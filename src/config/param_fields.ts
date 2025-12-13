import { _FORMAL_ITEMS, _INFORMAL_ITEMS } from "~/config/items";

export type ParamCategory =
  | "pregnancyOutcomes"
  | "familyPlanning"
  | "demand"
  | "facilityAccess"
  | "outOfFacilityAccess"
  | "facilityReadiness"
  | "outOfFacilityReadiness";

export type AdjustmentKey = Exclude<ParamCategory, "pregnancyOutcomes">;

export type HSBuildingBlock =
  | "workforce"
  | "it"
  | "governance"
  | "commodities"
  | "services"
  | "financing";

export type ParamField = {
  category: ParamCategory;
  property: string;
  label: string;
  description: string;
  source?: string;
  hsBuildingBlocks: HSBuildingBlock[];
  reverseColors?: boolean;
};

export type ParamFieldSection = {
  adjustmentKey: AdjustmentKey;
  header: string;
  labelPrefix?: string;
  fields: ParamField[];
};

export const PARAM_FIELD_SECTIONS: ParamFieldSection[] = [
  {
    adjustmentKey: "demand",
    header: "Abortion seeking",
    fields: [
      {
        category: "demand",
        property: "pDemandForAbortion",
        label:
          "Proportion of unintended pregnancies for which abortion is sought",
        description:
          "This indicator refers to the proportion of women experiencing an unintended pregnancy who choose to seek an abortion. An abortion (or termination) is the medical process of ending a pregnancy. Abortion is a common health intervention. It is very safe when carried out using a method recommended by WHO, appropriate to the pregnancy duration and by someone with the necessary skills.",
        source: "https://www.who.int/news-room/fact-sheets/detail/abortion",
        hsBuildingBlocks: ["services", "governance"],
      },
      {
        category: "demand",
        property: "pPreferFacility",
        label:
          "Proportion of women seeking an induced abortion whose preference is to initiate abortion in a facility",
        description:
          "This indicator refers to the proportion of women who choose to seek an abortion, who have a preference to engage with facility-based abortion care services based on knowledge, awareness, trust, and interest in facility based care.",
        source: "https://pubmed.ncbi.nlm.nih.gov/39667172/",
        hsBuildingBlocks: ["services", "governance"],
      },
    ],
  },
  {
    adjustmentKey: "facilityAccess",
    header: "Facility access",
    fields: [
      {
        category: "facilityAccess",
        property: "pNoLegalRestrictions",
        label:
          "Proportion of unintended pregnancies for which abortion is not legally restricted",
        description:
          "This indicator refers to the proportion of women who choose to seek an abortion, who will be able to access facility based care in accordance with the legal context of abortion in their country. Restrictive laws and requirements that are not medically justified include criminalization of abortion, mandatory waiting periods, provision of biased information or counselling, third-party authorization and restrictions regarding the type of health care providers or facilities that can provide abortion services.",
        source: "https://www.who.int/news-room/fact-sheets/detail/abortion",
        hsBuildingBlocks: ["governance"],
      },
      {
        category: "facilityAccess",
        property: "pFacilityOffersAbortion",
        label: "Proportion of facilities offering abortion services",
        description:
          "This indicator refers to the proportion of healthcare facilities who offer abortion care services of any kind (including comprehensive abortion care, and post abortion care).",
        hsBuildingBlocks: ["services", "governance"],
      },
      {
        category: "facilityAccess",
        property: "pFacilityOffersPostAbortionCare",
        label: "Proportion of facilities offering post-abortion care services",
        description:
          "This indicator refers to the proportion of healthcare facilities who offer post-abortion care services.",
        hsBuildingBlocks: ["services", "governance"],
      },
      {
        category: "facilityAccess",
        property: "pAccessibleDistance",
        label: "Proportion of women within accessible distance of a facility",
        description:
          "This indicator refers to the proportion of women who choose to seek an abortion, who will be able to access a healthcare facility based on their geographic distance from a healthcare facility.",
        hsBuildingBlocks: ["services"],
      },
      {
        category: "facilityAccess",
        property: "pAffordable",
        label:
          "Proportion of women for whom the cost of facility-based care is not a barrier",
        description:
          "This indicator refers to the proportion of women who choose to seek facility-based abortion care, for whom associated costs will not be a barrier (including loss of income, payment for abortion care services, and other financial costs).",
        source: "https://www.who.int/news-room/fact-sheets/detail/abortion",
        hsBuildingBlocks: ["financing"],
      },
    ],
  },
  {
    adjustmentKey: "outOfFacilityAccess",
    header: "Out-of-facility access",
    fields: [
      {
        category: "outOfFacilityAccess",
        property: "pAccessibleDistance",
        label:
          "Proportion of women within accessible distance of an out-of-facility provider",
        description:
          "This indicator refers to the proportion of women who choose to seek an abortion, who will be able to access an out-of-facility provider (including pharmacy, telehealth, or traditional provider) based on their geographic distance from an out-of-facility provider.",
        hsBuildingBlocks: ["services"],
      },
      {
        category: "outOfFacilityAccess",
        property: "pAffordable",
        label:
          "Proportion of women for whom the cost of out-of-facility care is not a barrier",
        description:
          "This indicator refers to the proportion of women who choose to seek out-of-facility-based abortion care, for whom associated costs will not be a barrier (including loss of income, payment for abortion care services, and other financial costs).",
        hsBuildingBlocks: ["financing"],
      },
    ],
  },
  {
    adjustmentKey: "facilityReadiness",
    header: "Facility readiness",
    labelPrefix: "Facility: ",
    fields: _FORMAL_ITEMS.map((item) => ({
      category: "facilityReadiness" as const,
      property: item.id,
      label: item.label,
      description: item.description,
      hsBuildingBlocks: item.hsBuildingBlocks,
      reverseColors: item.reverseColors,
    })),
  },
  {
    adjustmentKey: "outOfFacilityReadiness",
    header: "Out-of-facility readiness",
    labelPrefix: "Out-of-facility: ",
    fields: _INFORMAL_ITEMS.map((item) => ({
      category: "outOfFacilityReadiness" as const,
      property: item.id,
      label: item.label,
      description: item.description,
      hsBuildingBlocks: item.hsBuildingBlocks,
      reverseColors: item.reverseColors,
    })),
  },
  {
    adjustmentKey: "familyPlanning",
    header: "Family planning",
    fields: [
      {
        category: "familyPlanning",
        property: "pDemandForFamilyPlanning",
        label: "Demand for family planning",
        description:
          "This indicator refers to the proportion of women who don't want pregnancy, who want access to family planning services and contraception.",
        hsBuildingBlocks: ["services", "governance"],
      },
      {
        category: "familyPlanning",
        property: "pMetDemandForFamilyPlanning",
        label: "Met need for family planning",
        description:
          "This indicator refers to the proportion of women who want access to family planning services and contraception and have this demand met.",
        hsBuildingBlocks: ["services", "commodities"],
      },
      {
        category: "familyPlanning",
        property: "pCombinedEffectivenessOfMethods",
        label: "Combined effectiveness of contraceptive methods",
        description:
          "This indicator refers to combined effectiveness of family planning services and contraceptive methods.",
        hsBuildingBlocks: ["commodities"],
      },
    ],
  },
];
