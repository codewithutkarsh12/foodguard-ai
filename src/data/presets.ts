import { SafetyIntakeInput } from '../utils/foodSafetyEngine';

export interface PresetScenario {
  id: string;
  title: string;
  subtitle: string;
  badgeText: string;
  expectedRiskBand: 'CRITICAL (Recall)' | 'HIGH (Hold)' | 'MEDIUM (Monitor)' | 'LOW (Clear)' | 'INSUFFICIENT_DATA';
  specimenSvgType: 'SPINACH_CRITICAL' | 'SALMON_HIGH' | 'POULTRY_MEDIUM' | 'DAIRY_LOW' | 'SENSOR_GAP';
  intake: SafetyIntakeInput;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'spinach-critical-recall',
    title: 'Organic Baby Spinach — STEC & Cold-Chain Failure',
    subtitle: 'Batch LOT-SPN-2026-089 · Distribution Hub Intake',
    badgeText: 'CRITICAL · 9.5/10',
    expectedRiskBand: 'CRITICAL (Recall)',
    specimenSvgType: 'SPINACH_CRITICAL',
    intake: {
      analysisId: 'FGA-2026-0891C',
      timestamp: '2026-10-23T08:15:00.000Z',
      productName: 'Ready-to-Eat Organic Baby Spinach (16 oz Clamshell)',
      batchId: 'LOT-SPN-2026-089',
      supplyChainStage: 'DISTRIBUTION_HUB',
      inspectorId: 'INS-8841-FDA',
      visualSample: {
        sampleId: 'IMG-SPN-089',
        sampleType: 'PACKAGING',
        description:
          'Clamshell tray LOT-SPN-2026-089 inspected on stainless steel receiving table: dark water-soaked bacterial leaf lesions across ~35% of foliage, heavy interior fogging/condensation, and a 14mm corner lidding film delamination.',
        contaminationIndicators: [
          'Dark water-soaked necrotic leaf lesions (35% surface area)',
          'Viscous bacterial exudate and tissue maceration at bottom of tray',
          'Heavy internal condensation droplets indicating thermal cycling',
        ],
        packagingIssues: [
          '14mm top-right heat-seal lidding film delamination breach',
        ],
        labelingCompliant: true,
        storageConditionNotes: 'Infrared surface thermometer reading 9.8°C at pallet core upon dock arrival',
        qualityGrade: 'REJECT',
      },
      sensorDataRaw: JSON.stringify(
        {
          required_temp_min_c: 0.0,
          required_temp_max_c: 4.0,
          expected_transit_hours: 18,
          actual_transit_hours: 25.5,
          sensor_gaps_detected: false,
          gap_duration_minutes: 195,
          temperature_log: [
            { timestamp: '2026-10-22T06:00:00Z', celsius: 2.1, location: 'Salinas Valley Hydro-Cooler #2' },
            { timestamp: '2026-10-22T12:00:00Z', celsius: 3.4, location: 'Carrier Reefer Unit #TR-409' },
            { timestamp: '2026-10-22T18:00:00Z', celsius: 8.9, location: 'I-5 Kettleman Transfer Node' },
            { timestamp: '2026-10-23T01:00:00Z', celsius: 10.4, location: 'Regional Distribution Hub Dock 14' },
          ],
          humidity_log: [
            { timestamp: '2026-10-22T06:00:00Z', percent: 84, location: 'Salinas Valley Hydro-Cooler #2' },
            { timestamp: '2026-10-23T01:00:00Z', percent: 96, location: 'Regional Distribution Hub Dock 14' },
          ],
          handling_events: [
            {
              timestamp: '2026-10-22T06:30:00Z',
              facility: 'Salinas Valley Packinghouse #4',
              event: 'Chlorine wash free-chlorine residual dipped to 12 ppm (below 50 ppm critical limit)',
              compliant: false,
              anomaly_flag: true,
            },
            {
              timestamp: '2026-10-22T17:40:00Z',
              facility: 'I-5 Kettleman Transfer Node',
              event: 'Reefer evaporator coil freeze fault; trailer doors opened 50 mins during cross-dock',
              compliant: false,
              anomaly_flag: true,
            },
          ],
        },
        null,
        2
      ),
      labReportText:
        'LAB REPORT #LR-99201: Rapid BAX PCR screening on composite wash of LOT-SPN-2026-089 returned PRESUMPTIVE POSITIVE for Shiga toxin-producing E. coli (stx1/stx2 genes detected). Aerobic Plate Count: 6.8 log CFU/g.',
      naturalLanguageQuery:
        'Receiving dock inspection flagged warm pallets and slimy lesions on Ready-to-Eat Organic Baby Spinach LOT-SPN-2026-089. Determine immediate recall scope and affected sister batches.',
      iotAlertTrigger: 'ALERT-IOT-991: Continuous excursion >8.0°C for 195 minutes on Reefer #TR-409.',
      supplierProfile: {
        supplierName: 'Verde Valley Leafy Greens Co-op',
        supplierId: 'SUP-VV-209',
        historicalRiskScore: 7.4,
        priorIncidentsLast12Months: 2,
        seasonalRiskMultiplier: 8.2,
        lastAuditScore: 74,
      },
    },
  },
  {
    id: 'salmon-high-hold',
    title: 'Atlantic Salmon Fillets — Vacuum Seal Breach & Excursion',
    subtitle: 'Batch LOT-SAL-2026-412 · Cold Transit Audit',
    badgeText: 'HIGH · 6.0/10',
    expectedRiskBand: 'HIGH (Hold)',
    specimenSvgType: 'SALMON_HIGH',
    intake: {
      analysisId: 'FGA-2026-0412H',
      timestamp: '2026-10-23T07:40:00.000Z',
      productName: 'Vacuum-Packed Fresh Atlantic Salmon Portions (2.5 kg Foodservice)',
      batchId: 'LOT-SAL-2026-412',
      supplyChainStage: 'COLD_TRANSIT',
      inspectorId: 'INS-3319-NOAA',
      visualSample: {
        sampleId: 'IMG-SAL-412',
        sampleType: 'PACKAGING',
        description:
          'Vacuum skin-pack pouch shows loss of negative pressure (ballooning/slack film) on 3 of 24 master cases and mild pale muscle discoloration along the dorsal edge.',
        contaminationIndicators: [
          'Loss of vacuum negative pressure in 12.5% of inspected pouches',
          'Mild surface dullness and localized drip purge accumulation',
        ],
        packagingIssues: ['Micro-channel wrinkle across thermal impulse seal bar'],
        labelingCompliant: true,
        storageConditionNotes: 'Reduced Oxygen Packaging (ROP) requires strict <3.3°C control to prevent C. botulinum type E toxinogenesis',
        qualityGrade: 'SUBSTANDARD',
      },
      sensorDataRaw: JSON.stringify(
        {
          required_temp_min_c: -1.0,
          required_temp_max_c: 3.3,
          expected_transit_hours: 14,
          actual_transit_hours: 19,
          sensor_gaps_detected: false,
          gap_duration_minutes: 95,
          temperature_log: [
            { timestamp: '2026-10-22T15:00:00Z', celsius: 1.2, location: 'Coastal Seafood Processing Plant' },
            { timestamp: '2026-10-22T22:00:00Z', celsius: 5.6, location: 'Airport Cold Cargo Staging Bay' },
            { timestamp: '2026-10-23T04:00:00Z', celsius: 2.9, location: 'Metro Seafood Hub Vault B' },
          ],
          humidity_log: [
            { timestamp: '2026-10-22T22:00:00Z', percent: 78, location: 'Airport Cold Cargo Staging Bay' },
          ],
          handling_events: [
            {
              timestamp: '2026-10-22T21:45:00Z',
              facility: 'Airport Cold Cargo Staging Bay',
              event: 'Pallet staged on unrefrigerated tarmac apron for 95 minutes during freight transfer',
              compliant: false,
              anomaly_flag: true,
            },
          ],
        },
        null,
        2
      ),
      labReportText:
        'Histamine screen: 18 ppm (below 50 ppm FDA defect action level). Listeria monocytogenes & C. botulinum PCR pending 24h enrichment.',
      naturalLanguageQuery:
        'Reduced-oxygen packaged salmon LOT-SAL-2026-412 experienced a 5.6°C excursion (>3.3°C ROP threshold) for 95 minutes and shows loose vacuum seals. Issue Hold Notice and compliance inspection protocol.',
      iotAlertTrigger: 'ALERT-ROP-33: ROP temperature exceeded 3.3°C safety ceiling for Clostridium botulinum.',
      supplierProfile: {
        supplierName: 'Nordic Fjord Aquaculture Ltd.',
        supplierId: 'SUP-NFA-118',
        historicalRiskScore: 4.5,
        priorIncidentsLast12Months: 1,
        seasonalRiskMultiplier: 4.8,
        lastAuditScore: 86,
      },
    },
  },
  {
    id: 'poultry-medium-monitor',
    title: 'Air-Chilled Poultry Breast — Minor Transit Delay',
    subtitle: 'Batch LOT-PLT-2026-305 · Processing Plant Dispatch',
    badgeText: 'MEDIUM · 3.7/10',
    expectedRiskBand: 'MEDIUM (Monitor)',
    specimenSvgType: 'POULTRY_MEDIUM',
    intake: {
      analysisId: 'FGA-2026-0305M',
      timestamp: '2026-10-23T06:50:00.000Z',
      productName: 'Boneless Skinless Air-Chilled Chicken Breast Trays',
      batchId: 'LOT-PLT-2026-305',
      supplyChainStage: 'PROCESSING_PLANT',
      inspectorId: 'INS-6042-FSIS',
      visualSample: {
        sampleId: 'IMG-PLT-305',
        sampleType: 'RAW_PRODUCT',
        description:
          'Clean pink muscle tissue, intact modified-atmosphere overwrap film, minor scuffing on outer corrugated master carton.',
        contaminationIndicators: [],
        packagingIssues: ['Minor exterior master-carton corner compression (inner primary tray seal intact)'],
        labelingCompliant: true,
        storageConditionNotes: 'Chilled staging room maintained at 2.4°C',
        qualityGrade: 'GRADE_B',
      },
      sensorDataRaw: JSON.stringify(
        {
          required_temp_min_c: -1.0,
          required_temp_max_c: 4.0,
          expected_transit_hours: 12,
          actual_transit_hours: 14.5,
          sensor_gaps_detected: false,
          gap_duration_minutes: 30,
          temperature_log: [
            { timestamp: '2026-10-22T18:00:00Z', celsius: 1.8, location: 'Plant Chill Tunnel Exit' },
            { timestamp: '2026-10-23T00:00:00Z', celsius: 4.4, location: 'Loading Dock Staging' },
            { timestamp: '2026-10-23T05:00:00Z', celsius: 2.2, location: 'Route 81 Reefer #22' },
          ],
          humidity_log: [
            { timestamp: '2026-10-23T00:00:00Z', percent: 72, location: 'Loading Dock Staging' },
          ],
          handling_events: [
            {
              timestamp: '2026-10-23T00:10:00Z',
              facility: 'Plant Dispatch Dock 3',
              event: 'Brief 0.4°C peak during pallet loading; recovered within 25 minutes',
              compliant: true,
              anomaly_flag: false,
            },
          ],
        },
        null,
        2
      ),
      labReportText: 'Routine USDA FSIS Salmonella performance standard set: 0 positive of 51 samples to date.',
      naturalLanguageQuery:
        'Evaluate minor 4.4°C loading dock spike and outer carton scuff on LOT-PLT-2026-305.',
      supplierProfile: {
        supplierName: 'Shenandoah Valley Poultry Growers',
        supplierId: 'SUP-SVP-512',
        historicalRiskScore: 3.0,
        priorIncidentsLast12Months: 0,
        seasonalRiskMultiplier: 3.2,
        lastAuditScore: 93,
      },
    },
  },
  {
    id: 'dairy-low-clear',
    title: 'Grade-A Pasteurized Whole Milk — Nominal Cold Chain',
    subtitle: 'Batch LOT-DRY-2026-104 · Retail Shelf Verification',
    badgeText: 'LOW · 1.2/10',
    expectedRiskBand: 'LOW (Clear)',
    specimenSvgType: 'DAIRY_LOW',
    intake: {
      analysisId: 'FGA-2026-0104L',
      timestamp: '2026-10-23T06:10:00.000Z',
      productName: 'Grade-A HTST Pasteurized Organic Whole Milk (1 Gallon HDPE)',
      batchId: 'LOT-DRY-2026-104',
      supplyChainStage: 'RETAIL_SHELF',
      inspectorId: 'INS-2190-STATE',
      visualSample: {
        sampleId: 'IMG-DRY-104',
        sampleType: 'STORAGE_CONDITIONS',
        description:
          'HDPE jugs sealed with tamper-evident induction foil liner intact, crisp inkjet lot code, clean refrigerated display case at 2.1°C.',
        contaminationIndicators: [],
        packagingIssues: [],
        labelingCompliant: true,
        storageConditionNotes: 'Display case air curtain operating at 2.1°C',
        qualityGrade: 'GRADE_A',
      },
      sensorDataRaw: JSON.stringify(
        {
          required_temp_min_c: 0.5,
          required_temp_max_c: 4.0,
          expected_transit_hours: 10,
          actual_transit_hours: 9.5,
          sensor_gaps_detected: false,
          gap_duration_minutes: 0,
          temperature_log: [
            { timestamp: '2026-10-22T20:00:00Z', celsius: 1.9, location: 'Dairy Pasteurization Silo B' },
            { timestamp: '2026-10-23T01:00:00Z', celsius: 2.3, location: 'Dedicated Milk Tanker #08' },
            { timestamp: '2026-10-23T05:30:00Z', celsius: 2.1, location: 'Retail Cold Vault #11' },
          ],
          humidity_log: [
            { timestamp: '2026-10-23T05:30:00Z', percent: 65, location: 'Retail Cold Vault #11' },
          ],
          handling_events: [
            {
              timestamp: '2026-10-22T19:45:00Z',
              facility: 'Creamery HTST Line 2',
              event: 'Alkaline phosphatase test negative; HTST 72.8°C for 16 sec verified',
              compliant: true,
              anomaly_flag: false,
            },
          ],
        },
        null,
        2
      ),
      labReportText: 'Coliform count <1 CFU/mL; Somatic Cell Count 110,000 cells/mL; Antibiotic beta-lactam screen Negative.',
      naturalLanguageQuery: 'Routine retail verification for LOT-DRY-2026-104.',
      supplierProfile: {
        supplierName: 'Cascade Pasture Creamery Cooperative',
        supplierId: 'SUP-CPC-044',
        historicalRiskScore: 1.2,
        priorIncidentsLast12Months: 0,
        seasonalRiskMultiplier: 1.4,
        lastAuditScore: 98,
      },
    },
  },
  {
    id: 'sensor-gap-insufficient',
    title: 'Imported Soft Ripened Brie — Telemetry Blackout',
    subtitle: 'Batch LOT-CHE-2026-000 · Incomplete Data Verification',
    badgeText: 'INSUFFICIENT DATA',
    expectedRiskBand: 'INSUFFICIENT_DATA',
    specimenSvgType: 'SENSOR_GAP',
    intake: {
      analysisId: 'FGA-2026-0000U',
      timestamp: '2026-10-23T05:30:00.000Z',
      productName: 'Unpasteurized Raw-Milk Soft Ripened Brie Wheels',
      batchId: 'LOT-CHE-2026-000',
      supplyChainStage: 'COLD_TRANSIT',
      inspectorId: 'INS-7710-CBP',
      visualSample: null,
      sensorDataRaw: JSON.stringify(
        {
          required_temp_min_c: 1.0,
          required_temp_max_c: 4.0,
          expected_transit_hours: 36,
          actual_transit_hours: 42,
          sensor_gaps_detected: true,
          gap_duration_minutes: 840,
          temperature_log: [],
          humidity_log: [],
          handling_events: [
            {
              timestamp: '2026-10-22T11:00:00Z',
              facility: 'Port of Entry Container Yard',
              event: 'IoT cellular gateway battery depleted for 14 hours; zero temperature points logged',
              compliant: false,
              anomaly_flag: true,
            },
          ],
        },
        null,
        2
      ),
      labReportText: '',
      naturalLanguageQuery: '',
      iotAlertTrigger: 'ALERT-GAP-840: 14-hour telemetry dropout during ocean-to-rail intermodal transfer.',
      supplierProfile: {
        supplierName: 'Normandie Fromagerie Artisanal',
        supplierId: 'SUP-NFA-802',
        historicalRiskScore: 5.5,
        priorIncidentsLast12Months: 1,
        seasonalRiskMultiplier: 5.0,
        lastAuditScore: 81,
      },
    },
  },
];
