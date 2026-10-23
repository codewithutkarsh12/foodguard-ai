import React, { useState } from 'react';
import { Search, Thermometer, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PresetScenario } from '../data/presets';
import { evaluateSupplyChainTelemetry, SafetyAnalysisReport } from '../utils/foodSafetyEngine';

interface SupplyChainViewProps {
  presets: PresetScenario[];
  auditHistory: SafetyAnalysisReport[];
  activeReport: SafetyAnalysisReport;
  onSelectBatchPreset: (preset: PresetScenario) => void;
}

export const SupplyChainView: React.FC<SupplyChainViewProps> = ({
  presets,
  activeReport,
  onSelectBatchPreset,
}) => {
  const [searchBatchQuery, setSearchBatchQuery] = useState('');

  const matchedPreset = presets.find((p) => p.intake.batchId === activeReport.batchId) || presets[0];
  const scDetails = evaluateSupplyChainTelemetry(matchedPreset.intake.sensorDataRaw, activeReport.batchId);
  const tempLog = scDetails.parsedSensor?.temperature_log || [];
  const handlingEvents = scDetails.parsedSensor?.handling_events || [];

  const filteredPresets = presets.filter((p) => {
    const q = searchBatchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      p.intake.batchId.toLowerCase().includes(q) ||
      p.intake.productName.toLowerCase().includes(q) ||
      (p.intake.supplierProfile?.supplierName.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className="space-y-6" data-testid="supply-chain-view">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Supply Chain Sentinel &amp; Batch Traceability Lookup
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            [AGENT: SUPPLY_CHAIN_SENTINEL] — Continuous cold-chain telemetry, handling event verification, and FSMA 204 touchpoint compliance.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <label htmlFor="batch-lookup-search" className="sr-only">
            Search Batch ID, Commodity, or Supplier
          </label>
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            id="batch-lookup-search"
            type="search"
            value={searchBatchQuery}
            onChange={(e) => setSearchBatchQuery(e.target.value)}
            placeholder="Lookup Batch ID (e.g. LOT-SPN-2026-089)..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
          />
        </div>
      </div>

      {/* Monitored Batch Selector Table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-800">
          Active Supply Chain Lots ({filteredPresets.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2.5 px-4 font-medium">Batch / Lot ID</th>
                <th className="py-2.5 px-4 font-medium">Product Commodity</th>
                <th className="py-2.5 px-4 font-medium">Supplier Entity</th>
                <th className="py-2.5 px-4 font-medium">Stage</th>
                <th className="py-2.5 px-4 font-medium text-right">Risk Classification</th>
                <th className="py-2.5 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPresets.map((preset) => {
                const isSelected = preset.intake.batchId === activeReport.batchId;
                return (
                  <tr
                    key={preset.id}
                    className={isSelected ? 'bg-slate-100/90' : 'hover:bg-slate-50'}
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 tabular-nums">
                      {preset.intake.batchId}
                    </td>
                    <td className="py-3 px-4 text-slate-800">{preset.intake.productName}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {preset.intake.supplierProfile?.supplierName} ({preset.intake.supplierProfile?.supplierId})
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {preset.intake.supplyChainStage}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-800 tabular-nums">
                      {preset.badgeText}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectBatchPreset(preset)}
                        className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-slate-100 whitespace-nowrap shrink-0"
                      >
                        {isSelected ? 'Inspecting' : 'Inspect Telemetry'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Telemetry for Selected Batch */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-slate-700" />
              <h3 className="text-xs font-mono font-semibold text-slate-900">
                COLD-CHAIN TEMPERATURE LOG — {activeReport.batchId}
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              Required Range: {scDetails.output.allowedTempRangeC}
            </span>
          </div>

          {tempLog.length > 0 ? (
            <div className="mt-4 space-y-3">
              {tempLog.map((point, index) => {
                const maxAllowed = scDetails.parsedSensor?.required_temp_max_c ?? 4.0;
                const isExcursion = point.celsius > maxAllowed;
                const barWidthPercent = Math.min(100, Math.max(12, Math.round((point.celsius / 12) * 100)));
                return (
                  <div key={index} className="rounded-md border border-slate-200 p-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 font-mono tabular-nums">
                      <span className="text-slate-600">{point.timestamp}</span>
                      <span className="font-medium text-slate-800">{point.location || 'Sensor Node'}</span>
                      <span
                        className={
                          isExcursion ? 'font-bold text-red-700' : 'font-semibold text-emerald-700'
                        }
                      >
                        {point.celsius.toFixed(1)}°C {isExcursion ? '(EXCURSION)' : '(NOMINAL)'}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isExcursion ? 'bg-red-600' : 'bg-emerald-600'}`}
                        style={{ width: `${barWidthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>TELEMETRY STREAM BLACKOUT DETECTED</span>
              </div>
              <p className="mt-1">
                Zero temperature data points received for {activeReport.batchId}. Sensor data gaps represent unknown risk, not absence of risk.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="border-b border-slate-100 pb-3 text-xs font-mono font-semibold text-slate-900">
            CRITICAL TRACKING EVENTS (CTEs)
          </h3>
          <div className="mt-4 space-y-3 text-xs">
            {handlingEvents.map((ev, idx) => (
              <div key={idx} className="rounded-md border border-slate-200 p-3">
                <div className="flex items-center justify-between font-mono text-slate-500 tabular-nums">
                  <span>{ev.timestamp}</span>
                  {ev.compliant ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> COMPLIANT
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-700 font-semibold">
                      <AlertCircle className="h-3.5 w-3.5" /> BREACH
                    </span>
                  )}
                </div>
                <div className="mt-1 font-semibold text-slate-900">{ev.facility}</div>
                <p className="mt-1 text-slate-600 leading-relaxed">{ev.event}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
