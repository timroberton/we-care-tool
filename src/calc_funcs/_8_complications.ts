import { divideOrZero } from "panther";
import { _FORMAL_SERVICES, _OUT_OF_FACILITY_SERVICES } from "~/config/services";
import { _COMPLICATIONS } from "~/config/complications";
import type {
  ResultsComplications,
  ResultsReceipt,
  ResultsAbortionOutcomes,
} from "~/types/mod";

export function calculateComplications(
  facilityReceipt: ResultsReceipt,
  outOfFacilityReceipt: ResultsReceipt,
  abortionOutcomes: ResultsAbortionOutcomes
): ResultsComplications {
  // Initialize specific complication counters
  const specificComplicationCounts = new Array(_COMPLICATIONS.length).fill(0);

  let nModerateFromFacility = 0;
  let nSevereFromFacility = 0;

  // Calculate complications from facility services
  for (const service of _FORMAL_SERVICES) {
    const serviceData = facilityReceipt[service.id];
    if (!serviceData) {
      throw new Error(
        `Missing receipt data for facility service: ${service.id}`
      );
    }

    // Validate complication rates array length
    if (service.complicationRates.length !== _COMPLICATIONS.length) {
      throw new Error(
        `Service ${service.id} has ${service.complicationRates.length} complication rates, expected ${_COMPLICATIONS.length}`
      );
    }

    const nAbortions = serviceData.n;

    // Validate nAbortions is a valid number
    if (isNaN(nAbortions) || nAbortions < 0) {
      throw new Error(
        `Invalid abortion count for service ${service.id}: ${nAbortions}`
      );
    }

    for (let i = 0; i < _COMPLICATIONS.length; i++) {
      const complication = _COMPLICATIONS[i];
      const rate = service.complicationRates[i];

      // Validate rate is a valid proportion
      if (isNaN(rate) || rate < 0 || rate > 1) {
        throw new Error(
          `Invalid complication rate for service ${service.id}, complication ${complication.id}: ${rate}`
        );
      }

      const nWithComplication = nAbortions * rate;
      specificComplicationCounts[i] += nWithComplication;

      if (complication.category === "moderate") {
        nModerateFromFacility += nWithComplication;
      } else if (complication.category === "severe") {
        nSevereFromFacility += nWithComplication;
      }
    }
  }

  let nModerateFromOutOfFacility = 0;
  let nSevereFromOutOfFacility = 0;

  // Calculate complications from out-of-facility services
  for (const service of _OUT_OF_FACILITY_SERVICES) {
    const serviceData = outOfFacilityReceipt[service.id];
    if (!serviceData) {
      throw new Error(
        `Missing receipt data for out-of-facility service: ${service.id}`
      );
    }

    // Validate complication rates array length
    if (service.complicationRates.length !== _COMPLICATIONS.length) {
      throw new Error(
        `Service ${service.id} has ${service.complicationRates.length} complication rates, expected ${_COMPLICATIONS.length}`
      );
    }

    const nAbortions = serviceData.n;

    // Validate nAbortions is a valid number
    if (isNaN(nAbortions) || nAbortions < 0) {
      throw new Error(
        `Invalid abortion count for service ${service.id}: ${nAbortions}`
      );
    }

    for (let i = 0; i < _COMPLICATIONS.length; i++) {
      const complication = _COMPLICATIONS[i];
      const rate = service.complicationRates[i];

      // Validate rate is a valid proportion
      if (isNaN(rate) || rate < 0 || rate > 1) {
        throw new Error(
          `Invalid complication rate for service ${service.id}, complication ${complication.id}: ${rate}`
        );
      }

      const nWithComplication = nAbortions * rate;
      specificComplicationCounts[i] += nWithComplication;

      if (complication.category === "moderate") {
        nModerateFromOutOfFacility += nWithComplication;
      } else if (complication.category === "severe") {
        nSevereFromOutOfFacility += nWithComplication;
      }
    }
  }

  // Aggregate totals
  const nModerateComplications =
    nModerateFromFacility + nModerateFromOutOfFacility;
  const nSevereComplications = nSevereFromFacility + nSevereFromOutOfFacility;

  // Use total abortions from previous calculation
  const nTotalAbortions = abortionOutcomes.abortions.nTotal;

  // Validate total abortions
  if (isNaN(nTotalAbortions) || nTotalAbortions < 0) {
    throw new Error(`Invalid total abortions: ${nTotalAbortions}`);
  }

  const nNoComplications =
    nTotalAbortions - (nModerateComplications + nSevereComplications);

  // Validate that complications don't exceed total abortions (allow small floating-point tolerance)
  if (nNoComplications < -0.01) {
    throw new Error(
      `Complications (${nModerateComplications + nSevereComplications}) exceed total abortions (${nTotalAbortions})`
    );
  }

  // Calculate proportions
  const pModerateComplications = divideOrZero(
    nModerateComplications,
    nTotalAbortions
  );
  const pSevereComplications = divideOrZero(
    nSevereComplications,
    nTotalAbortions
  );
  const pNoComplications = divideOrZero(nNoComplications, nTotalAbortions);

  // Calculate specific complication results with proportions
  const nTotalComplications = nModerateComplications + nSevereComplications;
  const nSpecificComplications = specificComplicationCounts.map((n) => ({
    n,
    pAmongComplications: divideOrZero(n, nTotalComplications),
  }));

  return {
    nSpecificComplications,
    moderate: {
      nFromFacility: nModerateFromFacility,
      nFromOutOfFacility: nModerateFromOutOfFacility,
    },
    severe: {
      nFromFacility: nSevereFromFacility,
      nFromOutOfFacility: nSevereFromOutOfFacility,
    },
    nModerateComplications,
    pModerateComplications,
    nSevereComplications,
    pSevereComplications,
    nTotalComplications,
    nNoComplications,
    pNoComplications,
  };
}
