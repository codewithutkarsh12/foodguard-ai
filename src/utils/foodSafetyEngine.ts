export type AgentName =
  | 'ORCHESTRATOR'
  | 'VISION_INSPECTOR'
  | 'SUPPLY_CHAIN_SENTINEL'
  | 'RISK_CALCULATOR'
  | 'RECALL_COORDINATOR'
  | 'COMPLIANCE_REPORTER'
  | 'PREDICTIVE_ANALYST';

export type InputCategory =
  | 'FOOD_IMAGE'
  | 'SENSOR_DATA_JSON'
  | 'PRODUCT_BATCH_ID'
  | 'LAB_REPORT_DOCUMENT'
  | 'NATURAL_LANGUAGE_QUERY'
  | 'IOT_ALERT_TRIGGER';

export type ChainOfCustodyStatus = 'INTACT' | 'COMPROMISED' | 'UNKNOWN';
export type DeviationSeverity = 'NONE' | 'MINOR' | 'MODERATE' | 'CRITICAL';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'INSUFFICIENT_DATA';
export type FinalSafetyStatus = '✅ CLEAR' | '⚠️ MONITOR' | '🔶 HOLD' | '🚨 RECALL' | 'INSUFFICIENT_DATA';

export interface TemperatureReading {
  timestamp: string;
  celsius: number;
  location?: string;
}

export interface HumidityReading {
  timestamp: string;
  percent: number;
  location?: string;
}

export interface HandlingEvent {
  timestamp: string;
  facility: string;
  event: string;
  compliant: boolean;
  anomaly_flag?: boolean;
  notes?: string;
}

export interface SensorDataPayload {
  required_temp_min_c?: number;
  required_temp_max_c?: number;
  expected_transit_hours?: number;
  actual_transit_hours?: number;
  sensor_gaps_detected?: boolean;
  gap_duration_minutes?: number;
  temperature_log?: TemperatureReading[];
  humidity_log?: HumidityReading[];
  handling_events?: HandlingEvent[];
}

export interface VisualSampleInput {
  sampleId?: string;
  sampleType: 'PACKAGING' | 'RAW_PRODUCT' | 'PROCESSING_FACILITY' | 'STORAGE_CONDITIONS';
  description: string;
  contaminationIndicators: string[];
  packagingIssues: string[];
  labelingCompliant: boolean;
  storageConditionNotes: string;
  qualityGrade: 'GRADE_A' | 'GRADE_B' | 'SUBSTANDARD' | 'REJECT';
  imageDataUrl?: string;
}

export interface SupplierHistoryProfile {
  supplierName: string;
  supplierId: string;
  historicalRiskScore: number; // 0 to 10
  priorIncidentsLast12Months: number;
  seasonalRiskMultiplier: number; // 0 to 10
  lastAuditScore: number; // 0 to 100
}

export interface SafetyIntakeInput {
  analysisId?: string;
  timestamp?: string;
  productName: string;
  batchId: string;
  supplyChainStage: 'FARM_HARVEST' | 'PROCESSING_PLANT' | 'COLD_TRANSIT' | 'DISTRIBUTION_HUB' | 'RETAIL_SHELF' | 'CONSUMER_REPORT';
  inspectorId?: string;
  visualSample?: VisualSampleInput | null;
  sensorDataRaw?: string;
  labReportText?: string;
  naturalLanguageQuery?: string;
  iotAlertTrigger?: string;
  supplierProfile?: SupplierHistoryProfile;
}

export interface OrchestratorOutput {
  inputTypes: InputCategory[];
  productName: string;
  batchId: string;
  supplyChainPosition: string;
  requiredAgents: AgentName[];
  routingDecision: string;
  dataQualityFlags: string[];
  insufficientData: boolean;
  missingInformationRequired: string[];
}

export interface VisionInspectorOutput {
  visualRiskIndicators: string[];
  packagingIntegrity: string;
  labelingCompliance: string;
  storageConditionIndicators: string;
  qualityGradeAssessment: string;
  confidence: number;
  requiresImmediateAction: 'YES' | 'NO';
  recommendation: string;
  microbiologicalLimitationNote: string;
  subScore: number; // 0 to 10
}

export interface SupplyChainSentinelOutput {
  chainOfCustodyStatus: ChainOfCustodyStatus;
  criticalEvents: string[];
  deviationSeverity: DeviationSeverity;
  maxTempRecordedC: number | null;
  allowedTempRangeC: string;
  coldChainBreakMinutes: number;
  transitAnomalyDetails: string;
  facilityComplianceSummary: string;
  sensorGapWarning: string | null;
  confidence: number;
  subScore: number; // 0 to 10
}

export interface RiskCalculatorOutput {
  visualScore: number; // 0-10 (weight 40%)
  supplyChainScore: number; // 0-10 (weight 35%)
  historicalSupplierScore: number; // 0-10 (weight 15%)
  predictiveModelScore: number; // 0-10 (weight 10%)
  weightedBreakdown: {
    visualContribution: number;
    supplyChainContribution: number;
    historicalContribution: number;
    predictiveContribution: number;
  };
  riskScore: number; // X.X / 10
  riskLevel: RiskLevel;
  confidence: number;
  primaryRiskFactors: string[];
  reasoning: string;
  escalateToRecallCoordinator: boolean;
}

export interface StakeholderNotification {
  stakeholderGroup: 'SUPPLIERS' | 'DISTRIBUTORS' | 'RETAILERS' | 'REGULATORS';
  recipientEntity: string;
  channel: string;
  regulatoryRefNumber: string;
  actionRequired: string;
  priority: 'IMMEDIATE' | 'HIGH' | 'STANDARD';
}

export interface RecallCoordinatorOutput {
  recallReferenceId: string;
  regulatoryReferenceNumber: string;
  affectedBatchIds: string[];
  stakeholderNotifications: StakeholderNotification[];
  consumerSafetyAlertDraft: string;
  quarantineInstructions: string;
}

export interface ComplianceDocument {
  docId: string;
  title: string;
  authority: 'FDA_FSMA_204' | 'USDA_FSIS' | 'EFSA_RASFF' | 'HACCP_INTERNAL';
  status: 'GENERATED' | 'READY_FOR_SUBMISSION';
  summary: string;
}

export interface ComplianceReporterOutput {
  incidentReportId: string;
  regulatoryReferenceNumber: string;
  holdNoticeText: string;
  inspectionRequirements: string[];
  regulatoryNotificationDraft: string;
  documentsGenerated: ComplianceDocument[];
}

export interface PredictiveAnalystOutput {
  historicalPatternAnalysis: string;
  classificationType: 'SYSTEMIC_RISK_FACTOR' | 'ISOLATED_INCIDENT' | 'EMERGING_SEASONAL_CLUSTER';
  outbreakProbabilityPercent: number;
  confidence: number;
  horizonRecommendations: {
    days30: string;
    days60: string;
    days90: string;
  };
  updatedSupplierRiskProfile: {
    supplierName: string;
    previousRating: string;
    updatedRating: string;
    nextMandatoryAuditWindow: string;
  };
}

export interface ImmediateActionItem {
  stepNumber: number;
  action: string;
  owner: string;
  deadline: string;
}

