import React, { useState } from 'react';
import { ShieldAlert, FileCheck2, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { SafetyAnalysisReport } from '../utils/foodSafetyEngine';

interface RecallComplianceViewProps {
  report: SafetyAnalysisReport;
  onLoadCriticalScenario?: () => void;
}

export const RecallComplianceView: React.FC<RecallComplianceViewProps> = ({
  report,
  onLoadCriticalScenario,
}) => {
  const [dispatchedGroups, setDispatchedGroups] = useState<Record<string, boolean>>({});
  const [communicationTab, setCommunicationTab] = useState<'CONSUMER_PLAIN' | 'REGULATOR_FILING'>('CONSUMER_PLAIN');

  const handleDispatchNotice = (group: string) => {
    setDispatchedGroups((prev) => ({
      ...prev,
      [group]: true,
    }));
  };

  const handleDispatchAll = () => {
    if (!report.recallCoordinator) return;
    const next: Record<string, boolean> = {};
    for (const s of report.recallCoordinator.stakeholderNotifications) {
      next[s.stakeholderGroup] = true;
    }
    setDispatchedGroups(next);
  };

  return (
    <div className="space-y-6" data-testid="recall-compliance-view">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Recall Coordinator &amp; Regulatory Compliance Center
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            [AGENT: RECALL_COORDINATOR] · [AGENT: COMPLIANCE_REPORTER] · [AGENT: PREDICTIVE_ANALYST] — Separation of commercial supplier records and public health communications.
          </p>
        </div>
        {report.recallCoordinator && (
          <button
            type="button"
            onClick={handleDispatchAll}
            className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-xs font-medium text-white hover:bg-red-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Transmit All Stakeholder Recall Alerts</span>
          </button>
        )}
      </div>

      {report.recallCoordinator ? (
        <div className="rounded-lg border border-red-200 bg-red-950 p-5 text-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-800 pb-3 font-mono text-xs tabular-nums">
            <span className="font-bold text-red-300">
              ACTIVE CLASS I RECALL PACKAGE: {report.recallCoordinator.recallReferenceId}
            </span>
            <span>REGULATORY REF: {report.recallCoordinator.regulatoryReferenceNumber}</span>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 text-xs">
            <div>
              <div className="text-red-300 font-mono">AFFECTED SUPPLY CHAIN BATCHES:</div>
              <div className="mt-1 font-mono text-sm font-bold">
                {report.recallCoordinator.affectedBatchIds.join(' · ')}
              </div>
            </div>
            <div>
              <div className="text-red-300 font-mono">QUARANTINE DIRECTIVE:</div>
              <p className="mt-1 text-red-100">{report.recallCoordinator.quarantineInstructions}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-5 text-xs text-slate-700 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                Current Analysis ({report.batchId} — {report.finalSafetyStatus}, Score {report.riskCalculator.riskScore.toFixed(1)}/10) does not exceed the 7.0/10 Recall Escalation Threshold.
              </span>
            </div>
            <p className="mt-1 text-slate-600">
              RECALL_COORDINATOR_AGENT activates automatically whenever Unified Risk Score exceeds 7.0/10.
            </p>
          </div>
          {onLoadCriticalScenario && (
            <button
              type="button"
              onClick={onLoadCriticalScenario}
              className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              Load Class I Recall Lot (LOT-SPN-2026-089)
            </button>
          )}
        </div>
      )}

      {/* Stakeholder Notification Matrix */}
      {report.recallCoordinator && (
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-900">
            Stakeholder Notification Schedule (Regulatory Ref: {report.recallCoordinator.regulatoryReferenceNumber})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 px-4 font-medium">Stakeholder Group</th>
                  <th className="py-2.5 px-4 font-medium">Recipient Entity</th>
                  <th className="py-2.5 px-4 font-medium">Transmission Channel</th>
                  <th className="py-2.5 px-4 font-medium">Mandatory Action Directive</th>
                  <th className="py-2.5 px-4 font-medium text-right">Dispatch Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.recallCoordinator.stakeholderNotifications.map((item) => {
                  const isSent = Boolean(dispatchedGroups[item.stakeholderGroup]);
                  return (
                    <tr key={item.stakeholderGroup}>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {item.stakeholderGroup}
                      </td>
                      <td className="py-3 px-4 text-slate-800">{item.recipientEntity}</td>
                      <td className="py-3 px-4 text-slate-600">{item.channel}</td>
                      <td className="py-3 px-4 text-slate-700">{item.actionRequired}</td>
                      <td className="py-3 px-4 text-right">
                        {isSent ? (
                          <span className="inline-flex items-center gap-1 font-mono font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" /> TRANSMITTED
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDispatchNotice(item.stakeholderGroup)}
                            className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
                          >
                            Dispatch Alert
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dual Communication Separation: Consumer Plain Language vs Regulatory Dossier */}
      {(report.recallCoordinator || report.complianceReporter) && (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-mono font-semibold text-slate-900">
                COMMUNICATION SEPARATION PROTOCOL (PUBLIC CONSUMER VS. REGULATORY AUTHORITY)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Commercial supplier pricing/contracts are strictly segregated from public safety advisories.
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setCommunicationTab('CONSUMER_PLAIN')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  communicationTab === 'CONSUMER_PLAIN'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Consumer Safety Alert (Plain Language)
              </button>
              <button
                type="button"
                onClick={() => setCommunicationTab('REGULATOR_FILING')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  communicationTab === 'REGULATOR_FILING'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Regulatory Submission (FDA / FSIS Format)
              </button>
            </div>
          </div>

          <div className="mt-4">
            {communicationTab === 'CONSUMER_PLAIN' ? (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-800">
                <div className="font-semibold text-slate-900 mb-1">
                  Public Consumer Advisory (Plain Language — Requires Human Verification Before Broadcast)
                </div>
                <p>
                  {report.recallCoordinator
                    ? report.recallCoordinator.consumerSafetyAlertDraft
                    : report.complianceReporter?.holdNoticeText}
                </p>
              </div>
            ) : (
              <div className="rounded-md border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-100">
                <div className="text-slate-400 mb-1">
                  REGULATORY SUBMISSION DOSSIER — REF: {report.complianceReporter?.regulatoryReferenceNumber}
                </div>
                <p>{report.complianceReporter?.regulatoryNotificationDraft}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Predictive Analyst 30/60/90 Day Prevention Roadmap */}
      {report.predictiveAnalyst && (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-slate-700" />
              <h3 className="text-xs font-mono font-semibold text-slate-900">
                [AGENT: PREDICTIVE_ANALYST] — SUPPLIER RISK PROFILE &amp; 30/60/90-DAY CAPA HORIZON
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-600 tabular-nums">
              Outbreak Probability Index: {report.predictiveAnalyst.outbreakProbabilityPercent}%
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3 text-xs">
            <div className="rounded-md bg-slate-50 p-3.5">
              <div className="text-slate-500">Supplier Entity</div>
              <div className="mt-1 font-semibold text-slate-900">
                {report.predictiveAnalyst.updatedSupplierRiskProfile.supplierName}
              </div>
            </div>
            <div className="rounded-md bg-slate-50 p-3.5">
              <div className="text-slate-500">Updated Risk Tier</div>
              <div className="mt-1 font-mono font-bold text-red-700">
                {report.predictiveAnalyst.updatedSupplierRiskProfile.updatedRating}
              </div>
            </div>
            <div className="rounded-md bg-slate-50 p-3.5">
              <div className="text-slate-500">Mandatory Re-Audit Window</div>
              <div className="mt-1 font-mono font-semibold text-slate-900">
                {report.predictiveAnalyst.updatedSupplierRiskProfile.nextMandatoryAuditWindow}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
