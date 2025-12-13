import Papa from "papaparse";
import { PARAM_FIELD_SECTIONS } from "~/config/param_fields";
import type { Parameters, ScenarioParameters, SourceInfo, SourceType, SourceClassification } from "~/types/mod";
import { t } from "~/translate/mod";

const VALID_SOURCE_TYPES: SourceType[] = [
  "survey",
  "administrative",
  "estimate",
  "literature",
  "expert_opinion",
  "assumption",
  "unknown",
];

const VALID_SOURCE_CLASSIFICATIONS: SourceClassification[] = [
  "high_confidence",
  "medium_confidence",
  "low_confidence",
  "unclassified",
];

export function importParametersFromCSV(csvContent: string): Parameters {
  const parsed = Papa.parse(csvContent, {
    skipEmptyLines: true,
  });

  const rows = parsed.data as string[][];

  if (rows.length === 0) {
    throw new Error(t("CSV file is empty"));
  }

  const headers = rows[0];

  const baseIndex = headers.findIndex((h) => h.toUpperCase() === "BASE");
  if (baseIndex === -1) {
    throw new Error(t("CSV must have a 'BASE' column"));
  }

  const sourceDescIndex = headers.findIndex(
    (h) => h.toLowerCase() === "source_description"
  );
  const sourceTypeIndex = headers.findIndex(
    (h) => h.toLowerCase() === "source_type"
  );
  const sourceClassificationIndex = headers.findIndex(
    (h) => h.toLowerCase() === "source_classification"
  );
  const hasSourceColumns = sourceDescIndex !== -1 && sourceTypeIndex !== -1;

  const baselineSourceInfo: Record<string, SourceInfo> = {};

  // Scenario columns are between BASE and source columns (or end of headers)
  const endOfScenarios = hasSourceColumns
    ? Math.min(sourceDescIndex, sourceTypeIndex, sourceClassificationIndex !== -1 ? sourceClassificationIndex : Infinity)
    : headers.length;
  const scenarioNames = headers
    .slice(baseIndex + 1, endOfScenarios)
    .filter((h) => h.length > 0);

  const baseline: Partial<ScenarioParameters> = {
    id: crypto.randomUUID(),
    name: "Base case",
    pregnancyOutcomes: {} as any,
    familyPlanning: {} as any,
    demand: {} as any,
    facilityAccess: {} as any,
    outOfFacilityAccess: {} as any,
    facilityReadiness: {} as any,
    outOfFacilityReadiness: {} as any,
    adjustments: {
      familyPlanning: false,
      demand: false,
      facilityAccess: false,
      outOfFacilityAccess: false,
      facilityReadiness: false,
      outOfFacilityReadiness: false,
    },
  };

  const scenarios: Partial<ScenarioParameters>[] = scenarioNames.map(
    (name, i) => ({
      id: crypto.randomUUID(),
      name: name || `Scenario ${i + 1}`,
      pregnancyOutcomes: {} as any,
      familyPlanning: {} as any,
      demand: {} as any,
      facilityAccess: {} as any,
      outOfFacilityAccess: {} as any,
      facilityReadiness: {} as any,
      outOfFacilityReadiness: {} as any,
      adjustments: {
        familyPlanning: false,
        demand: false,
        facilityAccess: false,
        outOfFacilityAccess: false,
        facilityReadiness: false,
        outOfFacilityReadiness: false,
      },
    })
  );

  const allScenarios = [baseline, ...scenarios];

  const paramIdMap = new Map<
    string,
    {
      category: string;
      property: string;
      parseFunc: (v: string) => number;
      baselineOnly?: boolean;
    }
  >();

  paramIdMap.set("pregnancyOutcomes.nUnintendedPregnancies", {
    category: "pregnancyOutcomes",
    property: "nUnintendedPregnancies",
    parseFunc: parseNumber,
    baselineOnly: true,
  });
  paramIdMap.set("pregnancyOutcomes.pResultingInMiscarriage", {
    category: "pregnancyOutcomes",
    property: "pResultingInMiscarriage",
    parseFunc: parsePercent,
    baselineOnly: true,
  });

  for (const section of PARAM_FIELD_SECTIONS) {
    for (const slider of section.fields) {
      const paramId = `${slider.category}.${slider.property}`;
      paramIdMap.set(paramId, {
        category: slider.category,
        property: slider.property,
        parseFunc: parsePercent,
      });
    }
  }

  const foundParams = new Set<string>();

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const paramId = row[0];

    const mapping = paramIdMap.get(paramId);
    if (!mapping) {
      if (paramId && paramId.trim().length > 0) {
        throw new Error(
          `CSV import: Unknown parameter "${paramId}" on row ${rowIndex + 1}`
        );
      }
      continue;
    }

    foundParams.add(paramId);

    if (hasSourceColumns) {
      const sourceDesc = row[sourceDescIndex]?.trim() ?? "";
      const sourceTypeRaw = row[sourceTypeIndex]?.trim().toLowerCase() ?? "";
      const sourceType: SourceType = VALID_SOURCE_TYPES.includes(
        sourceTypeRaw as SourceType
      )
        ? (sourceTypeRaw as SourceType)
        : "unknown";

      const sourceClassificationRaw =
        sourceClassificationIndex !== -1
          ? row[sourceClassificationIndex]?.trim().toLowerCase() ?? ""
          : "";
      const sourceClassification: SourceClassification =
        VALID_SOURCE_CLASSIFICATIONS.includes(
          sourceClassificationRaw as SourceClassification
        )
          ? (sourceClassificationRaw as SourceClassification)
          : "unclassified";

      baselineSourceInfo[paramId] = {
        description: sourceDesc,
        type: sourceType,
        classification: sourceClassification,
      };
    } else {
      baselineSourceInfo[paramId] = {
        description: "",
        type: "unknown",
        classification: "unclassified",
      };
    }

    // For baseline-only parameters, only parse BASE column
    if (mapping.baselineOnly) {
      const cellValue = row[baseIndex];
      if (!cellValue || cellValue.trim().length === 0) {
        throw new Error(
          `CSV import: Missing value for parameter "${paramId}" in column BASE on row ${
            rowIndex + 1
          }`
        );
      }
      const numericValue = mapping.parseFunc(cellValue);

      // Set value for all scenarios (needed for object structure, even though calc only uses baseline)
      for (const scenario of allScenarios) {
        (scenario[mapping.category as keyof ScenarioParameters] as any)[
          mapping.property
        ] = numericValue;
      }
    } else {
      // Regular parameters - parse each column
      for (let i = 0; i < allScenarios.length; i++) {
        const cellValue = row[baseIndex + i];
        if (!cellValue || cellValue.trim().length === 0) {
          throw new Error(
            `CSV import: Missing value for parameter "${paramId}" in column ${
              i === 0 ? "BASE" : scenarioNames[i - 1] || `Scenario ${i}`
            } on row ${rowIndex + 1}`
          );
        }
        const numericValue = mapping.parseFunc(cellValue);
        const scenario = allScenarios[i];
        (scenario[mapping.category as keyof ScenarioParameters] as any)[
          mapping.property
        ] = numericValue;
      }
    }
  }

  // IMPORTANT: Strict parameter validation
  // When new parameters are added to the model, we REQUIRE them to be present in CSV imports.
  // This is a deliberate design decision:
  // - For CSV uploads: Throws an error, user must update their CSV file
  // - For project loading: Throws an error, project load fails and project is skipped
  // We do NOT provide default values or silently fill missing parameters.
  // This ensures data integrity and forces explicit handling of new model requirements.
  const missingParams: string[] = [];
  for (const [paramId] of paramIdMap) {
    if (!foundParams.has(paramId)) {
      missingParams.push(paramId);
    }
  }

  if (missingParams.length > 0) {
    throw new Error(
      `CSV import: Missing required parameters: ${missingParams.join(", ")}`
    );
  }

  for (const scenario of scenarios) {
    updateAdjustmentFlags(
      scenario as ScenarioParameters,
      baseline as ScenarioParameters
    );
  }

  // Force contraindication to 0 for all scenarios
  baseline.pregnancyOutcomes!.pResultingInContraindication = 0;
  for (const scenario of scenarios) {
    scenario.pregnancyOutcomes!.pResultingInContraindication = 0;
  }

  const baselineParams = baseline as ScenarioParameters;

  return {
    baseline: baselineParams,
    scenarios: scenarios as ScenarioParameters[],
    originalBaseline: JSON.parse(JSON.stringify(baselineParams)),
    baselineSourceInfo,
  };
}