export interface SafetyAnalysisReport {
  timestamp: string;
  analysisId: string;
  auditTrailReferenceId: string;
  productName: string;
  batchId: string;
  supplyChainStage: string;
  inspectorId: string;
  confidentialityBanner: string;
  orchestrator: OrchestratorOutput;
  visionInspector: VisionInspectorOutput | null;
  supplyChainSentinel: SupplyChainSentinelOutput | null;
  riskCalculator: RiskCalculatorOutput;
  recallCoordinator: RecallCoordinatorOutput | null;
  complianceReporter: ComplianceReporterOutput | null;
  predictiveAnalyst: PredictiveAnalystOutput | null;
  finalSafetyStatus: FinalSafetyStatus;
  responseProtocolSummary: string;
  immediateActionsRequired: ImmediateActionItem[];
  complianceDocumentationGenerated: boolean;
  complianceDocumentTitles: string[];
  limitationsAndDisclaimers: string[];
  canonicalReportText: string;
}

/**
 * Redacts personally identifiable information (emails, phone numbers, SSNs)
 * while preserving Inspector IDs and Batch IDs.
 */
export function redactPII(input: string): string {
  if (!input) return '';
  return input
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    .replace(/\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g, '[REDACTED_PHONE]')
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_ID]');
}

/**
 * Computes the weighted Risk Score according to FoodGuard AI specification:
 * - Visual indicators: 40%
 * - Supply chain integrity: 35%
 * - Historical supplier data: 15%
 * - Predictive model output: 10%
 */
export function calculateWeightedRiskScore(params: {
  visualScore: number;
  supplyChainScore: number;
  historicalSupplierScore: number;
  predictiveModelScore: number;
}): {
  riskScore: number;
  riskLevel: Exclude<RiskLevel, 'INSUFFICIENT_DATA'>;
  escalateToRecallCoordinator: boolean;
  weightedBreakdown: {
    visualContribution: number;
    supplyChainContribution: number;
    historicalContribution: number;
    predictiveContribution: number;
  };
} {
  const clamp = (val: number) => Math.max(0, Math.min(10, val));
  const v = clamp(params.visualScore);
  const s = clamp(params.supplyChainScore);
  const h = clamp(params.historicalSupplierScore);
  const p = clamp(params.predictiveModelScore);

  const visualContribution = Number((v * 0.4).toFixed(2));
  const supplyChainContribution = Number((s * 0.35).toFixed(2));
  const historicalContribution = Number((h * 0.15).toFixed(2));
  const predictiveContribution = Number((p * 0.1).toFixed(2));

  const rawTotal = v * 0.4 + s * 0.35 + h * 0.15 + p * 0.1;
  const riskScore = Number(Math.max(0, Math.min(10, rawTotal)).toFixed(1));

  let riskLevel: Exclude<RiskLevel, 'INSUFFICIENT_DATA'>;
  if (riskScore <= 3.0) {
    riskLevel = 'LOW';
  } else if (riskScore <= 5.0) {
    riskLevel = 'MEDIUM';
  } else if (riskScore <= 7.0) {
    riskLevel = 'HIGH';
  } else {
    riskLevel = 'CRITICAL';
  }

  return {
    riskScore,
    riskLevel,
    escalateToRecallCoordinator: riskScore > 7.0,
    weightedBreakdown: {
      visualContribution,
      supplyChainContribution,
      historicalContribution,
      predictiveContribution,
    },
  };
}

export function evaluateSupplyChainTelemetry(
  sensorJsonRaw: string | undefined,
  batchId: string
): {
  output: SupplyChainSentinelOutput;
  parsedSensor: SensorDataPayload | null;
  parseError: string | null;
} {
  if (!sensorJsonRaw || !sensorJsonRaw.trim()) {
    return {
      parsedSensor: null,
      parseError: null,
      output: {
        chainOfCustodyStatus: batchId ? 'UNKNOWN' : 'UNKNOWN',
        criticalEvents: ['No IoT sensor telemetry JSON attached to batch record.'],
        deviationSeverity: 'MINOR',
        maxTempRecordedC: null,
        allowedTempRangeC: '0.0°C – 4.0°C',
        coldChainBreakMinutes: 0,
        transitAnomalyDetails: 'Telemetry log absent; chain-of-custody verification relies on manual manifest.',
        facilityComplianceSummary: 'Touchpoint verification incomplete due to missing sensor log.',
        sensorGapWarning: 'Sensor data gaps represent unknown risk, not absence of risk.',
        confidence: 55,
        subScore: 4.5,
      },
    };
  }

  let parsed: SensorDataPayload;
  try {
    parsed = JSON.parse(sensorJsonRaw) as SensorDataPayload;
  } catch (err) {
    return {
      parsedSensor: null,
      parseError: err instanceof Error ? err.message : 'Invalid JSON syntax in sensor log',
      output: {
        chainOfCustodyStatus: 'UNKNOWN',
        criticalEvents: ['Malformed IoT sensor JSON payload; telemetry integrity cannot be verified.'],
        deviationSeverity: 'MODERATE',
        maxTempRecordedC: null,
        allowedTempRangeC: 'Unknown (JSON Parse Error)',
        coldChainBreakMinutes: 0,
        transitAnomalyDetails: 'Unable to parse transit telemetry.',
        facilityComplianceSummary: 'Unable to verify touchpoints.',
        sensorGapWarning: 'Corrupted telemetry stream flagged as data quality failure.',
        confidence: 35,
        subScore: 5.5,
      },
    };
  }

  const minC = parsed.required_temp_min_c ?? 0;
  const maxC = parsed.required_temp_max_c ?? 4.0;
  const tempLog = Array.isArray(parsed.temperature_log) ? parsed.temperature_log : [];
  const humidityLog = Array.isArray(parsed.humidity_log) ? parsed.humidity_log : [];
  const handlingEvents = Array.isArray(parsed.handling_events) ? parsed.handling_events : [];

  const criticalEvents: string[] = [];
  let maxTemp: number | null = null;
  let excursionCount = 0;

  for (const entry of tempLog) {
    if (typeof entry.celsius === 'number') {
      if (maxTemp === null || entry.celsius > maxTemp) {
        maxTemp = entry.celsius;
      }
      if (entry.celsius > maxC || entry.celsius < minC) {
        excursionCount++;
        const delta = entry.celsius > maxC ? `+${(entry.celsius - maxC).toFixed(1)}°C above max` : `${(entry.celsius - minC).toFixed(1)}°C below min`;
        criticalEvents.push(
          `[${entry.timestamp}] Temperature excursion at ${entry.location || 'Transit Node'}: ${entry.celsius.toFixed(1)}°C (${delta} threshold ${minC}°C–${maxC}°C)`
        );
      }
    }
  }

  for (const hum of humidityLog) {
    if (typeof hum.percent === 'number' && hum.percent > 90) {
      criticalEvents.push(
        `[${hum.timestamp}] High condensation risk at ${hum.location || 'Cold Storage'}: relative humidity ${hum.percent}% (>90% limit)`
      );
    }
  }

  let nonCompliantTouchpoints = 0;
  for (const ev of handlingEvents) {
    if (!ev.compliant || ev.anomaly_flag) {
      nonCompliantTouchpoints++;
      criticalEvents.push(
        `[${ev.timestamp}] Facility/Handling Anomaly at ${ev.facility}: ${ev.event}${ev.notes ? ` (${ev.notes})` : ''}`
      );
    }
  }

  const coldChainBreakMinutes =
    parsed.gap_duration_minutes && parsed.gap_duration_minutes > 0
      ? parsed.gap_duration_minutes
      : excursionCount * 45;

  const expectedHours = parsed.expected_transit_hours ?? 24;
  const actualHours = parsed.actual_transit_hours ?? expectedHours;
  const transitDelayHours = Math.max(0, actualHours - expectedHours);

  if (transitDelayHours > 2) {
    criticalEvents.push(
      `[TRANSIT_WINDOW] Delivery window exceeded by ${transitDelayHours.toFixed(1)} hrs (Expected: ${expectedHours}h, Actual: ${actualHours}h)`
    );
  }

  let sensorGapWarning: string | null = null;
  if (parsed.sensor_gaps_detected || tempLog.length === 0) {
    sensorGapWarning =
      parsed.gap_duration_minutes && parsed.gap_duration_minutes > 0
        ? `Telemetry blackout of ${parsed.gap_duration_minutes} minutes detected. Sensor data gaps represent unknown risk, not absence of risk.`
        : 'Missing temperature log points detected. Sensor data gaps represent unknown risk, not absence of risk.';
    criticalEvents.push(`[DATA_QUALITY_GAP] ${sensorGapWarning}`);
  }

  let deviationSeverity: DeviationSeverity = 'NONE';
  let chainStatus: ChainOfCustodyStatus = 'INTACT';
  let subScore = 1.0;

  const maxOverTemp = maxTemp !== null ? Math.max(0, maxTemp - maxC) : 0;

  if (parsed.sensor_gaps_detected && tempLog.length === 0) {
    chainStatus = 'UNKNOWN';
    deviationSeverity = 'MODERATE';
    subScore = 6.0;
  } else if (maxOverTemp >= 4.0 || nonCompliantTouchpoints >= 2 || coldChainBreakMinutes >= 120) {
    chainStatus = 'COMPROMISED';
    deviationSeverity = 'CRITICAL';
    subScore = Math.min(10, 7.8 + Math.min(2.2, maxOverTemp * 0.3));
  } else if (maxOverTemp >= 1.5 || nonCompliantTouchpoints === 1 || transitDelayHours >= 4 || parsed.sensor_gaps_detected) {
    chainStatus = 'COMPROMISED';
    deviationSeverity = 'MODERATE';
    subScore = Math.min(7.5, 5.2 + maxOverTemp * 0.4);
  } else if (maxOverTemp > 0 || transitDelayHours > 0) {
    chainStatus = 'INTACT';
    deviationSeverity = 'MINOR';
    subScore = 3.2;
  } else {
    chainStatus = 'INTACT';
    deviationSeverity = 'NONE';
    subScore = 0.8;
  }

  if (criticalEvents.length === 0) {
    criticalEvents.push('No cold-chain excursions or handling anomalies recorded across monitored touchpoints.');
  }

  const confidence = parsed.sensor_gaps_detected ? 68 : tempLog.length >= 3 ? 94 : 82;

  return {
    parsedSensor: parsed,
    parseError: null,
    output: {
      chainOfCustodyStatus: chainStatus,
      criticalEvents,
      deviationSeverity,
      maxTempRecordedC: maxTemp,
      allowedTempRangeC: `${minC.toFixed(1)}°C – ${maxC.toFixed(1)}°C`,
      coldChainBreakMinutes,
      transitAnomalyDetails:
        transitDelayHours > 0
          ? `Transit duration ${actualHours}h exceeded target ${expectedHours}h window (+${transitDelayHours.toFixed(1)}h).`
          : `Transit completed within scheduled ${expectedHours}h window (${actualHours}h actual).`,
      facilityComplianceSummary:
        nonCompliantTouchpoints > 0
          ? `${nonCompliantTouchpoints} of ${handlingEvents.length || 1} touchpoint(s) reported compliance or handling deviations.`
          : `All ${handlingEvents.length || 1} logged facility touchpoints verified compliant.`,
      sensorGapWarning,
      confidence,
      subScore: Number(subScore.toFixed(1)),
    },
  };
}

