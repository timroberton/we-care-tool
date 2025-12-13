import type { AITool } from "panther";
import { type SetStoreFunction } from "solid-js/store";
import type { Parameters, ScenarioParameters, SourceInfo } from "~/types/mod";
import { uiStore } from "~/stores/ui";
import { getBibliography } from "~/utils/text_for_ai/mod";

function formatSourceInfo(
  sourceInfo: Record<string, SourceInfo> | undefined,
  category: string,
  property: string,
  maxDescLength: number = 80
): string {
  const key = `${category}.${property}`;
  const info = sourceInfo?.[key];
  if (!info || !info.description) {
    return "";
  }

  let desc = info.description;
  if (desc.length > maxDescLength) {
    desc = desc.slice(0, maxDescLength - 3) + "...";
  }

  const parts: string[] = [`Source: ${desc}`];

  if (info.type && info.type !== "unknown") {
    parts.push(`Type: ${info.type}`);
  }

  const classification = info.classification ?? "unclassified";
  if (classification !== "unclassified") {
    const evidenceLabels: Record<string, string> = {
      "high_confidence": "Strong evidence",
      "medium_confidence": "Moderate evidence",
      "low_confidence": "Weak evidence",
    };
    const evidenceLabel = evidenceLabels[classification];
    if (evidenceLabel) {
      parts.push(`Evidence: ${evidenceLabel}`);
    }
  }

  return ` [${parts.join(", ")}]`;
}

type AdjustmentCategory = keyof ScenarioParameters["adjustments"];

type UpdateParameterInput = {
  scenarioId?: string;
  category?: AdjustmentCategory;
  property?: string;
  value?: number;
};

type ToolsContext = {
  params: () => Parameters;
  setParams: SetStoreFunction<Parameters>;
};

