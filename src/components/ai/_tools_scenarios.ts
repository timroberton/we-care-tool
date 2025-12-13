import type { AITool } from "panther";
import { type SetStoreFunction } from "solid-js/store";
import type { Parameters, ScenarioParameters } from "~/types/mod";
import { addScenario, removeScenario } from "~/utils/scenario_actions";
import { uiStore } from "~/stores/ui";

type AdjustmentCategory = keyof ScenarioParameters["adjustments"];

type ParameterChange = {
  category?: AdjustmentCategory;
  property?: string;
  value?: number;
};

type AddScenarioInput = {
  name?: string;
  parameters?: ParameterChange[];
};

type DeleteScenarioInput = {
  scenarioId?: string;
};

type ToolsContext = {
  params: () => Parameters;
  setParams: SetStoreFunction<Parameters>;
};

export function createScenarioTools(context: ToolsContext) {
  const addScenarioTool: AITool<AddScenarioInput, string> = {
    name: "add_scenario",
    description:
      "CREATE A NEW SCENARIO for comparing interventions. Use this when the user wants to model a new intervention, policy change, or 'what if' scenario. The new scenario starts with baseline parameter values and can be modified using update_parameter. Always provide a descriptive name. Optionally specify initial parameter changes to avoid creating blank scenarios.",
    input_schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description:
            "REQUIRED. The name for the new scenario. Extract from user's request (e.g., if user says 'add scenario called Tim', use 'Tim'). Must never be empty or omitted.",
        },
        parameters: {
          type: "array",
          description:
            "OPTIONAL but recommended. Array of parameter changes to apply when creating the scenario. Uses same structure as update_parameter. Prevents creating blank scenarios.",
          items: {
            type: "object",
            properties: {
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
                description: "REQUIRED. Parameter category to modify.",
              },
              property: {
                type: "string",
                description:
                  "REQUIRED. Property name within category (e.g., 'pMetDemandForFamilyPlanning').",
              },
              value: {
                type: "number",
                description: "REQUIRED. New value (0-1 for percentages).",
              },
            },
            required: ["category", "property", "value"],
          },
        },
      },
      required: ["name"],
      additionalProperties: false,
    },
    handler: async (input: AddScenarioInput) => {
      try {
        const params = context.params();
        const scenarioName =
          input.name || `Scenario ${params.scenarios.length + 1}`;

        const newScenarioId = addScenario(
          params,
          context.setParams,
          scenarioName
        );

        const messages: string[] = [];

        messages.push(
          `Successfully added new scenario "${scenarioName}" (id: ${newScenarioId}).`
        );

        if (input.parameters && input.parameters.length > 0) {
          const paramsAfterAdd = context.params();
          const newScenarioIndex = paramsAfterAdd.scenarios.findIndex(
            (s) => s.id === newScenarioId
          );

          if (newScenarioIndex === -1) {
            messages.push(
              `Warning: Could not find newly created scenario to apply parameters.`
            );
          } else {
            const newScenario = paramsAfterAdd.scenarios[newScenarioIndex];

            for (const param of input.parameters) {
              if (
                !param.category ||
                !param.property ||
                param.value === undefined
              ) {
                messages.push(
                  `Warning: Skipped invalid parameter change - missing required fields.`
                );
                continue;
              }

              const categoryObj = newScenario[param.category] as Record<
                string,
                number
              >;
              if (!categoryObj) {
                messages.push(
                  `Warning: Category '${param.category}' not found.`
                );
                continue;
              }

              if (categoryObj[param.property] === undefined) {
                messages.push(
                  `Warning: Property '${param.property}' not found in category '${param.category}'.`
                );
                continue;
              }

              context.setParams(
                "scenarios",
                newScenarioIndex,
                param.category as any,
                param.property as any,
                param.value
              );

              context.setParams(
                "scenarios",
                newScenarioIndex,
                "adjustments",
                param.category,
                true
              );

              const formatValue = (v: number) =>
                v >= 0 && v <= 1 ? `${(v * 100).toFixed(0)}%` : v.toString();
              messages.push(
                `  • Set ${param.category}.${param.property} to ${formatValue(
                  param.value
                )}`
              );
            }

            // Re-select the scenario after all modifications to ensure UI updates correctly
            uiStore.setSelectedScenarioIndex(newScenarioIndex);
          }
        } else {
          messages.push(
            "Initialized with baseline values. All adjustments are off."
          );
        }

        return messages.join("\n");
      } catch (error) {
        return `Error creating scenario: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    },
    inProgressLabel: (input) =>
      `Adding scenario "${input.name || "new scenario"}"...`,
  };

  const deleteScenarioTool: AITool<DeleteScenarioInput, string> = {
    name: "delete_scenario",
    description:
      "REMOVE A SCENARIO from the project. Use when the user wants to delete a scenario they no longer need. Requires the scenario ID (get from list_parameters). This is permanent and cannot be undone.",
    input_schema: {
      type: "object",
      properties: {
        scenarioId: {
          type: "string",
          description:
            "REQUIRED. The unique ID of the scenario to delete. Use list_parameters tool to see scenario IDs.",
        },
      },
      required: ["scenarioId"],
      additionalProperties: false,
    },
    handler: async (input: DeleteScenarioInput) => {
      if (!input.scenarioId) {
        return "Error: scenarioId is required";
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

      const scenarioName = params.scenarios[scenarioIndex].name;
      removeScenario(params, context.setParams, scenarioIndex);
      return `Successfully deleted scenario "${scenarioName}" from the project.`;
    },
    inProgressLabel: "Deleting scenario...",
  };

  return [addScenarioTool, deleteScenarioTool] as AITool[];
}