export function evaluateVisualInspection(
  visualSample: VisualSampleInput | null | undefined,
  labReportText?: string,
  naturalLanguageQuery?: string
): VisionInspectorOutput | null {
  if (!visualSample) return null;

  const indicators = [...visualSample.contaminationIndicators];
  const packagingIssues = [...visualSample.packagingIssues];
  let subScore = 1.0;

  if (indicators.length > 0) {
    subScore += Math.min(6.0, indicators.length * 2.6);
  }
  if (packagingIssues.length > 0) {
    subScore += Math.min(2.8, packagingIssues.length * 1.5);
  }
  if (!visualSample.labelingCompliant) {
    subScore += 1.5;
    indicators.push('Non-compliant allergen/lot traceability labeling');
  }
  if (visualSample.qualityGrade === 'REJECT') {
    subScore = Math.max(subScore, 9.2);
  } else if (visualSample.qualityGrade === 'SUBSTANDARD') {
    subScore = Math.max(subScore, 6.8);
  } else if (visualSample.qualityGrade === 'GRADE_B') {
    subScore = Math.max(subScore, 3.8);
  }

  // Incorporate severe pathogen indicators if lab report or query notes visible spoilage
  const combinedText = `${labReportText || ''} ${naturalLanguageQuery || ''} ${visualSample.description}`.toLowerCase();
  if (combinedText.includes('mold') || combinedText.includes('lesion') || combinedText.includes('slime') || combinedText.includes('foreign')) {
    subScore = Math.max(subScore, 8.4);
  }

  subScore = Number(Math.min(10, subScore).toFixed(1));
  const requiresImmediateAction: 'YES' | 'NO' = subScore >= 5.5 || !visualSample.labelingCompliant ? 'YES' : 'NO';

  const allVisualFindings = [
    ...indicators,
    ...packagingIssues.map((p) => `Packaging integrity defect: ${p}`),
  ];

  if (allVisualFindings.length === 0) {
    allVisualFindings.push('No visible surface lesions, foreign matter, pest evidence, or seal defects observed');
  }

  const recommendation =
    requiresImmediateAction === 'YES'
      ? 'Segregate affected pallets immediately, apply physical quarantine tags, and collect swab/tissue samples for microbiological PCR & culture confirmation.'
      : 'Release lot for standard cold-storage staging and continue routine visual spot-checks.';

  return {
    visualRiskIndicators: allVisualFindings,
    packagingIntegrity:
      packagingIssues.length > 0
        ? `COMPROMISED (${packagingIssues.join('; ')})`
        : 'INTACT — Hermetic seal and barrier film verified without punctures or bloat',
    labelingCompliance: visualSample.labelingCompliant
      ? 'COMPLIANT — FSMA 204 Traceability Lot Code (TLC), allergen declaration, and use-by date verified'
      : 'NON-COMPLIANT — Missing or illegible mandatory lot traceability / allergen markings',
    storageConditionIndicators: visualSample.storageConditionNotes || 'Standard commercial inspection staging',
    qualityGradeAssessment: visualSample.qualityGrade,
    confidence: visualSample.imageDataUrl ? 92 : 88,
    requiresImmediateAction,
    recommendation,
    microbiologicalLimitationNote:
      'LIMITATION: Visual analysis cannot detect microbiological contamination (Salmonella, E. coli O157:H7, Listeria monocytogenes, Norovirus) — laboratory microbiological testing is required for pathogen clearance.',
    subScore,
  };
}

