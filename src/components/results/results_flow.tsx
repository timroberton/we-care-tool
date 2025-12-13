import { trackDeep } from "@solid-primitives/deep";
import type { SimpleVizInputs } from "panther";
import { Button, ChartHolder, Select, downloadBase64Image } from "panther";
import { createMemo, Show } from "solid-js";
import { uiStore } from "~/stores/ui";
import type { Results } from "~/types/mod";
import { renderFigureToBase64 } from "~/utils/image_capture";
import { cleanFilename } from "~/utils/clean_filename";
import { getFlowInputs } from "./_flow_inputs";
import { getFlowModelOptions, type FlowModelKey } from "./_flow_models";
import { t, td } from "~/translate/mod";

type Props = {
  results: Results;
};

export function ResultsFlow(p: Props) {
  const handleFlowModelChange = (model: FlowModelKey) => {
    uiStore.setSelectedFlowModel(model);
  };

  const selectedScenarioValue = () => String(uiStore.selectedScenarioIndex);

  const scenarioOptions = createMemo(() => [
    { value: "-1", label: td(p.results.baseline.name) },
    ...p.results.scenarios.map((scenario, i) => ({
      value: String(i),
      label: `${t("Scenario")} ${i + 1}. ${scenario.name}`,
    })),
  ]);

  const flowData = createMemo<SimpleVizInputs>(() => {
    trackDeep(p.results);
    return getFlowInputs(
      p.results,
      uiStore.selectedScenarioIndex,
      uiStore.selectedFlowModel
    );
  });

  const handleDownload = () => {
    const scenario =
      uiStore.selectedScenarioIndex === -1
        ? p.results.baseline
        : p.results.scenarios[uiStore.selectedScenarioIndex];
    const scenarioName = scenario?.name || "base-case";
    const modelType = uiStore.selectedFlowModel;
    const filename = cleanFilename(`flow diagram ${scenarioName} ${modelType}`);

    downloadBase64Image(
      renderFigureToBase64(flowData(), 1200, 2, true),
      `${filename}.png`
    );
  };

  return (
    <div class="flex flex-col justify-start h-full">
      <div class="ui-pad flex ui-gap items-center border-b border-base-300 flex-none w-full sticky top-0 bg-base-100">
        <Show when={scenarioOptions()} keyed>
          {(options) => (
            <Select
              options={options}
              value={selectedScenarioValue()}
              onChange={(v) => uiStore.setSelectedScenarioIndex(Number(v))}
              fullWidth
            />
          )}
        </Show>
        <Select
          options={getFlowModelOptions()}
          value={uiStore.selectedFlowModel}
          onChange={(v) => handleFlowModelChange(v as FlowModelKey)}
          // horizontal
        />
      </div>
      <div class="relative w-full flex-1 overflow-y-scroll h-0 ui-pad">
        <div class="relative">
          <ChartHolder
            chartInputs={flowData()}
            height="ideal"
            // noRescaleWithWidthChange
          />
          <div class="absolute right-0 top-0">
            <Button
              iconName="download"
              outline
              onClick={handleDownload}
            ></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
