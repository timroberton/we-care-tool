import { unwrap, type SetStoreFunction } from "solid-js/store";
import type { Parameters } from "~/types/mod";
import { uiStore } from "~/stores/ui";

export function addScenario(
  params: Parameters,
  setParams: SetStoreFunction<Parameters>,
  name: string = "New scenario"
): string {
  const baselineUnwrapped = unwrap(params.baseline);
  const baselineClone = structuredClone(baselineUnwrapped);
  const newScenarioId = crypto.randomUUID();
  baselineClone.id = newScenarioId;
  baselineClone.name = name;
  baselineClone.adjustments = {
    familyPlanning: false,
    demand: false,
    facilityAccess: false,
    outOfFacilityAccess: false,
    facilityReadiness: false,
    outOfFacilityReadiness: false,
  };
  const newResultsScenarioIndex = params.scenarios.length;
  setParams("scenarios", params.scenarios.length, baselineClone);
  uiStore.setSelectedScenarioIndex(newResultsScenarioIndex);
  return newScenarioId;
}

export function addScenarioWithTemplate(
  params: Parameters,
  setParams: SetStoreFunction<Parameters>,
  name: string,
  applyTemplate: (scenario: any) => void
) {
  const baselineUnwrapped = unwrap(params.baseline);
  const baselineClone = structuredClone(baselineUnwrapped);
  baselineClone.id = crypto.randomUUID();
  baselineClone.name = name;
  baselineClone.adjustments = {
    familyPlanning: false,
    demand: false,
    facilityAccess: false,
    outOfFacilityAccess: false,
    facilityReadiness: false,
    outOfFacilityReadiness: false,
  };
  applyTemplate(baselineClone);
  const newResultsScenarioIndex = params.scenarios.length;
  setParams("scenarios", params.scenarios.length, baselineClone);
  uiStore.setSelectedScenarioIndex(newResultsScenarioIndex);
}

export function removeScenario(
  params: Parameters,
  setParams: SetStoreFunction<Parameters>,
  index: number
) {
  const updated = params.scenarios.filter((_, i) => i !== index);
  setParams("scenarios", updated);
  uiStore.setSelectedScenarioIndex(-1);
  uiStore.setPaneVisibility("inputs", true);
  uiStore.setActiveInputTab("scenarios");
}

export function updateScenarioName(
  params: Parameters,
  setParams: SetStoreFunction<Parameters>,
  index: number,
  newName: string
) {
  setParams("scenarios", index, "name", newName);
  uiStore.setSelectedScenarioIndex(index);
}

export function resetScenario(
  params: Parameters,
  setParams: SetStoreFunction<Parameters>,
  index: number
) {
  const currentScenario = params.scenarios[index];
  const currentId = currentScenario.id;
  const currentName = currentScenario.name;
  const baselineUnwrapped = unwrap(params.baseline);
  const baselineClone = structuredClone(baselineUnwrapped);
  baselineClone.id = currentId;
  baselineClone.name = currentName;
  baselineClone.adjustments = {
    familyPlanning: false,
    demand: false,
    facilityAccess: false,
    outOfFacilityAccess: false,
    facilityReadiness: false,
    outOfFacilityReadiness: false,
  };
  setParams("scenarios", index, baselineClone);
  uiStore.setSelectedScenarioIndex(index);
}
