export type Service = {
  id: string;
  label: string;
  componentCombos: string[][];
  safety: "safe" | "less" | "least";
  complicationRates: number[];
};

// Point estimates from "We Care_ Appendix 2 Revised_2026.10.08.xlsx", sheet
// "Appendix 2 - update" (WHO, October 2026), in _COMPLICATIONS order:
// incomplete, continuing, infection, trauma, hemorrhage, other.
// Facility services use the Formal rows, out-of-facility services the
// Informal rows. WHO gives no separate evidence for services without a
// competent health worker, so those share the row of the same method.
// The model has no gestational-age split, so the <12-week band is used.
// D&E is only performed at >=12 weeks, so it uses that band.
const _COMPLICATION_RATES = {
  FORMAL_MIFE_MISO: [0.029, 0.007, 0.005, 0.0004, 0.0014, 0.0008],
  FORMAL_MISO: [0.054, 0.015, 0.0045, 0.0004, 0.003, 0.0008],
  FORMAL_VA: [0.01, 0.0016, 0.01, 0.0008, 0.0013, 0.0003],
  FORMAL_DE: [0.015, 0, 0.016, 0.04, 0.066, 0.001],
  FORMAL_DC: [0.003, 0.0016, 0.024, 0.0004, 0.0002, 0.0003],
  INFORMAL_MIFE_MISO: [0.029, 0.007, 0.007, 0.0004, 0.002, 0.0008],
  INFORMAL_MISO: [0.054, 0.015, 0.0045, 0.0004, 0.003, 0.0008],
  INFORMAL_OTHER: [0.054, 0.015, 0.024, 0.0008, 0.004, 0.0008],
};

// Array order matters: services are allocated items in priority order
// During receipt calculation, earlier services get first access to limited resources
export const _FORMAL_SERVICES: Service[] = [
  {
    id: "facility01",
    label: "Misoprostol and mifepristone",
    componentCombos: [["hw", "miso", "mife"]],
    safety: "safe",
    complicationRates: [..._COMPLICATION_RATES.FORMAL_MIFE_MISO],
  },
  {
    id: "facility02",
    label: "Misoprostol only",
    componentCombos: [["hw", "miso"]],
    safety: "safe",
    complicationRates: [..._COMPLICATION_RATES.FORMAL_MISO],
  },
  {
    id: "facility03",
    label: "Vacuum aspiration",
    componentCombos: [
      ["hw", "vacasp", "latexgloves", "antiseptic", "antibiotics"],
    ],
    safety: "safe",
    complicationRates: [..._COMPLICATION_RATES.FORMAL_VA],
  },
  {
    id: "facility04",
    label: "Dilation and evacuation",
    componentCombos: [
      ["hw", "dilevac", "latexgloves", "antiseptic", "antibiotics"],
    ],
    safety: "safe",
    complicationRates: [..._COMPLICATION_RATES.FORMAL_DE],
  },
  {
    id: "facility05",
    label: "Dilation and curettage",
    componentCombos: [["hw", "dilcur", "latexgloves", "antiseptic"]],
    safety: "less",
    complicationRates: [..._COMPLICATION_RATES.FORMAL_DC],
  },
  {
    id: "facility06",
    label: "Misoprostol and mifepristone, without a competent health worker",
    componentCombos: [["miso", "mife"]],
    safety: "less",
    complicationRates: [..._COMPLICATION_RATES.FORMAL_MIFE_MISO],
  },
  {
    id: "facility07",
    label: "Misoprostol only, without a competent health worker",
    componentCombos: [["miso"]],
    safety: "less",
    complicationRates: [..._COMPLICATION_RATES.FORMAL_MISO],
  },
  {
    id: "facility08",
    label: "Vacuum aspiration, without a competent health worker",
    componentCombos: [["vacasp", "latexgloves", "antiseptic", "antibiotics"]],
    safety: "less",
    complicationRates: [..._COMPLICATION_RATES.FORMAL_VA],
  },
  {
    id: "facility09",
    label: "Dilation and evacuation, without a competent health worker",
    componentCombos: [["dilevac", "latexgloves", "antiseptic", "antibiotics"]],
    safety: "less",
    complicationRates: [..._COMPLICATION_RATES.FORMAL_DE],
  },
  {
    id: "facility10",
    label: "Dilation and curettage, without a competent health worker",
    componentCombos: [["dilcur", "latexgloves", "antiseptic"]],
    safety: "least",
    complicationRates: [..._COMPLICATION_RATES.FORMAL_DC],
  },
];

export function getFormalServicesMap(
  tFunc: (key: string) => string
): Record<string, string> {
  return _FORMAL_SERVICES.reduce((acc, item) => {
    acc[item.id] = tFunc("Facility: ") + item.label;
    return acc;
  }, {} as Record<string, string>);
}

// Array order matters: services are allocated items in priority order
// During receipt calculation, earlier services get first access to limited resources
export const _OUT_OF_FACILITY_SERVICES: Service[] = [
  {
    id: "outOfFacility1",
    label: "Misoprostol and mifepristone",
    safety: "safe",
    componentCombos: [["hw", "miso", "mife"]],
    complicationRates: [..._COMPLICATION_RATES.INFORMAL_MIFE_MISO],
  },
  {
    id: "outOfFacility2",
    label: "Misoprostol only",
    safety: "safe",
    componentCombos: [["hw", "miso"]],
    complicationRates: [..._COMPLICATION_RATES.INFORMAL_MISO],
  },
  {
    id: "outOfFacility3",
    label: "Misoprostol and mifepristone, without a competent health worker",
    componentCombos: [["miso", "mife"]],
    safety: "less",
    complicationRates: [..._COMPLICATION_RATES.INFORMAL_MIFE_MISO],
  },
  {
    id: "outOfFacility4",
    label: "Misoprostol only, without a competent health worker",
    componentCombos: [["miso"]],
    safety: "less",
    complicationRates: [..._COMPLICATION_RATES.INFORMAL_MISO],
  },
  {
    id: "outOfFacility5",
    label: "All other out-of-facility services",
    safety: "least",
    componentCombos: [["other"]],
    complicationRates: [..._COMPLICATION_RATES.INFORMAL_OTHER],
  },
];

export function getOutOfFacilityServicesMap(
  tFunc: (key: string) => string
): Record<string, string> {
  return _OUT_OF_FACILITY_SERVICES.reduce(
    (acc, item) => {
      acc[item.id] = tFunc("Out-of-facility: ") + item.label;
      return acc;
    },
    {} as Record<string, string>
  );
}

export const _POST_ABORTION_CARE_READINESS = {
  moderate: ["hw", "antibiotics"] as const,
  severe: ["cemonc"] as const,
} as const;
