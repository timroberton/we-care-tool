import type { ChartOVInputs } from "panther";
import type { Results } from "~/types/mod";
import {
  formatComparison,
  formatPercentageComparison,
  formatValue,
  leftAlign,
  rightAlign,
  sectionHeader,
} from "./_shared";
import { toNum0, toPct1 } from "panther";

function getScenarioLabel(scenario: { name: string; id: string }, index: number): string {
  return index === 0 ? scenario.name : `Scenario ${index}. ${scenario.name}`;
}

export function getReadableTextFromChart(
  chartConfig: {
    id: string;
    description: string;
    inputs: ChartOVInputs;
  },
  results: Results
): string {
  const sections: string[] = [];

  sections.push(`CHART: ${chartConfig.id}`);
  sections.push(`Description: ${chartConfig.description}`);
  sections.push("");

  const chartData = chartConfig.inputs.chartData;

  if ("jsonArray" in chartData && chartData.jsonArray) {
    const config = chartData.jsonDataConfig;
    const data = chartData.jsonArray;

    const seriesProp = config.seriesProp;
    const indicatorProp = config.indicatorProp;

    if (seriesProp && seriesProp !== "--v") {
      const seriesSet = new Set(
        data.map((item) => (item as Record<string, unknown>)[seriesProp])
      );
      sections.push(`Series: ${Array.from(seriesSet).join(", ")}`);
    }

    if (indicatorProp && indicatorProp !== "--v") {
      const indicatorSet = new Set(
        data.map((item) => (item as Record<string, unknown>)[indicatorProp])
      );
      const indicators = Array.from(indicatorSet);

      const labelMap = config.labelReplacementsAfterSorting || {};
      const indicatorLabels = indicators.map((ind) => labelMap[String(ind)] || String(ind));

      sections.push(`Indicators: ${indicatorLabels.join(", ")}`);
    }

    sections.push("");
    sections.push("DATA:");
    sections.push("");

    if (chartConfig.id === "safety-outcomes") {
      return formatSafetyOutcomesChart(results);
    }

    if (chartConfig.id === "safe-abortion-proportion") {
      return formatSafeAbortionProportionChart(results);
    }

    const grouped = groupDataByIndicator(data, indicatorProp, seriesProp);
    const labelMap = config.labelReplacementsAfterSorting || {};

    for (const [indicator, items] of Object.entries(grouped)) {
      const indicatorLabel = labelMap[indicator] || indicator;
      sections.push(`${indicatorLabel}:`);

      for (const item of items) {
        const seriesLabel = seriesProp
          ? labelMap[String((item as Record<string, unknown>)[seriesProp])] ||
            String((item as Record<string, unknown>)[seriesProp])
          : "";

        const values = config.valueProps
          .map((prop) => (item as Record<string, unknown>)[prop])
          .filter((v) => v !== undefined);

        const valueStr = values.map((v) => toNum0(Number(v))).join(", ");

        sections.push(`  ${leftAlign(seriesLabel, 25)} ${rightAlign(valueStr, 15)}`);
      }

      sections.push("");
    }
  }

  return sections.join("\n");
}

