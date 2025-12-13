# Model Methodology

> **Model limitations**: This model provides a simplified representation of abortion care pathways and does not reflect the full complexity of real-world health systems. Use results as insights for exploration and planning, not as definitive predictions.

## Overview

We Care implements a deterministic cohort model tracking individuals from a state of non-pregnancy to pregnancy to service delivery and final outcomes. The model calculates how interventions affect abortion safety by modeling the cascade from family planning through abortion and postabortion care service delivery, grounded in WHO Abortion Care Guideline, Second edition (2025) recommendations.

The model operates through **sequential calculation stages**:

## Family Planning → Unintended Pregnancies

Family planning is the most upstream intervention point. Improved contraceptive access and effectiveness reduces unintended pregnancies, and can reduce the need for abortion.

**Calculation:**

- Baseline unintended pregnancies are specified as input
- Proportion unintended = 1 - (method effectiveness × demand for FP × met demand for FP)
- Total pregnancies calculated backward from baseline unintended pregnancies
- Scenario adjustments to FP parameters change proportion unintended while keeping **intended pregnancies constant** (allowing total pregnancies to vary)

**Key insight:** This is the highest-leverage intervention category. Reducing unintended pregnancies reduces downstream need for abortion.

## Demand → Who Seeks Abortion

From unintended pregnancies, the model determines who seeks induced abortion.

**Pathways:**

- Some pregnancies miscarry naturally before care-seeking
- Some have medical contraindications requiring abortion (included with induced abortion seekers)
- Among remaining unintended pregnancies, a proportion seeks induced abortion (demand parameter)
- The remainder continue to live birth

**Output:** Total seeking induced abortion flows to access stage.

## Care-Seeking → Facility vs Out-of-Facility

Among those seeking abortion, people access facility-based and out-of-facility providers.

**"Acceptability" parameter:** Proportion preferring facility-based care. This reflects social and personal factors affecting facility decision-making.

- High acceptability → most seek facility care first
- Low acceptability → most go directly to out-of-facility providers

## Access Barriers → Who Reaches Services

People navigate barriers to reach care. The model tracks facility and out-of-facility pathways separately with **critical rerouting logic**.

**Facility access barriers (multiplicative):**

- Legal restrictions (proportion for whom abortion is legal)
- Service availability (proportion of facilities offering abortion)
- Combined distance and affordability barrier (see below)

**Out-of-facility access barriers:**

- Combined distance and affordability barrier

**Distance and affordability correlation:** The model assumes partial correlation between geographic distance and financial affordability barriers, reflecting that these barriers often affect the same populations (e.g., rural poor face both). The model uses a 50/50 blend:

- 50% assumes **independence**: barriers multiply (Distance × Cost)
- 50% assumes **perfect correlation**: worst barrier dominates (min(Distance, Cost))
- Final combined barrier = 0.5 × (Distance × Cost) + 0.5 × min(Distance, Cost)

Example with Distance=80%, Cost=60%:

- Independent: 80% × 60% = 48%
- Correlated: min(80%, 60%) = 60%
- Final: 0.5 × 48% + 0.5 × 60% = 54%

This results in higher access rates than pure independence (which would give 48%) but lower than pure correlation (which would give 60%), reflecting realistic partial overlap of barriers.

**CRITICAL REROUTING:** All who fail facility access barriers attempt out-of-facility care (100% reroute rate). Only those who fail out-of-facility barriers end up with no access.

## Service Readiness → What Components Available

Component availability determines which abortion methods can be provided. The model tracks readiness for:

- **Competent health workers** (competent providers)
- **Medications:** misoprostol, mifepristone (includes pain management)
- **Equipment:** vacuum aspiration, dilation & evacuation (D&E), dilation & curettage (D&C)
- **Supplies:** latex gloves, antiseptic, antibiotics

Each method requires specific component combinations.

## Service Receipt → Which Method Received

Based on component availability, people receive specific methods classified by WHO safety standards.

**Allocation method:** The model blends two allocation approaches based on health worker availability:

- **Priority-based allocation:** Safer methods allocated first (used when health workers present)
- **Proportional allocation:** Services allocated proportionally to availability (used when health workers absent)
- **Blend weight:** $1 - p_{healthworker}$ determines the mix

Higher health worker availability increases use of safer recommended services. Zero health worker availability results in proportional distribution across all available services.

**Facility sector (facility-based):**

- **Safe methods:**
  - Medication abortion with mifepristone + misoprostol (competent provider)
  - Medication abortion with misoprostol only (competent provider)
  - Vacuum aspiration (competent provider + equipment + supplies)
  - Dilation & evacuation - D&E (competent provider + equipment + supplies)
- **Less safe methods:**
  - Dilation & curettage - D&C (sharp method, higher risk)
  - Any safe method attempted without competent provider
- **Least safe methods:**
  - D&C without competent provider

**Out-of-facility sector:**

- **Safe methods:**
  - Self-management of medical abortion with quality-assured medicines (misoprostol and mifepristone, or misoprostol alone) and access to a competent health worker (who provides accurate information, including pain management, and can facilitate referral to facility services if needed or desired)
- **Less safe methods:**
  - Medication abortion without support from competent health worker
