import type { AITool } from "panther";
import { type SetStoreFunction } from "solid-js/store";
import type { Parameters, Results } from "~/types/mod";
import { createParameterTools } from "./_tools_parameters";
import { createScenarioTools } from "./_tools_scenarios";
import { createReportTools } from "./_tools_reports";
import { createResultsTools } from "./_tools_results";
import { createVisualizationTools } from "./_tools_visualizations";

type ToolsContext = {
  results: () => Results;
  params: () => Parameters;
  setParams: SetStoreFunction<Parameters>;
  projectId: string;
};

export function createAITools(context: ToolsContext) {
  return [
    ...createParameterTools(context),
    ...createScenarioTools(context),
    ...createReportTools(context),
    ...createResultsTools(context),
    ...createVisualizationTools(context),
  ] as AITool[];
}
