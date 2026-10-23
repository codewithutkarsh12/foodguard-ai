import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  runFoodGuardAnalysis,
  formatCanonicalReport,
  SafetyIntakeInput,
  SafetyAnalysisReport,
} from './src/utils/foodSafetyEngine';
import { PRESET_SCENARIOS } from './src/data/presets';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '15mb' }));

// Initialize server-side audit ledger with initial preset analyses
const auditLedger: SafetyAnalysisReport[] = PRESET_SCENARIOS.map((preset) =>
  runFoodGuardAnalysis(preset.intake)
);

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'FoodGuard AI Multi-Agent Orchestrator',
    auditCount: auditLedger.length,
  });
});

app.get('/api/audits', (_req, res) => {
  res.json({
    audits: auditLedger,
  });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const intake = req.body as SafetyIntakeInput;
    if (!intake || typeof intake !== 'object') {
      res.status(400).json({ error: 'Invalid food safety intake payload.' });
      return;
    }

    // 1. Run deterministic multi-agent analysis engine
    let report = runFoodGuardAnalysis({
      ...intake,
      timestamp: new Date().toISOString(),
      analysisId: `FGA-${Date.now().toString(36).toUpperCase().slice(-5)}-${Math.floor(100 + Math.random() * 899)}`,
    });

    // 2. Optional server-side Gemini 3.8 Flash enrichment if API key is present and valid
    const ai = getGeminiClient();
    if (ai && !report.orchestrator.insufficientData) {
      try {
        const promptParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

        if (intake.visualSample?.imageDataUrl && intake.visualSample.imageDataUrl.startsWith('data:image/')) {
          const match = intake.visualSample.imageDataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
          if (match) {
            promptParts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2],
              },
            });
          }
        }

        promptParts.push({
          text: `You are FoodGuard AI Orchestrator coordinating VISION_INSPECTOR, SUPPLY_CHAIN_SENTINEL, RISK_CALCULATOR, RECALL_COORDINATOR, COMPLIANCE_REPORTER, and PREDICTIVE_ANALYST.
Product: ${report.productName} (Batch: ${report.batchId}) at ${report.supplyChainStage}
Computed Weighted Risk Score: ${report.riskCalculator.riskScore}/10 (${report.riskCalculator.riskLevel})
Visual Indicators: ${report.visionInspector?.visualRiskIndicators.join('; ') || 'None'}
Supply Chain Events: ${report.supplyChainSentinel?.criticalEvents.join('; ') || 'None'}
Lab Report: ${intake.labReportText || 'None'}
Query: ${intake.naturalLanguageQuery || 'Standard triage'}

Provide concise, domain-precise food safety enhancements in JSON.`,
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: { parts: promptParts },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                enhancedRiskReasoning: {
                  type: Type.STRING,
                  description: 'Transparent 2-sentence explanation of the weighted risk score.',
                },
                visionRecommendation: {
                  type: Type.STRING,
                  description: 'Specific food safety action for visual inspection findings.',
                },
                consumerAlertPlainLanguage: {
                  type: Type.STRING,
                  description: 'Plain-language consumer safety alert free of technical jargon if Critical.',
                },
              },
              required: ['enhancedRiskReasoning'],
            },
          },
        });

        const rawJson = response.text?.trim();
        if (rawJson) {
          const parsed = JSON.parse(rawJson) as {
            enhancedRiskReasoning?: string;
            visionRecommendation?: string;
            consumerAlertPlainLanguage?: string;
          };
          if (parsed.enhancedRiskReasoning) {
            report.riskCalculator.reasoning = `${report.riskCalculator.reasoning} AI Synthesis: ${parsed.enhancedRiskReasoning}`;
          }
          if (parsed.visionRecommendation && report.visionInspector) {
            report.visionInspector.recommendation = parsed.visionRecommendation;
          }
          if (parsed.consumerAlertPlainLanguage && report.recallCoordinator) {
            report.recallCoordinator.consumerSafetyAlertDraft = `${parsed.consumerAlertPlainLanguage} [Regulatory Ref: ${report.recallCoordinator.regulatoryReferenceNumber}]`;
          }
          const { canonicalReportText: _ignored, ...rest } = report;
          report = {
            ...rest,
            canonicalReportText: formatCanonicalReport(rest),
          };
        }
      } catch (_geminiErr) {
        // Keep deterministic multi-agent report when Gemini quota or key is unavailable
      }
    }

    auditLedger.unshift(report);
    res.json({ report });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Internal FoodGuard AI orchestrator error',
    });
  }
});

async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FoodGuard AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