- **Least safe methods:**
  - Other traditional or dangerous methods

**People receiving "no abortion":** Those who reach a provider but cannot receive any method (all components exhausted) result in miscarriage or live birth.

## Abortion Outcomes → Safety Classifications

All pathways aggregate into pregnancy outcomes:

**Induced abortions by safety category:**

- **Safe:** Recommended WHO method with competent health worker (facility-based or self-managed with health worker support providing information, pain management, and referral access)
- **Less safe:** Correct method without support from competent health worker OR non-recommended method (D&C)
- **Least safe:** Dangerous methods

**Live births from:**

- Never sought abortion (chose to continue pregnancy)
- Sought but had no access
- Arrived at facility but received no abortion

**Miscarriages from:**

- Stage 1: Natural spontaneous miscarriages before seeking care (early pregnancy)
- Stage 2: Miscarriages among those who sought abortion but had no access
- Stage 2: Miscarriages among those who reached a facility but received no abortion
- Note: Same miscarriage rate applied to both stages (modeling simplification)

## Complications → Who Experiences Complications

Abortion services carry varying complication risks. The model tracks six complication types based on service safety:

**Moderate complications:**

- Incomplete abortion (retained products of conception)
- Continuing pregnancy (abortion failure)
- Infection

**Severe complications:**

- Uterine trauma/perforation
- Hemorrhage
- Other severe complications

**Service-specific complication rates:**

Each service has empirically-derived complication rates. Safe methods (medication abortion with competent health worker, vacuum aspiration) have substantially lower complication rates than less safe methods (D&C, medication without health worker support) or least safe methods (dangerous traditional practices).

**Calculation:**

For each person receiving a specific service, complications are determined by applying that service's complication rate. Total complications = moderate complications + severe complications.

**Those without complications** return to a non-pregnant state without requiring additional medical intervention.

## Post-Abortion Care → Treatment of Complications

Those experiencing complications require post-abortion care (PAC). The model calculates who receives effective treatment through access and readiness pathways.

### PAC Access Barriers

**Critical difference from abortion access:** Legal restrictions do NOT apply to PAC. Even where abortion is restricted, seeking treatment for complications is legal.

**PAC access barriers:**

- Service availability (proportion of facilities offering PAC services)
- Combined distance and affordability barrier (uses same 50/50 correlation blend as abortion access)

**Important note:** Both facility-origin and out-of-facility-origin complications face the same PAC access barriers. People who successfully accessed facilities for abortion have already demonstrated they can overcome distance/cost barriers, so they face the same rate when seeking PAC.

### PAC Effectiveness

Effective PAC requires different components based on complication severity:

**Moderate complications** (incomplete abortion, continuing pregnancy, infection):

- Require: Competent health worker × Antibiotics

**Severe complications** (trauma, hemorrhage, other):

- Require: Comprehensive Emergency Obstetric Care (CEmONC)

Effective PAC depends on both access to services and readiness (availability of appropriate components), where readiness differs by complication severity (moderate requires basic competent staff + antibiotics; severe requires CEmONC).

**Final PAC outcomes:**

- **Receiving effective care:** Have access AND effective services available
- **Not receiving effective care:** Lack access OR services unavailable/ineffective

---

## Mathematical Formulation

**Key notation:** $N$ = count (number of people), $p$ = proportion (0-1)

### Family Planning

$$p_{unintended} = 1 - (demand \times met\_demand \times effectiveness)$$

Scenarios keep intended pregnancies constant, so total pregnancies adjust based on the proportion intended.

### Access Barriers

Combined distance/affordability barrier accounts for partial correlation (controlled by $\alpha = 0.5$):

$$Combined(p_{dist}, p_{cost}) = \alpha \times \min(p_{dist}, p_{cost}) + (1-\alpha) \times (p_{dist} \times p_{cost})$$

Facility access barriers multiply:

$$p_{facility\_arrive} = p_{legal} \times p_{facilities} \times Combined(p_{distance}, p_{cost})$$

Out-of-facility access:

$$p_{outOfFacility\_arrive} = Combined(p_{distance}^{OOF}, p_{cost}^{OOF})$$

Those who fail facility access are rerouted to attempt out-of-facility access (100% reroute rate).

### Service Receipt

Services allocated based on component availability. Each service requires specific component combinations (health worker, medications, equipment, supplies).

Allocation blends priority-based and proportional methods:

$$\text{proportional weight} = 1 - p_{healthworker}$$

Higher health worker availability shifts allocation toward safer recommended services.

### Abortion Outcomes

$$N_{total} = N_{livebirth} + N_{miscarriage} + N_{abortions}$$

Abortions categorized as safe, less safe, or least safe based on method and provider type.

### Post-Abortion Care

PAC access excludes legal restrictions and uses the same combined distance/cost barrier:

$$p_{PAC\_access} = p_{facilities\_PAC} \times Combined(p_{distance}, p_{cost})$$

PAC effectiveness depends on complication severity:

$$p_{moderate\_effective} = p_{health\_worker} \times p_{antibiotics}$$

$$p_{severe\_effective} = p_{CEmONC}$$

Final outcomes:

$$N_{effective\_PAC} = N_{complications} \times p_{PAC\_access} \times p_{effectiveness}$$