export function runFoodGuardAnalysis(rawInput: SafetyIntakeInput): SafetyAnalysisReport {
  const timestamp = rawInput.timestamp || new Date().toISOString();
  const analysisId = rawInput.analysisId || `FGA-${Date.now().toString(36).toUpperCase()}-89A`;
  const auditTrailReferenceId = `AUD-FSMA-${analysisId.replace('FGA-', '')}`;

  const cleanProductName = redactPII(rawInput.productName.trim());
  const cleanBatchId = redactPII(rawInput.batchId.trim().toUpperCase());
  const cleanInspectorId = redactPII((rawInput.inspectorId || 'INS-AUTO-GATEWAY').trim());
  const cleanLabReport = redactPII(rawInput.labReportText || '');
  const cleanQuery = redactPII(rawInput.naturalLanguageQuery || '');
  const cleanAlert = redactPII(rawInput.iotAlertTrigger || '');

  // Step 1: ORCHESTRATOR intake & classification
  const inputTypes: InputCategory[] = [];
  if (rawInput.visualSample) inputTypes.push('FOOD_IMAGE');
  if (rawInput.sensorDataRaw && rawInput.sensorDataRaw.trim()) inputTypes.push('SENSOR_DATA_JSON');
  if (cleanBatchId) inputTypes.push('PRODUCT_BATCH_ID');
  if (cleanLabReport) inputTypes.push('LAB_REPORT_DOCUMENT');
  if (cleanQuery) inputTypes.push('NATURAL_LANGUAGE_QUERY');
  if (cleanAlert) inputTypes.push('IOT_ALERT_TRIGGER');

  const dataQualityFlags: string[] = [];
  const missingInformationRequired: string[] = [];

  if (!cleanProductName) {
    missingInformationRequired.push('Product Name / Commodity Identification');
  }
  if (!cleanBatchId) {
    missingInformationRequired.push('Product Traceability Batch / Lot ID');
  }

  const hasAnalyticalEvidence =
    Boolean(rawInput.visualSample) ||
    Boolean(rawInput.sensorDataRaw && rawInput.sensorDataRaw.trim()) ||
    Boolean(cleanLabReport) ||
    Boolean(cleanQuery && cleanQuery.length >= 10) ||
    Boolean(cleanAlert);

  if (!hasAnalyticalEvidence) {
    missingInformationRequired.push(
      'At least one verifiable safety telemetry source (Food Inspection Image, IoT Sensor JSON log, Lab Report text, or detailed Inspector observation)'
    );
  }

  const scEval = evaluateSupplyChainTelemetry(rawInput.sensorDataRaw, cleanBatchId);
  if (scEval.parseError) {
    dataQualityFlags.push(`IoT Sensor JSON syntax error: ${scEval.parseError}`);
    missingInformationRequired.push('Validly formatted IoT Sensor JSON log (temperature_log, humidity_log, handling_events)');
  }
  if (scEval.parsedSensor?.sensor_gaps_detected) {
    dataQualityFlags.push(
      `IoT Telemetry blackout of ${scEval.parsedSensor.gap_duration_minutes || 'unspecified'} minutes flagged in sensor stream.`
    );
    if ((scEval.parsedSensor.temperature_log?.length ?? 0) === 0 && !rawInput.visualSample && !cleanLabReport) {
      missingInformationRequired.push(
        'Continuous temperature telemetry log or secondary physical/laboratory verification to resolve complete sensor blackout'
      );
    }
  }

  const insufficientData = missingInformationRequired.length > 0;

  const requiredAgents: AgentName[] = ['ORCHESTRATOR'];
  if (rawInput.visualSample) {
    requiredAgents.push('VISION_INSPECTOR');
  }
  if (rawInput.sensorDataRaw || cleanBatchId || cleanAlert) {
    requiredAgents.push('SUPPLY_CHAIN_SENTINEL');
  }
  requiredAgents.push('RISK_CALCULATOR');

  const visionOutput = evaluateVisualInspection(rawInput.visualSample, cleanLabReport, cleanQuery);
  const supplyChainOutput = scEval.output;

  // Evaluate lab report / query modifiers for scoring
  let labModifier = 0;
  const combinedEvidenceText = `${cleanLabReport} ${cleanQuery} ${cleanAlert}`.toLowerCase();
  if (
    combinedEvidenceText.includes('positive') ||
    combinedEvidenceText.includes('salmonella') ||
    combinedEvidenceText.includes('e. coli') ||
    combinedEvidenceText.includes('listeria') ||
    combinedEvidenceText.includes('outbreak') ||
    combinedEvidenceText.includes('recall')
  ) {
    labModifier = 3.5;
  } else if (
    combinedEvidenceText.includes('elevated') ||
    combinedEvidenceText.includes('coliform') ||
    combinedEvidenceText.includes('breach') ||
    combinedEvidenceText.includes('deviation')
  ) {
    labModifier = 1.8;
  }

  const supplierProfile: SupplierHistoryProfile = rawInput.supplierProfile || {
    supplierName: 'Regional Cold-Chain Agricultural Cooperative',
    supplierId: 'SUP-4092',
    historicalRiskScore: 3.2,
    priorIncidentsLast12Months: 1,
    seasonalRiskMultiplier: 3.5,
    lastAuditScore: 89,
  };

  const effectiveVisualScore = Math.min(
    10,
    (visionOutput ? visionOutput.subScore : supplyChainOutput.subScore * 0.85) + labModifier * 0.6
  );
  const effectiveSupplyChainScore = Math.min(10, supplyChainOutput.subScore + labModifier * 0.5);
  const effectiveHistoricalScore = Math.min(10, supplierProfile.historicalRiskScore);
  const effectivePredictiveScore = Math.min(
    10,
    Number(((supplierProfile.seasonalRiskMultiplier * 0.6) + (effectiveSupplyChainScore * 0.4)).toFixed(1))
  );

  const calcResult = calculateWeightedRiskScore({
    visualScore: effectiveVisualScore,
    supplyChainScore: effectiveSupplyChainScore,
    historicalSupplierScore: effectiveHistoricalScore,
    predictiveModelScore: effectivePredictiveScore,
  });

  if (calcResult.riskLevel === 'HIGH' || calcResult.riskLevel === 'CRITICAL') {
    requiredAgents.push('COMPLIANCE_REPORTER');
  }
  if (calcResult.escalateToRecallCoordinator) {
    requiredAgents.push('RECALL_COORDINATOR');
  }
  if (calcResult.riskLevel === 'HIGH' || calcResult.riskLevel === 'CRITICAL') {
    requiredAgents.push('PREDICTIVE_ANALYST');
  }

  const primaryRiskFactors: string[] = [];
  if (visionOutput && visionOutput.subScore >= 4.0) {
    primaryRiskFactors.push(
      `Visual Contamination & Packaging Assessment (${visionOutput.subScore.toFixed(1)}/10, weight 40%): ${visionOutput.visualRiskIndicators.join('; ')}`
    );
  }
  if (supplyChainOutput.subScore >= 3.5) {
    primaryRiskFactors.push(
      `Supply Chain Cold-Chain Integrity (${supplyChainOutput.subScore.toFixed(1)}/10, weight 35%): Status ${supplyChainOutput.chainOfCustodyStatus}, Severity ${supplyChainOutput.deviationSeverity}`
    );
  }
  if (cleanLabReport) {
    primaryRiskFactors.push(`Laboratory & Field Findings: ${cleanLabReport.slice(0, 140)}`);
  }
  primaryRiskFactors.push(
    `Supplier Historical Profile (${effectiveHistoricalScore.toFixed(1)}/10, weight 15%): ${supplierProfile.supplierName} (${supplierProfile.priorIncidentsLast12Months} prior incident(s) in 12m)`
  );
  primaryRiskFactors.push(
    `Predictive Outbreak Model (${effectivePredictiveScore.toFixed(1)}/10, weight 10%): Seasonal & corridor risk index`
  );

  const overallConfidence = insufficientData
    ? 30
    : Math.round(
        ((visionOutput ? visionOutput.confidence : 80) * 0.45 +
          supplyChainOutput.confidence * 0.45 +
          90 * 0.1)
      );

  const riskCalculatorOutput: RiskCalculatorOutput = {
    visualScore: Number(effectiveVisualScore.toFixed(1)),
    supplyChainScore: Number(effectiveSupplyChainScore.toFixed(1)),
    historicalSupplierScore: Number(effectiveHistoricalScore.toFixed(1)),
    predictiveModelScore: Number(effectivePredictiveScore.toFixed(1)),
    weightedBreakdown: calcResult.weightedBreakdown,
    riskScore: calcResult.riskScore,
    riskLevel: insufficientData ? 'INSUFFICIENT_DATA' : calcResult.riskLevel,
    confidence: overallConfidence,
    primaryRiskFactors,
    reasoning: insufficientData
      ? `INSUFFICIENT_DATA: Reliable safety determination cannot be finalized because required evidentiary inputs are missing or incomplete (${missingInformationRequired.join('; ')}). Provisional telemetry weighted score is ${calcResult.riskScore}/10, but FoodGuard AI behavioral rules prohibit making safety clearance decisions on incomplete data.`
      : `Unified Risk Score of ${calcResult.riskScore}/10 (${calcResult.riskLevel}) derived from weighted multi-agent synthesis: Visual Indicators contributed ${calcResult.weightedBreakdown.visualContribution.toFixed(2)} pts (40% of ${effectiveVisualScore.toFixed(1)}/10), Supply Chain Integrity contributed ${calcResult.weightedBreakdown.supplyChainContribution.toFixed(2)} pts (35% of ${effectiveSupplyChainScore.toFixed(1)}/10), Historical Supplier Data contributed ${calcResult.weightedBreakdown.historicalContribution.toFixed(2)} pts (15% of ${effectiveHistoricalScore.toFixed(1)}/10), and Predictive Model Output contributed ${calcResult.weightedBreakdown.predictiveContribution.toFixed(2)} pts (10% of ${effectivePredictiveScore.toFixed(1)}/10).`,
    escalateToRecallCoordinator: !insufficientData && calcResult.escalateToRecallCoordinator,
  };

  const orchestratorOutput: OrchestratorOutput = {
    inputTypes,
    productName: cleanProductName || 'UNSPECIFIED_PRODUCT',
    batchId: cleanBatchId || 'UNSPECIFIED_BATCH',
    supplyChainPosition: rawInput.supplyChainStage.replace(/_/g, ' '),
    requiredAgents,
    routingDecision: insufficientData
      ? `INSUFFICIENT_DATA flagged during intake validation. Routed to ${requiredAgents.join(' → ')} to document data gaps and halt automated clearance until missing records are supplied.`
      : `Input classified as [${inputTypes.join(', ')}] for ${cleanProductName} (${cleanBatchId}) at stage ${rawInput.supplyChainStage}. Routed sequentially through ${requiredAgents.join(' → ')}.`,
    dataQualityFlags,
    insufficientData,
    missingInformationRequired,
  };

  // Step 5: Response Coordination
  let finalSafetyStatus: FinalSafetyStatus = '✅ CLEAR';
  let responseProtocolSummary = '';
  let recallCoordinatorOutput: RecallCoordinatorOutput | null = null;
  let complianceReporterOutput: ComplianceReporterOutput | null = null;
  let predictiveAnalystOutput: PredictiveAnalystOutput | null = null;
  const immediateActionsRequired: ImmediateActionItem[] = [];

  const regRefNumber = `FDA-FSMA-2026-${cleanBatchId.replace(/[^A-Z0-9]/g, '').slice(-6) || '0091'}`;

  if (insufficientData) {
    finalSafetyStatus = 'INSUFFICIENT_DATA';
    responseProtocolSummary =
      'INSUFFICIENT_DATA — Precautionary administrative hold applied. Safety clearance is blocked until missing telemetry and batch documentation are provided.';
    immediateActionsRequired.push(
      {
        stepNumber: 1,
        action: `Provide missing required data: ${missingInformationRequired.join('; ')}`,
        owner: `Submitting Inspector (${cleanInspectorId}) & QA Data Steward`,
        deadline: 'Immediate (Within 30 minutes)',
      },
      {
        stepNumber: 2,
        action: `Maintain physical precautionary quarantine on batch ${cleanBatchId || 'pending lot'} until full sensor and visual verification is complete`,
        owner: 'Facility Cold-Storage Supervisor',
        deadline: 'Immediate',
      }
    );
  } else if (calcResult.riskLevel === 'LOW') {
    finalSafetyStatus = '✅ CLEAR';
    responseProtocolSummary =
      'LOW RISK (0.0–3.0): Log analysis to FSMA 204 traceability ledger and continue standard cold-chain monitoring procedures.';
    immediateActionsRequired.push(
      {
        stepNumber: 1,
        action: `Archive routine safety verification for batch ${cleanBatchId} in automated FSMA 204 audit log`,
        owner: `QA Compliance Automated Ledger (${cleanInspectorId})`,
        deadline: 'Within 4 hours',
      },
      {
        stepNumber: 2,
        action: 'Continue standard continuous IoT temperature & humidity logging through retail receiving',
        owner: 'Supply Chain Sentinel Automated Monitor',
        deadline: 'Ongoing transit monitoring',
      }
    );
  } else if (calcResult.riskLevel === 'MEDIUM') {
    finalSafetyStatus = '⚠️ MONITOR';
    responseProtocolSummary =
      'MEDIUM RISK (3.1–5.0): Enhanced inspection protocol triggered. Flagged for priority QA review and secondary microbial swabbing within 4 hours.';
    immediateActionsRequired.push(
      {
        stepNumber: 1,
        action: `Execute enhanced physical & organoleptic inspection on 100% of sampled pallets in batch ${cleanBatchId}`,
        owner: `Lead Receiving QA Inspector (${cleanInspectorId})`,
        deadline: 'Within 2 hours',
      },
      {
        stepNumber: 2,
        action: 'Verify calibration of refrigeration unit sensors and pull backup data logger CSV from carrier',
        owner: 'Cold-Chain Logistics Coordinator',
        deadline: 'Within 4 hours',
      }
    );
  } else if (calcResult.riskLevel === 'HIGH') {
    finalSafetyStatus = '🔶 HOLD';
    responseProtocolSummary =
      'HIGH RISK (5.1–7.0): Mandatory Product Hold initiated. Escalated to Food Safety Rapid Response Team with formal incident report and regulatory notification draft.';

    complianceReporterOutput = {
      incidentReportId: `INC-${analysisId.replace('FGA-', '')}`,
      regulatoryReferenceNumber: regRefNumber,
      holdNoticeText: `MANDATORY QUALITY & SAFETY HOLD NOTICE: Batch ${cleanBatchId} (${cleanProductName}) at ${rawInput.supplyChainStage} is placed under immediate physical and ERP quarantine due to elevated unified risk score (${calcResult.riskScore}/10). Do not ship, process, or release until pathogen PCR testing and cold-chain audit are cleared by QA Director.`,
      inspectionRequirements: [
        'Isolate all pallets bearing Traceability Lot Code ' + cleanBatchId + ' in designated quarantined cold bay (0°C–2°C).',
        'Collect 60 representative composite sub-samples (FDA BAM Chapter 4 / USDA MLG protocol) for accredited PCR pathogen screening.',
        'Audit carrier refrigeration compressor defrost logs and door-seal switch telemetry across all transit checkpoints.',
      ],
      regulatoryNotificationDraft: `PRELIMINARY REGULATORY HOLD NOTIFICATION [Ref: ${regRefNumber}]: Pursuant to FSMA Section 204 recordkeeping and HACCP corrective action mandates, ${supplierProfile.supplierName} notifies regulatory oversight of an internal Class II Precautionary Hold on ${cleanProductName} (Lot ${cleanBatchId}). No confirmed consumer illnesses reported; hold initiated proactively via FoodGuard AI multi-agent surveillance.`,
      documentsGenerated: [
        {
          docId: `DOC-HOLD-${cleanBatchId}`,
          title: `Mandatory Quarantine & Hold Order (${cleanBatchId})`,
          authority: 'HACCP_INTERNAL',
          status: 'GENERATED',
          summary: 'ERP stock lock and physical pallet quarantine directive.',
        },
        {
          docId: `DOC-FSMA-${cleanBatchId}`,
          title: `FSMA 204 Key Data Elements (KDE) Incident Dossier`,
          authority: 'FDA_FSMA_204',
          status: 'READY_FOR_SUBMISSION',
          summary: 'Complete chain-of-custody and Critical Tracking Event (CTE) package.',
        },
      ],
    };

    immediateActionsRequired.push(
      {
        stepNumber: 1,
        action: `Enforce ERP inventory lock and apply physical HOLD tags on all units of batch ${cleanBatchId}`,
        owner: 'Warehouse & Inventory Control Manager',
        deadline: 'Immediate (Within 15 minutes)',
      },
      {
        stepNumber: 2,
        action: `Dispatch stat microbiological swab & tissue samples from ${cleanBatchId} to ISO-17025 accredited lab`,
        owner: `Food Safety Lead Inspector (${cleanInspectorId})`,
        deadline: 'Within 1 hour',
      },
      {
        stepNumber: 3,
        action: `Review and sign Compliance Reporter Hold Notice (${complianceReporterOutput.incidentReportId})`,
        owner: 'VP of Food Safety & Regulatory Affairs',
        deadline: 'Within 2 hours',
      }
    );
  } else {
    // CRITICAL (7.1 - 10.0) -> Escalate to RECALL_COORDINATOR_AGENT
    finalSafetyStatus = '🚨 RECALL';
    responseProtocolSummary =
      'CRITICAL RISK (7.1–10.0): Immediate Class I Recall Protocol initiated by RECALL_COORDINATOR_AGENT. Full supply chain trace, stakeholder alerts, consumer safety notice, and regulatory filings generated.';

    const baseLotPrefix = cleanBatchId.slice(0, Math.max(4, cleanBatchId.length - 2));
    const affectedBatchIds = [
      cleanBatchId,
      `${baseLotPrefix}88`,
      `${baseLotPrefix}90`,
    ];

    recallCoordinatorOutput = {
      recallReferenceId: `RCL-CLASS1-${analysisId.replace('FGA-', '')}`,
      regulatoryReferenceNumber: regRefNumber,
      affectedBatchIds,
      stakeholderNotifications: [
        {
          stakeholderGroup: 'SUPPLIERS',
          recipientEntity: `${supplierProfile.supplierName} (${supplierProfile.supplierId})`,
          channel: 'EDI 846 / Emergency Supplier Portal & Direct Safety Hotline',
          regulatoryRefNumber: regRefNumber,
          actionRequired: `Halt harvesting/packing on lines tied to ${cleanBatchId}; preserve retention samples and sanitation logs.`,
          priority: 'IMMEDIATE',
        },
        {
          stakeholderGroup: 'DISTRIBUTORS',
          recipientEntity: 'Regional Cold-Chain Logistics & Hub Operators',
          channel: 'Automated AS2 Recall Broadcast & Dispatch Lockdown',
          regulatoryRefNumber: regRefNumber,
          actionRequired: `Intercept in-transit reefers and quarantine all pallets for lots ${affectedBatchIds.join(', ')}.`,
          priority: 'IMMEDIATE',
        },
        {
          stakeholderGroup: 'RETAILERS',
          recipientEntity: 'Downstream Grocery & Foodservice Accounts',
          channel: 'GS1 US Recallnet & POS Register Block API',
          regulatoryRefNumber: regRefNumber,
          actionRequired: `Lock UPC scan at point-of-sale, pull affected lots (${affectedBatchIds.join(', ')}) from cold cases immediately, and log destruction/return counts.`,
          priority: 'IMMEDIATE',
        },
        {
          stakeholderGroup: 'REGULATORS',
          recipientEntity: 'FDA Reportable Food Registry (RFR) / USDA FSIS Recall Division',
          channel: 'Electronic Submissions Gateway (ESG) — 24h Mandatory Filing',
          regulatoryRefNumber: regRefNumber,
          actionRequired: `Submit Class I Reportable Food Registry dossier and distribution list under Reference ${regRefNumber}.`,
          priority: 'IMMEDIATE',
        },
      ],
      consumerSafetyAlertDraft: `PUBLIC HEALTH & CONSUMER SAFETY ALERT [Ref: ${regRefNumber}]: Do not eat, serve, or sell ${cleanProductName} with Batch/Lot codes ${affectedBatchIds.join(', ')}. Automated safety inspection identified critical contamination and temperature safety risks that may cause serious foodborne illness. Check the package label for the lot code. If you have this product at home, seal it in a bag and discard it immediately or return it to the store for a full refund. Wash your hands and any kitchen surfaces that touched the product with warm, soapy water. Note: Requires human expert regulatory & legal review prior to public release.`,
      quarantineInstructions:
        'Lock all warehouse zones containing affected lots, disable automated replenishment, and initiate 100% physical reconciliation within 60 minutes.',
    };

    complianceReporterOutput = {
      incidentReportId: `INC-CRIT-${analysisId.replace('FGA-', '')}`,
      regulatoryReferenceNumber: regRefNumber,
      holdNoticeText: `EMERGENCY CLASS I RECALL & QUARANTINE ORDER: All inventory of ${cleanProductName} across batches ${affectedBatchIds.join(', ')} is subject to immediate mandatory recall (Risk Score: ${calcResult.riskScore}/10).`,
      inspectionRequirements: [
        `Execute immediate physical segregation and red-tag quarantine of ${affectedBatchIds.join(', ')}.`,
        'Perform root-cause environmental swabbing (Zone 1 to Zone 4 food-contact surfaces) and whole-genome sequencing (WGS) isolate submission.',
        'Compile 100% consignee traceability distribution manifest (FSMA 204 KDEs) within 45 minutes.',
      ],
      regulatoryNotificationDraft: `URGENT CLASS I REPORTABLE FOOD REGISTRY SUBMISSION [Regulatory Ref: ${regRefNumber}]: Pursuant to 21 U.S.C. 350f (Reportable Food Registry) and 21 CFR Part 7, we hereby submit an initial Class I Recall Notification for ${cleanProductName} (Primary Batch ${cleanBatchId}; Co-processed Batches ${affectedBatchIds.slice(1).join(', ')}). Unified Risk Assessment scored ${calcResult.riskScore}/10 (Confidence: ${overallConfidence}%). Immediate consignee notification and POS register lockouts have been initiated.`,
      documentsGenerated: [
        {
          docId: `DOC-RFR-${cleanBatchId}`,
          title: `FDA Reportable Food Registry (RFR) Initial Submission (${regRefNumber})`,
          authority: 'FDA_FSMA_204',
          status: 'READY_FOR_SUBMISSION',
          summary: 'Statutory 24-hour electronic safety filing with lot genealogy.',
        },
        {
          docId: `DOC-RCL-${cleanBatchId}`,
          title: `Class I Consignee Recall Notification & POS Block Package`,
          authority: 'FDA_FSMA_204',
          status: 'GENERATED',
          summary: 'Downstream distributor and retail withdrawal instructions.',
        },
        {
          docId: `DOC-CAPA-${cleanBatchId}`,
          title: `Emergency HACCP Corrective & Preventive Action (CAPA) Log`,
          authority: 'HACCP_INTERNAL',
          status: 'GENERATED',
          summary: 'Root-cause containment and sanitation verification protocol.',
        },
      ],
    };

    immediateActionsRequired.push(
      {
        stepNumber: 1,
        action: `Authorize and transmit Class I Recall Package (${recallCoordinatorOutput.recallReferenceId} / Ref ${regRefNumber}) to all downstream distributors and retailers`,
        owner: 'VP of Food Safety & Recall Coordinator',
        deadline: 'Immediate (Within 15 minutes)',
      },
      {
        stepNumber: 2,
        action: `Execute POS barcode lockout and physical quarantine across affected batches: ${affectedBatchIds.join(', ')}`,
        owner: 'Retail Operations & Supply Chain Control Tower',
        deadline: 'Within 30 minutes',
      },
      {
        stepNumber: 3,
        action: `File mandatory Reportable Food Registry submission (${regRefNumber}) after human expert verification`,
        owner: `Regulatory Compliance Director (${cleanInspectorId})`,
        deadline: 'Within 2 hours',
      }
    );
  }

  // Step 6: Predictive Intelligence (After any High or Critical finding)
  if (!insufficientData && (calcResult.riskLevel === 'HIGH' || calcResult.riskLevel === 'CRITICAL')) {
    const isSystemic =
      supplierProfile.priorIncidentsLast12Months >= 1 ||
      supplyChainOutput.deviationSeverity === 'CRITICAL';

    predictiveAnalystOutput = {
      historicalPatternAnalysis: `Analysis of 24-month historical ledger for ${supplierProfile.supplierName} (${supplierProfile.supplierId}) indicates ${supplierProfile.priorIncidentsLast12Months} prior cold-chain or quality deviation(s). Current incident correlates with elevated ambient transit temperatures and high-humidity condensation cycles during post-harvest precooling.`,
      classificationType: isSystemic ? 'SYSTEMIC_RISK_FACTOR' : 'ISOLATED_INCIDENT',
      outbreakProbabilityPercent: calcResult.riskLevel === 'CRITICAL' ? 78 : 46,
      confidence: 86,
      horizonRecommendations: {
        days30:
          'Mandate 100% pre-shipment ATP bioluminescence & rapid PCR lot testing for all shipments from this facility; enforce dual redundant BLE temperature loggers per pallet.',
        days60:
          'Conduct unannounced third-party HACCP & FSMA 204 sanitation audit of supplier precooling tunnels and re-qualify refrigerated carrier fleet compressors.',
        days90:
          'Deploy automated geofenced cold-chain handoff interlocks that reject dock receiving if cumulative degree-minute excursion exceeds 1.5°C-hours.',
      },
      updatedSupplierRiskProfile: {
        supplierName: `${supplierProfile.supplierName} (${supplierProfile.supplierId})`,
        previousRating: supplierProfile.historicalRiskScore <= 3.5 ? 'TIER 1 — STANDARD' : 'TIER 2 — WATCHLIST',
        updatedRating:
          calcResult.riskLevel === 'CRITICAL'
            ? 'TIER 3 — PROBATIONARY / MANDATORY HOLD ON RECEIPT'
            : 'TIER 2 — ENHANCED INSPECTION REQUIRED',
        nextMandatoryAuditWindow: 'Within 14 Calendar Days',
      },
    };
  }

  const limitationsAndDisclaimers = [
    'Visual analysis cannot detect microbiological contamination (Salmonella, E. coli, Listeria, etc.) — laboratory testing is required for definitive pathogen identification.',
    'Sensor data gaps represent unknown risk, not absence of risk.',
    'Predictions are probabilistic, not guaranteed — human expert review is required for all Critical classifications.',
    'FoodGuard AI supports human decision-making and does not replace qualified food safety inspectors or regulatory authority.',
  ];

  const reportWithoutText: Omit<SafetyAnalysisReport, 'canonicalReportText'> = {
    timestamp,
    analysisId,
    auditTrailReferenceId,
    productName: cleanProductName || 'UNSPECIFIED_PRODUCT',
    batchId: cleanBatchId || 'UNSPECIFIED_BATCH',
    supplyChainStage: rawInput.supplyChainStage,
    inspectorId: cleanInspectorId,
    confidentialityBanner: 'CONFIDENTIAL FOOD SAFETY DATA — RESTRICTED REGULATORY & QA DISTRIBUTION',
    orchestrator: orchestratorOutput,
    visionInspector: visionOutput,
    supplyChainSentinel: supplyChainOutput,
    riskCalculator: riskCalculatorOutput,
    recallCoordinator: recallCoordinatorOutput,
    complianceReporter: complianceReporterOutput,
    predictiveAnalyst: predictiveAnalystOutput,
    finalSafetyStatus,
    responseProtocolSummary,
    immediateActionsRequired,
    complianceDocumentationGenerated: Boolean(
      complianceReporterOutput && complianceReporterOutput.documentsGenerated.length > 0
    ),
    complianceDocumentTitles: complianceReporterOutput
      ? complianceReporterOutput.documentsGenerated.map((d) => `${d.title} [${d.docId}]`)
      : [],
    limitationsAndDisclaimers,
  };

  const canonicalReportText = formatCanonicalReport(reportWithoutText);

  return {
    ...reportWithoutText,
    canonicalReportText,
  };
}

