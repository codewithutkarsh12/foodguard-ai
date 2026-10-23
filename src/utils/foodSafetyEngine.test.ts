import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateWeightedRiskScore,
  evaluateSupplyChainTelemetry,
  redactPII,
  runFoodGuardAnalysis,
} from './foodSafetyEngine';

test('calculateWeightedRiskScore applies 40/35/15/10 weights accurately and escalates above 7.0', () => {
  const criticalResult = calculateWeightedRiskScore({
    visualScore: 9.0, // 3.6
    supplyChainScore: 8.0, // 2.8
    historicalSupplierScore: 6.0, // 0.9
    predictiveModelScore: 7.0, // 0.7 => total 8.0
  });

  assert.equal(criticalResult.riskScore, 8.0);
  assert.equal(criticalResult.riskLevel, 'CRITICAL');
  assert.equal(criticalResult.escalateToRecallCoordinator, true);
  assert.equal(criticalResult.weightedBreakdown.visualContribution, 3.6);
  assert.equal(criticalResult.weightedBreakdown.supplyChainContribution, 2.8);
  assert.equal(criticalResult.weightedBreakdown.historicalContribution, 0.9);
  assert.equal(criticalResult.weightedBreakdown.predictiveContribution, 0.7);

  const lowResult = calculateWeightedRiskScore({
    visualScore: 1.0,
    supplyChainScore: 1.0,
    historicalSupplierScore: 2.0,
    predictiveModelScore: 1.5,
  });

  assert.equal(lowResult.riskScore, 1.2);
  assert.equal(lowResult.riskLevel, 'LOW');
  assert.equal(lowResult.escalateToRecallCoordinator, false);
});

test('runFoodGuardAnalysis triggers RECALL_COORDINATOR and PREDICTIVE_ANALYST on Critical scenario', () => {
  const report = runFoodGuardAnalysis({
    productName: 'Organic Baby Spinach 16oz Clamshell',
    batchId: 'LOT-SPN-2026-089',
    supplyChainStage: 'DISTRIBUTION_HUB',
    inspectorId: 'INS-4410',
    visualSample: {
      sampleType: 'PACKAGING',
      description: 'Dark water-soaked leaf lesions and internal condensation with seal micro-tear',
      contaminationIndicators: [
        'Dark bacterial water-soaked lesions on 35% of leaves',
        'Excessive slimy exudate and foul odor',
      ],
      packagingIssues: ['Corner heat-seal delamination (14mm breach)'],
      labelingCompliant: true,
      storageConditionNotes: 'Staging pallet measured at 9.8°C surface temp',
      qualityGrade: 'REJECT',
    },
    sensorDataRaw: JSON.stringify({
      required_temp_min_c: 0,
      required_temp_max_c: 4.0,
      expected_transit_hours: 18,
      actual_transit_hours: 25,
      sensor_gaps_detected: false,
      temperature_log: [
        { timestamp: '2026-10-22T08:00:00Z', celsius: 2.8, location: 'Salinas Precooler' },
        { timestamp: '2026-10-22T14:00:00Z', celsius: 9.4, location: 'I-5 Corridor Reefer #12' },
        { timestamp: '2026-10-22T20:00:00Z', celsius: 10.6, location: 'Central Hub Receiving Dock' },
      ],
      humidity_log: [{ timestamp: '2026-10-22T20:00:00Z', percent: 94, location: 'Central Hub Receiving Dock' }],
      handling_events: [
        {
          timestamp: '2026-10-22T14:15:00Z',
          facility: 'I-5 Transit Carrier',
          event: 'Reefer compressor fault code E-09; door opened for 55m during unscheduled stop',
          compliant: false,
          anomaly_flag: true,
        },
      ],
    }),
    labReportText: 'Presumptive positive Shiga toxin-producing E. coli (STEC) PCR screen on composite leaf wash.',
  });

  assert.equal(report.finalSafetyStatus, '🚨 RECALL');
  assert.ok(report.riskCalculator.riskScore > 7.0);
  assert.ok(report.orchestrator.requiredAgents.includes('RECALL_COORDINATOR'));
  assert.ok(report.orchestrator.requiredAgents.includes('COMPLIANCE_REPORTER'));
  assert.ok(report.orchestrator.requiredAgents.includes('PREDICTIVE_ANALYST'));
  assert.ok(report.recallCoordinator !== null);
  assert.ok(report.recallCoordinator!.affectedBatchIds.includes('LOT-SPN-2026-089'));
  assert.equal(report.recallCoordinator!.stakeholderNotifications.length, 4);
  assert.ok(report.canonicalReportText.includes('🛡️ FOODGUARD AI SAFETY ANALYSIS REPORT'));
  assert.ok(report.canonicalReportText.includes('[AGENT: RECALL_COORDINATOR]'));
});

test('runFoodGuardAnalysis flags INSUFFICIENT_DATA when required evidence or batch metadata is missing', () => {
  const report = runFoodGuardAnalysis({
    productName: '',
    batchId: '',
    supplyChainStage: 'COLD_TRANSIT',
    inspectorId: 'INS-102',
  });

  assert.equal(report.orchestrator.insufficientData, true);
  assert.equal(report.finalSafetyStatus, 'INSUFFICIENT_DATA');
  assert.ok(report.orchestrator.missingInformationRequired.length >= 2);
  assert.ok(report.canonicalReportText.includes('INSUFFICIENT_DATA'));
});

test('evaluateSupplyChainTelemetry flags sensor data gaps explicitly as unknown risk', () => {
  const res = evaluateSupplyChainTelemetry(
    JSON.stringify({
      required_temp_min_c: 0,
      required_temp_max_c: 4,
      sensor_gaps_detected: true,
      gap_duration_minutes: 180,
      temperature_log: [],
    }),
    'LOT-GAP-900'
  );

  assert.equal(res.output.chainOfCustodyStatus, 'UNKNOWN');
  assert.ok(res.output.sensorGapWarning?.includes('Sensor data gaps represent unknown risk'));
});

test('redactPII strips emails and phone numbers from inspector queries', () => {
  const sanitized = redactPII('Contact john.doe@freshfarms.org or 555-234-5678 regarding LOT-901');
  assert.equal(sanitized.includes('john.doe@freshfarms.org'), false);
  assert.equal(sanitized.includes('555-234-5678'), false);
  assert.ok(sanitized.includes('[REDACTED_EMAIL]'));
  assert.ok(sanitized.includes('[REDACTED_PHONE]'));
  assert.ok(sanitized.includes('LOT-901'));
});
