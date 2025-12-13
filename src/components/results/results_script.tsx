import { CopyToClipboardButton, Select, downloadText, Button } from "panther";
import { createMemo, createSignal } from "solid-js";
import type { Parameters } from "~/types/mod";
import { getRScript } from "~/calc_funcs/mod";
import { cleanFilename } from "~/utils/clean_filename";
import { t, td } from "~/translate/mod";

type Props = {
  params: Parameters;
};

type ResolvedParams = Parameters["baseline"];

function getResolvedParams(
  baseline: Parameters["baseline"],
  scenario: Parameters["scenarios"][number]
): ResolvedParams {
  return {
    id: scenario.id,
    name: scenario.name,
    adjustments: scenario.adjustments,
    pregnancyOutcomes: baseline.pregnancyOutcomes,
    familyPlanning: scenario.adjustments.familyPlanning
      ? scenario.familyPlanning
      : baseline.familyPlanning,
    demand: scenario.adjustments.demand ? scenario.demand : baseline.demand,
    facilityAccess: scenario.adjustments.facilityAccess
      ? scenario.facilityAccess
      : baseline.facilityAccess,
    outOfFacilityAccess: scenario.adjustments.outOfFacilityAccess
      ? scenario.outOfFacilityAccess
      : baseline.outOfFacilityAccess,
    facilityReadiness: scenario.adjustments.facilityReadiness
      ? scenario.facilityReadiness
      : baseline.facilityReadiness,
    outOfFacilityReadiness: scenario.adjustments.outOfFacilityReadiness
      ? scenario.outOfFacilityReadiness
      : baseline.outOfFacilityReadiness,
  };
}

export function ResultsScript(p: Props) {
  const scenarioOptions = createMemo(() => {
    const options = [
      { value: "baseline", label: td(p.params.baseline.name) },
      ...p.params.scenarios.map((s, i) => ({
        value: s.id,
        label: `${t("Scenario")} ${i + 1}. ${s.name}`,
      })),
    ];
    return options;
  });

  const [selectedScenarioId, setSelectedScenarioId] = createSignal("baseline");

  const resolvedParams = createMemo(() => {
    const id = selectedScenarioId();
    if (id === "baseline") {
      return getResolvedParams(p.params.baseline, p.params.baseline);
    }
    const scenario = p.params.scenarios.find((s) => s.id === id);
    if (!scenario) {
      return getResolvedParams(p.params.baseline, p.params.baseline);
    }
    return getResolvedParams(p.params.baseline, scenario);
  });

  const rScript = createMemo(() => {
    const params = resolvedParams();
    return getRScript({
      pregnancyOutcomes: params.pregnancyOutcomes,
      familyPlanning: params.familyPlanning,
      demand: params.demand,
      facilityAccess: params.facilityAccess,
      outOfFacilityAccess: params.outOfFacilityAccess,
      facilityReadiness: params.facilityReadiness,
      outOfFacilityReadiness: params.outOfFacilityReadiness,
    });
  });

  function handleDownload() {
    const filename = cleanFilename(
      `who_abortion_model_${resolvedParams().name}`
    );
    downloadText(rScript(), `${filename}.R`);
  }

  return (
    <div class="h-full flex flex-col">
      <div class="ui-pad border-b border-base-300 flex items-center ui-gap-sm w-full">
        <div class="flex-1">
          <Select
            value={selectedScenarioId()}
            onChange={setSelectedScenarioId}
            options={scenarioOptions()}
            fullWidth
          />
        </div>
        <CopyToClipboardButton getText={rScript} outline>
          Copy
        </CopyToClipboardButton>
        <Button onClick={handleDownload} outline iconName="download">
          R script
        </Button>
      </div>
      <div class="flex-1 h-0 ui-pad text-sm font-mono whitespace-pre overflow-auto">
        {rScript()}
      </div>
    </div>
  );
}
