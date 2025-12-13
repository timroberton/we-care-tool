import { _FORMAL_ITEMS, _INFORMAL_ITEMS } from "~/config/items";

export type ParamCategory =
  | "familyPlanning"
  | "demand"
  | "facilityAccess"
  | "outOfFacilityAccess"
  | "facilityReadiness"
  | "outOfFacilityReadiness";

export type HSBuildingBlock =
  | "workforce"
  | "it"
  | "governance"
  | "commodities"
  | "services"
  | "financing";

export interface ParamField {
  category: ParamCategory;
  property: string;
  label: string;
  description: string;
  hsBuildingBlocks: HSBuildingBlock[];
}

export interface ParamFieldSection {
  header: string;
  fields: ParamField[];
}

export const PARAM_FIELD_SECTIONS: ParamFieldSection[] = [
  {
    header: "Demand",
    fields: [
      {
        category: "demand",
        property: "pDemandForAbortion",
        label:
          "Proportion of unintended pregnancies for which abortion is sought",
        description:
          "The proportion of women with unintended pregnancies who actively seek abortion services",
        hsBuildingBlocks: ["services", "governance"],
      },
      {
        category: "demand",
        property: "pPreferFacility",
        label:
          "Proportion of women seeking an abortion whose preference is for facility-based care",
        description:
          "Among women seeking abortion, the proportion who prefer facility-based care over out-of-facility options",
        hsBuildingBlocks: ["services", "governance"],
      },
    ],
  },
  {
    header: "Facility access",
    fields: [
      {
        category: "facilityAccess",
        property: "pNoLegalRestrictions",
        label:
          "Proportion of unintended pregnancies for which abortion is legally restricted",
        description:
          "The proportion of women who face legal restrictions that prevent them from accessing legal abortion services",
        hsBuildingBlocks: ["governance"],
      },
      {
        category: "facilityAccess",
        property: "pAccessibleDistance",
        label: "Proportion of women within accessible distance of a facility",
        description:
          "The proportion of women who live within a reasonable geographic distance to reach a facility offering abortion care",
        hsBuildingBlocks: ["services"],
      },
      {
        category: "facilityAccess",
        property: "pFacilityOffersAbortion",
        label: "Proportion of facilities offering abortion care services",
        description:
          "Among all health facilities, the proportion that provide abortion care services",
        hsBuildingBlocks: ["services", "governance"],
      },
      {
        category: "facilityAccess",
        property: "pAffordable",
        label:
          "Proportion of women for whom the cost of facility-based care is not a barrier",
        description:
          "The proportion of women who can afford facility-based abortion care without financial hardship",
        hsBuildingBlocks: ["financing"],
      },
    ],
  },
  {
    header: "Out-of-facility access",
    fields: [
      {
        category: "outOfFacilityAccess",
        property: "pAccessibleDistance",
        label:
          "Proportion of women within accessible distance of an out-of-facility provider",
        description:
          "The proportion of women who live within a reasonable geographic distance to reach an out-of-facility abortion provider",
        hsBuildingBlocks: ["services"],
      },
      {
        category: "outOfFacilityAccess",
        property: "pAffordable",
        label:
          "Proportion of women for whom the cost of out-of-facility care is not a barrier",
        description:
          "The proportion of women who can afford out-of-facility abortion care without financial hardship",
        hsBuildingBlocks: ["financing"],
      },
    ],
  },
  {
    header: "Facility readiness",
    fields: _FORMAL_ITEMS.map((item) => ({
      category: "facilityReadiness" as const,
      property: item.id,
      label: item.label,
      description: item.description,
      hsBuildingBlocks: item.hsBuildingBlocks,
    })),
  },
  {
    header: "Out-of-facility readiness",
    fields: _INFORMAL_ITEMS.map((item) => ({
      category: "outOfFacilityReadiness" as const,
      property: item.id,
      label: item.label,
      description: item.description,
      hsBuildingBlocks: item.hsBuildingBlocks,
    })),
  },
  {
    header: "Family planning",
    fields: [
      {
        category: "familyPlanning",
        property: "pDemandForFamilyPlanning",
        label: "Demand for family planning",
        description:
          "Among women not wanting pregnancy, the proportion who desire family planning services",
        hsBuildingBlocks: ["services", "governance"],
      },
      {
        category: "familyPlanning",
        property: "pMetDemandForFamilyPlanning",
        label: "Met need for family planning",
        description:
          "The proportion of family planning demand that is currently being met with contraceptive services",
        hsBuildingBlocks: ["services", "commodities"],
      },
      {
        category: "familyPlanning",
        property: "pCombinedEffectivenessOfMethods",
        label: "Combined effectiveness of contraceptive methods",
        description:
          "The weighted average effectiveness of all contraceptive methods currently in use",
        hsBuildingBlocks: ["commodities"],
      },
    ],
  },
];
