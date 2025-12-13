import { divideOrZero } from "panther";
import { _POST_ABORTION_CARE_READINESS } from "~/config/services";
import type {
  AccessFacilityParameters,
  ResultsComplications,
  ResultsPostAbortionCare,
} from "~/types/mod";

const _ACCESS_CORRELATION: number = 0.5; // 0 = independent, 1 = perfect correlation

export function calculatePostAbortionCare(
  accessFacilityParams: AccessFacilityParameters,
  readinessFacilityParams: Record<string, number>,
  complications: ResultsComplications
): ResultsPostAbortionCare {
  // Validate access parameters (excluding legal restrictions for PAC)
  const accessParams = [
    {
      name: "pAccessibleDistance",
      value: accessFacilityParams.pAccessibleDistance,
    },
    {
      name: "pFacilityOffersPostAbortionCare",
      value: accessFacilityParams.pFacilityOffersPostAbortionCare,
    },
    { name: "pAffordable", value: accessFacilityParams.pAffordable },
  ];

  for (const param of accessParams) {
    if (isNaN(param.value) || param.value < 0 || param.value > 1) {
      throw new Error(
        `Invalid PAC access parameter ${param.name}: ${param.value}`
      );
    }
  }

  // Calculate access rate for out-of-facility complications seeking PAC
  // Legal restrictions don't apply to PAC
  const pOutOfFacilityAccess = Math.min(
    1,
    accessFacilityParams.pFacilityOffersPostAbortionCare *
      combineAccessBarriers(
        accessFacilityParams.pAccessibleDistance,
        accessFacilityParams.pAffordable
      )
  );

  // ============================================================================
  // MODERATE COMPLICATIONS
  // ============================================================================

  const nModerateFromFacility = complications.moderate.nFromFacility;
  const nModerateFromOutOfFacility = complications.moderate.nFromOutOfFacility;
  const nModerateTotal = nModerateFromFacility + nModerateFromOutOfFacility;

  // Access calculation for moderate complications
  // Both facility and out-of-facility use same PAC access rate
  const nModerateFromFacilityWithAccess = Math.round(
    nModerateFromFacility * pOutOfFacilityAccess
  );

  const nModerateFromOutOfFacilityWithAccess = Math.round(
    nModerateFromOutOfFacility * pOutOfFacilityAccess
  );

  const nModerateTotalWithAccess =
    nModerateFromFacilityWithAccess + nModerateFromOutOfFacilityWithAccess;

  // Effectiveness calculation for moderate care
  // Requires: hw * antibiotics
  const moderateItems = _POST_ABORTION_CARE_READINESS.moderate;
  let pModerateEffectiveness = 1;
  for (const itemId of moderateItems) {
    const itemValue = readinessFacilityParams[itemId];

    // Validate readiness parameter
    if (isNaN(itemValue) || itemValue < 0 || itemValue > 1) {
      throw new Error(`Invalid readiness parameter ${itemId}: ${itemValue}`);
    }

    pModerateEffectiveness *= itemValue;
  }
  pModerateEffectiveness = Math.min(1, pModerateEffectiveness);

  // Final outcomes for moderate complications
  const nModerateReceivingEffectiveCare = Math.min(
    Math.round(nModerateTotalWithAccess * pModerateEffectiveness),
    nModerateTotal
  );
  const nModerateNotReceivingEffectiveCare =
    nModerateTotal - nModerateReceivingEffectiveCare;

  // ============================================================================
  // SEVERE COMPLICATIONS
  // ============================================================================

  const nSevereFromFacility = complications.severe.nFromFacility;
  const nSevereFromOutOfFacility = complications.severe.nFromOutOfFacility;
  const nSevereTotal = nSevereFromFacility + nSevereFromOutOfFacility;

  // Access calculation for severe complications
  // Both facility and out-of-facility use same PAC access rate
  const nSevereFromFacilityWithAccess = Math.round(
    nSevereFromFacility * pOutOfFacilityAccess
  );

  const nSevereFromOutOfFacilityWithAccess = Math.round(
    nSevereFromOutOfFacility * pOutOfFacilityAccess
  );

  const nSevereTotalWithAccess =
    nSevereFromFacilityWithAccess + nSevereFromOutOfFacilityWithAccess;

  // Effectiveness calculation for severe care
  // Requires: cemonc
  const severeItems = _POST_ABORTION_CARE_READINESS.severe;
  let pSevereEffectiveness = 1;
  for (const itemId of severeItems) {
    const itemValue = readinessFacilityParams[itemId];

    // Validate readiness parameter
    if (isNaN(itemValue) || itemValue < 0 || itemValue > 1) {
      throw new Error(`Invalid readiness parameter ${itemId}: ${itemValue}`);
    }

    pSevereEffectiveness *= itemValue;
  }
  pSevereEffectiveness = Math.min(1, pSevereEffectiveness);

  // Final outcomes for severe complications
  const nSevereReceivingEffectiveCare = Math.min(
    Math.round(nSevereTotalWithAccess * pSevereEffectiveness),
    nSevereTotal
  );
  const nSevereNotReceivingEffectiveCare =
    nSevereTotal - nSevereReceivingEffectiveCare;

  // ============================================================================
  // TOTALS
  // ============================================================================

  const nTotalComplications = nModerateTotal + nSevereTotal;
  const nTotalReceivingEffectiveCare =
    nModerateReceivingEffectiveCare + nSevereReceivingEffectiveCare;
  const nTotalNotReceivingEffectiveCare =
    nModerateNotReceivingEffectiveCare + nSevereNotReceivingEffectiveCare;

  const pTotalReceivingEffectiveCare = divideOrZero(
    nTotalReceivingEffectiveCare,
    nTotalComplications
  );
  const pTotalNotReceivingEffectiveCare = divideOrZero(
    nTotalNotReceivingEffectiveCare,
    nTotalComplications
  );

  const pModerateReceivingEffectiveCare = divideOrZero(
    nModerateReceivingEffectiveCare,
    nModerateTotal
  );
  const pModerateNotReceivingEffectiveCare = divideOrZero(
    nModerateNotReceivingEffectiveCare,
    nModerateTotal
  );

  const pSevereReceivingEffectiveCare = divideOrZero(
    nSevereReceivingEffectiveCare,
    nSevereTotal
  );
  const pSevereNotReceivingEffectiveCare = divideOrZero(
    nSevereNotReceivingEffectiveCare,
    nSevereTotal
  );

  // Final validation
  const totalCheck =
    nTotalReceivingEffectiveCare + nTotalNotReceivingEffectiveCare;
  if (Math.abs(totalCheck - nTotalComplications) > 0.01) {
    throw new Error(
      `PAC totals don't match: ${nTotalReceivingEffectiveCare} + ${nTotalNotReceivingEffectiveCare} != ${nTotalComplications}`
    );
  }

  // People with no complications return to non-pregnant state
  // Note: People who receive effective PAC are handled in subsequent calculations
  const nReturningToAStateOfNonPregnancy = complications.nNoComplications;

  return {
    moderate: {
      nTotal: nModerateTotal,
      nFromFacility: nModerateFromFacility,
      nFromOutOfFacility: nModerateFromOutOfFacility,
      access: {
        nFromFacilityWithAccess: nModerateFromFacilityWithAccess,
        nFromOutOfFacilityWithAccess: nModerateFromOutOfFacilityWithAccess,
        nTotalWithAccess: nModerateTotalWithAccess,
        pOutOfFacilityAccess: pOutOfFacilityAccess,
      },
      effectiveness: {
        pEffectiveness: pModerateEffectiveness,
      },
      nReceivingEffectiveCare: nModerateReceivingEffectiveCare,
      pReceivingEffectiveCare: pModerateReceivingEffectiveCare,
      nNotReceivingEffectiveCare: nModerateNotReceivingEffectiveCare,
      pNotReceivingEffectiveCare: pModerateNotReceivingEffectiveCare,
    },
    severe: {
      nTotal: nSevereTotal,
      nFromFacility: nSevereFromFacility,
      nFromOutOfFacility: nSevereFromOutOfFacility,
      access: {
        nFromFacilityWithAccess: nSevereFromFacilityWithAccess,
        nFromOutOfFacilityWithAccess: nSevereFromOutOfFacilityWithAccess,
        nTotalWithAccess: nSevereTotalWithAccess,
        pOutOfFacilityAccess: pOutOfFacilityAccess,
      },
      effectiveness: {
        pEffectiveness: pSevereEffectiveness,
      },
      nReceivingEffectiveCare: nSevereReceivingEffectiveCare,
      pReceivingEffectiveCare: pSevereReceivingEffectiveCare,
      nNotReceivingEffectiveCare: nSevereNotReceivingEffectiveCare,
      pNotReceivingEffectiveCare: pSevereNotReceivingEffectiveCare,
    },
    totals: {
      nTotalComplications: nTotalComplications,
      nReceivingEffectiveCare: nTotalReceivingEffectiveCare,
      pReceivingEffectiveCare: pTotalReceivingEffectiveCare,
      nNotReceivingEffectiveCare: nTotalNotReceivingEffectiveCare,
      pNotReceivingEffectiveCare: pTotalNotReceivingEffectiveCare,
    },
    nReturningToAStateOfNonPregnancy: nReturningToAStateOfNonPregnancy,
  };
}

function combineAccessBarriers(pDist: number, pAfford: number): number {
  const independent = pDist * pAfford;
  const correlated = Math.min(pDist, pAfford);
  return _ACCESS_CORRELATION * correlated + (1 - _ACCESS_CORRELATION) * independent;
}
