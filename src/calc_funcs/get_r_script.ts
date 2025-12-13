import { _FORMAL_SERVICES, _OUT_OF_FACILITY_SERVICES } from "~/config/services";
import { _COMPLICATIONS } from "~/config/complications";
import type { ScenarioParameters } from "~/types/mod";

type ResolvedParams = {
  pregnancyOutcomes: ScenarioParameters["pregnancyOutcomes"];
  familyPlanning: ScenarioParameters["familyPlanning"];
  demand: ScenarioParameters["demand"];
  facilityAccess: ScenarioParameters["facilityAccess"];
  outOfFacilityAccess: ScenarioParameters["outOfFacilityAccess"];
  facilityReadiness: ScenarioParameters["facilityReadiness"];
  outOfFacilityReadiness: ScenarioParameters["outOfFacilityReadiness"];
};

export function getRScript(params: ResolvedParams): string {
  const lines: string[] = [];

  const add = (line: string) => lines.push(line);
  const blank = () => lines.push("");

  add("# =============================================================================");
  add("# WHO Abortion Care Model - R Script");
  add("# Generated from the WHO Abortion Care web application");
  add("# =============================================================================");
  blank();

  add("# =============================================================================");
  add("# HELPER FUNCTIONS");
  add("# =============================================================================");
  blank();
  add("divide_or_zero <- function(num, denom) {");
  add("  if (denom == 0) return(0)");
  add("  return(num / denom)");
  add("}");
  blank();
  add("combine_access_barriers <- function(p_dist, p_afford) {");
  add("  ACCESS_CORRELATION <- 0.5");
  add("  independent <- p_dist * p_afford");
  add("  correlated <- min(p_dist, p_afford)");
  add("  return(ACCESS_CORRELATION * correlated + (1 - ACCESS_CORRELATION) * independent)");
  add("}");
  blank();

  add("# =============================================================================");
  add("# INPUT PARAMETERS");
  add("# =============================================================================");
  blank();

  add("# --- Pregnancy Outcomes ---");
  add(`n_unintended_pregnancies <- ${params.pregnancyOutcomes.nUnintendedPregnancies}`);
  add(`p_resulting_in_miscarriage <- ${params.pregnancyOutcomes.pResultingInMiscarriage}`);
  add(`p_resulting_in_contraindication <- ${params.pregnancyOutcomes.pResultingInContraindication}`);
  blank();

  add("# --- Family Planning ---");
  add(`p_demand_for_family_planning <- ${params.familyPlanning.pDemandForFamilyPlanning}`);
  add(`p_met_demand_for_family_planning <- ${params.familyPlanning.pMetDemandForFamilyPlanning}`);
  add(`p_combined_effectiveness_of_methods <- ${params.familyPlanning.pCombinedEffectivenessOfMethods}`);
  blank();

  add("# --- Demand ---");
  add(`p_demand_for_abortion <- ${params.demand.pDemandForAbortion}`);
  add(`p_prefer_facility <- ${params.demand.pPreferFacility}`);
  blank();

  add("# --- Facility Access ---");
  add(`p_no_legal_restrictions <- ${params.facilityAccess.pNoLegalRestrictions}`);
  add(`p_facility_accessible_distance <- ${params.facilityAccess.pAccessibleDistance}`);
  add(`p_facility_offers_abortion <- ${params.facilityAccess.pFacilityOffersAbortion}`);
  add(`p_facility_affordable <- ${params.facilityAccess.pAffordable}`);
  add(`p_facility_offers_pac <- ${params.facilityAccess.pFacilityOffersPostAbortionCare}`);
  blank();

  add("# --- Out-of-Facility Access ---");
  add(`p_oof_affordable <- ${params.outOfFacilityAccess.pAffordable}`);
  add(`p_oof_accessible_distance <- ${params.outOfFacilityAccess.pAccessibleDistance}`);
  blank();

  add("# --- Facility Readiness (item availability proportions) ---");
  for (const [key, value] of Object.entries(params.facilityReadiness)) {
    add(`facility_readiness_${key} <- ${value}`);
  }
  blank();

  add("# --- Out-of-Facility Readiness (item availability proportions) ---");
  for (const [key, value] of Object.entries(params.outOfFacilityReadiness)) {
    add(`oof_readiness_${key} <- ${value}`);
  }
  blank();

  add("# =============================================================================");
  add("# SERVICE CONFIGURATIONS");
  add("# =============================================================================");
  blank();

  add("# Complication types: incomplete, continuing, infection, trauma, hemorrhage, other");
  add("# Categories: incomplete/continuing/infection = moderate; trauma/hemorrhage/other = severe");
  blank();

  add("# --- Facility Services ---");
  add("# Format: list(id, label, safety, component_combos, complication_rates)");
  add("facility_services <- list(");
  _FORMAL_SERVICES.forEach((service, i) => {
    const combosStr = service.componentCombos
      .map((combo) => `c(${combo.map((c) => `"${c}"`).join(", ")})`)
      .join(", ");
    const ratesStr = service.complicationRates.join(", ");
    const comma = i < _FORMAL_SERVICES.length - 1 ? "," : "";
    add(`  list(id = "${service.id}", label = "${service.label}", safety = "${service.safety}", combos = list(${combosStr}), rates = c(${ratesStr}))${comma}`);
  });
  add(")");
  blank();

  add("# --- Out-of-Facility Services ---");
  add("oof_services <- list(");
  _OUT_OF_FACILITY_SERVICES.forEach((service, i) => {
    const combosStr = service.componentCombos
      .map((combo) => `c(${combo.map((c) => `"${c}"`).join(", ")})`)
      .join(", ");
    const ratesStr = service.complicationRates.join(", ");
    const comma = i < _OUT_OF_FACILITY_SERVICES.length - 1 ? "," : "";
    add(`  list(id = "${service.id}", label = "${service.label}", safety = "${service.safety}", combos = list(${combosStr}), rates = c(${ratesStr}))${comma}`);
  });
  add(")");
  blank();

  add("# --- Complications ---");
  add("complications_config <- list(");
  _COMPLICATIONS.forEach((comp, i) => {
    const comma = i < _COMPLICATIONS.length - 1 ? "," : "";
    add(`  list(id = "${comp.id}", label = "${comp.label}", category = "${comp.category}")${comma}`);
  });
  add(")");
  blank();

  add("# --- Post-Abortion Care Readiness Requirements ---");
  add('pac_moderate_items <- c("hw", "antibiotics")');
  add('pac_severe_items <- c("cemonc")');
  blank();

  add("# =============================================================================");
  add("# STEP 1: FAMILY PLANNING CALCULATIONS");
  add("# =============================================================================");
  blank();
  add("proportion_unintended <- max(0, min(1,");
  add("  1 - p_combined_effectiveness_of_methods * p_demand_for_family_planning * p_met_demand_for_family_planning");
  add("))");
  blank();
  add("n_total_pregnancies <- round(divide_or_zero(n_unintended_pregnancies, proportion_unintended))");
  add("n_intended_pregnancies <- max(0, n_total_pregnancies - n_unintended_pregnancies)");
  add("n_unintended_pregnancies_calc <- n_unintended_pregnancies");
  blank();

  add("# =============================================================================");
  add("# STEP 2: DEMAND CALCULATIONS");
  add("# =============================================================================");
  blank();
  add("p_miscarriage <- min(1, p_resulting_in_miscarriage)");
  add("p_contraindicated <- min(1 - p_miscarriage, p_resulting_in_contraindication)");
  blank();
  add("# Intended pregnancies");
  add("n_intended_miscarriage <- round(n_intended_pregnancies * p_miscarriage)");
  add("n_intended_contraindicated <- round(n_intended_pregnancies * p_contraindicated)");
  add("n_intended_remaining <- max(0, n_intended_pregnancies - (n_intended_miscarriage + n_intended_contraindicated))");
  add("n_intended_live_birth <- n_intended_remaining");
  blank();
  add("# Unintended pregnancies");
  add("n_unintended_miscarriage <- round(n_unintended_pregnancies_calc * p_miscarriage)");
  add("n_unintended_contraindicated <- round(n_unintended_pregnancies_calc * p_contraindicated)");
  add("n_unintended_remaining <- max(0, n_unintended_pregnancies_calc - (n_unintended_miscarriage + n_unintended_contraindicated))");
  blank();
  add("# Demand for abortion");
  add("p_demanding_abortion <- min(1, p_demand_for_abortion)");
  add("n_seeks_abortion_before_contraindicated <- min(round(n_unintended_remaining * p_demanding_abortion), n_unintended_remaining)");
  add("n_unintended_live_birth <- n_unintended_remaining - n_seeks_abortion_before_contraindicated");
  blank();
  add("# Aggregate");
  add("n_contraindicated <- n_intended_contraindicated + n_unintended_contraindicated");
  add("n_seeks_induced_abortion <- n_seeks_abortion_before_contraindicated + n_contraindicated");
  add("n_miscarriage_before_access <- n_intended_miscarriage + n_unintended_miscarriage");
  add("n_live_births_before_access <- n_intended_live_birth + n_unintended_live_birth");
  blank();

  add("# =============================================================================");
  add("# STEP 3: ACCESS CALCULATIONS");
  add("# =============================================================================");
  blank();
  add("# First choice split");
  add("p_first_choice_facility <- min(1, p_prefer_facility)");
  add("n_facility_seekers <- min(round(n_seeks_induced_abortion * p_first_choice_facility), n_seeks_induced_abortion)");
  add("n_oof_first_choice <- n_seeks_induced_abortion - n_facility_seekers");
  blank();
  add("# Facility access barriers");
  add("p_facility_arrive <- min(1,");
  add("  p_no_legal_restrictions *");
  add("  p_facility_offers_abortion *");
  add("  combine_access_barriers(p_facility_accessible_distance, p_facility_affordable)");
  add(")");
  blank();
  add("n_facility_arrive <- min(round(n_facility_seekers * p_facility_arrive), n_facility_seekers)");
  add("n_facility_reroute <- n_facility_seekers - n_facility_arrive");
  blank();
  add("# Out-of-facility access barriers");
  add("n_oof_total_seekers <- n_oof_first_choice + n_facility_reroute");
  add("p_oof_arrive <- min(1, combine_access_barriers(p_oof_accessible_distance, p_oof_affordable))");
  add("n_oof_arrive <- min(round(n_oof_total_seekers * p_oof_arrive), n_oof_total_seekers)");
  add("n_oof_no_access <- n_oof_total_seekers - n_oof_arrive");
  blank();
  add("# Total access");
  add("n_total_no_access <- n_oof_no_access");
  add("access_sum <- n_facility_arrive + n_oof_arrive + n_total_no_access");
  add("p_arrive_facility <- divide_or_zero(n_facility_arrive, access_sum)");
  add("p_arrive_oof <- divide_or_zero(n_oof_arrive, access_sum)");
  add("p_no_access <- divide_or_zero(n_total_no_access, access_sum)");
  blank();

  add("# =============================================================================");
  add("# STEP 4: RECEIPT CALCULATIONS (Service allocation)");
  add("# =============================================================================");
  blank();
  add("# This implements a mixture of 'ideal' (greedy priority) and 'naive' (proportional)");
  add("# allocation based on health worker availability");
  blank();
  add("calculate_receipt <- function(services, item_readiness, n_arriving) {");
  add("  hw_availability <- max(0, min(1, item_readiness[['hw']]))");
  add("  receipt_mixture <- 1 - hw_availability");
  add("");
  add("  # Ideal allocation (greedy, priority-based)");
  add("  calculate_ideal <- function() {");
  add("    receipt <- list()");
  add("    current_readiness <- item_readiness");
  add("    total_service_receipt <- 0");
  add("");
  add("    for (service in services) {");
  add("      p_service <- 0");
  add("      for (combo in service$combos) {");
  add("        availabilities <- sapply(combo, function(item) current_readiness[[item]])");
  add("        min_avail <- min(availabilities)");
  add("        p_service <- p_service + min_avail");
  add("        # Consume resources");
  add("        for (item in names(current_readiness)) {");
  add("          current_readiness[[item]] <- max(0, current_readiness[[item]] - min_avail)");
  add("        }");
  add("      }");
  add("      receipt[[service$id]] <- list(p = p_service, n = n_arriving * p_service)");
  add("      total_service_receipt <- total_service_receipt + p_service");
  add("    }");
  add("    p_no_abortion <- max(0, 1 - total_service_receipt)");
  add("    receipt[['noAbortion']] <- list(p = p_no_abortion, n = n_arriving * p_no_abortion)");
  add("    return(list(receipt = receipt, capacity = total_service_receipt))");
  add("  }");
  add("");
  add("  # Naive allocation (proportional based on potential scores)");
  add("  calculate_naive <- function(ideal_capacity) {");
  add("    potentials <- list()");
  add("    total_score <- 0");
  add("");
  add("    for (service in services) {");
  add("      max_score <- 0");
  add("      for (combo in service$combos) {");
  add("        combo_score <- min(sapply(combo, function(item) item_readiness[[item]]))");
  add("        max_score <- max(max_score, combo_score)");
  add("      }");
  add("      potentials[[service$id]] <- max_score");
  add("      total_score <- total_score + max_score");
  add("    }");
  add("");
  add("    receipt <- list()");
  add("    total_service_receipt <- 0");
  add("");
  add("    for (service in services) {");
  add("      p <- if (total_score > 0) (potentials[[service$id]] / total_score) * ideal_capacity else 0");
  add("      receipt[[service$id]] <- list(p = p, n = n_arriving * p)");
  add("      total_service_receipt <- total_service_receipt + p");
  add("    }");
  add("");
  add("    p_no_abortion <- max(0, 1 - total_service_receipt)");
  add("    receipt[['noAbortion']] <- list(p = p_no_abortion, n = n_arriving * p_no_abortion)");
  add("    return(receipt)");
  add("  }");
  add("");
  add("  # Pure ideal");
  add("  if (receipt_mixture <= 0) {");
  add("    return(calculate_ideal()$receipt)");
  add("  }");
  add("");
  add("  # Pure naive");
  add("  ideal_result <- calculate_ideal()");
  add("  if (receipt_mixture >= 1) {");
  add("    return(calculate_naive(ideal_result$capacity))");
  add("  }");
  add("");
  add("  # Mix");
  add("  ideal_receipt <- ideal_result$receipt");
  add("  naive_receipt <- calculate_naive(ideal_result$capacity)");
  add("");
  add("  mixed_receipt <- list()");
  add("  all_ids <- c(sapply(services, function(s) s$id), 'noAbortion')");
  add("");
  add("  for (id in all_ids) {");
  add("    ideal_p <- ideal_receipt[[id]]$p");
  add("    naive_p <- naive_receipt[[id]]$p");
  add("    mixed_p <- ideal_p * (1 - receipt_mixture) + naive_p * receipt_mixture");
  add("    mixed_receipt[[id]] <- list(p = mixed_p, n = n_arriving * mixed_p)");
  add("  }");
  add("");
  add("  return(mixed_receipt)");
  add("}");
  blank();

  add("# Build readiness lists");
  add("facility_readiness <- list(");
  const facilityItems = Object.keys(params.facilityReadiness);
  facilityItems.forEach((key, i) => {
    const comma = i < facilityItems.length - 1 ? "," : "";
    add(`  "${key}" = facility_readiness_${key}${comma}`);
  });
  add(")");
  blank();

  add("oof_readiness <- list(");
  const oofItems = Object.keys(params.outOfFacilityReadiness);
  oofItems.forEach((key, i) => {
    const comma = i < oofItems.length - 1 ? "," : "";
    add(`  "${key}" = oof_readiness_${key}${comma}`);
  });
  add(")");
  blank();

  add("# Calculate receipt");
  add("facility_receipt <- calculate_receipt(facility_services, facility_readiness, n_facility_arrive)");
  add("oof_receipt <- calculate_receipt(oof_services, oof_readiness, n_oof_arrive)");
  blank();

  add("# =============================================================================");
  add("# STEP 5: ABORTION OUTCOMES");
  add("# =============================================================================");
  blank();
  add("# Count abortions by safety category");
  add("n_safe <- 0");
  add("n_less_safe <- 0");
  add("n_least_safe <- 0");
  blank();
  add("for (service in facility_services) {");
  add("  n <- facility_receipt[[service$id]]$n");
  add('  if (service$safety == "safe") n_safe <- n_safe + n');
  add('  else if (service$safety == "less") n_less_safe <- n_less_safe + n');
  add('  else if (service$safety == "least") n_least_safe <- n_least_safe + n');
  add("}");
  blank();
  add("for (service in oof_services) {");
  add("  n <- oof_receipt[[service$id]]$n");
  add('  if (service$safety == "safe") n_safe <- n_safe + n');
  add('  else if (service$safety == "less") n_less_safe <- n_less_safe + n');
  add('  else if (service$safety == "least") n_least_safe <- n_least_safe + n');
  add("}");
  blank();
  add("n_total_abortions <- n_safe + n_less_safe + n_least_safe");
  blank();
  add("# People who arrived but didn't receive abortion");
  add("n_no_abortion_at_facilities <- facility_receipt[['noAbortion']]$n + oof_receipt[['noAbortion']]$n");
  blank();
  add("# Apply miscarriage to no-access and no-abortion groups");
  add("n_miscarriages_from_no_access <- min(round(n_total_no_access * p_miscarriage), n_total_no_access)");
  add("n_live_births_from_no_access <- n_total_no_access - n_miscarriages_from_no_access");
  blank();
  add("n_miscarriages_from_no_abortion <- min(round(n_no_abortion_at_facilities * p_miscarriage), n_no_abortion_at_facilities)");
  add("n_live_births_from_no_abortion <- n_no_abortion_at_facilities - n_miscarriages_from_no_abortion");
  blank();
  add("# Totals");
  add("n_live_births_total <- n_live_births_before_access + n_live_births_from_no_access + n_live_births_from_no_abortion");
  add("n_miscarriages_total <- n_miscarriage_before_access + n_miscarriages_from_no_access + n_miscarriages_from_no_abortion");
  blank();

  add("# =============================================================================");
  add("# STEP 6: COMPLICATIONS");
  add("# =============================================================================");
  blank();
  add("specific_complication_counts <- rep(0, length(complications_config))");
  add("n_moderate_from_facility <- 0");
  add("n_severe_from_facility <- 0");
  add("n_moderate_from_oof <- 0");
  add("n_severe_from_oof <- 0");
  blank();
  add("# Facility complications");
  add("for (service in facility_services) {");
  add("  n_abortions <- facility_receipt[[service$id]]$n");
  add("  for (i in seq_along(complications_config)) {");
  add("    rate <- service$rates[i]");
  add("    n_with_complication <- n_abortions * rate");
  add("    specific_complication_counts[i] <- specific_complication_counts[i] + n_with_complication");
  add('    if (complications_config[[i]]$category == "moderate") {');
  add("      n_moderate_from_facility <- n_moderate_from_facility + n_with_complication");
  add('    } else if (complications_config[[i]]$category == "severe") {');
  add("      n_severe_from_facility <- n_severe_from_facility + n_with_complication");
  add("    }");
  add("  }");
  add("}");
  blank();
  add("# Out-of-facility complications");
  add("for (service in oof_services) {");
  add("  n_abortions <- oof_receipt[[service$id]]$n");
  add("  for (i in seq_along(complications_config)) {");
  add("    rate <- service$rates[i]");
  add("    n_with_complication <- n_abortions * rate");
  add("    specific_complication_counts[i] <- specific_complication_counts[i] + n_with_complication");
  add('    if (complications_config[[i]]$category == "moderate") {');
  add("      n_moderate_from_oof <- n_moderate_from_oof + n_with_complication");
  add('    } else if (complications_config[[i]]$category == "severe") {');
  add("      n_severe_from_oof <- n_severe_from_oof + n_with_complication");
  add("    }");
  add("  }");
  add("}");
  blank();
  add("n_moderate_complications <- n_moderate_from_facility + n_moderate_from_oof");
  add("n_severe_complications <- n_severe_from_facility + n_severe_from_oof");
  add("n_total_complications <- n_moderate_complications + n_severe_complications");
  add("n_no_complications <- n_total_abortions - n_total_complications");
  blank();

  add("# =============================================================================");
  add("# STEP 7: POST-ABORTION CARE");
  add("# =============================================================================");
  blank();
  add("# PAC access rate (legal restrictions don't apply to PAC)");
  add("p_pac_access <- min(1,");
  add("  p_facility_offers_pac *");
  add("  combine_access_barriers(p_facility_accessible_distance, p_facility_affordable)");
  add(")");
  blank();
  add("# Moderate complications");
  add("n_moderate_total <- n_moderate_from_facility + n_moderate_from_oof");
  add("n_moderate_with_access <- round(n_moderate_total * p_pac_access)");
  blank();
  add("# Moderate effectiveness (requires hw * antibiotics)");
  add("p_moderate_effectiveness <- 1");
  add("for (item in pac_moderate_items) {");
  add("  p_moderate_effectiveness <- p_moderate_effectiveness * facility_readiness[[item]]");
  add("}");
  add("p_moderate_effectiveness <- min(1, p_moderate_effectiveness)");
  blank();
  add("n_moderate_receiving_effective_care <- min(round(n_moderate_with_access * p_moderate_effectiveness), n_moderate_total)");
  add("n_moderate_not_receiving_effective_care <- n_moderate_total - n_moderate_receiving_effective_care");
  blank();
  add("# Severe complications");
  add("n_severe_total <- n_severe_from_facility + n_severe_from_oof");
  add("n_severe_with_access <- round(n_severe_total * p_pac_access)");
  blank();
  add("# Severe effectiveness (requires cemonc)");
  add("p_severe_effectiveness <- 1");
  add("for (item in pac_severe_items) {");
  add("  p_severe_effectiveness <- p_severe_effectiveness * facility_readiness[[item]]");
  add("}");
  add("p_severe_effectiveness <- min(1, p_severe_effectiveness)");
  blank();
  add("n_severe_receiving_effective_care <- min(round(n_severe_with_access * p_severe_effectiveness), n_severe_total)");
  add("n_severe_not_receiving_effective_care <- n_severe_total - n_severe_receiving_effective_care");
  blank();
  add("# PAC totals");
  add("n_pac_total <- n_moderate_total + n_severe_total");
  add("n_pac_receiving_effective <- n_moderate_receiving_effective_care + n_severe_receiving_effective_care");
  add("n_pac_not_receiving_effective <- n_moderate_not_receiving_effective_care + n_severe_not_receiving_effective_care");
  blank();

  add("# =============================================================================");
  add("# RESULTS TABLE");
  add("# =============================================================================");
  blank();
  add("cat('\\n========================================\\n')");
  add("cat('WHO ABORTION CARE MODEL RESULTS\\n')");
  add("cat('========================================\\n\\n')");
  blank();
  add("format_n <- function(n) format(round(n), big.mark = ',', scientific = FALSE)");
  add("format_pct <- function(p) paste0(round(p * 100, 1), '%')");
  add("format_n_pct <- function(n, p) paste0(format_n(n), ' (', format_pct(p), ')')");
  blank();

  add("cat('PREGNANCIES\\n')");
  add("cat('  All pregnancies:', format_n(n_total_pregnancies), '\\n')");
  add("cat('  Intended pregnancies:', format_n(n_intended_pregnancies), '\\n')");
  add("cat('  Unintended pregnancies:', format_n(n_unintended_pregnancies_calc), '\\n')");
  add("cat('\\n')");
  blank();

  add("cat('DEMAND\\n')");
  add("cat('  Pregnant women seeking an induced abortion:', format_n(n_seeks_induced_abortion), '\\n')");
  add("cat('\\n')");
  blank();

  add("cat('ACCESS\\n')");
  add("cat('  Abortion initiated in a facility:', format_n_pct(n_facility_arrive, p_arrive_facility), '\\n')");
  add("cat('  Abortion initiated out of a facility:', format_n_pct(n_oof_arrive, p_arrive_oof), '\\n')");
  add("cat('  No access:', format_n_pct(n_total_no_access, p_no_access), '\\n')");
  add("cat('\\n')");
  blank();

  add("cat('ABORTION SERVICE PROVISION AT FACILITIES\\n')");
  add("for (service in facility_services) {");
  add("  r <- facility_receipt[[service$id]]");
  add("  cat(paste0('  ', service$label, ' [', toupper(service$safety), ']: ', format_n_pct(r$n, r$p), '\\n'))");
  add("}");
  add("cat('  No abortion after initiating in a facility:', format_n_pct(facility_receipt[['noAbortion']]$n, facility_receipt[['noAbortion']]$p), '\\n')");
  add("cat('\\n')");
  blank();

  add("cat('ABORTION SERVICE PROVISION AT OUT-OF-FACILITY PROVIDERS\\n')");
  add("for (service in oof_services) {");
  add("  r <- oof_receipt[[service$id]]");
  add("  cat(paste0('  ', service$label, ' [', toupper(service$safety), ']: ', format_n_pct(r$n, r$p), '\\n'))");
  add("}");
  add("cat('  No abortion after initiating out of a facility:', format_n_pct(oof_receipt[['noAbortion']]$n, oof_receipt[['noAbortion']]$p), '\\n')");
  add("cat('\\n')");
  blank();

  add("cat('ABORTIONS\\n')");
  add("cat('  Total abortions:', format_n(n_total_abortions), '\\n')");
  add("cat('   -> Safe abortion:', format_n_pct(n_safe, divide_or_zero(n_safe, n_total_abortions)), '\\n')");
  add("cat('   -> Less safe abortion:', format_n_pct(n_less_safe, divide_or_zero(n_less_safe, n_total_abortions)), '\\n')");
  add("cat('   -> Least safe abortion:', format_n_pct(n_least_safe, divide_or_zero(n_least_safe, n_total_abortions)), '\\n')");
  add("cat('\\n')");
  blank();

  add("cat('ABORTION COMPLICATIONS\\n')");
  add("cat('  Total abortion complications:', format_n(n_total_complications), '\\n')");
  add("for (i in seq_along(complications_config)) {");
  add("  comp <- complications_config[[i]]");
  add("  n <- specific_complication_counts[i]");
  add("  p <- divide_or_zero(n, n_total_complications)");
  add("  cat(paste0('   -> ', comp$label, ' [', toupper(comp$category), ']: ', format_n_pct(n, p), '\\n'))");
  add("}");
  add("cat('\\n')");
  blank();

  add("cat('POST-ABORTION CARE FOR ABORTION COMPLICATIONS\\n')");
  add("cat('  Total moderate complications needing care:', format_n(n_moderate_total), '\\n')");
  add("cat('   -> Receiving effective care:', format_n_pct(n_moderate_receiving_effective_care, divide_or_zero(n_moderate_receiving_effective_care, n_moderate_total)), '\\n')");
  add("cat('   -> Not receiving effective care:', format_n_pct(n_moderate_not_receiving_effective_care, divide_or_zero(n_moderate_not_receiving_effective_care, n_moderate_total)), '\\n')");
  add("cat('  Total severe complications needing care:', format_n(n_severe_total), '\\n')");
  add("cat('   -> Receiving effective care:', format_n_pct(n_severe_receiving_effective_care, divide_or_zero(n_severe_receiving_effective_care, n_severe_total)), '\\n')");
  add("cat('   -> Not receiving effective care:', format_n_pct(n_severe_not_receiving_effective_care, divide_or_zero(n_severe_not_receiving_effective_care, n_severe_total)), '\\n')");
  add("cat('  Total complications needing care:', format_n(n_pac_total), '\\n')");
  add("cat('   -> Receiving effective care:', format_n_pct(n_pac_receiving_effective, divide_or_zero(n_pac_receiving_effective, n_pac_total)), '\\n')");
  add("cat('   -> Not receiving effective care:', format_n_pct(n_pac_not_receiving_effective, divide_or_zero(n_pac_not_receiving_effective, n_pac_total)), '\\n')");
  add("cat('\\n')");
  blank();

  add("cat('========================================\\n')");

  return lines.join("\n");
}
