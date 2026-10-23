import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  FileText,
  Copy,
  Check,
  Download,
  HelpCircle,
} from 'lucide-react';
import { SafetyAnalysisReport } from '../utils/foodSafetyEngine';

interface AgentPipelineViewProps {
  report: SafetyAnalysisReport;
  onOpenRecallCenter?: () => void;
}

export const AgentPipelineView: React.FC<AgentPipelineViewProps> = ({
  report,
  onOpenRecallCenter,
}) => {
  const [reportFormatMode, setReportFormatMode] = useState<'STRUCTURED' | 'CANONICAL_ASCII'>('STRUCTURED');
  const [copied, setCopied] = useState(false);

  const handleCopyCanonical = async () => {
    try {
      await navigator.clipboard.writeText(report.canonicalReportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadReport = () => {
    const blob = new Blob([report.canonicalReportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.analysisId}-${report.batchId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusStyle = () => {
    switch (report.finalSafetyStatus) {
      case '🚨 RECALL':
        return {
          bannerBg: 'bg-red-950 text-white border-red-800',
          scoreColor: 'text-red-400',
          icon: <ShieldAlert className="h-5 w-5 text-red-400 shrink-0" />,
        };
      case '🔶 HOLD':
        return {
          bannerBg: 'bg-amber-950 text-white border-amber-800',
          scoreColor: 'text-amber-300',
          icon: <AlertTriangle className="h-5 w-5 text-amber-300 shrink-0" />,
        };
      case '⚠️ MONITOR':
        return {
          bannerBg: 'bg-slate-900 text-white border-slate-700',
          scoreColor: 'text-amber-400',
          icon: <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />,
        };
      case 'INSUFFICIENT_DATA':
        return {
          bannerBg: 'bg-slate-800 text-white border-slate-600',
          scoreColor: 'text-slate-300',
          icon: <HelpCircle className="h-5 w-5 text-slate-300 shrink-0" />,
        };
      default:
        return {
          bannerBg: 'bg-emerald-950 text-white border-emerald-800',
          scoreColor: 'text-emerald-400',
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />,
        };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <div className="space-y-6" data-testid="agent-pipeline-view">
      {/* Confidentiality & Status Banner */}
      <div className={`rounded-lg border p-5 ${statusStyle.bannerBg}`}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-3 text-xs font-mono tabular-nums text-white/80">
          <span>{report.confidentialityBanner}</span>
          <div className="flex items-center gap-3">
            <span>ANALYSIS_ID: {report.analysisId}</span>
            <span aria-hidden="true">·</span>
            <span>AUDIT_REF: {report.auditTrailReferenceId}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-white/75 font-mono tabular-nums">
              <span>PRODUCT: {report.productName}</span>
              <span aria-hidden="true">·</span>
              <span>BATCH: {report.batchId}</span>
              <span aria-hidden="true">·</span>
              <span>INSPECTOR: {report.inspectorId}</span>
            </div>
            <div className="flex items-center gap-2.5 pt-1">
              {statusStyle.icon}
              <h2 className="text-xl font-bold tracking-tight" data-testid="final-safety-status">
                FINAL SAFETY STATUS: {report.finalSafetyStatus}
              </h2>
            </div>
            <p className="text-sm text-white/85 max-w-3xl pt-1">{report.responseProtocolSummary}</p>
          </div>

          <div className="flex items-center gap-6 shrink-0 border-t border-white/15 pt-3 lg:border-t-0 lg:pt-0">
            <div className="text-right font-mono tabular-nums">
              <div className="text-xs text-white/70">UNIFIED RISK SCORE</div>
              <div className={`text-3xl font-bold ${statusStyle.scoreColor}`} data-testid="unified-risk-score">
                {report.riskCalculator.riskScore.toFixed(1)} <span className="text-base font-normal text-white/60">/ 10</span>
              </div>
              <div className="text-xs text-white/75">
                {report.riskCalculator.riskLevel} · CONFIDENCE {report.riskCalculator.confidence}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Switcher & Report Actions Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-1 rounded-lg bg-slate-200/80 p-1">
          <button
            type="button"
            onClick={() => setReportFormatMode('STRUCTURED')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              reportFormatMode === 'STRUCTURED'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Structured 6-Step Agent Trace
          </button>
          <button
            type="button"
            onClick={() => setReportFormatMode('CANONICAL_ASCII')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              reportFormatMode === 'CANONICAL_ASCII'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Canonical FoodGuard Safety Report
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenRecallCenter && (report.recallCoordinator || report.complianceReporter) && (
            <button
              type="button"
              onClick={onOpenRecallCenter}
              className="px-3.5 py-2 text-xs font-medium text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Open Recall &amp; Compliance Package
            </button>
          )}
          <button
            type="button"
            onClick={handleCopyCanonical}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied Report' : 'Copy Official Report'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export .TXT</span>
          </button>
        </div>
      </div>

      {reportFormatMode === 'CANONICAL_ASCII' ? (
        <div className="rounded-lg border border-slate-200 bg-slate-950 p-6 text-slate-100">
          <pre
            data-testid="canonical-report-pre"
            className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed tabular-nums"
          >
            {report.canonicalReportText}
          </pre>
        </div>
      ) : (
        <div className="space-y-6">
          {/* STEP 1: ORCHESTRATOR */}
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-slate-900">[AGENT: ORCHESTRATOR]</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-xs text-slate-500">Step 1: Intake Classification &amp; Sub-Agent Routing</span>
              </div>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                Position: {report.orchestrator.supplyChainPosition}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs font-medium text-slate-500">Classified Input Modalities</div>
                <div className="mt-1 font-mono text-xs text-slate-900">
                  {report.orchestrator.inputTypes.join(' · ') || 'NONE'}
                </div>
                <div className="mt-3 text-xs font-medium text-slate-500">Routing Sequence</div>
                <div className="mt-1 font-mono text-xs font-semibold text-slate-900">
                  {report.orchestrator.requiredAgents.map((a) => `[${a}]`).join(' → ')}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500">Orchestrator Routing Decision</div>
                <p className="mt-1 text-xs leading-relaxed text-slate-700">{report.orchestrator.routingDecision}</p>
                {report.orchestrator.dataQualityFlags.length > 0 && (
                  <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900">
                    <span className="font-semibold">Data Quality Alert: </span>
                    {report.orchestrator.dataQualityFlags.join(' | ')}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* STEP 2 & STEP 3: VISION_INSPECTOR + SUPPLY_CHAIN_SENTINEL */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* STEP 2: VISION_INSPECTOR */}
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono text-xs font-semibold text-slate-900">[AGENT: VISION_INSPECTOR]</span>
                  <p className="text-xs text-slate-500">Step 2: Multimodal Contamination &amp; Packaging Inspection</p>
                </div>
                {report.visionInspector && (
                  <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
                    CONFIDENCE: {report.visionInspector.confidence}%
                  </span>
                )}
              </div>

              {report.visionInspector ? (
                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-500">REQUIRES_IMMEDIATE_ACTION:</span>
                    <span
                      className={
                        report.visionInspector.requiresImmediateAction === 'YES'
                          ? 'font-bold text-red-700'
                          : 'font-semibold text-emerald-700'
                      }
                    >
                      {report.visionInspector.requiresImmediateAction} (Sub-score: {report.visionInspector.subScore.toFixed(1)}/10)
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-slate-500">VISUAL_RISK_INDICATORS:</span>
                    <ul className="mt-1.5 list-disc space-y-1 pl-4 text-slate-800">
                      {report.visionInspector.visualRiskIndicators.map((ind, idx) => (
                        <li key={idx}>{ind}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-1 gap-2 border-t border-slate-100 pt-2 sm:grid-cols-2">
                    <div>
                      <span className="text-slate-500">Packaging Integrity:</span>
                      <p className="font-medium text-slate-800 mt-0.5">{report.visionInspector.packagingIntegrity}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Labeling Compliance:</span>
                      <p className="font-medium text-slate-800 mt-0.5">{report.visionInspector.labelingCompliance}</p>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-2">
                    <span className="font-mono text-slate-500">RECOMMENDATION:</span>
                    <p className="mt-0.5 font-medium text-slate-900">{report.visionInspector.recommendation}</p>
                  </div>
                  <div className="rounded-md bg-slate-100 p-2.5 text-slate-600">
                    {report.visionInspector.microbiologicalLimitationNote}
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-md bg-slate-50 p-4 text-xs text-slate-600">
                  No optical sample attached for this intake. Visual risk weight estimated conservatively from physical manifest &amp; sensor telemetry.
                </div>
              )}
            </section>

            {/* STEP 3: SUPPLY_CHAIN_SENTINEL */}
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono text-xs font-semibold text-slate-900">[AGENT: SUPPLY_CHAIN_SENTINEL]</span>
                  <p className="text-xs text-slate-500">Step 3: Cold-Chain Telemetry &amp; Custody Verification</p>
                </div>
                {report.supplyChainSentinel && (
                  <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
                    CONFIDENCE: {report.supplyChainSentinel.confidence}%
                  </span>
                )}
              </div>

              {report.supplyChainSentinel && (
                <div className="mt-4 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 font-mono tabular-nums">
                    <div>
                      <span className="text-slate-500">CHAIN_OF_CUSTODY_STATUS:</span>
                      <p
                        className={`mt-0.5 font-bold ${
                          report.supplyChainSentinel.chainOfCustodyStatus === 'COMPROMISED'
                            ? 'text-red-700'
                            : report.supplyChainSentinel.chainOfCustodyStatus === 'UNKNOWN'
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {report.supplyChainSentinel.chainOfCustodyStatus}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">DEVIATION_SEVERITY:</span>
                      <p className="mt-0.5 font-bold text-slate-900">
                        {report.supplyChainSentinel.deviationSeverity} (Sub-score: {report.supplyChainSentinel.subScore.toFixed(1)}/10)
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="font-mono text-slate-500">CRITICAL_EVENTS:</span>
                    <ul className="mt-1.5 list-disc space-y-1 pl-4 font-mono text-slate-800 tabular-nums">
                      {report.supplyChainSentinel.criticalEvents.map((ev, idx) => (
                        <li key={idx}>{ev}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2">
                    <div>
                      <span className="text-slate-500">Peak Temperature / Allowed:</span>
                      <p className="font-mono font-medium text-slate-900 tabular-nums mt-0.5">
                        {report.supplyChainSentinel.maxTempRecordedC !== null
                          ? `${report.supplyChainSentinel.maxTempRecordedC.toFixed(1)}°C`
                          : 'N/A'}{' '}
                        (Target: {report.supplyChainSentinel.allowedTempRangeC})
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Cold-Chain Excursion Duration:</span>
                      <p className="font-mono font-medium text-slate-900 tabular-nums mt-0.5">
                        {report.supplyChainSentinel.coldChainBreakMinutes} minutes
                      </p>
                    </div>
                  </div>

                  {report.supplyChainSentinel.sensorGapWarning && (
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-2.5 text-amber-900">
                      {report.supplyChainSentinel.sensorGapWarning}
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* STEP 4: UNIFIED RISK ASSESSMENT */}
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-semibold text-slate-900">[AGENT: RISK_CALCULATOR]</span>
                <p className="text-xs text-slate-500">
                  Step 4: Multi-Source Weighted Threat Scoring (40% Visual · 35% Supply Chain · 15% Historical · 10% Predictive)
                </p>
              </div>
              <div className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
                RISK_SCORE: {report.riskCalculator.riskScore.toFixed(1)} / 10 · CONFIDENCE: {report.riskCalculator.confidence}%
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-4 font-medium">Risk Factor Dimension</th>
                    <th className="py-2 px-4 font-medium text-right">Raw Sub-Score (0–10)</th>
                    <th className="py-2 px-4 font-medium text-right">Protocol Weight</th>
                    <th className="py-2 pl-4 font-medium text-right">Weighted Contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono tabular-nums text-slate-800">
                  <tr>
                    <td className="py-2.5 pr-4 font-sans font-medium">1. Visual Contamination &amp; Packaging Indicators</td>
                    <td className="py-2.5 px-4 text-right">{report.riskCalculator.visualScore.toFixed(1)} / 10</td>
                    <td className="py-2.5 px-4 text-right">40%</td>
                    <td className="py-2.5 pl-4 text-right font-semibold">
                      +{report.riskCalculator.weightedBreakdown.visualContribution.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-sans font-medium">2. Supply Chain Cold-Chain &amp; Custody Integrity</td>
                    <td className="py-2.5 px-4 text-right">{report.riskCalculator.supplyChainScore.toFixed(1)} / 10</td>
                    <td className="py-2.5 px-4 text-right">35%</td>
                    <td className="py-2.5 pl-4 text-right font-semibold">
                      +{report.riskCalculator.weightedBreakdown.supplyChainContribution.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-sans font-medium">3. Historical Supplier Compliance Profile</td>
                    <td className="py-2.5 px-4 text-right">{report.riskCalculator.historicalSupplierScore.toFixed(1)} / 10</td>
                    <td className="py-2.5 px-4 text-right">15%</td>
                    <td className="py-2.5 pl-4 text-right font-semibold">
                      +{report.riskCalculator.weightedBreakdown.historicalContribution.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-sans font-medium">4. Predictive Outbreak &amp; Seasonal Model</td>
                    <td className="py-2.5 px-4 text-right">{report.riskCalculator.predictiveModelScore.toFixed(1)} / 10</td>
                    <td className="py-2.5 px-4 text-right">10%</td>
                    <td className="py-2.5 pl-4 text-right font-semibold">
                      +{report.riskCalculator.weightedBreakdown.predictiveContribution.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3 text-xs">
              <div className="font-mono text-slate-500">REASONING:</div>
              <p className="mt-1 leading-relaxed text-slate-800">{report.riskCalculator.reasoning}</p>
            </div>
          </section>

          {/* STEP 5: RESPONSE COORDINATION (RECALL_COORDINATOR / COMPLIANCE_REPORTER) */}
          {(report.recallCoordinator || report.complianceReporter) && (
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono text-xs font-semibold text-slate-900">
                    {report.recallCoordinator
                      ? '[AGENT: RECALL_COORDINATOR] · [AGENT: COMPLIANCE_REPORTER]'
                      : '[AGENT: COMPLIANCE_REPORTER]'}
                  </span>
                  <p className="text-xs text-slate-500">
                    Step 5: Automated Escalation, Regulatory Filings &amp; Stakeholder Notification
                  </p>
                </div>
                {report.complianceReporter && (
                  <span className="font-mono text-xs text-slate-600 tabular-nums">
                    REG_REF: {report.complianceReporter.regulatoryReferenceNumber}
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-4 text-xs">
                {report.recallCoordinator && (
                  <div className="rounded-md border border-red-200 bg-red-50/70 p-4 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-red-900">
                      <span className="font-bold">
                        IMMEDIATE CLASS I RECALL INITIATED ({report.recallCoordinator.recallReferenceId})
                      </span>
                      <span>AFFECTED BATCHES: {report.recallCoordinator.affectedBatchIds.join(', ')}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-red-950">Plain-Language Consumer Safety Alert Draft:</span>
                      <p className="mt-1 leading-relaxed text-red-900">
                        {report.recallCoordinator.consumerSafetyAlertDraft}
                      </p>
                    </div>
                  </div>
                )}

                {report.complianceReporter && (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                      <div className="font-mono text-slate-500">REGULATORY_NOTIFICATION_DRAFT:</div>
                      <p className="mt-1 rounded-md bg-slate-50 p-3 font-mono text-xs leading-relaxed text-slate-800">
                        {report.complianceReporter.regulatoryNotificationDraft}
                      </p>
                    </div>
                    <div>
                      <div className="font-mono text-slate-500">COMPLIANCE_DOCUMENTATION_GENERATED:</div>
                      <ul className="mt-1 space-y-2">
                        {report.complianceReporter.documentsGenerated.map((doc) => (
                          <li
                            key={doc.docId}
                            className="flex items-start gap-2 rounded-md border border-slate-200 p-2.5"
                          >
                            <FileText className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium text-slate-900">
                                {doc.title} <span className="font-mono text-slate-500">({doc.docId})</span>
                              </div>
                              <div className="text-slate-500 mt-0.5">
                                {doc.authority} · {doc.status} — {doc.summary}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* STEP 6: PREDICTIVE_ANALYST */}
          {report.predictiveAnalyst && (
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono text-xs font-semibold text-slate-900">[AGENT: PREDICTIVE_ANALYST]</span>
                  <p className="text-xs text-slate-500">
                    Step 6: Outbreak Pattern Classification &amp; 30/60/90-Day Prevention Horizon
                  </p>
                </div>
                <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
                  CLASSIFICATION: {report.predictiveAnalyst.classificationType} · CONFIDENCE: {report.predictiveAnalyst.confidence}%
                </span>
              </div>

              <div className="mt-4 space-y-4 text-xs">
                <p className="text-slate-700 leading-relaxed">{report.predictiveAnalyst.historicalPatternAnalysis}</p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-md border border-slate-200 p-3">
                    <div className="font-mono font-semibold text-slate-900">30-DAY HORIZON</div>
                    <p className="mt-1 text-slate-600 leading-relaxed">
                      {report.predictiveAnalyst.horizonRecommendations.days30}
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-200 p-3">
                    <div className="font-mono font-semibold text-slate-900">60-DAY HORIZON</div>
                    <p className="mt-1 text-slate-600 leading-relaxed">
                      {report.predictiveAnalyst.horizonRecommendations.days60}
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-200 p-3">
                    <div className="font-mono font-semibold text-slate-900">90-DAY HORIZON</div>
                    <p className="mt-1 text-slate-600 leading-relaxed">
                      {report.predictiveAnalyst.horizonRecommendations.days90}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* IMMEDIATE ACTIONS & MANDATORY LIMITATIONS */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="text-xs font-mono font-semibold text-slate-900">IMMEDIATE ACTIONS REQUIRED</h3>
              <ul className="mt-3 space-y-2.5 text-xs">
                {report.immediateActionsRequired.map((act) => (
                  <li key={act.stepNumber} className="rounded-md border border-slate-200 p-3">
                    <div className="font-semibold text-slate-900">
                      {act.stepNumber}. {act.action}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-slate-500 font-mono tabular-nums">
                      <span>Owner: {act.owner}</span>
                      <span aria-hidden="true">·</span>
                      <span>Deadline: {act.deadline}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="text-xs font-mono font-semibold text-slate-900">
                MANDATORY SYSTEM LIMITATIONS &amp; HUMAN OVERSIGHT
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-4 text-xs text-slate-600 leading-relaxed">
                {report.limitationsAndDisclaimers.map((lim, i) => (
                  <li key={i}>{lim}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};
