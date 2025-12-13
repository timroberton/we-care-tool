export type Goal = "increase" | "decrease" | "neutral";

export const RESULT_GOALS: Record<string, Goal> = {
  "familyPlanning.nPregnancies": "neutral",
  "familyPlanning.nIntendedPregnancies": "neutral",
  "familyPlanning.nUnintendedPregnancies": "decrease",

  "demand.nSeeksInducedAbortion": "neutral",

  "access.totals.nArriveFacility": "increase",
  "access.totals.nArriveOutOfFacility": "neutral",
  "access.facilitySeekers.nRerouteToOutOfFacility": "neutral",
  "access.totals.nNoAccess": "decrease",

  "facilityReceipt.noAbortion": "decrease",
  "outOfFacilityReceipt.noAbortion": "decrease",

  "finalOutcomes.nTotalPregnancies": "neutral",
  "finalOutcomes.liveBirths.nTotal": "neutral",
  "finalOutcomes.miscarriages.nTotal": "neutral",
  "finalOutcomes.abortions.nTotal": "neutral",
  "finalOutcomes.abortions.safe": "increase",
  "finalOutcomes.abortions.lessSafe": "decrease",
  "finalOutcomes.abortions.leastSafe": "decrease",
};
