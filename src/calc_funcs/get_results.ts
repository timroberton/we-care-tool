import { _FORMAL_SERVICES, _OUT_OF_FACILITY_SERVICES } from "~/config/services";
import type { Results, ScenarioResults } from "~/types/mod";
import type { Parameters, ScenarioParameters } from "~/types/mod";
import { calculateFamilyPlanning } from "./_1_family_planning";
import { calculateDemand } from "./_2_demand";
import { calculateAccess } from "./_4_access";
import { calculateReceipt } from "./_6_receipt";
import { calculateAbortionOutcomes } from "./_7_abortion_outcomes";
import { calculateComplications } from "./_8_complications";
import { calculatePostAbortionCare } from "./_9_post_abortion_care";

export function getResults(params: Parameters): Results {
  return {
    baseline: getResultsOneScenario(params.baseline, params.baseline),
    scenarios: params.scenarios.map((scenario) => {
      return getResultsOneScenario(params.baseline, scenario);
    }),
  };
}

export function getResultsOneScenario(
  baseline: ScenarioParameters,
  scenario: ScenarioParameters
): ScenarioResults {
  // ============================================================================
  // RESOLVE PARAMETERS (apply adjustments)
  // ============================================================================

  const familyPlanningParams = scenario.adjustments.familyPlanning
    ? scenario.familyPlanning
    : baseline.familyPlanning;
  const demandParams = scenario.adjustments.demand
    ? scenario.demand
    : baseline.demand;
  const accessFacilityParams = scenario.adjustments.facilityAccess
    ? scenario.facilityAccess
    : baseline.facilityAccess;
  const accessOutOfFacilityParams = scenario.adjustments.outOfFacilityAccess
    ? scenario.outOfFacilityAccess
    : baseline.outOfFacilityAccess;
  const facilityReadiness = scenario.adjustments.facilityReadiness
    ? scenario.facilityReadiness
    : baseline.facilityReadiness;
  const outOfFacilityReadiness = scenario.adjustments.outOfFacilityReadiness
    ? scenario.outOfFacilityReadiness
    : baseline.outOfFacilityReadiness;

  // ============================================================================
  // CALCULATIONS
  // ============================================================================

  // Step 1: Calculate family planning metrics
  const fp = calculateFamilyPlanning(
    baseline.pregnancyOutcomes,
    baseline.familyPlanning,
    familyPlanningParams
  );

  // Step 2: Calculate demand distribution
  const demand = calculateDemand(
    baseline.pregnancyOutcomes,
    demandParams,
    fp.nIntendedPregnancies,
    fp.nUnintendedPregnancies
  );

  // Step 3: Calculate access
  const access = calculateAccess(
    demandParams,
    demand,
    accessFacilityParams,
    accessOutOfFacilityParams
  );

  // Step 4: Calculate facility sector method distribution
  const facilityReceipt = calculateReceipt(
    _FORMAL_SERVICES,
    facilityReadiness,
    access.totals.nArriveFacility
  );

  // Step 5: Calculate outOfFacility sector service distribution
  const outOfFacilityReceipt = calculateReceipt(
    _OUT_OF_FACILITY_SERVICES,
    outOfFacilityReadiness,
    access.totals.nArriveOutOfFacility
  );

  // Step 6: Calculate abortion outcomes
  const abortionOutcomes = calculateAbortionOutcomes(
    baseline.pregnancyOutcomes,
    demand,
    access,
    facilityReceipt,
    outOfFacilityReceipt
  );

  // Step 7: Calculate complications
  const complications = calculateComplications(
    facilityReceipt,
    outOfFacilityReceipt,
    abortionOutcomes
  );

  // Step 8: Calculate post-abortion care
  const postAbortionCare = calculatePostAbortionCare(
    accessFacilityParams,
    facilityReadiness,
    complications
  );

  // Step 9: Aggregate receipt by safety category
  const facilityReceiptBySafety = {
    safe: _FORMAL_SERVICES
      .filter((srv) => srv.safety === "safe")
      .reduce((sum, srv) => sum + (facilityReceipt[srv.id]?.n || 0), 0),
    lessSafe: _FORMAL_SERVICES
      .filter((srv) => srv.safety === "less")
      .reduce((sum, srv) => sum + (facilityReceipt[srv.id]?.n || 0), 0),
    leastSafe: _FORMAL_SERVICES
      .filter((srv) => srv.safety === "least")
      .reduce((sum, srv) => sum + (facilityReceipt[srv.id]?.n || 0), 0),
  };

  const outOfFacilityReceiptBySafety = {
    safe: _OUT_OF_FACILITY_SERVICES
      .filter((srv) => srv.safety === "safe")
      .reduce((sum, srv) => sum + (outOfFacilityReceipt[srv.id]?.n || 0), 0),
    lessSafe: _OUT_OF_FACILITY_SERVICES
      .filter((srv) => srv.safety === "less")
      .reduce((sum, srv) => sum + (outOfFacilityReceipt[srv.id]?.n || 0), 0),
    leastSafe: _OUT_OF_FACILITY_SERVICES
      .filter((srv) => srv.safety === "least")
      .reduce((sum, srv) => sum + (outOfFacilityReceipt[srv.id]?.n || 0), 0),
  };

  // ============================================================================
  // COMPILE FINAL RESULTS
  // ============================================================================

  const results: ScenarioResults = {
    id: scenario.id,
    name: scenario.name,
    familyPlanning: fp,
    demand,
    access,
    facilityReceipt,
    outOfFacilityReceipt,
    facilityReceiptBySafety,
    outOfFacilityReceiptBySafety,
    abortionOutcomes,
    complications,
    postAbortionCare,
  };

  return results;
}
