import type { AITool } from "panther";
import { toNum0, toPct1 } from "panther";
import type { Results } from "~/types/mod";
import {
  FLOW_MODELS,
  type FlowModelKey,
} from "~/components/results/_flow_models";

type ListChartsInput = Record<string, never>;

type DescribeChartInput = {
  chartId?: string;
};

type DescribeFlowInput = {
  modelType?: "summary" | "standard" | "full-detail";
  scenarioName?: string;
};

type ToolsContext = {
  results: () => Results;
};

export function createVisualizationTools(context: ToolsContext) {
  const listChartsTool: AITool<ListChartsInput, string> = {
    name: "list_charts",
    description:
      "SHOW AVAILABLE CHARTS/VISUALIZATIONS. Returns all chart IDs and what they display. Use this when the user asks what charts are available or before calling describe_chart to get detailed chart data.",
    input_schema: {
      type: "object",
      properties: {},
    },
    handler: async () => {
      const charts = [
        {
          id: "safety-outcomes",
          description:
            "Safety outcomes comparing safe, less safe, and least safe abortions across all scenarios (stacked bar chart)",
        },
        {
          id: "safe-abortion-proportion",
          description:
            "Proportion of abortions that are safe, showing improvement over baseline (stacked bar chart)",
        },
        {
          id: "service-distribution",
          description:
            "Distribution of abortion services received, showing types of services by safety category (bar chart)",
        },
        {
          id: "flow-diagram-full",
          description:
            "Full detail flow diagram showing the complete pathway from unintended pregnancies through seeking, access, and final outcomes",
        },
        {
          id: "flow-diagram-medium",
          description:
            "Medium detail flow diagram showing simplified pathway with access and outcomes",
        },
        {
          id: "flow-diagram-summary",
          description:
            "Summary flow diagram showing high-level pathway from seeking to final outcomes",
        },
      ];

      return `AVAILABLE VISUALIZATIONS:\n\n${charts
        .map((c, i) => `${i + 1}. ${c.id}\n   ${c.description}`)
        .join("\n\n")}`;
    },
    inProgressLabel: "Listing charts...",
  };

  const describeChartTool: AITool<DescribeChartInput, string> = {
    name: "describe_chart",
    description:
      "GET DETAILED CHART DATA with numbers for all scenarios. Returns the actual values displayed in a specific chart (e.g., safety outcomes, safe abortion proportions). Use when the user wants to see or analyze chart data. Get available chartId values from list_charts.",
    input_schema: {
      type: "object",
      properties: {
        chartId: {
          type: "string",
          enum: [
            "safety-outcomes",
            "safe-abortion-proportion",
            "service-distribution",
          ],
          description:
            "REQUIRED. The ID of the chart to describe. Must be one of: safety-outcomes, safe-abortion-proportion, service-distribution.",
        },
      },
      required: ["chartId"],
      additionalProperties: false,
    },
    handler: async (input: DescribeChartInput) => {
      if (!input.chartId) {
        return "Error: chartId is required. Use list_charts to see available chart IDs.";
      }

      const results = context.results();
      const allScenarios = [results.baseline, ...results.scenarios];

      if (input.chartId === "safety-outcomes") {
        const sections: string[] = [
          "SAFETY OUTCOMES CHART",
          "Compares abortion safety categories across all scenarios\n",
        ];

        allScenarios.forEach((scenario) => {
          sections.push(`Scenario: ${scenario.name}`);
          sections.push(
            `  Safe abortions: ${toNum0(
              scenario.abortionOutcomes.abortions.safe.n
            )} (${toPct1(
              scenario.abortionOutcomes.abortions.safe.pAmongAbortions
            )})`
          );
          sections.push(
            `  Less safe abortions: ${toNum0(
              scenario.abortionOutcomes.abortions.lessSafe.n
            )} (${toPct1(
              scenario.abortionOutcomes.abortions.lessSafe.pAmongAbortions
            )})`
          );
          sections.push(
            `  Least safe abortions: ${toNum0(
              scenario.abortionOutcomes.abortions.leastSafe.n
            )} (${toPct1(
              scenario.abortionOutcomes.abortions.leastSafe.pAmongAbortions
            )})`
          );
          sections.push("");
        });

        return sections.join("\n");
      }

      if (input.chartId === "safe-abortion-proportion") {
        const sections: string[] = [
          "SAFE ABORTION PROPORTION CHART",
          "Shows proportion of safe abortions and improvement over baseline\n",
        ];

        const baselineProportion =
          results.baseline.abortionOutcomes.abortions.safe.pAmongAbortions;

        allScenarios.forEach((scenario) => {
          const scenarioProportion =
            scenario.abortionOutcomes.abortions.safe.pAmongAbortions;
          const improvement = scenarioProportion - baselineProportion;

          sections.push(`Scenario: ${scenario.name}`);
          sections.push(`  Baseline proportion: ${toPct1(baselineProportion)}`);
          sections.push(`  Scenario proportion: ${toPct1(scenarioProportion)}`);
          sections.push(
            `  Improvement: ${improvement >= 0 ? "+" : ""}${toPct1(
              improvement
            )}`
          );
          sections.push("");
        });

        return sections.join("\n");
      }

      if (input.chartId === "service-distribution") {
        const scenario = results.baseline;
        const sections: string[] = [
          "SERVICE DISTRIBUTION CHART (Baseline only)",
          "Shows types of abortion services received by safety category\n",
        ];

        sections.push("FACILITY SERVICES (Safe):");
        if (scenario.facilityReceipt.ma) {
          sections.push(
            `  Medical abortion (MA): ${toNum0(scenario.facilityReceipt.ma.n)}`
          );
        }
        if (scenario.facilityReceipt.mva) {
          sections.push(
            `  Manual vacuum aspiration (MVA): ${toNum0(
              scenario.facilityReceipt.mva.n
            )}`
          );
        }
        if (scenario.facilityReceipt.electric) {
          sections.push(
            `  Electric vacuum aspiration: ${toNum0(
              scenario.facilityReceipt.electric.n
            )}`
          );
        }

        sections.push("\nFACILITY SERVICES (Less safe):");
        if (scenario.facilityReceipt.dc) {
          sections.push(
            `  Dilation & curettage (D&C): ${toNum0(
              scenario.facilityReceipt.dc.n
            )}`
          );
        }
        if (scenario.facilityReceipt.other) {
          sections.push(
            `  Other methods: ${toNum0(scenario.facilityReceipt.other.n)}`
          );
        }

        sections.push("\nOUT-OF-FACILITY SERVICES:");
        if (scenario.outOfFacilityReceipt.maCorrect) {
          sections.push(
            `  MA - correct (Safe): ${toNum0(
              scenario.outOfFacilityReceipt.maCorrect.n
            )}`
          );
        }
        if (scenario.outOfFacilityReceipt.maIncorrect) {
          sections.push(
            `  MA - incorrect (Less safe): ${toNum0(
              scenario.outOfFacilityReceipt.maIncorrect.n
            )}`
          );
        }
        if (scenario.outOfFacilityReceipt.other) {
          sections.push(
            `  Other methods (Least safe): ${toNum0(
              scenario.outOfFacilityReceipt.other.n
            )}`
          );
        }

        sections.push(
          `\nNo abortion: ${toNum0(
            scenario.facilityReceipt.noAbortion.n +
              scenario.outOfFacilityReceipt.noAbortion.n
          )}`
        );

        return sections.join("\n");
      }

      return `Error: Unknown chart ID '${input.chartId}'`;
    },
    inProgressLabel: "Describing chart...",
  };

  const describeFlowTool: AITool<DescribeFlowInput, string> = {
    name: "describe_flow_diagram",
    description:
      "SHOW PATHWAY FLOW from unintended pregnancies → seeking → access → outcomes. Shows how women move through the care pathway with numbers at each step. Useful for understanding the complete care pathway. Choose detail level: 'summary' (high-level), 'standard' (includes access points), 'full-detail' (all steps including safety breakdowns). Optionally specify scenarioName to compare baseline → scenario.",
    input_schema: {
      type: "object",
      properties: {
        modelType: {
          type: "string",
          enum: ["summary", "standard", "full-detail"],
          description:
            "REQUIRED. Level of detail: 'full-detail' shows all steps including safety categories at each access point, 'standard' shows access points and final outcomes, 'summary' shows only seek/don't seek and final outcomes.",
        },
        scenarioName: {
          type: "string",
          description:
            "OPTIONAL. Name of scenario to display. If OMITTED, shows baseline data only. If PROVIDED, shows comparison format with baseline values → scenario values. Use list_parameters to see available scenario names.",
        },
      },
      required: ["modelType"],
      additionalProperties: false,
    },
    handler: async (input: DescribeFlowInput) => {
      if (!input.modelType) {
        return "Error: modelType is required. Must be 'full', 'medium', or 'summary'.";
      }

      const results = context.results();
      let scenario = results.baseline;
      let baseline: typeof results.baseline | undefined;

      if (input.scenarioName) {
        const foundScenario = results.scenarios.find(
          (s) => s.name === input.scenarioName
        );
        if (!foundScenario) {
          const available = results.scenarios.map((s) => s.name).join("', '");
          return `Error: Scenario '${input.scenarioName}' not found. Available scenarios: ['${available}']`;
        }
        baseline = results.baseline;
        scenario = foundScenario;
      }

      const flowData = FLOW_MODELS[input.modelType as FlowModelKey](
        scenario,
        baseline
      );

      const sections: string[] = [
        `FLOW DIAGRAM: ${input.modelType.toUpperCase()} DETAIL`,
        input.scenarioName
          ? `Scenario: ${input.scenarioName} (compared to baseline)`
          : "Scenario: Baseline",
        "",
        "PATHWAY:",
      ];

      flowData.boxes.forEach((box) => {
        const indent = "  ".repeat(box.layer ?? 0);
        const text = Array.isArray(box.text) ? box.text.join(" ") : box.text;
        const secondaryText = Array.isArray(box.secondaryText)
          ? box.secondaryText.join(", ")
          : box.secondaryText;

        sections.push(`${indent}${text}: ${secondaryText}`);
      });

      return sections.join("\n");
    },
    inProgressLabel: "Describing flow diagram...",
  };

  return [listChartsTool, describeChartTool, describeFlowTool] as AITool[];
}