function formatSafetyOutcomesChart(results: Results): string {
  const sections: string[] = [];
  sections.push("CHART: safety-outcomes");
  sections.push("Description: Safety outcomes comparing safe, less safe, and least safe abortions");
  sections.push("");
  sections.push("Type: Stacked Bar Chart");
  sections.push("Series: Safe abortion, Less safe abortion, Least safe abortion");
  sections.push("");
  sections.push("DATA:");
  sections.push("");

  const allScenarios = [results.baseline, ...results.scenarios];
  const baseline = results.baseline;

  allScenarios.forEach((scenario, i) => {
    const isBaseline = scenario.id === baseline.id;
    sections.push(`${getScenarioLabel(scenario, i)}:`);

    const safe = scenario.abortionOutcomes.abortions.safe;
    const lessSafe = scenario.abortionOutcomes.abortions.lessSafe;
    const leastSafe = scenario.abortionOutcomes.abortions.leastSafe;
    const total = safe.n + lessSafe.n + leastSafe.n;

    if (isBaseline) {
      sections.push(
        `  Safe abortion:       ${rightAlign(toNum0(safe.n), 10)}  (${toPct1(safe.pAmongAbortions)})`
      );
      sections.push(
        `  Less safe abortion:  ${rightAlign(toNum0(lessSafe.n), 10)}  (${toPct1(lessSafe.pAmongAbortions)})`
      );
      sections.push(
        `  Least safe abortion: ${rightAlign(toNum0(leastSafe.n), 10)}  (${toPct1(leastSafe.pAmongAbortions)})`
      );
    } else {
      const baseSafe = baseline.abortionOutcomes.abortions.safe;
      const baseLessSafe = baseline.abortionOutcomes.abortions.lessSafe;
      const baseLeastSafe = baseline.abortionOutcomes.abortions.leastSafe;

      sections.push(
        `  Safe abortion:       ${rightAlign(toNum0(safe.n), 10)}  (${toPct1(safe.pAmongAbortions)})  [vs baseline: ${formatComparison(baseSafe.n, safe.n)} / ${formatPercentageComparison(baseSafe.pAmongAbortions, safe.pAmongAbortions)}]`
      );
      sections.push(
        `  Less safe abortion:  ${rightAlign(toNum0(lessSafe.n), 10)}  (${toPct1(lessSafe.pAmongAbortions)})  [vs baseline: ${formatComparison(baseLessSafe.n, lessSafe.n)} / ${formatPercentageComparison(baseLessSafe.pAmongAbortions, lessSafe.pAmongAbortions)}]`
      );
      sections.push(
        `  Least safe abortion: ${rightAlign(toNum0(leastSafe.n), 10)}  (${toPct1(leastSafe.pAmongAbortions)})  [vs baseline: ${formatComparison(baseLeastSafe.n, leastSafe.n)} / ${formatPercentageComparison(baseLeastSafe.pAmongAbortions, leastSafe.pAmongAbortions)}]`
      );
    }

    sections.push(`  Total abortions:     ${rightAlign(toNum0(total), 10)}`);
    sections.push("");
  });

  return sections.join("\n");
}

function formatSafeAbortionProportionChart(results: Results): string {
  const sections: string[] = [];
  sections.push("CHART: safe-abortion-proportion");
  sections.push(
    "Description: Proportion of safe abortions and improvement over baseline"
  );
  sections.push("");
  sections.push("Type: Stacked Bar Chart");
  sections.push("");
  sections.push("DATA:");
  sections.push("");

  const baseline = results.baseline;
  const baselineProportion = baseline.abortionOutcomes.abortions.safe.pAmongAbortions;

  const allScenarios = [results.baseline, ...results.scenarios];

  allScenarios.forEach((scenario, i) => {
    const isBaseline = scenario.id === baseline.id;
    const scenarioProportion = scenario.abortionOutcomes.abortions.safe.pAmongAbortions;
    const improvement = scenarioProportion - baselineProportion;

    sections.push(`${getScenarioLabel(scenario, i)}:`);
    sections.push(
      `  Safe abortion proportion:  ${toPct1(scenarioProportion)}`
    );

    if (!isBaseline) {
      const sign = improvement >= 0 ? "+" : "";
      sections.push(
        `  Baseline proportion:       ${toPct1(baselineProportion)}`
      );
      sections.push(
        `  Improvement:               ${sign}${toPct1(improvement)} (${sign}${(improvement * 100).toFixed(1)}pp)`
      );
    }

    sections.push("");
  });

  return sections.join("\n");
}

function groupDataByIndicator(
  data: unknown[],
  indicatorProp: string | "--v",
  seriesProp: string | "--v" | undefined
): Record<string, unknown[]> {
  const grouped: Record<string, unknown[]> = {};

  if (indicatorProp === "--v") {
    return { all: data };
  }

  for (const item of data) {
    const indicator = String((item as Record<string, unknown>)[indicatorProp]);
    if (!grouped[indicator]) {
      grouped[indicator] = [];
    }
    grouped[indicator].push(item);
  }

  return grouped;
}