export function createParameterTools(context: ToolsContext) {
  const listParametersTool: AITool<{}, string> = {
    name: "list_parameters",
    description:
      "SHOWS BASELINE PARAMETER VALUES (with data source info) and lists all scenarios. Returns all baseline input parameter values (family planning rates, access percentages, readiness levels, etc.) along with their data source information when available (e.g., survey name, data type). Use this tool when the user asks about baseline parameters, input values, data sources, or which scenarios exist. Essential for understanding what parameter values the baseline is using and where the data came from.",
    input_schema: {
      type: "object",
      properties: {},
    },
    handler: async () => {
      const params = context.params();
      const baseline = params.baseline;
      const sourceInfo = params.baselineSourceInfo;

      const info: string[] = [];
      info.push("BASELINE PARAMETER VALUES:");
      info.push("");
      info.push(
        "Category: pregnancyOutcomes (cannot be modified in scenarios)"
      );
      Object.keys(baseline.pregnancyOutcomes).forEach((key) => {
        const src = formatSourceInfo(sourceInfo, "pregnancyOutcomes", key);
        info.push(`  - ${key}: ${(baseline.pregnancyOutcomes as any)[key]}${src}`);
      });
      info.push("");
      info.push("Category: familyPlanning (baseline)");
      Object.keys(baseline.familyPlanning).forEach((key) => {
        const src = formatSourceInfo(sourceInfo, "familyPlanning", key);
        info.push(`  - ${key}: ${(baseline.familyPlanning as any)[key]}${src}`);
      });
      info.push("");
      info.push("Category: demand (baseline)");
      Object.keys(baseline.demand).forEach((key) => {
        const src = formatSourceInfo(sourceInfo, "demand", key);
        info.push(`  - ${key}: ${(baseline.demand as any)[key]}${src}`);
      });
      info.push("");
      info.push("Category: facilityAccess (baseline)");
      Object.keys(baseline.facilityAccess).forEach((key) => {
        const src = formatSourceInfo(sourceInfo, "facilityAccess", key);
        info.push(`  - ${key}: ${(baseline.facilityAccess as any)[key]}${src}`);
      });
      info.push("");
      info.push("Category: outOfFacilityAccess (baseline)");
      Object.keys(baseline.outOfFacilityAccess).forEach((key) => {
        const src = formatSourceInfo(sourceInfo, "outOfFacilityAccess", key);
        info.push(`  - ${key}: ${(baseline.outOfFacilityAccess as any)[key]}${src}`);
      });
      info.push("");
      info.push("Category: facilityReadiness (baseline)");
      Object.keys(baseline.facilityReadiness).forEach((key) => {
        const src = formatSourceInfo(sourceInfo, "facilityReadiness", key);
        info.push(`  - ${key}: ${(baseline.facilityReadiness as any)[key]}${src}`);
      });
      info.push("");
      info.push("Category: outOfFacilityReadiness (baseline)");
      Object.keys(baseline.outOfFacilityReadiness).forEach((key) => {
        const src = formatSourceInfo(sourceInfo, "outOfFacilityReadiness", key);
        info.push(
          `  - ${key}: ${(baseline.outOfFacilityReadiness as any)[key]}${src}`
        );
      });
      info.push("");
      info.push("AVAILABLE SCENARIOS:");
      const selectedScenarioIndex = uiStore.selectedScenarioIndex;
      params.scenarios.forEach((s, i) => {
        const selected = i === selectedScenarioIndex ? " [SELECTED]" : "";
        info.push(`  ${i + 1}. "${s.name}" (id: ${s.id})${selected}`);
      });

      const bibliography = getBibliography(sourceInfo);
      return info.join("\n") + bibliography;
    },
    inProgressLabel: "Listing available parameters...",
  };

  const updateParameterTool: AITool<UpdateParameterInput, string> = {
    name: "update_parameter",
    description: `MODIFY SCENARIO PARAMETERS to model interventions. Use this when the user wants to change a scenario's inputs (e.g., "increase family planning to 90%", "improve access within distance to 80%"). Can ONLY modify scenario parameters, NOT baseline (baseline is read-only reference point).

Available intervention categories:
- familyPlanning: Change contraception coverage/effectiveness (pMetDemandForFamilyPlanning, pCombinedEffectivenessOfMethods)
- demand: Change abortion demand patterns (pDemandForAbortion, pPreferFacility)
- facilityAccess: Change facility access barriers (pAccessibleDistance, pNoLegalRestrictions, pFacilityOffersAbortion, pAffordable)
- outOfFacilityAccess: Change out-of-facility access (pAccessibleDistance, pAffordable)
- facilityReadiness/outOfFacilityReadiness: Change service availability

Values are proportions 0-1. User says "95%" → use 0.95. Use list_parameters first to get exact property names and scenario IDs.`,
    input_schema: {
      type: "object",
      properties: {
        scenarioId: {
          type: "string",
          description:
            "REQUIRED. The unique ID of the scenario to update. Use list_parameters to see scenario IDs.",
        },
        category: {
          type: "string",
          enum: [
            "familyPlanning",
            "demand",
            "facilityAccess",
            "outOfFacilityAccess",
            "facilityReadiness",
            "outOfFacilityReadiness",
          ],
          description:
            "REQUIRED. Parameter category to update. Must be one of the listed enum values.",
        },
        property: {
          type: "string",
          description:
            "REQUIRED. Specific property within the category (e.g., 'pMetDemandForFamilyPlanning'). Use list_parameters tool to see all available properties if unsure.",
        },
        value: {
          type: "number",
          description:
            "REQUIRED. New value (use 0-1 for percentages, e.g., 0.95 for 95%)",
        },
      },
      required: ["scenarioId", "category", "property", "value"],
      additionalProperties: false,
    },
    handler: async (input: UpdateParameterInput) => {
      try {
        if (
          Object.keys(input).length === 0 ||
          (!input.scenarioId &&
            !input.category &&
            !input.property &&
            input.value === undefined)
        ) {
          return "";
        }

        if (!input.scenarioId) {
          return "Error: scenarioId is required. Use list_parameters to see scenario IDs.";
        }

        if (!input.category) {
          return "Error: category parameter is required. Call list_parameters to see available categories.";
        }

        if (!input.property) {
          return "Error: property parameter is required. Call list_parameters to see available properties for this category.";
        }

        if (input.value === undefined || input.value === null) {
          return "Error: value parameter is required";
        }

        const params = context.params();
        const scenarioIndex = params.scenarios.findIndex(
          (s) => s.id === input.scenarioId
        );
        if (scenarioIndex === -1) {
          const available = params.scenarios
            .map((s) => `"${s.name}" (id: ${s.id})`)
            .join(", ");
          return `Error: Scenario with ID '${input.scenarioId}' not found. Available scenarios: [${available}]`;
        }

        const targetParams = params.scenarios[scenarioIndex];

        const categoryObj = targetParams[input.category] as Record<
          string,
          number
        >;
        if (!categoryObj) {
          return `Error: Category '${input.category}' not found`;
        }

        const oldValue = categoryObj[input.property!];
        if (oldValue === undefined) {
          return `Error: Property '${input.property}' not found in category '${input.category}'`;
        }

        context.setParams(
          "scenarios",
          scenarioIndex,
          input.category as any,
          input.property as any,
          input.value
        );

        context.setParams(
          "scenarios",
          scenarioIndex,
          "adjustments",
          input.category,
          true
        );

        uiStore.setSelectedScenarioIndex(scenarioIndex);

        const formatValue = (v: number) =>
          v >= 0 && v <= 1 ? `${(v * 100).toFixed(0)}%` : v.toString();

        const scenarioName = params.scenarios[scenarioIndex].name;
        const result = `Updated scenario '${scenarioName}': ${input.category}.${
          input.property
        } from ${formatValue(oldValue)} to ${formatValue(
          input.value
        )}. Adjustment flag enabled.`;
        return result;
      } catch (error) {
        const errorMessage = `Error in update_parameter: ${
          error instanceof Error ? error.message : String(error)
        }`;
        console.error("update_parameter error:", errorMessage, error);
        return errorMessage;
      }
    },
    inProgressLabel: (input) =>
      `Updating ${input.category || "parameter"}.${input.property || "..."}...`,
  };

  return [listParametersTool, updateParameterTool] as AITool[];
}
