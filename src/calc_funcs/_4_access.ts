import { divideOrZero } from "panther";
import type {
  AccessFacilityParameters,
  AccessOutOfFacilityParameters,
  DemandParameters,
  ResultsAccess,
  ResultsDemand,
} from "~/types/mod";

const _ACCESS_CORRELATION: number = 0.5; // 0 = independent, 1 = perfect correlation

export function calculateAccess(
  demandParams: DemandParameters,
  demand: ResultsDemand,
  accessFacilityParams: AccessFacilityParameters,
  accessOutOfFacilityParams: AccessOutOfFacilityParameters
): ResultsAccess {
  const nSeeksInducedAbortion = demand.nSeeksInducedAbortion;

  // Validate input counts
  if (isNaN(nSeeksInducedAbortion) || nSeeksInducedAbortion < 0) {
    throw new Error(`Invalid abortion seekers count: ${nSeeksInducedAbortion}`);
  }

  // Validate access parameters are valid proportions
  const accessParams = [
    {
      name: "pPreferFacility",
      value: demandParams.pPreferFacility,
    },
    {
      name: "pNoLegalRestrictions",
      value: accessFacilityParams.pNoLegalRestrictions,
    },
    {
      name: "pAccessibleDistance (facility)",
      value: accessFacilityParams.pAccessibleDistance,
    },
    {
      name: "pFacilityOffersAbortion",
      value: accessFacilityParams.pFacilityOffersAbortion,
    },
    { name: "pAffordable (facility)", value: accessFacilityParams.pAffordable },
    {
      name: "pAffordable (out-of-facility)",
      value: accessOutOfFacilityParams.pAffordable,
    },
    {
      name: "pAccessibleDistance (out-of-facility)",
      value: accessOutOfFacilityParams.pAccessibleDistance,
    },
  ];

  for (const param of accessParams) {
    if (isNaN(param.value) || param.value < 0 || param.value > 1) {
      throw new Error(`Invalid access parameter ${param.name}: ${param.value}`);
    }
  }

  // First choice split
  const pFirstChoiceFacilityParam = Math.min(1, demandParams.pPreferFacility);

  const nFacilitySeekers = Math.min(
    Math.round(nSeeksInducedAbortion * pFirstChoiceFacilityParam),
    nSeeksInducedAbortion
  );
  const nOutOfFacilityFirstChoice = nSeeksInducedAbortion - nFacilitySeekers;

  const pFirstChoiceFacility = divideOrZero(
    nFacilitySeekers,
    nSeeksInducedAbortion
  );
  const pFirstChoiceOutOfFacility = divideOrZero(
    nOutOfFacilityFirstChoice,
    nSeeksInducedAbortion
  );

  // Facility sector access barriers
  const pFacilityArrive = Math.min(
    1,
    accessFacilityParams.pNoLegalRestrictions *
      accessFacilityParams.pFacilityOffersAbortion *
      combineAccessBarriers(
        accessFacilityParams.pAccessibleDistance,
        accessFacilityParams.pAffordable
      )
  );

  const nFacilityArrive = Math.min(
    Math.round(nFacilitySeekers * pFacilityArrive),
    nFacilitySeekers
  );
  const nFacilityReroute = nFacilitySeekers - nFacilityArrive; // All who don't arrive reroute to outOfFacility
  const nFacilityNoAccess = 0; // With 100% reroute rate, no one is left without access at facility stage

  // OutOfFacility sector access barriers
  const nOutOfFacilityTotalSeekers =
    nOutOfFacilityFirstChoice + nFacilityReroute;

  const pOutOfFacilityArrive = Math.min(
    1,
    combineAccessBarriers(
      accessOutOfFacilityParams.pAccessibleDistance,
      accessOutOfFacilityParams.pAffordable
    )
  );

  const nOutOfFacilityArrive = Math.min(
    Math.round(nOutOfFacilityTotalSeekers * pOutOfFacilityArrive),
    nOutOfFacilityTotalSeekers
  );
  const nOutOfFacilityNoAccess =
    nOutOfFacilityTotalSeekers - nOutOfFacilityArrive;

  // Total no access comes only from outOfFacility sector (facility failures all reroute)
  const nTotalNoAccess = nOutOfFacilityNoAccess;

  const sum = nFacilityArrive + nOutOfFacilityArrive + nTotalNoAccess;

  return {
    careSeeking: {
      firstChoiceFacility: {
        p: pFirstChoiceFacility,
        n: nFacilitySeekers,
      },
      firstChoiceOutOfFacility: {
        p: pFirstChoiceOutOfFacility,
        n: nOutOfFacilityFirstChoice,
      },
    },
    facilitySeekers: {
      nSeek: nFacilitySeekers,
      nArrive: nFacilityArrive,
      nRerouteToOutOfFacility: nFacilityReroute,
      nNoAccess: nFacilityNoAccess,
    },
    outOfFacilitySeekers: {
      nFirstChoice: nOutOfFacilityFirstChoice,
      nReroutedFromFacility: nFacilityReroute,
      nTotalSeek: nOutOfFacilityTotalSeekers,
      nArrive: nOutOfFacilityArrive,
      nNoAccess: nOutOfFacilityNoAccess,
    },
    totals: {
      nArriveFacility: nFacilityArrive,
      nArriveOutOfFacility: nOutOfFacilityArrive,
      nNoAccess: nTotalNoAccess,
      pArriveFacility: divideOrZero(nFacilityArrive, sum),
      pArriveOutOfFacility: divideOrZero(nOutOfFacilityArrive, sum),
      pNoAccess: divideOrZero(nTotalNoAccess, sum),
    },
  };
}

function combineAccessBarriers(pDist: number, pAfford: number): number {
  const independent = pDist * pAfford;
  const correlated = Math.min(pDist, pAfford);
  return _ACCESS_CORRELATION * correlated + (1 - _ACCESS_CORRELATION) * independent;
}
