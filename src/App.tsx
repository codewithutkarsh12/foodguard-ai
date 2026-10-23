import React, { useState, useEffect } from 'react';
import {
  Shield,
  ClipboardCheck,
  Truck,
  Siren,
  History,
  Upload,
  Play,
  RotateCcw,
  Search,
} from 'lucide-react';
import {
  runFoodGuardAnalysis,
  SafetyIntakeInput,
  SafetyAnalysisReport,
} from './utils/foodSafetyEngine';
import { PRESET_SCENARIOS, PresetScenario } from './data/presets';
import { SpecimenVisual } from './components/SpecimenVisual';
import { AgentPipelineView } from './components/AgentPipelineView';
import { SupplyChainView } from './components/SupplyChainView';
import { RecallComplianceView } from './components/RecallComplianceView';

type ActiveWorkspaceTab =
  | 'INTAKE_TRIAGE'
  | 'SUPPLY_CHAIN'
  | 'RECALL_COMPLIANCE'
  | 'AUDIT_LEDGER';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveWorkspaceTab>('INTAKE_TRIAGE');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_SCENARIOS[0].id);

  // Form state initialized from the first preset scenario
  const [productName, setProductName] = useState<string>(PRESET_SCENARIOS[0].intake.productName);
  const [batchId, setBatchId] = useState<string>(PRESET_SCENARIOS[0].intake.batchId);
  const [supplyChainStage, setSupplyChainStage] = useState<SafetyIntakeInput['supplyChainStage']>(
    PRESET_SCENARIOS[0].intake.supplyChainStage
  );
  const [inspectorId, setInspectorId] = useState<string>(PRESET_SCENARIOS[0].intake.inspectorId || 'INS-8841-FDA');
  const [sensorDataRaw, setSensorDataRaw] = useState<string>(PRESET_SCENARIOS[0].intake.sensorDataRaw || '');
  const [labReportText, setLabReportText] = useState<string>(PRESET_SCENARIOS[0].intake.labReportText || '');
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState<string>(
    PRESET_SCENARIOS[0].intake.naturalLanguageQuery || ''
  );
  const [includeVisualSample, setIncludeVisualSample] = useState<boolean>(true);
  const [customImageDataUrl, setCustomImageDataUrl] = useState<string | undefined>(undefined);
  const [visualQualityGrade, setVisualQualityGrade] = useState<'GRADE_A' | 'GRADE_B' | 'SUBSTANDARD' | 'REJECT'>(
    PRESET_SCENARIOS[0].intake.visualSample?.qualityGrade || 'REJECT'
  );
  const [visualIndicatorsText, setVisualIndicatorsText] = useState<string>(
    PRESET_SCENARIOS[0].intake.visualSample?.contaminationIndicators.join('\n') || ''
  );
  const [packagingIssuesText, setPackagingIssuesText] = useState<string>(
    PRESET_SCENARIOS[0].intake.visualSample?.packagingIssues.join('\n') || ''
  );
  const [labelingCompliant, setLabelingCompliant] = useState<boolean>(
    PRESET_SCENARIOS[0].intake.visualSample?.labelingCompliant ?? true
  );

  // Active report & audit history
  const [activeReport, setActiveReport] = useState<SafetyAnalysisReport>(() =>
    runFoodGuardAnalysis(PRESET_SCENARIOS[0].intake)
  );
  const [auditHistory, setAuditHistory] = useState<SafetyAnalysisReport[]>(() =>
    PRESET_SCENARIOS.map((p) => runFoodGuardAnalysis(p.intake))
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');
  const [auditStatusFilter, setAuditStatusFilter] = useState<string>('ALL');

  // Sync with server audit ledger on mount
  useEffect(() => {
    fetch('/api/audits')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.audits) && data.audits.length > 0) {
          setAuditHistory(data.audits);
        }
      })
      .catch(() => {
        // Keep local seeded audit history if offline
      });
  }, []);

  const applyPresetScenario = (preset: PresetScenario) => {
    setSelectedPresetId(preset.id);
    setProductName(preset.intake.productName);
    setBatchId(preset.intake.batchId);
    setSupplyChainStage(preset.intake.supplyChainStage);
    setInspectorId(preset.intake.inspectorId || 'INS-8841-FDA');
    setSensorDataRaw(preset.intake.sensorDataRaw || '');
    setLabReportText(preset.intake.labReportText || '');
    setNaturalLanguageQuery(preset.intake.naturalLanguageQuery || '');
    setCustomImageDataUrl(undefined);

    if (preset.intake.visualSample) {
      setIncludeVisualSample(true);
      setVisualQualityGrade(preset.intake.visualSample.qualityGrade);
      setVisualIndicatorsText(preset.intake.visualSample.contaminationIndicators.join('\n'));
      setPackagingIssuesText(preset.intake.visualSample.packagingIssues.join('\n'));
      setLabelingCompliant(preset.intake.visualSample.labelingCompliant);
    } else {
      setIncludeVisualSample(false);
      setVisualIndicatorsText('');
      setPackagingIssuesText('');
    }

    const computed = runFoodGuardAnalysis(preset.intake);
    setActiveReport(computed);
  };

  const handleClearForCustomBlankTest = () => {
    setSelectedPresetId('custom');
    setProductName('');
    setBatchId('');
    setSensorDataRaw('');
    setLabReportText('');
    setNaturalLanguageQuery('');
    setIncludeVisualSample(false);
    setVisualIndicatorsText('');
    setPackagingIssuesText('');
    setCustomImageDataUrl(undefined);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomImageDataUrl(reader.result);
        setIncludeVisualSample(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExecuteAnalysis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAnalyzing(true);

    const currentPreset = PRESET_SCENARIOS.find((p) => p.id === selectedPresetId);

    const payload: SafetyIntakeInput = {
      productName,
      batchId,
      supplyChainStage,
      inspectorId,
      sensorDataRaw,
      labReportText,
      naturalLanguageQuery,
      supplierProfile: currentPreset?.intake.supplierProfile,
      visualSample: includeVisualSample
        ? {
            sampleType: currentPreset?.intake.visualSample?.sampleType || 'PACKAGING',
            description:
              currentPreset?.intake.visualSample?.description ||
              `Optical inspection of ${productName || 'submitted sample'} (${batchId || 'unlabeled'})`,
            contaminationIndicators: visualIndicatorsText
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean),
            packagingIssues: packagingIssuesText
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean),
            labelingCompliant,
            storageConditionNotes:
              currentPreset?.intake.visualSample?.storageConditionNotes || 'Receiving dock inspection table',
            qualityGrade: visualQualityGrade,
            imageDataUrl: customImageDataUrl,
          }
        : null,
    };

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const data = (await response.json()) as { report: SafetyAnalysisReport };
        setActiveReport(data.report);
        setAuditHistory((prev) => [
          data.report,
          ...prev.filter((a) => a.analysisId !== data.report.analysisId),
        ]);
        setIsAnalyzing(false);
        return;
      }
    } catch {
      // Fallback to local engine if network request fails
    }

    const fallbackReport = runFoodGuardAnalysis({
      ...payload,
      timestamp: new Date().toISOString(),
      analysisId: `FGA-${Date.now().toString(36).toUpperCase().slice(-5)}`,
    });
    setActiveReport(fallbackReport);
    setAuditHistory((prev) => [fallbackReport, ...prev]);
    setIsAnalyzing(false);
  };

  const currentPresetObj =
    PRESET_SCENARIOS.find((p) => p.id === selectedPresetId) || PRESET_SCENARIOS[0];

  const filteredAudits = auditHistory.filter((item) => {
    if (auditStatusFilter !== 'ALL' && item.finalSafetyStatus !== auditStatusFilter) {
      return false;
    }
    const q = auditSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      item.batchId.toLowerCase().includes(q) ||
      item.productName.toLowerCase().includes(q) ||
      item.analysisId.toLowerCase().includes(q) ||
      item.inspectorId.toLowerCase().includes(q)
    );
  });

  const getTabLabel = (tab: ActiveWorkspaceTab) => {
    switch (tab) {
      case 'INTAKE_TRIAGE':
        return 'Intake & Multi-Agent Triage';
      case 'SUPPLY_CHAIN':
        return 'Supply Chain Sentinel';
      case 'RECALL_COMPLIANCE':
        return 'Recall & Compliance Package';
      case 'AUDIT_LEDGER':
        return 'Chain of Custody & Audit Trail';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      {/* Left Sidebar Navigation (260px on desktop) */}
      <aside className="w-full lg:w-64 lg:shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-950 text-slate-100 flex flex-col justify-between">
        <div className="p-5">
          <div className="flex items-center gap-2.5 pb-5 border-b border-slate-800">
            <Shield className="h-5 w-5 text-emerald-400 shrink-0" />
            <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
              FoodGuard AI
            </span>
          </div>

          <nav aria-label="FoodGuard Workspace Navigation" className="mt-5 space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab('INTAKE_TRIAGE')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === 'INTAKE_TRIAGE'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ClipboardCheck className="h-4 w-4 shrink-0" />
              <span>Intake &amp; Agent Triage</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('SUPPLY_CHAIN')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === 'SUPPLY_CHAIN'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Truck className="h-4 w-4 shrink-0" />
              <span>Supply Chain Sentinel</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('RECALL_COMPLIANCE')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === 'RECALL_COMPLIANCE'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Siren className="h-4 w-4 shrink-0" />
              <span>Recall &amp; Compliance</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('AUDIT_LEDGER')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === 'AUDIT_LEDGER'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span className="flex items-center gap-3">
                <History className="h-4 w-4 shrink-0" />
                <span>Chain of Custody Log</span>
              </span>
              <span className="font-mono text-xs text-slate-400 tabular-nums" data-testid="audit-count">
                {auditHistory.length}
              </span>
            </button>
          </nav>

          {/* 6 Coordinated Agents Roster */}
          <div className="mt-8 border-t border-slate-800 pt-5 hidden lg:block">
            <div className="text-xs font-semibold text-slate-400">Coordinated Sub-Agents (6)</div>
            <ul className="mt-3 space-y-2 text-xs font-mono text-slate-300">
              <li className="flex items-center justify-between">
                <span>1. VISION_INSPECTOR</span>
                <span className="text-slate-500">40% wt</span>
              </li>
              <li className="flex items-center justify-between">
                <span>2. SUPPLY_CHAIN_SENTINEL</span>
                <span className="text-slate-500">35% wt</span>
              </li>
              <li className="flex items-center justify-between">
                <span>3. RISK_CALCULATOR</span>
                <span className="text-slate-500">Scoring</span>
              </li>
              <li className="flex items-center justify-between">
                <span>4. RECALL_COORDINATOR</span>
                <span className="text-slate-500">&gt;7.0/10</span>
              </li>
              <li className="flex items-center justify-between">
                <span>5. COMPLIANCE_REPORTER</span>
                <span className="text-slate-500">FSMA 204</span>
              </li>
              <li className="flex items-center justify-between">
                <span>6. PREDICTIVE_ANALYST</span>
                <span className="text-slate-500">30/60/90d</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 p-4 text-xs text-slate-400 hidden lg:block">
          <div className="font-medium text-slate-300">Human Oversight Mandatory</div>
          <p className="mt-1 leading-relaxed">
            Supports qualified food safety inspectors &amp; regulatory authorities.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Contract: Breadcrumb trail on left, 1 primary action on right */}
        <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2 text-xs text-slate-600 truncate">
            <span className="font-semibold text-slate-900">FoodGuard AI</span>
            <span aria-hidden="true">/</span>
            <span>{getTabLabel(activeTab)}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-slate-800">
              Active Batch: {activeReport.batchId} ({activeReport.finalSafetyStatus})
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab('INTAKE_TRIAGE');
                handleExecuteAnalysis();
              }}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" />
              <span>{isAnalyzing ? 'Running Orchestrator...' : 'Run Safety Analysis'}</span>
            </button>
          </div>
        </header>

        {/* Main Workspace Container */}
        <main className="flex-1 p-6 max-w-[1400px] w-full mx-auto space-y-6">
          {/* KPI Summary Strip */}
          <section
            aria-label="Current Triage Telemetry Summary"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">Active Batch &amp; Stage</div>
              <div className="mt-1 font-mono text-base font-bold text-slate-900 tabular-nums truncate">
                {activeReport.batchId}
              </div>
              <div className="mt-1 text-xs text-slate-600 truncate">
                {activeReport.productName} · {activeReport.supplyChainStage.replace(/_/g, ' ')}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">Unified Risk Score (Weighted)</div>
              <div className="mt-1 font-mono text-base font-bold text-slate-900 tabular-nums">
                {activeReport.riskCalculator.riskScore.toFixed(1)} / 10.0 · {activeReport.riskCalculator.riskLevel}
              </div>
              <div className="mt-1 text-xs text-slate-600 font-mono tabular-nums">
                Confidence: {activeReport.riskCalculator.confidence}% · Recall &gt; 7.0
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">Chain of Custody Status</div>
              <div className="mt-1 font-mono text-base font-bold text-slate-900 tabular-nums">
                {activeReport.supplyChainSentinel?.chainOfCustodyStatus || 'UNKNOWN'}
              </div>
              <div className="mt-1 text-xs text-slate-600 font-mono tabular-nums">
                Deviation: {activeReport.supplyChainSentinel?.deviationSeverity || 'NONE'} (
                {activeReport.supplyChainSentinel?.coldChainBreakMinutes ?? 0}m excursion)
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">Final Safety Determination</div>
              <div className="mt-1 font-mono text-base font-bold text-slate-900 tabular-nums">
                {activeReport.finalSafetyStatus}
              </div>
              <div className="mt-1 text-xs text-slate-600 font-mono tabular-nums">
                Audit Ref: {activeReport.auditTrailReferenceId}
              </div>
            </div>
          </section>

          {activeTab === 'INTAKE_TRIAGE' && (
            <div className="space-y-6">
              {/* Preset Scenario Bar */}
              <section className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      1. Select Live Inspection Scenario or Configure Custom Multimodal Intake
                    </h2>
                    <p className="text-xs text-slate-500">
                      Test across Critical Recall (&gt;7.0), High Hold (5.1–7.0), Medium Monitor (3.1–5.0), Low Clear (0–3.0), and Insufficient Data guardrails.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearForCustomBlankTest}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Clear Form for Custom Input</span>
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
                  {PRESET_SCENARIOS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyPresetScenario(preset)}
                        className={`flex flex-col justify-between rounded-lg border p-3 text-left transition-colors ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-slate-50/60 text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <div className="font-mono text-xs font-semibold tabular-nums">
                            {preset.intake.batchId}
                          </div>
                          <div className="mt-1 text-xs font-medium leading-snug line-clamp-2">
                            {preset.title}
                          </div>
                        </div>
                        <div
                          className={`mt-2.5 pt-2 border-t text-xs font-mono tabular-nums ${
                            isSelected ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'
                          }`}
                        >
                          {preset.badgeText}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Intake Configuration Form + Multimodal Specimen Viewer */}
              <form
                onSubmit={handleExecuteAnalysis}
                className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start"
              >
                {/* Left 7 columns: Multimodal Input Fields */}
                <div className="lg:col-span-7 rounded-lg border border-slate-200 bg-white p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      Multimodal Food Safety Intake Parameters
                    </h3>
                    <span className="font-mono text-xs text-slate-500">PII Auto-Redaction Active</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="product-name-input" className="block text-xs font-medium text-slate-700">
                        Product / Commodity Name
                      </label>
                      <input
                        id="product-name-input"
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="e.g. Organic Baby Spinach 16oz"
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="batch-id-input" className="block text-xs font-medium text-slate-700">
                        Traceability Batch / Lot ID
                      </label>
                      <input
                        id="batch-id-input"
                        type="text"
                        value={batchId}
                        onChange={(e) => setBatchId(e.target.value)}
                        placeholder="e.g. LOT-SPN-2026-089"
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="supply-stage-select" className="block text-xs font-medium text-slate-700">
                        Supply Chain Touchpoint
                      </label>
                      <select
                        id="supply-stage-select"
                        value={supplyChainStage}
                        onChange={(e) =>
                          setSupplyChainStage(e.target.value as SafetyIntakeInput['supplyChainStage'])
                        }
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                      >
                        <option value="FARM_HARVEST">FARM_HARVEST (Field / Harvest)</option>
                        <option value="PROCESSING_PLANT">PROCESSING_PLANT (Wash / Pack)</option>
                        <option value="COLD_TRANSIT">COLD_TRANSIT (Reefer Carrier)</option>
                        <option value="DISTRIBUTION_HUB">DISTRIBUTION_HUB (Regional DC)</option>
                        <option value="RETAIL_SHELF">RETAIL_SHELF (Store Display)</option>
                        <option value="CONSUMER_REPORT">CONSUMER_REPORT (Adverse Event)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="inspector-id-input" className="block text-xs font-medium text-slate-700">
                        Submitting Inspector / Authority ID
                      </label>
                      <input
                        id="inspector-id-input"
                        type="text"
                        value={inspectorId}
                        onChange={(e) => setInspectorId(e.target.value)}
                        placeholder="e.g. INS-8841-FDA"
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="sensor-json-textarea" className="block text-xs font-medium text-slate-700">
                      IoT Sensor Telemetry JSON (temperature_log, humidity_log, handling_events)
                    </label>
                    <textarea
                      id="sensor-json-textarea"
                      rows={5}
                      value={sensorDataRaw}
                      onChange={(e) => setSensorDataRaw(e.target.value)}
                      placeholder='{"required_temp_min_c": 0, "required_temp_max_c": 4, "temperature_log": [...]}'
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 font-mono text-xs text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="lab-report-textarea" className="block text-xs font-medium text-slate-700">
                        Laboratory Report Findings (PCR / Culture / Histamine)
                      </label>
                      <textarea
                        id="lab-report-textarea"
                        rows={3}
                        value={labReportText}
                        onChange={(e) => setLabReportText(e.target.value)}
                        placeholder="Enter lab certificate results or pathogen screen status..."
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="nl-query-textarea" className="block text-xs font-medium text-slate-700">
                        Inspector / Regulator / Consumer Query
                      </label>
                      <textarea
                        id="nl-query-textarea"
                        rows={3}
                        value={naturalLanguageQuery}
                        onChange={(e) => setNaturalLanguageQuery(e.target.value)}
                        placeholder="Describe observed condition or specific regulatory question..."
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={isAnalyzing}
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>{isAnalyzing ? 'Executing 6-Agent Workflow...' : 'Execute Multi-Agent Triage'}</span>
                    </button>
                  </div>
                </div>

                {/* Right 5 columns: VISION_INSPECTOR Specimen & Optical Indicators */}
                <div className="lg:col-span-5 rounded-lg border border-slate-200 bg-white p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Optical Specimen &amp; Packaging Feed
                      </h3>
                      <p className="text-xs text-slate-500">Feeds [AGENT: VISION_INSPECTOR] (40% risk weight)</p>
                    </div>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={includeVisualSample}
                        onChange={(e) => setIncludeVisualSample(e.target.checked)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span>Include Optical Feed</span>
                    </label>
                  </div>

                  <SpecimenVisual
                    specimenType={currentPresetObj.specimenSvgType}
                    batchId={batchId || 'UNSPECIFIED'}
                    visualSample={
                      includeVisualSample
                        ? {
                            sampleType: currentPresetObj.intake.visualSample?.sampleType || 'PACKAGING',
                            description: productName,
                            contaminationIndicators: visualIndicatorsText
                              .split('\n')
                              .map((s) => s.trim())
                              .filter(Boolean),
                            packagingIssues: packagingIssuesText
                              .split('\n')
                              .map((s) => s.trim())
                              .filter(Boolean),
                            labelingCompliant,
                            storageConditionNotes: '',
                            qualityGrade: visualQualityGrade,
                            imageDataUrl: customImageDataUrl,
                          }
                        : null
                    }
                  />

                  {includeVisualSample && (
                    <div className="space-y-3 pt-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label
                          htmlFor="upload-food-image"
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span>Upload Custom Inspection Image</span>
                          <input
                            id="upload-food-image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileUpload}
                            className="sr-only"
                          />
                        </label>

                        <div className="flex items-center gap-2">
                          <label htmlFor="quality-grade-select" className="text-xs text-slate-600">
                            Grade:
                          </label>
                          <select
                            id="quality-grade-select"
                            value={visualQualityGrade}
                            onChange={(e) =>
                              setVisualQualityGrade(
                                e.target.value as 'GRADE_A' | 'GRADE_B' | 'SUBSTANDARD' | 'REJECT'
                              )
                            }
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 font-mono text-xs text-slate-900"
                          >
                            <option value="GRADE_A">GRADE_A</option>
                            <option value="GRADE_B">GRADE_B</option>
                            <option value="SUBSTANDARD">SUBSTANDARD</option>
                            <option value="REJECT">REJECT</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="visual-indicators-input"
                          className="block text-xs font-medium text-slate-700"
                        >
                          Observed Contamination Indicators (1 per line)
                        </label>
                        <textarea
                          id="visual-indicators-input"
                          rows={2}
                          value={visualIndicatorsText}
                          onChange={(e) => setVisualIndicatorsText(e.target.value)}
                          placeholder="e.g. Dark water-soaked leaf lesions..."
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                          <input
                            type="checkbox"
                            checked={labelingCompliant}
                            onChange={(e) => setLabelingCompliant(e.target.checked)}
                            className="rounded border-slate-300"
                          />
                          <span>FSMA 204 Lot Code &amp; Allergen Label Compliant</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </form>

              {/* Full 6-Step Multi-Agent Report Output */}
              <AgentPipelineView
                report={activeReport}
                onOpenRecallCenter={() => setActiveTab('RECALL_COMPLIANCE')}
              />
            </div>
          )}

          {activeTab === 'SUPPLY_CHAIN' && (
            <SupplyChainView
              presets={PRESET_SCENARIOS}
              auditHistory={auditHistory}
              activeReport={activeReport}
              onSelectBatchPreset={(preset) => {
                applyPresetScenario(preset);
              }}
            />
          )}

          {activeTab === 'RECALL_COMPLIANCE' && (
            <RecallComplianceView
              report={activeReport}
              onLoadCriticalScenario={() => applyPresetScenario(PRESET_SCENARIOS[0])}
            />
          )}

          {activeTab === 'AUDIT_LEDGER' && (
            <div className="space-y-6" data-testid="audit-ledger-view">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Chain of Custody &amp; Immutable Audit Trail Registry
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Every FoodGuard AI multi-agent triage is logged with a permanent FSMA 204 audit reference ID and confidence score.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1 rounded-lg bg-slate-200/80 p-1">
                    {['ALL', '🚨 RECALL', '🔶 HOLD', '⚠️ MONITOR', '✅ CLEAR', 'INSUFFICIENT_DATA'].map(
                      (statusOpt) => (
                        <button
                          key={statusOpt}
                          type="button"
                          onClick={() => setAuditStatusFilter(statusOpt)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                            auditStatusFilter === statusOpt
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {statusOpt}
                        </button>
                      )
                    )}
                  </div>

                  <div className="relative w-64">
                    <label htmlFor="audit-search-input" className="sr-only">
                      Search Audit Trail
                    </label>
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      id="audit-search-input"
                      type="search"
                      value={auditSearchQuery}
                      onChange={(e) => setAuditSearchQuery(e.target.value)}
                      placeholder="Filter by Batch or Analysis ID..."
                      className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                        <th className="py-3 px-4 font-medium">Audit Ref / Analysis ID</th>
                        <th className="py-3 px-4 font-medium">Timestamp (ISO 8601)</th>
                        <th className="py-3 px-4 font-medium">Product &amp; Batch ID</th>
                        <th className="py-3 px-4 font-medium">Inspector</th>
                        <th className="py-3 px-4 font-medium text-right">Weighted Score</th>
                        <th className="py-3 px-4 font-medium">Final Safety Status</th>
                        <th className="py-3 px-4 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAudits.map((entry) => (
                        <tr key={entry.analysisId} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono text-slate-900 tabular-nums">
                            <div className="font-semibold">{entry.auditTrailReferenceId}</div>
                            <div className="text-slate-500">{entry.analysisId}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">
                            {entry.timestamp.slice(0, 19).replace('T', ' ')}Z
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-900">{entry.productName}</div>
                            <div className="font-mono text-slate-500 tabular-nums">{entry.batchId}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">{entry.inspectorId}</td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                            {entry.riskCalculator.riskScore.toFixed(1)} / 10 ({entry.riskCalculator.confidence}%)
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                            {entry.finalSafetyStatus}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveReport(entry);
                                setActiveTab('INTAKE_TRIAGE');
                              }}
                              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-slate-100 whitespace-nowrap shrink-0"
                            >
                              Open Report
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Quiet Regulatory Footer */}
        <footer className="border-t border-slate-200 bg-white px-6 py-4 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4">
          <span>CONFIDENTIAL FOOD SAFETY DATA — FoodGuard AI Multi-Agent Intelligence System</span>
          <span>
            Supports human food safety inspectors &amp; regulatory oversight · FSMA 204 / HACCP Compliant Audit Ledger
          </span>
        </footer>
      </div>
    </div>
  );
}
