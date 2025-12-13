import { toNum0, toPct1 } from "panther";
import type { Results, ScenarioResults } from "~/types/mod";
import { _FORMAL_SERVICES, _OUT_OF_FACILITY_SERVICES } from "~/config/services";
import { _COMPLICATIONS } from "~/config/complications";
import { formatComparison, formatDualValue, sectionHeader } from "./_shared";

function getScenarioLabel(scenario: { name: string; id: string }, index: number): string {
  return index === 0 ? scenario.name : `Scenario ${index}. ${scenario.name}`;
}

export function getReadableTextFromTable(results: Results): string {
  const sections: string[] = [];
  const allScenarios = [results.baseline, ...results.scenarios];
  const baseline = results.baseline;

  sections.push("RESULTS TABLE");
  sections.push("");
  sections.push(`Scenarios: ${allScenarios.map((s, i) => getScenarioLabel(s, i)).join(", ")}`);
  sections.push("");

  sections.push(sectionHeader("Pregnancies"));
  sections.push("");

  addMetric(
    sections,
    "Total pregnancies",
    allScenarios,
    baseline,
    (s) => s.familyPlanning.nPregnancies
  );

  addMetric(
    sections,
    "Intended pregnancies",
    allScenarios,
    baseline,
    (s) => s.familyPlanning.nIntendedPregnancies
  );

  addMetric(
    sections,
    "Unintended pregnancies",
    allScenarios,
    baseline,
    (s) => s.familyPlanning.nUnintendedPregnancies
  );

  sections.push(sectionHeader("Demand"));
  sections.push("");

  addMetric(
    sections,
    "Seeking induced abortion",
    allScenarios,
    baseline,
    (s) => s.demand.nSeeksInducedAbortion
  );

  sections.push(sectionHeader("Access"));
  sections.push("");

  addMetric(
    sections,
    "Access to facility care",
    allScenarios,
    baseline,
    (s) => s.access.totals.nArriveFacility
  );

  addMetric(
    sections,
    "Access to out-of-facility care",
    allScenarios,
    baseline,
    (s) => s.access.totals.nArriveOutOfFacility
  );

  addMetric(
    sections,
    "Rerouted from facility to out-of-facility",
    allScenarios,
    baseline,
    (s) => s.access.facilitySeekers.nRerouteToOutOfFacility
  );

  addMetric(
    sections,
    "No access to any care",
    allScenarios,
    baseline,
    (s) => s.access.totals.nNoAccess
  );

  sections.push(sectionHeader("Service Provision at Facilities"));
  sections.push("");

  for (const service of _FORMAL_SERVICES) {
    addDualMetric(
      sections,
      `${service.label} (${service.safety.toUpperCase()})`,
      allScenarios,
      baseline,
      (s) => s.facilityReceipt[service.id].p,
      (s) => s.facilityReceipt[service.id].n
    );
  }

  addDualMetric(
    sections,
    "No abortion after initiating in facility",
    allScenarios,
    baseline,
    (s) => s.facilityReceipt.noAbortion.p,
    (s) => s.facilityReceipt.noAbortion.n
  );

  sections.push(
    sectionHeader("Service Provision at Out-of-Facility Providers")
  );
  sections.push("");

  for (const service of _OUT_OF_FACILITY_SERVICES) {
    addDualMetric(
      sections,
      `${service.label} (${service.safety.toUpperCase()})`,
      allScenarios,
      baseline,
      (s) => s.outOfFacilityReceipt[service.id].p,
      (s) => s.outOfFacilityReceipt[service.id].n
    );
  }

  addDualMetric(
    sections,
    "No abortion after initiating out-of-facility",
    allScenarios,
    baseline,
    (s) => s.outOfFacilityReceipt.noAbortion.p,
    (s) => s.outOfFacilityReceipt.noAbortion.n
  );

  sections.push(sectionHeader("Abortion Outcomes"));
  sections.push("");

  addMetric(
    sections,
    "Total pregnancies",
    allScenarios,
    baseline,
    (s) => s.abortionOutcomes.nTotalPregnancies
  );

  addMetric(
    sections,
    "Live births (total)",
    allScenarios,
    baseline,
    (s) => s.abortionOutcomes.liveBirths.nTotal
  );

  addMetric(
    sections,
    "Miscarriages (total)",
    allScenarios,
    baseline,
    (s) => s.abortionOutcomes.miscarriages.nTotal
  );

  addMetric(
    sections,
    "Abortions (total)",
    allScenarios,
    baseline,
    (s) => s.abortionOutcomes.abortions.nTotal
  );

  addDualMetric(
    sections,
    "  - Safe abortion",
    allScenarios,
    baseline,
    (s) => s.abortionOutcomes.abortions.safe.pAmongAbortions,
    (s) => s.abortionOutcomes.abortions.safe.n
  );

  addDualMetric(
    sections,
    "  - Less safe abortion",
    allScenarios,
    baseline,
    (s) => s.abortionOutcomes.abortions.lessSafe.pAmongAbortions,
    (s) => s.abortionOutcomes.abortions.lessSafe.n
  );

  addDualMetric(
    sections,
    "  - Least safe abortion",
    allScenarios,
    baseline,
    (s) => s.abortionOutcomes.abortions.leastSafe.pAmongAbortions,
    (s) => s.abortionOutcomes.abortions.leastSafe.n
  );

  sections.push(sectionHeader("Complications"));
  sections.push("");

  addDualMetric(
    sections,
    "Total complications",
    allScenarios,
    baseline,
    (s) =>
      (s.complications.nModerateComplications +
        s.complications.nSevereComplications) /
      s.abortionOutcomes.abortions.nTotal,
    (s) =>
      s.complications.nModerateComplications +
      s.complications.nSevereComplications
  );

  for (const complication of _COMPLICATIONS) {
    const index = _COMPLICATIONS.indexOf(complication);
    addDualMetric(
      sections,
      `  - ${complication.label} (${complication.category.toUpperCase()})`,
      allScenarios,
      baseline,
      (s) => s.complications.nSpecificComplications[index]?.pAmongComplications || 0,
      (s) => s.complications.nSpecificComplications[index]?.n || 0
    );
  }

  addDualMetric(
    sections,
    "Moderate complications (total)",
    allScenarios,
    baseline,
    (s) => s.complications.pModerateComplications,
    (s) => s.complications.nModerateComplications
  );

  addDualMetric(
    sections,
    "Severe complications (total)",
    allScenarios,
    baseline,
    (s) => s.complications.pSevereComplications,
    (s) => s.complications.nSevereComplications
  );

  addDualMetric(
    sections,
    "No complications",
    allScenarios,
    baseline,
    (s) => s.complications.pNoComplications,
    (s) => s.complications.nNoComplications
  );

  sections.push(sectionHeader("Post-Abortion Care"));
  sections.push("");

  addMetric(
    sections,
    "Total moderate complications needing care",
    allScenarios,
    baseline,
    (s) => s.postAbortionCare.moderate.nTotal
  );

  addDualMetric(
    sections,
    "  - Receiving effective care",
    allScenarios,
    baseline,
    (s) => s.postAbortionCare.moderate.pReceivingEffectiveCare,
    (s) => s.postAbortionCare.moderate.nReceivingEffectiveCare
  );

  addDualMetric(
    sections,
    "  - Not receiving effective care",
    allScenarios,
    baseline,
    (s) => s.postAbortionCare.moderate.pNotReceivingEffectiveCare,
    (s) => s.postAbortionCare.moderate.nNotReceivingEffectiveCare
  );

  addMetric(
    sections,
    "Total severe complications needing care",
    allScenarios,
    baseline,
    (s) => s.postAbortionCare.severe.nTotal
  );

  addDualMetric(
    sections,
    "  - Receiving effective care",
    allScenarios,
    baseline,
    (s) => s.postAbortionCare.severe.pReceivingEffectiveCare,
    (s) => s.postAbortionCare.severe.nReceivingEffectiveCare
  );

  addDualMetric(
    sections,
    "  - Not receiving effective care",
    allScenarios,
    baseline,
    (s) => s.postAbortionCare.severe.pNotReceivingEffectiveCare,
    (s) => s.postAbortionCare.severe.nNotReceivingEffectiveCare
  );

  addMetric(
    sections,
    "Total complications needing care",
    allScenarios,
    baseline,
    (s) => s.postAbortionCare.totals.nTotalComplications
  );

  addDualMetric(
    sections,
    "  - Receiving effective care",
    allScenarios,
    baseline,
    (s) => s.postAbortionCare.totals.pReceivingEffectiveCare,
    (s) => s.postAbortionCare.totals.nReceivingEffectiveCare
  );

  addDualMetric(
    sections,
    "  - Not receiving effective care",
    allScenarios,
    baseline,
    (s) => s.postAbortionCare.totals.pNotReceivingEffectiveCare,
    (s) => s.postAbortionCare.totals.nNotReceivingEffectiveCare
  );

  return sections.join("\n");
}

