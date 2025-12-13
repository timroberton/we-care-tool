import type { HSBuildingBlock } from "./param_fields";

type Item = {
  id: string;
  defaultValue: number;
  label: string;
  description: string;
  source?: string;
  hsBuildingBlocks: HSBuildingBlock[];
  reverseColors?: boolean;
};

export const _FORMAL_ITEMS: Item[] = [
  {
    id: "hw",
    defaultValue: 0.6,
    label: "Health worker competent in abortion care",
    description:
      "This indicator refers to the proportion of facilities offering abortion services, whose health workforce are appropriately knowledgeable and trained to provide abortion care services in accordance with the WHO Family planning and comprehensive abortion care toolkit for the primary health care workforce guidelines.",
    source:
      "https://www.who.int/activities/empowering-health-workers-to-deliver-quality-abortion-care",
    hsBuildingBlocks: ["workforce"],
  },
  {
    id: "miso",
    defaultValue: 0.7,
    label: "Misoprostol",
    description:
      "This indicator refers to the proportion of facilities offering abortion services, who have misoprostol available as a commodity for facility-based abortion care.",
    hsBuildingBlocks: ["commodities"],
  },
  {
    id: "mife",
    defaultValue: 0.6,
    label: "Mifepristone",
    description:
      "This indicator refers to the proportion of facilities offering abortion services, who have mifepristone available as a commodity for facility-based abortion care.",
    hsBuildingBlocks: ["commodities"],
  },
  {
    id: "vacasp",
    defaultValue: 0.8,
    label: "Vacuum aspiration kit (MVA, EVA kit)",
    description:
      "This indicator refers to the proportion of facilities offering abortion services, who have a vacuum aspiration kit (MVA, EVA) available as a commodity for facility-based abortion care.",
    hsBuildingBlocks: ["commodities"],
  },
  {
    id: "dilevac",
    defaultValue: 0.8,
    label: "Dilation and evacuation kit (D&E kit)",
    description:
      "This indicator refers to the proportion of facilities offering abortion services, who have a dilation and evacuation kit (D&E) available as a commodity for facility-based abortion care.",
    hsBuildingBlocks: ["commodities"],
  },
  {
    id: "dilcur",
    defaultValue: 0.8,
    label: "Dilation and curettage kit (D&C kit)",
    description:
      "This indicator refers to the proportion of facilities offering abortion services, who have a dilation and curettage kit (D&C) available as a commodity for facility-based abortion care.",
    hsBuildingBlocks: ["commodities"],
    reverseColors: true,
  },
  {
    id: "latexgloves",
    defaultValue: 0.8,
    label: "Disposable latex gloves (sterile)",
    description:
      "This indicator refers to the proportion of facilities offering abortion services, who have disposable latex gloves available as a commodity for facility-based abortion care.",
    hsBuildingBlocks: ["commodities"],
  },
  {
    id: "antiseptic",
    defaultValue: 0.8,
    label: "Antiseptic for cleaning cervix",
    description:
      "This indicator refers to the proportion of facilities offering abortion services, who have antiseptic available as a commodity for facility-based abortion care.",
    hsBuildingBlocks: ["commodities"],
  },
  {
    id: "antibiotics",
    defaultValue: 0.8,
    label: "Antibiotics",
    description:
      "This indicator refers to the proportion of facilities offering abortion services, who have antibiotics available as a commodity for facility-based abortion care.",
    hsBuildingBlocks: ["commodities"],
  },
  {
    id: "cemonc",
    defaultValue: 0.2,
    label: "CEmONC",
    description:
      "This indicator refers to the proportion of facilities offering CEmONC for facility-based post-abortion care.",
    hsBuildingBlocks: ["commodities"],
  },
];

export const _INFORMAL_ITEMS: Item[] = [
  {
    id: "hw",
    defaultValue: 0.6,
    label: "Health worker competent in abortion care",
    description:
      "This indicator refers to the proportion of out-of-facility service providers who are appropriately knowledgeable and trained to correctly dispense a WHO-recommended medical abortion regimen (mifepristone + misoprostol or correct misoprostol-only dosing), and provide the minimum essential counselling (how to take the drugs, expected bleeding/pain, when to seek care for warning signs).",
    hsBuildingBlocks: ["workforce"],
  },
  {
    id: "miso",
    defaultValue: 0.5,
    label: "Misoprostol",
    description:
      "This indicator refers to the proportion of out-of-facility service points who have misoprostol available as a commodity to provide abortion care.",
    hsBuildingBlocks: ["commodities"],
  },
  {
    id: "mife",
    defaultValue: 0.4,
    label: "Mifepristone",
    description:
      "This indicator refers to the proportion of out-of-facility service points who have mifepristone available as a commodity to provide abortion care.",
    hsBuildingBlocks: ["commodities"],
  },
  {
    id: "other",
    defaultValue: 0.7,
    label: "Other items for non-recommended out-of-facility services",
    description:
      "This indicator refers to the proportion of out-of-facility service points who have other non-recommended products available to provide abortion care.",
    hsBuildingBlocks: ["commodities"],
  },
];
