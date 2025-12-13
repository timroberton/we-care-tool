import { divideOrZero } from "panther";
import { _FORMAL_SERVICES, _OUT_OF_FACILITY_SERVICES } from "~/config/services";
import type {
  PregnancyOutcomesParameters,
  ResultsAccess,
  ResultsDemand,
  ResultsAbortionOutcomes,
  ResultsReceipt,
} from "~/types/mod";

export function calculateAbortionOutcomes(
  pregnancyOutcomes: PregnancyOutcomesParameters,
  demand: ResultsDemand,
  access: ResultsAccess,
  facilityReceipt: ResultsReceipt,
  outOfFacilityReceipt: ResultsReceipt
): ResultsAbortionOutcomes {
  let nSafe = 0;
  let nLessSafe = 0;
  let nLeastSafe = 0;

  // Categorize facility services by safety level
  for (const service of _FORMAL_SERVICES) {
    const serviceData = facilityReceipt[service.id];
    if (!serviceData) continue;

    switch (service.safety) {
      case "safe":
        nSafe += serviceData.n;
        break;
      case "less":
        nLessSafe += serviceData.n;
        break;
      case "least":
        nLeastSafe += serviceData.n;
        break;
    }
  }

  // Categorize outOfFacility services by safety level
  for (const service of _OUT_OF_FACILITY_SERVICES) {
    const serviceData = outOfFacilityReceipt[service.id];
    if (!serviceData) continue;

    switch (service.safety) {
      case "safe":
        nSafe += serviceData.n;
        break;
      case "less":
        nLessSafe += serviceData.n;
        break;
      case "least":
        nLeastSafe += serviceData.n;
        break;
    }
  }

  const nTotalAbortions = nSafe + nLessSafe + nLeastSafe;

  // Validate receipt data has noAbortion key
  if (!facilityReceipt.noAbortion) {
    throw new Error("Missing noAbortion data in facilityReceipt");
  }
  if (!outOfFacilityReceipt.noAbortion) {
    throw new Error("Missing noAbortion data in outOfFacilityReceipt");
  }

  // People who arrived but didn't receive abortion
  const nNoAbortionAtFacilities =
    facilityReceipt.noAbortion.n + outOfFacilityReceipt.noAbortion.n;

  // Apply miscarriage rate to "no access" and "no abortion" groups
  const pMiscarriage = Math.min(
    1,
    pregnancyOutcomes.pResultingInMiscarriage
  );
  const nMiscarriagesFromNoAccess = Math.min(
    Math.round(access.totals.nNoAccess * pMiscarriage),
    access.totals.nNoAccess
  );
  const nLiveBirthsFromNoAccess =
    access.totals.nNoAccess - nMiscarriagesFromNoAccess;

  const nMiscarriagesFromNoAbortion = Math.min(
    Math.round(nNoAbortionAtFacilities * pMiscarriage),
    nNoAbortionAtFacilities
  );
  const nLiveBirthsFromNoAbortion =
    nNoAbortionAtFacilities - nMiscarriagesFromNoAbortion;

  // Aggregate live births and miscarriages
  const nLiveBirthsDidNotSeek = demand.nLiveBirthsBeforeAccessIssues;
  const nLiveBirthsTotal =
    nLiveBirthsDidNotSeek + nLiveBirthsFromNoAccess + nLiveBirthsFromNoAbortion;

  const nMiscarriagesBeforeSeekingCare = demand.nMiscarriageBeforeAccessIssues;
  const nMiscarriagesTotal =
    nMiscarriagesBeforeSeekingCare +
    nMiscarriagesFromNoAccess +
    nMiscarriagesFromNoAbortion;

  // Calculate total pregnancies for consistency check
  const nTotalPregnancies =
    nLiveBirthsTotal + nMiscarriagesTotal + nTotalAbortions;

  // Validate no NaN values in results
  if (
    isNaN(nTotalPregnancies) ||
    isNaN(nLiveBirthsTotal) ||
    isNaN(nMiscarriagesTotal) ||
    isNaN(nTotalAbortions)
  ) {
    throw new Error("NaN detected in abortion outcomes calculation");
  }

  return {
    nTotalPregnancies,
    liveBirths: {
      nDidNotSeek: nLiveBirthsDidNotSeek,
      nNoAccess: nLiveBirthsFromNoAccess,
      nTotal: nLiveBirthsTotal,
    },
    miscarriages: {
      nBeforeSeekingCare: nMiscarriagesBeforeSeekingCare,
      nTotal: nMiscarriagesTotal,
    },
    abortions: {
      safe: {
        n: nSafe,
        pAmongAbortions: divideOrZero(nSafe, nTotalAbortions),
      },
      lessSafe: {
        n: nLessSafe,
        pAmongAbortions: divideOrZero(nLessSafe, nTotalAbortions),
      },
      leastSafe: {
        n: nLeastSafe,
        pAmongAbortions: divideOrZero(nLeastSafe, nTotalAbortions),
      },
      nTotal: nTotalAbortions,
    },
  };
}
