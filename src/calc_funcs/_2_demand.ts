import type {
  DemandParameters,
  PregnancyOutcomesParameters,
  ResultsDemand,
} from "~/types/mod";

export function calculateDemand(
  pregnancyOutcomes: PregnancyOutcomesParameters,
  demandParams: DemandParameters,
  nIntendedPregnancies: number,
  nUnintendedPregnancies: number
): ResultsDemand {
  // Validate input proportions
  if (
    isNaN(pregnancyOutcomes.pResultingInMiscarriage) ||
    pregnancyOutcomes.pResultingInMiscarriage < 0 ||
    pregnancyOutcomes.pResultingInMiscarriage > 1
  ) {
    throw new Error(
      `Invalid miscarriage proportion: ${pregnancyOutcomes.pResultingInMiscarriage}`
    );
  }
  if (
    isNaN(pregnancyOutcomes.pResultingInContraindication) ||
    pregnancyOutcomes.pResultingInContraindication < 0 ||
    pregnancyOutcomes.pResultingInContraindication > 1
  ) {
    throw new Error(
      `Invalid contraindication proportion: ${pregnancyOutcomes.pResultingInContraindication}`
    );
  }
  if (
    isNaN(demandParams.pDemandForAbortion) ||
    demandParams.pDemandForAbortion < 0 ||
    demandParams.pDemandForAbortion > 1
  ) {
    throw new Error(
      `Invalid abortion demand proportion: ${demandParams.pDemandForAbortion}`
    );
  }

  // Ensure proportions are bounded
  const pMiscarriage = Math.min(1, pregnancyOutcomes.pResultingInMiscarriage);
  const pContraindicated = Math.min(
    1 - pMiscarriage,
    pregnancyOutcomes.pResultingInContraindication
  );

  // Apply miscarriage rate to intended pregnancies
  const nIntendedMiscarriage = Math.round(nIntendedPregnancies * pMiscarriage);
  const nIntendedContraindicated = Math.round(
    nIntendedPregnancies * pContraindicated
  );

  // Apply miscarriage rate to unintended pregnancies
  const nUnintendedMiscarriage = Math.round(
    nUnintendedPregnancies * pMiscarriage
  );
  const nUnintendedContraindicated = Math.round(
    nUnintendedPregnancies * pContraindicated
  );

  // Calculate remaining pregnancies after miscarriage and contraindication
  const nIntendedRemaining = Math.max(
    0,
    nIntendedPregnancies - (nIntendedMiscarriage + nIntendedContraindicated)
  );

  const nUnintendedRemaining = Math.max(
    0,
    nUnintendedPregnancies -
      (nUnintendedMiscarriage + nUnintendedContraindicated)
  );

  // Apply demand for abortion (only to unintended pregnancies)
  const pDemandingAbortion = Math.min(1, demandParams.pDemandForAbortion);
  const nSeeksInducedAbortionBeforeContraindicated = Math.min(
    Math.round(nUnintendedRemaining * pDemandingAbortion),
    nUnintendedRemaining
  );
  const nUnintendedLiveBirth =
    nUnintendedRemaining - nSeeksInducedAbortionBeforeContraindicated;

  // All remaining intended pregnancies result in live births
  const nIntendedLiveBirth = nIntendedRemaining;

  // Aggregate contraindicated pregnancies (flow into seeking abortion)
  const nContraindicated =
    nIntendedContraindicated + nUnintendedContraindicated;
  const nSeeksInducedAbortion =
    nSeeksInducedAbortionBeforeContraindicated + nContraindicated;

  return {
    nMiscarriageBeforeAccessIssues:
      nIntendedMiscarriage + nUnintendedMiscarriage,
    nContraindicated,
    nLiveBirthsBeforeAccessIssues: nIntendedLiveBirth + nUnintendedLiveBirth,
    nSeeksInducedAbortion,
  };
}
