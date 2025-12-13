// ============================================================================
// SOURCE INFO FOR BASELINE PARAMETERS
// ============================================================================

export type SourceType =
  | "survey"
  | "administrative"
  | "estimate"
  | "literature"
  | "expert_opinion"
  | "assumption"
  | "unknown";

export type SourceClassification =
  | "high_confidence"
  | "medium_confidence"
  | "low_confidence"
  | "unclassified";

export type SourceInfo = {
  description: string;
  type: SourceType;
  classification: SourceClassification;
};

// ============================================================================
// MAIN PARAMETERS STRUCTURE
// ============================================================================

export type Parameters = {
  baseline: ScenarioParameters;
  scenarios: ScenarioParameters[];
  originalBaseline?: ScenarioParameters;
  baselineSourceInfo?: Record<string, SourceInfo>;
};

// ============================================================================
// SCENARIO PARAMETERS
// ============================================================================

export type ScenarioParameters = {
  id: string;
  name: string;
  adjustments: {
    familyPlanning: boolean;
    demand: boolean;
    facilityAccess: boolean;
    outOfFacilityAccess: boolean;
    facilityReadiness: boolean;
    outOfFacilityReadiness: boolean;
  };
  pregnancyOutcomes: PregnancyOutcomesParameters;
  familyPlanning: FamilyPlanningParameters;
  demand: DemandParameters;
  facilityAccess: AccessFacilityParameters;
  outOfFacilityAccess: AccessOutOfFacilityParameters;
  facilityReadiness: Record<string, number>;
  outOfFacilityReadiness: Record<string, number>;
};

// ============================================================================
// BASELINE PARAMETER COMPONENTS
// ============================================================================

export type PregnancyOutcomesParameters = {
  nUnintendedPregnancies: number;
  pResultingInMiscarriage: number;
  pResultingInContraindication: number;
};

export type FamilyPlanningParameters = {
  pDemandForFamilyPlanning: number;
  pMetDemandForFamilyPlanning: number;
  pCombinedEffectivenessOfMethods: number;
};

export type DemandParameters = {
  pDemandForAbortion: number;
  pPreferFacility: number;
};

export type AccessFacilityParameters = {
  pNoLegalRestrictions: number;
  pAccessibleDistance: number;
  pFacilityOffersAbortion: number;
  pAffordable: number;
  pFacilityOffersPostAbortionCare: number;
};

export type AccessOutOfFacilityParameters = {
  pAffordable: number;
  pAccessibleDistance: number;
};
