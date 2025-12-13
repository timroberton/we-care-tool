export type Service = {
  id: string;
  label: string;
  componentCombos: string[][];
  safety: "safe" | "less" | "least";
  complicationRates: number[];
};

const _COMPLICATION_RATES = {
  _Miso_Mife_HW: [0.025, 0.005, 0.005, 0.0, 0.01, 0.01],
  _Vac_DE_HW: [0.01, 0.001, 0.001, 0.005, 0.001, 0.001],
  _DC_HW: [0.01, 0.001, 0.04, 0.045, 0.05, 0.2],
  _Miso_Mife_NOHEALTHWORKER: [0.04, 0.04, 0.04, 0.045, 0.05, 0.2],
  _Vac_DE_NOHEALTHWORKER: [0.01, 0.001, 0.04, 0.045, 0.05, 0.2],
  _DC_NOHEALTHWORKER: [0.01, 0.001, 0.04, 0.045, 0.05, 0.2].map((v) => v * 2),
  // Out-of-facility
  // _Miso_Mife_NOHEALTHWORKER_OUTSIDE: [0.04, 0.04, 0.3295, 0.0, 0.05, 0.2],
  _OTHER_OUTSIDE: [0.04, 0.04, 0.33, 0.085, 0.09, 0.38],
};

// Array order matters: services are allocated items in priority order
// During receipt calculation, earlier services get first access to limited resources
export const _FORMAL_SERVICES: Service[] = [
  {
    id: "facility01",
    label: "Misoprostol and mifepristone",
    componentCombos: [["hw", "miso", "mife"]],
    safety: "safe",
    complicationRates: [..._COMPLICATION_RATES._Miso_Mife_HW],
  },
  {
    id: "facility02",
    label: "Misoprostol only",
    componentCombos: [["hw", "miso"]],
    safety: "safe",
    complicationRates: [..._COMPLICATION_RATES._Miso_Mife_HW],
  },
  {
    id: "facility03",
    label: "Vacuum aspiration",
    componentCombos: [
      ["hw", "vacasp", "latexgloves", "antiseptic", "antibiotics"],
    ],
    safety: "safe",
    complicationRates: [..._COMPLICATION_RATES._Vac_DE_HW],
  },
  {
    id: "facility04",
    label: "Dilation and evacuation",
    componentCombos: [
      ["hw", "dilevac", "latexgloves", "antiseptic", "antibiotics"],
    ],
    safety: "safe",
    complicationRates: [..._COMPLICATION_RATES._Vac_DE_HW],
  },
  {
    id: "facility05",
    label: "Dilation and curettage",
    componentCombos: [["hw", "dilcur", "latexgloves", "antiseptic"]],
    safety: "less",
    complicationRates: [..._COMPLICATION_RATES._DC_HW],
  },
  {
    id: "facility06",
    label: "Misoprostol and mifepristone, without a competent health worker",
    componentCombos: [["miso", "mife"]],
    safety: "less",
    complicationRates: [..._COMPLICATION_RATES._Miso_Mife_NOHEALTHWORKER],
  },
  {
    id: "facility07",
    label: "Misoprostol only, without a competent health worker",
    componentCombos: [["miso"]],
    safety: "less",
    complicationRates: [..._COMPLICATION_RATES._Miso_Mife_NOHEALTHWORKER],
  },
  {
    id: "facility08",
    label: "Vacuum aspiration, without a competent health worker",
    componentCombos: [["vacasp", "latexgloves", "antiseptic", "antibiotics"]],
    safety: "less",
    complicationRates: [..._COMPLICATION_RATES._Vac_DE_NOHEALTHWORKER],
  },
  {
    id: "facility09",
    label: "Dilation and evacuation, without a competent health worker",
    componentCombos: [["dilevac", "latexgloves", "antiseptic", "antibiotics"]],
    safety: "less",
    complicationRates: [..._COMPLICATION_RATES._Vac_DE_NOHEALTHWORKER],
  },
  {
    id: "facility10",
    label: "Dilation and curettage, without a competent health worker",
    componentCombos: [["dilcur", "latexgloves", "antiseptic"]],
    safety: "least",
    complicationRates: [..._COMPLICATION_RATES._DC_NOHEALTHWORKER],
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
    complicationRates: [..._COMPLICATION_RATES._Miso_Mife_HW],
  },
  {
    id: "outOfFacility2",
    label: "Misoprostol only",
    safety: "safe",
    componentCombos: [["hw", "miso"]],
    complicationRates: [..._COMPLICATION_RATES._Miso_Mife_HW],
  },
  {
    id: "outOfFacility3",
    label: "Misoprostol and mifepristone, without a competent health worker",
    componentCombos: [["miso", "mife"]],
    safety: "less",
    complicationRates: [..._COMPLICATION_RATES._Miso_Mife_NOHEALTHWORKER],
  },
  {
    id: "outOfFacility4",
    label: "Misoprostol only, without a competent health worker",
    componentCombos: [["miso"]],
    safety: "less",
    complicationRates: [..._COMPLICATION_RATES._Miso_Mife_NOHEALTHWORKER],
  },
  {
    id: "outOfFacility5",
    label: "All other out-of-facility services",
    safety: "least",
    componentCombos: [["other"]],
    complicationRates: [..._COMPLICATION_RATES._OTHER_OUTSIDE],
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
