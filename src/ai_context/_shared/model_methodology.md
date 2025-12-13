# Model Methodology

The model projects abortion care outcomes through a sequential calculation cascade:

## FAMILY PLANNING → Unintended pregnancies

- Improved family planning access/effectiveness reduces unintended pregnancies upstream
- Reduces total number of abortions but does not improve the proportion receiving safe care
- Keeps intended pregnancies constant (allowing total pregnancies to vary)

## ABORTION SEEKING → Who seeks abortion

- Among unintended pregnancies, proportion seeking abortion
- Includes contraindicated pregnancies (medical necessity)

## CARE-SEEKING PREFERENCES → Facility vs out-of-facility

- "Acceptable" = prefers facility-based care
- Choice affects access pathways and available services

## ACCESS BARRIERS → Who reaches services

- FACILITY: Legal × Facilities offering service × Combined(Distance, Cost)
- OUT-OF-FACILITY: Combined(Distance, Cost)
- **Distance/Cost Correlation**: Uses 50/50 blend of independent and correlated assumptions, reflecting that distance and affordability barriers often affect the same populations
- CRITICAL: All who fail facility access are rerouted to out-of-facility sector (100% reroute rate)

## SERVICE READINESS → What components available

- Tracks availability of: health workers, medications (miso/mife), equipment (vacuum aspiration, D&E, D&C), supplies (gloves, antiseptic, antibiotics)
- Each method requires specific component combinations

## SERVICE RECEIPT → Which method received

**Allocation:** Blends priority-based (safer first) and proportional methods based on health worker availability. Higher health worker availability → more use of safer recommended services.

**Safety classifications:**

- Safe: Competent health worker + recommended method (facility-based OR self-managed with health worker support)
- Less safe: Correct method without support from a competent health worker OR non-recommended method (D&C)
- Least safe: Dangerous methods

## ABORTION OUTCOMES → Safety classifications

- Aggregates all pathways into safety categories
- Includes those who receive no abortion (→ miscarriage or live birth)

## COMPLICATIONS → Who experiences complications

- Each service has specific complication rates (6 types: moderate and severe)
- Safe services have lower complication rates than less safe or least safe services
- Those without complications return to non-pregnant state

## POST-ABORTION CARE → Treatment of complications

### Access to PAC

- Does NOT include legal restrictions (PAC is legal even where abortion isn't)
- Barriers: Facilities offering PAC × Combined(Distance, Cost)
- Uses same Distance/Cost correlation blend as abortion access (50/50 independent/correlated)
- Both facility and out-of-facility complications face same access barriers
- Note: Those who can access facilities for abortion can also access PAC (same location/infrastructure)

### PAC Effectiveness

- **Moderate complications** require: Health worker × Antibiotics
- **Severe complications** require: Comprehensive emergency obstetric care (CEmONC)
- Final outcomes:
  - Receiving effective care (have access × effective services available)
  - Not receiving effective care (lack access OR ineffective services)

## Baseline vs Scenarios

- Baseline represents current state
- Scenarios inherit all baseline parameters by default
- Each scenario has "adjustment flags" for 6 categories (familyPlanning, abortionSeeking, facilityAccess, outOfFacilityAccess, facilityReadiness, outOfFacilityReadiness)
- When adjustment flag is TRUE for a category, scenario uses its own values for that category
- When adjustment flag is FALSE, scenario inherits baseline values
- Modifying any parameter automatically enables its category's adjustment flag

## Service Sectors

- **FACILITY**: Health facilities with competent staff, equipment, commodities (can provide MA, vacuum aspiration, D&E, or D&C)
- **OUT-OF-FACILITY**: Pharmacies, community providers, self-managed care (quality varies by health worker support)
