import { divideOrZero } from "panther";
import type {
  FamilyPlanningParameters,
  PregnancyOutcomesParameters,
  ResultsFamilyPlanning,
} from "~/types/mod";

export function calculateFamilyPlanning(
  pregnancyOutcomes: PregnancyOutcomesParameters,
  baselineFamilyPlanning: FamilyPlanningParameters,
  scenarioFamilyPlanning: FamilyPlanningParameters
): ResultsFamilyPlanning {
  // Check if baseline == scenario (comparing all three params)
  const isBaselineCase =
    baselineFamilyPlanning.pDemandForFamilyPlanning ===
      scenarioFamilyPlanning.pDemandForFamilyPlanning &&
    baselineFamilyPlanning.pMetDemandForFamilyPlanning ===
      scenarioFamilyPlanning.pMetDemandForFamilyPlanning &&
    baselineFamilyPlanning.pCombinedEffectivenessOfMethods ===
      scenarioFamilyPlanning.pCombinedEffectivenessOfMethods;

  if (isBaselineCase) {
    // For baseline case, use exact input value to avoid rounding issues
    const proportionUnintended = Math.max(
      0,
      Math.min(
        1,
        1 -
          baselineFamilyPlanning.pCombinedEffectivenessOfMethods *
            baselineFamilyPlanning.pDemandForFamilyPlanning *
            baselineFamilyPlanning.pMetDemandForFamilyPlanning
      )
    );

    const nTotal = Math.round(
      divideOrZero(
        pregnancyOutcomes.nUnintendedPregnancies,
        proportionUnintended
      )
    );

    return {
      nPregnancies: nTotal,
      nIntendedPregnancies: Math.max(0, nTotal - pregnancyOutcomes.nUnintendedPregnancies),
      nUnintendedPregnancies: pregnancyOutcomes.nUnintendedPregnancies,
    };
  }

  // Scenario case - calculate adjustments from baseline
  const proportionUnintendedBaseline = Math.max(
    0,
    Math.min(
      1,
      1 -
        baselineFamilyPlanning.pCombinedEffectivenessOfMethods *
          baselineFamilyPlanning.pDemandForFamilyPlanning *
          baselineFamilyPlanning.pMetDemandForFamilyPlanning
    )
  );

  const proportionUnintendedScenario = Math.max(
    0,
    Math.min(
      1,
      1 -
        scenarioFamilyPlanning.pCombinedEffectivenessOfMethods *
          scenarioFamilyPlanning.pDemandForFamilyPlanning *
          scenarioFamilyPlanning.pMetDemandForFamilyPlanning
    )
  );

  const totalBaseline = Math.round(
    divideOrZero(
      pregnancyOutcomes.nUnintendedPregnancies,
      proportionUnintendedBaseline
    )
  );
  const intendedBaseline = Math.max(
    0,
    totalBaseline - pregnancyOutcomes.nUnintendedPregnancies
  );

  const proportionIntendedScenario = 1 - proportionUnintendedScenario;
  const totalScenario = Math.round(
    divideOrZero(intendedBaseline, proportionIntendedScenario)
  );
  const unintendedScenario = Math.max(0, totalScenario - intendedBaseline);

  return {
    nPregnancies: totalScenario,
    nIntendedPregnancies: intendedBaseline,
    nUnintendedPregnancies: unintendedScenario,
  };
}
