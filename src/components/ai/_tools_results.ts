import type { AITool } from "panther";
import type { Parameters, Results } from "~/types/mod";
import {
  getReadableTextFromResults,
  getBibliography,
  type ReadableResultsOptions,
} from "~/utils/text_for_ai/mod";

type ToolsContext = {
  results: () => Results;
  params: () => Parameters;
};

type GetResultsInput = {
  includeDetailedTable: boolean;
};

export function createResultsTools(context: ToolsContext) {
  const getResultsTool: AITool<GetResultsInput, string> = {
    name: "get_results",
    description:
      "SHOWS MODEL OUTCOMES/RESULTS for baseline and all scenarios. Returns calculated health outcomes (unintended pregnancies, abortions, safety levels, complications, etc.) NOT input parameters. Shows what happens as a result of the baseline/scenario parameters. Use this when the user asks about outcomes, results, impacts, or wants to compare scenario performance. Always includes baseline results plus all scenario results for comparison. Also includes a bibliography of data sources used for baseline parameters.",
    input_schema: {
      type: "object",
      properties: {
        includeDetailedTable: {
          type: "boolean",
          description:
            "Set to true for comprehensive analysis with detailed breakdown of all metrics (pregnancies, demand, access, service provision, abortion outcomes, complications, post-abortion care). Set to false for quick overview with executive summary and key pathway metrics only.",
        },
      },
      required: ["includeDetailedTable"],
      additionalProperties: false,
    },
    handler: async (input: GetResultsInput) => {
      const options: ReadableResultsOptions = {
        includeDetailedTable: input.includeDetailedTable,
      };

      const resultsText = getReadableTextFromResults(context.results(), options);
      const bibliography = getBibliography(context.params().baselineSourceInfo);

      return resultsText + bibliography;
    },
    inProgressLabel: "Retrieving results...",
  };

  return [getResultsTool] as AITool[];
}