function updateAdjustmentFlags(
  scenario: ScenarioParameters,
  baseline: ScenarioParameters
): void {
  scenario.adjustments.familyPlanning = hasChanges(
    scenario.familyPlanning,
    baseline.familyPlanning
  );
  scenario.adjustments.demand = hasChanges(scenario.demand, baseline.demand);
  scenario.adjustments.facilityAccess = hasChanges(
    scenario.facilityAccess,
    baseline.facilityAccess
  );
  scenario.adjustments.outOfFacilityAccess = hasChanges(
    scenario.outOfFacilityAccess,
    baseline.outOfFacilityAccess
  );
  scenario.adjustments.facilityReadiness = hasChanges(
    scenario.facilityReadiness,
    baseline.facilityReadiness
  );
  scenario.adjustments.outOfFacilityReadiness = hasChanges(
    scenario.outOfFacilityReadiness,
    baseline.outOfFacilityReadiness
  );
}

function hasChanges(scenarioObj: any, baselineObj: any): boolean {
  for (const key in scenarioObj) {
    if (Math.abs(scenarioObj[key] - baselineObj[key]) > 0.0001) {
      return true;
    }
  }
  return false;
}

function parseNumber(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  const num = parseFloat(cleaned);
  if (isNaN(num)) {
    throw new Error(`${t("Invalid number value")}: ${value}`);
  }
  return num;
}

function parsePercent(value: string): number {
  const cleaned = value.replace("%", "").replace(/,/g, "").trim();
  const num = parseFloat(cleaned);
  if (isNaN(num)) {
    throw new Error(`${t("Invalid percentage value")}: ${value}`);
  }
  return num / 100;
}
