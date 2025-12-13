import { downloadCsv, stringifyCsv, toPct1 } from "panther";
import { PARAM_FIELD_SECTIONS } from "~/config/param_fields";
import type { Parameters } from "~/types/mod";
import { t, td } from "~/translate/mod";

export function exportParametersToCSV(params: Parameters): string {
  const rows: string[][] = [];

  const toNumPlain = (v: number) => v.toFixed(0);

  const allScenarios = [params.baseline, ...params.scenarios];
  const headers = [
    "parameter_id",
    "label",
    "BASE",
    ...params.scenarios.map((s) => s.name),
    "source_description",
    "source_type",
    "source_classification",
  ];
  rows.push(headers);

  const getSourceInfo = (paramId: string) => {
    const info = params.baselineSourceInfo?.[paramId];
    return {
      description: info?.description ?? "",
      type: info?.type ?? "unknown",
      classification: info?.classification ?? "unclassified",
    };
  };

  const baselineOnlyParams = [
    {
      paramId: "pregnancyOutcomes.nUnintendedPregnancies",
      label: t("Number of unintended pregnancies"),
      format: toNumPlain,
    },
    {
      paramId: "pregnancyOutcomes.pResultingInMiscarriage",
      label: t("Proportion of pregnancies resulting in miscarriage"),
      format: toPct1,
    },
  ];

  for (const param of baselineOnlyParams) {
    const [category, property] = param.paramId.split(".");
    const sourceInfo = getSourceInfo(param.paramId);
    const baselineValue = (
      params.baseline[category as keyof typeof params.baseline] as any
    )[property] as number;
    const rowData: string[] = [
      param.paramId,
      param.label,
      param.format(baselineValue),
    ];
    for (let i = 0; i < params.scenarios.length; i++) {
      rowData.push("");
    }
    rowData.push(sourceInfo.description, sourceInfo.type, sourceInfo.classification);
    rows.push(rowData);
  }

  for (const section of PARAM_FIELD_SECTIONS) {
    for (const slider of section.fields) {
      const paramId = `${slider.category}.${slider.property}`;
      const sourceInfo = getSourceInfo(paramId);

      // Baseline always uses its own values
      const baselineValue = (params.baseline[slider.category] as any)[
        slider.property
      ] as number;

      const rowData: string[] = [paramId, td(slider.label), toPct1(baselineValue)];

      // For scenarios, check adjustment flag
      for (const scenario of params.scenarios) {
        const adjustmentKey = section.adjustmentKey;

        if (scenario.adjustments[adjustmentKey]) {
          // Adjustment is active - export scenario's value
          const value = (scenario[slider.category] as any)[
            slider.property
          ] as number;
          rowData.push(toPct1(value));
        } else {
          // Adjustment is inactive - export baseline value
          rowData.push(toPct1(baselineValue));
        }
      }

      rowData.push(sourceInfo.description, sourceInfo.type, sourceInfo.classification);
      rows.push(rowData);
    }
  }

  return stringifyCsv(rows, { bom: true });
}

export function downloadCSV(
  csvContent: string,
  filename: string = "parameters.csv"
): void {
  downloadCsv(csvContent, filename);
}
