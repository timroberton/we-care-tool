// ============================================================================
// FINAL RESULT STRUCTURES
// ============================================================================

export type ScenarioResults = {
  id: string;
  name: string;
  familyPlanning: ResultsFamilyPlanning;
  demand: ResultsDemand;
  access: ResultsAccess;
  facilityReceipt: ResultsReceipt;
  outOfFacilityReceipt: ResultsReceipt;
  facilityReceiptBySafety: ResultsReceiptBySafety;
  outOfFacilityReceiptBySafety: ResultsReceiptBySafety;
  abortionOutcomes: ResultsAbortionOutcomes;
  complications: ResultsComplications;
  postAbortionCare: ResultsPostAbortionCare;
};

export type Results = {
  baseline: ScenarioResults;
  scenarios: ScenarioResults[];
};

// ============================================================================
// INTERMEDIATE CALCULATION RESULTS
// ============================================================================

export type ResultsFamilyPlanning = {
  nPregnancies: number;
  nIntendedPregnancies: number;
  nUnintendedPregnancies: number;
};

export type ResultsDemand = {
  nLiveBirthsBeforeAccessIssues: number;
  nMiscarriageBeforeAccessIssues: number;
  nContraindicated: number;
  nSeeksInducedAbortion: number;
};

export type ResultsAccess = {
  careSeeking: {
    firstChoiceFacility: {
      p: number;
      n: number;
    };
    firstChoiceOutOfFacility: {
      p: number;
      n: number;
    };
  };
  facilitySeekers: {
    nSeek: number;
    nArrive: number;
    nRerouteToOutOfFacility: number;
    nNoAccess: number;
  };
  outOfFacilitySeekers: {
    nFirstChoice: number;
    nReroutedFromFacility: number;
    nTotalSeek: number;
    nArrive: number;
    nNoAccess: number;
  };
  totals: {
    nArriveFacility: number;
    pArriveFacility: number;
    nArriveOutOfFacility: number;
    pArriveOutOfFacility: number;
    nNoAccess: number;
    pNoAccess: number;
  };
};

export type ResultsFacilityProvisionDistribution = {
  [key: string]: number;
};

export type ResultsReceipt = {
  [key: string]: {
    n: number;
    p: number;
  };
};

export type ResultsReceiptBySafety = {
  safe: number;
  lessSafe: number;
  leastSafe: number;
};

export type ResultsAbortionOutcomes = {
  nTotalPregnancies: number;
  liveBirths: {
    nDidNotSeek: number;
    nNoAccess: number;
    nTotal: number;
  };
  miscarriages: {
    nBeforeSeekingCare: number;
    nTotal: number;
  };
  abortions: {
    safe: {
      n: number;
      pAmongAbortions: number;
    };
    lessSafe: {
      n: number;
      pAmongAbortions: number;
    };
    leastSafe: {
      n: number;
      pAmongAbortions: number;
    };
    nTotal: number;
  };
};

export type ResultsComplications = {
  nSpecificComplications: {
    n: number;
    pAmongComplications: number;
  }[];
  moderate: {
    nFromFacility: number;
    nFromOutOfFacility: number;
  };
  severe: {
    nFromFacility: number;
    nFromOutOfFacility: number;
  };
  nModerateComplications: number;
  pModerateComplications: number;
  nSevereComplications: number;
  pSevereComplications: number;
  nTotalComplications: number;
  nNoComplications: number;
  pNoComplications: number;
};

export type ResultsPostAbortionCare = {
  moderate: {
    nTotal: number;
    nFromFacility: number;
    nFromOutOfFacility: number;
    access: {
      nFromFacilityWithAccess: number;
      nFromOutOfFacilityWithAccess: number;
      nTotalWithAccess: number;
      pOutOfFacilityAccess: number;
    };
    effectiveness: {
      pEffectiveness: number;
    };
    nReceivingEffectiveCare: number;
    pReceivingEffectiveCare: number;
    nNotReceivingEffectiveCare: number;
    pNotReceivingEffectiveCare: number;
  };
  severe: {
    nTotal: number;
    nFromFacility: number;
    nFromOutOfFacility: number;
    access: {
      nFromFacilityWithAccess: number;
      nFromOutOfFacilityWithAccess: number;
      nTotalWithAccess: number;
      pOutOfFacilityAccess: number;
    };
    effectiveness: {
      pEffectiveness: number;
    };
    nReceivingEffectiveCare: number;
    pReceivingEffectiveCare: number;
    nNotReceivingEffectiveCare: number;
    pNotReceivingEffectiveCare: number;
  };
  totals: {
    nTotalComplications: number;
    nReceivingEffectiveCare: number;
    pReceivingEffectiveCare: number;
    nNotReceivingEffectiveCare: number;
    pNotReceivingEffectiveCare: number;
  };
  nReturningToAStateOfNonPregnancy: number;
};