function addMetric(
  sections: string[],
  label: string,
  scenarios: ScenarioResults[],
  baseline: ScenarioResults,
  getValue: (s: ScenarioResults) => number
): void {
  sections.push(`${label}:`);

  const allScenarios = [baseline, ...scenarios.filter(s => s.id !== baseline.id)];
  allScenarios.forEach((scenario) => {
    const value = getValue(scenario);
    const isBaseline = scenario.id === baseline.id;

    if (isBaseline) {
      sections.push(`  ${getScenarioLabel(scenario, 0)}: ${toNum0(value)}`);
    } else {
      const baselineValue = getValue(baseline);
      const scenarioIndex = scenarios.findIndex(s => s.id === scenario.id);
      sections.push(
        `  ${getScenarioLabel(scenario, scenarioIndex)}: ${formatComparison(baselineValue, value)}`
      );
    }
  });

  sections.push("");
}

function addDualMetric(
  sections: string[],
  label: string,
  scenarios: ScenarioResults[],
  baseline: ScenarioResults,
  getPct: (s: ScenarioResults) => number,
  getN: (s: ScenarioResults) => number
): void {
  sections.push(`${label}:`);

  const allScenarios = [baseline, ...scenarios.filter(s => s.id !== baseline.id)];
  allScenarios.forEach((scenario) => {
    const pct = getPct(scenario);
    const n = getN(scenario);
    const isBaseline = scenario.id === baseline.id;

    if (isBaseline) {
      sections.push(`  ${getScenarioLabel(scenario, 0)}: ${toPct1(pct)} (${toNum0(n)})`);
    } else {
      const baselinePct = getPct(baseline);
      const baselineN = getN(baseline);
      const scenarioIndex = scenarios.findIndex(s => s.id === scenario.id);
      sections.push(
        `  ${getScenarioLabel(scenario, scenarioIndex)}: ${formatDualValue(pct, n, {
          baselinePct,
          baselineN,
        })}`
      );
    }
  });

  sections.push("");
}
