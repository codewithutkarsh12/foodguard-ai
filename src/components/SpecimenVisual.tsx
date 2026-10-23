import React from 'react';
import { VisualSampleInput } from '../utils/foodSafetyEngine';

interface SpecimenVisualProps {
  specimenType: 'SPINACH_CRITICAL' | 'SALMON_HIGH' | 'POULTRY_MEDIUM' | 'DAIRY_LOW' | 'SENSOR_GAP';
  batchId: string;
  visualSample: VisualSampleInput | null | undefined;
}

export const SpecimenVisual: React.FC<SpecimenVisualProps> = ({
  specimenType,
  batchId,
  visualSample,
}) => {
  if (visualSample?.imageDataUrl) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-900">
        <img
          src={visualSample.imageDataUrl}
          alt={`Food safety inspection sample for batch ${batchId}`}
          referrerPolicy="no-referrer"
          className="h-56 w-full object-cover"
        />
        <div className="flex items-center justify-between bg-slate-900/90 px-3 py-2 text-xs text-slate-200 font-mono tabular-nums">
          <span>BATCH: {batchId}</span>
          <span>GRADE: {visualSample.qualityGrade}</span>
        </div>
      </div>
    );
  }

  if (!visualSample || specimenType === 'SENSOR_GAP') {
    return (
      <div
        data-testid="specimen-visual-empty"
        className="flex h-56 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-100 p-6 text-center"
      >
        <svg className="h-10 w-10 text-slate-400 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-xs font-semibold text-slate-700">No Optical Specimen Attached</p>
        <p className="mt-1 text-xs text-slate-500 max-w-xs">
          VISION_INSPECTOR_AGENT bypassed or awaiting physical sample capture for batch {batchId || 'UNSPECIFIED'}.
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="specimen-visual-canvas"
      className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-white"
    >
      <svg
        viewBox="0 0 480 220"
        className="h-52 w-full block"
        role="img"
        aria-label={`Multimodal optical inspection scan for ${batchId}`}
      >
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="480" height="220" fill="#0f172a" />
        <rect width="480" height="220" fill="url(#grid)" />

        {/* Tray / Packaging Frame */}
        <rect x="36" y="22" width="300" height="176" rx="12" fill="#1e293b" stroke="#475569" strokeWidth="2" />
        <rect x="48" y="34" width="276" height="152" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1" />

        {specimenType === 'SPINACH_CRITICAL' && (
          <g>
            {/* Spinach leaves */}
            <ellipse cx="120" cy="95" rx="42" ry="26" fill="#15803d" transform="rotate(-15 120 95)" />
            <ellipse cx="185" cy="85" rx="46" ry="28" fill="#166534" transform="rotate(12 185 85)" />
            <ellipse cx="150" cy="135" rx="48" ry="25" fill="#14532d" transform="rotate(5 150 135)" />
            <ellipse cx="235" cy="125" rx="40" ry="26" fill="#15803d" transform="rotate(-22 235 125)" />
            {/* Dark necrotic lesions */}
            <circle cx="175" cy="82" r="11" fill="#451a03" opacity="0.9" />
            <circle cx="195" cy="92" r="8" fill="#27272a" opacity="0.9" />
            <circle cx="145" cy="132" r="13" fill="#3f2305" opacity="0.92" />
            {/* AI Bounding Box 1: Necrotic Lesion Cluster */}
            <rect x="155" y="64" width="58" height="44" fill="none" stroke="#ef4444" strokeWidth="1.75" strokeDasharray="4 2" />
            <rect x="155" y="48" width="112" height="16" fill="#ef4444" />
            <text x="159" y="59" fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold">
              LESION CLUSTER 94%
            </text>
            {/* AI Bounding Box 2: Corner Seal Breach */}
            <rect x="276" y="30" width="52" height="36" fill="none" stroke="#f59e0b" strokeWidth="1.75" strokeDasharray="4 2" />
            <rect x="236" y="14" width="92" height="15" fill="#f59e0b" />
            <text x="240" y="24" fill="#0f172a" fontSize="9" fontFamily="monospace" fontWeight="bold">
              SEAL BREACH 14MM
            </text>
          </g>
        )}

        {specimenType === 'SALMON_HIGH' && (
          <g>
            {/* Salmon fillet */}
            <path d="M75,70 Q180,55 285,85 L275,145 Q175,160 70,135 Z" fill="#fb7185" stroke="#f43f5e" strokeWidth="1.5" />
            <path d="M95,74 L115,138 M140,70 L160,145 M185,72 L205,148 M230,78 L248,145" stroke="#fda4af" strokeWidth="2" opacity="0.65" />
            {/* Discoloration zone */}
            <ellipse cx="252" cy="112" rx="26" ry="18" fill="#a8a29e" opacity="0.75" />
            {/* Bounding box */}
            <rect x="220" y="88" width="66" height="48" fill="none" stroke="#f59e0b" strokeWidth="1.75" strokeDasharray="4 2" />
            <rect x="200" y="72" width="106" height="15" fill="#f59e0b" />
            <text x="204" y="82" fill="#0f172a" fontSize="9" fontFamily="monospace" fontWeight="bold">
              ROP VACUUM LOSS
            </text>
          </g>
        )}

        {specimenType === 'POULTRY_MEDIUM' && (
          <g>
            <ellipse cx="140" cy="110" rx="55" ry="36" fill="#fda4af" opacity="0.85" />
            <ellipse cx="235" cy="112" rx="52" ry="34" fill="#fda4af" opacity="0.85" />
            <rect x="44" y="30" width="58" height="42" fill="none" stroke="#eab308" strokeWidth="1.5" strokeDasharray="4 2" />
            <text x="48" y="25" fill="#fde047" fontSize="9" fontFamily="monospace">
              OUTER CARTON SCUFF
            </text>
          </g>
        )}

        {specimenType === 'DAIRY_LOW' && (
          <g>
            <rect x="95" y="52" width="75" height="115" rx="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
            <rect x="195" y="52" width="75" height="115" rx="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
            <rect x="115" y="42" width="35" height="10" fill="#16a34a" />
            <rect x="215" y="42" width="35" height="10" fill="#16a34a" />
            <rect x="75" y="38" width="215" height="138" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 2" />
            <text x="80" y="32" fill="#4ade80" fontSize="9" fontFamily="monospace" fontWeight="bold">
              FOIL SEAL &amp; LOT CODE VERIFIED (98%)
            </text>
          </g>
        )}

        {/* Right Side Telemetry HUD Panel inside SVG */}
        <rect x="352" y="22" width="114" height="176" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        <text x="362" y="40" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          VISION_INSPECTOR
        </text>
        <text x="362" y="54" fill="#f8fafc" fontSize="10" fontFamily="monospace" fontWeight="bold">
          {batchId}
        </text>
        <line x1="362" y1="62" x2="456" y2="62" stroke="#334155" />
        <text x="362" y="78" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          QUALITY GRADE
        </text>
        <text
          x="362"
          y="92"
          fill={
            visualSample.qualityGrade === 'REJECT'
              ? '#f87171'
              : visualSample.qualityGrade === 'SUBSTANDARD'
              ? '#fbbf24'
              : '#4ade80'
          }
          fontSize="10"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {visualSample.qualityGrade}
        </text>
        <text x="362" y="114" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          LABELING FSMA 204
        </text>
        <text x="362" y="128" fill={visualSample.labelingCompliant ? '#4ade80' : '#f87171'} fontSize="9" fontFamily="monospace">
          {visualSample.labelingCompliant ? 'COMPLIANT' : 'DEFICIENT'}
        </text>
        <text x="362" y="150" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          FINDINGS COUNT
        </text>
        <text x="362" y="165" fill="#f8fafc" fontSize="11" fontFamily="monospace" fontWeight="bold">
          {visualSample.contaminationIndicators.length + visualSample.packagingIssues.length} INDICATOR(S)
        </text>
      </svg>
      <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300">
        <span className="truncate">{visualSample.sampleType.replace(/_/g, ' ')} INSPECTION</span>
        <span className="font-mono tabular-nums text-slate-400 shrink-0">
          {visualSample.labelingCompliant ? 'TLC VERIFIED' : 'LABEL DEFECT'}
        </span>
      </div>
    </div>
  );
};