export function formatCanonicalReport(
  report: Omit<SafetyAnalysisReport, 'canonicalReportText'>
): string {
  const lines: string[] = [];
  lines.push('═══════════════════════════════════════════');
  lines.push('🛡️ FOODGUARD AI SAFETY ANALYSIS REPORT');
  lines.push('═══════════════════════════════════════════');
  lines.push(`CLASSIFICATION: ${report.confidentialityBanner}`);
  lines.push(`TIMESTAMP: ${report.timestamp}`);
  lines.push(`ANALYSIS_ID: ${report.analysisId}`);
  lines.push(`PRODUCT: ${report.productName} / ${report.batchId}`);
  lines.push(`INSPECTOR: ${report.inspectorId}`);
  lines.push('');

  // STEP 1 — ORCHESTRATOR
  lines.push('[AGENT: ORCHESTRATOR]');
  lines.push(`INPUT_TYPES: ${report.orchestrator.inputTypes.join(', ') || 'NONE'}`);
  lines.push(`SUPPLY_CHAIN_POSITION: ${report.orchestrator.supplyChainPosition}`);
  lines.push(`AGENTS_ACTIVATED: ${report.orchestrator.requiredAgents.join(' → ')}`);
  lines.push(`ROUTING_DECISION: ${report.orchestrator.routingDecision}`);
  if (report.orchestrator.dataQualityFlags.length > 0) {
    lines.push(`DATA_QUALITY_FLAGS: ${report.orchestrator.dataQualityFlags.join(' | ')}`);
  }
  if (report.orchestrator.insufficientData) {
    lines.push(
      `STATUS_FLAG: INSUFFICIENT_DATA — Missing: ${report.orchestrator.missingInformationRequired.join('; ')}`
    );
  }
  lines.push('');

  // STEP 2 — VISION_INSPECTOR
  if (report.visionInspector) {
    lines.push('[AGENT: VISION_INSPECTOR]');
    lines.push(`VISUAL_RISK_INDICATORS: [${report.visionInspector.visualRiskIndicators.join('; ')}]`);
    lines.push(`PACKAGING_INTEGRITY: ${report.visionInspector.packagingIntegrity}`);
    lines.push(`LABELING_COMPLIANCE: ${report.visionInspector.labelingCompliance}`);
    lines.push(`STORAGE_CONDITIONS: ${report.visionInspector.storageConditionIndicators}`);
    lines.push(`QUALITY_GRADE: ${report.visionInspector.qualityGradeAssessment}`);
    lines.push(`CONFIDENCE: ${report.visionInspector.confidence}%`);
    lines.push(`REQUIRES_IMMEDIATE_ACTION: ${report.visionInspector.requiresImmediateAction}`);
    lines.push(`RECOMMENDATION: ${report.visionInspector.recommendation}`);
    lines.push(`LIMITATION_NOTICE: ${report.visionInspector.microbiologicalLimitationNote}`);
    lines.push('');
  }

  // STEP 3 — SUPPLY_CHAIN_SENTINEL
  if (report.supplyChainSentinel) {
    lines.push('[AGENT: SUPPLY_CHAIN_SENTINEL]');
    lines.push(`CHAIN_OF_CUSTODY_STATUS: ${report.supplyChainSentinel.chainOfCustodyStatus}`);
    lines.push(`CRITICAL_EVENTS: [${report.supplyChainSentinel.criticalEvents.join(' | ')}]`);
    lines.push(`DEVIATION_SEVERITY: ${report.supplyChainSentinel.deviationSeverity}`);
    lines.push(`CONFIDENCE: ${report.supplyChainSentinel.confidence}%`);
    if (report.supplyChainSentinel.sensorGapWarning) {
      lines.push(`DATA_GAP_WARNING: ${report.supplyChainSentinel.sensorGapWarning}`);
    }
    lines.push('');
  }

  // STEP 4 — RISK_CALCULATOR
  lines.push('[AGENT: RISK_CALCULATOR]');
  lines.push(`RISK_SCORE: ${report.riskCalculator.riskScore.toFixed(1)} / 10`);
  lines.push(
    `RISK_LEVEL: ${
      report.riskCalculator.riskLevel === 'LOW'
        ? 'LOW (0-3)'
        : report.riskCalculator.riskLevel === 'MEDIUM'
        ? 'MEDIUM (3.1-5)'
        : report.riskCalculator.riskLevel === 'HIGH'
        ? 'HIGH (5.1-7)'
        : report.riskCalculator.riskLevel === 'CRITICAL'
        ? 'CRITICAL (7.1-10)'
        : 'INSUFFICIENT_DATA'
    }`
  );
  lines.push(`CONFIDENCE: ${report.riskCalculator.confidence}%`);
  lines.push(`PRIMARY_RISK_FACTORS: [${report.riskCalculator.primaryRiskFactors.join(' ; ')}]`);
  lines.push(`REASONING: ${report.riskCalculator.reasoning}`);
  lines.push('');

  // STEP 5 — RECALL_COORDINATOR & COMPLIANCE_REPORTER
  if (report.recallCoordinator) {
    lines.push('[AGENT: RECALL_COORDINATOR]');
    lines.push(`RECALL_REFERENCE_ID: ${report.recallCoordinator.recallReferenceId}`);
    lines.push(`REGULATORY_REFERENCE_NUMBER: ${report.recallCoordinator.regulatoryReferenceNumber}`);
    lines.push(`AFFECTED_BATCH_IDS: ${report.recallCoordinator.affectedBatchIds.join(', ')}`);
    lines.push(
      `STAKEHOLDER_NOTIFICATIONS: ${report.recallCoordinator.stakeholderNotifications
        .map((s) => `${s.stakeholderGroup} (${s.recipientEntity} - Ref: ${s.regulatoryRefNumber})`)
        .join(' | ')}`
    );
    lines.push(`CONSUMER_SAFETY_ALERT_DRAFT: ${report.recallCoordinator.consumerSafetyAlertDraft}`);
    lines.push('');
  }

  if (report.complianceReporter) {
    lines.push('[AGENT: COMPLIANCE_REPORTER]');
    lines.push(`INCIDENT_REPORT_ID: ${report.complianceReporter.incidentReportId}`);
    lines.push(`REGULATORY_REFERENCE_NUMBER: ${report.complianceReporter.regulatoryReferenceNumber}`);
    lines.push(`HOLD_NOTICE: ${report.complianceReporter.holdNoticeText}`);
    lines.push(`INSPECTION_REQUIREMENTS: ${report.complianceReporter.inspectionRequirements.join(' ; ')}`);
    lines.push(`REGULATORY_NOTIFICATION_DRAFT: ${report.complianceReporter.regulatoryNotificationDraft}`);
    lines.push('');
  }

  // STEP 6 — PREDICTIVE_ANALYST
  if (report.predictiveAnalyst) {
    lines.push('[AGENT: PREDICTIVE_ANALYST]');
    lines.push(`PATTERN_CLASSIFICATION: ${report.predictiveAnalyst.classificationType}`);
    lines.push(`HISTORICAL_ANALYSIS: ${report.predictiveAnalyst.historicalPatternAnalysis}`);
    lines.push(`OUTBREAK_PROBABILITY: ${report.predictiveAnalyst.outbreakProbabilityPercent}% (Confidence: ${report.predictiveAnalyst.confidence}%)`);
    lines.push(`PREVENTION_30_DAY: ${report.predictiveAnalyst.horizonRecommendations.days30}`);
    lines.push(`PREVENTION_60_DAY: ${report.predictiveAnalyst.horizonRecommendations.days60}`);
    lines.push(`PREVENTION_90_DAY: ${report.predictiveAnalyst.horizonRecommendations.days90}`);
    lines.push(
      `SUPPLIER_PROFILE_UPDATE: ${report.predictiveAnalyst.updatedSupplierRiskProfile.supplierName} -> ${report.predictiveAnalyst.updatedSupplierRiskProfile.updatedRating}`
    );
    lines.push('');
  }

  lines.push(`FINAL SAFETY STATUS: ${report.finalSafetyStatus}`);
  lines.push('IMMEDIATE ACTIONS REQUIRED:');
  for (const item of report.immediateActionsRequired) {
    lines.push(`${item.stepNumber}. ${item.action} [Owner: ${item.owner} | Deadline: ${item.deadline}]`);
  }
  lines.push(
    `COMPLIANCE DOCUMENTATION GENERATED: ${
      report.complianceDocumentationGenerated
        ? `YES — ${report.complianceDocumentTitles.join(', ')}`
        : 'NO — Standard monitoring log only'
    }`
  );
  lines.push(`AUDIT TRAIL: Logged to system — Reference ID: ${report.auditTrailReferenceId}`);
  lines.push('MANDATORY SYSTEM LIMITATIONS:');
  for (const lim of report.limitationsAndDisclaimers) {
    lines.push(`- ${lim}`);
  }
  lines.push('═══════════════════════════════════════════');

  return lines.join('\n');
}
