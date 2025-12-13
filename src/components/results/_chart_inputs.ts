import type { ChartOVInputs } from "panther";
import {
  divideOrZero,
  getCSSColor,
  sum,
  toAbbrev1,
  toNum0,
  toPct0,
} from "panther";
import {
  _FORMAL_SERVICES,
  _OUT_OF_FACILITY_SERVICES,
} from "~/config/services";
import type { Results } from "~/types/mod";
import { t, td } from "~/translate/mod";

export const _CF_GREEN = "#27AE60";
export const _CF_YELLOW = "#F2C94C";
export const _CF_RED = "#EB5757";
const _WARNING_COLOR = _CF_YELLOW;

//////////////////////////////////////////////////////////////////////
//   ______   __                              __              __    //
//  /      \ /  |                            /  |           _/  |   //
// /$$$$$$  |$$ |____    ______    ______   _$$ |_         / $$ |   //
// $$ |  $$/ $$      \  /      \  /      \ / $$   |        $$$$ |   //
// $$ |      $$$$$$$  | $$$$$$  |/$$$$$$  |$$$$$$/           $$ |   //
// $$ |   __ $$ |  $$ | /    $$ |$$ |  $$/   $$ | __         $$ |   //
// $$ \__/  |$$ |  $$ |/$$$$$$$ |$$ |        $$ |/  |       _$$ |_  //
// $$    $$/ $$ |  $$ |$$    $$ |$$ |        $$  $$/       / $$   | //
//  $$$$$$/  $$/   $$/  $$$$$$$/ $$/          $$$$/        $$$$$$/  //
//                                                                  //
//////////////////////////////////////////////////////////////////////

export function getChart1(results: Results): ChartOVInputs {
  const allScenarios = [results.baseline, ...results.scenarios];
  const scenarioLabelMap = allScenarios.reduce((acc, s, i) => {
    acc[s.id] = i === 0 ? td(s.name) : `${t("Scenario")} ${i}. ${s.name}`;
    return acc;
  }, {} as Record<string, string>);

  const jsonArray = allScenarios
    .map((scenario) => {
      return [
        {
          scenario: scenario.id,
          category: "Safe abortion",
          v: scenario.abortionOutcomes.abortions.safe.n,
        },
        {
          scenario: scenario.id,
          category: "Less safe abortion",
          v: scenario.abortionOutcomes.abortions.lessSafe.n,
        },
        {
          scenario: scenario.id,
          category: "Least safe abortion",
          v: scenario.abortionOutcomes.abortions.leastSafe.n,
        },
      ];
    })
    .flat();

  return {
    caption: t("Safe, less safe, and least safe abortions"),
    chartData: {
      jsonArray,
      jsonDataConfig: {
        seriesProp: "category",
        indicatorProp: "scenario",
        valueProps: ["v"],
        sortHeaders: false,
        labelReplacementsAfterSorting: {
          ...scenarioLabelMap,
          "Safe abortion": t("Safe abortion"),
          "Less safe abortion": t("Less safe abortion"),
          "Least safe abortion": t("Least safe abortion"),
        },
      },
    },
    style: {
      seriesColorFunc: (info) =>
        [getCSSColor("success"), _WARNING_COLOR, getCSSColor("danger")][
          info.i_series
        ],
      yScaleAxis: {
        tickLabelFormatter: toNum0,
      },
      content: {
        dataLabelFormatter: (info) => {
          const vals = info.seriesValArrays.map((s) => s.at(info.i_val) ?? 0);
          const total = sum(vals);
          return (
            toAbbrev1(info.val) +
            "\n" +
            toPct0(divideOrZero(info.val ?? 0, total))
          );
        },
      },
    },
  };
}

////////////////////////////////////////////////////////////////////////
//   ______   __                              __             ______   //
//  /      \ /  |                            /  |           /      \  //
// /$$$$$$  |$$ |____    ______    ______   _$$ |_         /$$$$$$  | //
// $$ |  $$/ $$      \  /      \  /      \ / $$   |        $$____$$ | //
// $$ |      $$$$$$$  | $$$$$$  |/$$$$$$  |$$$$$$/          /    $$/  //
// $$ |   __ $$ |  $$ | /    $$ |$$ |  $$/   $$ | __       /$$$$$$/   //
// $$ \__/  |$$ |  $$ |/$$$$$$$ |$$ |        $$ |/  |      $$ |_____  //
// $$    $$/ $$ |  $$ |$$    $$ |$$ |        $$  $$/       $$       | //
//  $$$$$$/  $$/   $$/  $$$$$$$/ $$/          $$$$/        $$$$$$$$/  //
//                                                                    //
////////////////////////////////////////////////////////////////////////

export function getChart2(results: Results): ChartOVInputs {
  const allScenarios = [results.baseline, ...results.scenarios];
  const scenarioLabelMap = allScenarios.reduce((acc, s, i) => {
    acc[s.id] = i === 0 ? td(s.name) : `${t("Scenario")} ${i}. ${s.name}`;
    return acc;
  }, {} as Record<string, string>);

  const jsonArray = allScenarios
    .map((scenario) => {
      const valS = scenario.abortionOutcomes.abortions.safe.pAmongAbortions;
      const valB =
        results.baseline.abortionOutcomes.abortions.safe.pAmongAbortions;
      if (valS < valB - 0.0001) {
        return [
          {
            scenario: scenario.id,
            category: "baseline",
            v: 0,
          },
          {
            scenario: scenario.id,
            category: "scenario",
            v: valS,
          },
        ];
      }
      return [
        {
          scenario: scenario.id,
          category: "baseline",
          v: valB,
        },
        {
          scenario: scenario.id,
          category: "scenario",
          v: valS - valB,
        },
      ];
    })
    .flat();

  return {
    caption: t("Proportion of abortions that are safe"),
    chartData: {
      jsonArray,
      jsonDataConfig: {
        indicatorProp: "scenario",
        seriesProp: "category",
        valueProps: ["v"],
        sortHeaders: false,
        labelReplacementsAfterSorting: {
          ...scenarioLabelMap,
          baseline: t("Base case proportion of abortions that are safe"),
          scenario: t("Improvement due to scenario"),
        },
      },
    },
    style: {
      surrounds: {
        padding: { top: 20 },
      },
      yScaleAxis: {
        tickLabelFormatter: toPct0,
        max: 1,
      },
      seriesColorFunc: (info) => {
        return info.i_series === 0 ? getCSSColor("neutral") : _CF_GREEN;
      },
      content: {
        dataLabelFormatter: (info) => {
          const baselinePct = info.seriesValArrays?.[0]?.[0] ?? 0;

          if (info.i_val === 0) {
            return toPct0(baselinePct);
          }

          const totalPct =
            (info.val ?? 0) +
            (info.seriesValArrays?.[info.i_series - 1]?.[info.i_val] ?? 0);

          const diff = (totalPct - baselinePct) * 100;

          const diffAbs = Math.abs(diff);

          if (diffAbs < 0.5) {
            return `${toPct0(baselinePct)} (${t("No change")})`;
          }
          return `${toPct0(baselinePct)} → ${toPct0(totalPct)}`;

          // return `${toPct0(totalPct)} (${sign}${diffAbs.toFixed(0)}pp)`;
        },
        bars: {
          stacking: "stacked",
          func: (info) => {
            const baselinePct = info.seriesValArrays?.[0]?.[0] ?? 0;

            if (info.i_val === 0) {
              return {
                fillColor: 666,
              };
            }

            const totalPct =
              (info.val ?? 0) +
              (info.seriesValArrays?.[info.i_series - 1]?.[info.i_val] ?? 0);

            const diff = (totalPct - baselinePct) * 100;

            const diffAbs = Math.abs(diff);
            if (info.seriesValArrays?.[0]?.[info.i_val] === 0) {
              return {
                fillColor: diffAbs >= 0.5 ? _CF_RED : getCSSColor("neutral"),
              };
            }
            return {
              fillColor: 666,
            };
          },
        },
      },
    },
  };
}

////////////////////////////////////////////////////////////////////////////////
//   ______   __                              __              __    _______   //
//  /      \ /  |                            /  |           _/  |  /       \  //
// /$$$$$$  |$$ |____    ______    ______   _$$ |_         / $$ |  $$$$$$$  | //
// $$ |  $$/ $$      \  /      \  /      \ / $$   |        $$$$ |  $$ |__$$ | //
// $$ |      $$$$$$$  | $$$$$$  |/$$$$$$  |$$$$$$/           $$ |  $$    $$<  //
// $$ |   __ $$ |  $$ | /    $$ |$$ |  $$/   $$ | __         $$ |  $$$$$$$  | //
// $$ \__/  |$$ |  $$ |/$$$$$$$ |$$ |        $$ |/  |       _$$ |_ $$ |__$$ | //
// $$    $$/ $$ |  $$ |$$    $$ |$$ |        $$  $$/       / $$   |$$    $$/  //
//  $$$$$$/  $$/   $$/  $$$$$$$/ $$/          $$$$/        $$$$$$/ $$$$$$$/   //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

// export function getChart1b(results: Results): ChartOVInputs {
//   const allScenarios = [results.baseline, ...results.scenarios];
//   const scenarioLabelMap = allScenarios.reduce((acc, s, i) => {
//     acc[s.id] = i === 0 ? s.name : `Scenario ${i}. ${s.name}`;
//     return acc;
//   }, {} as Record<string, string>);

//   const jsonArray = allScenarios
//     .map((scenario) => {
//       return [
//         {
//           scenario: scenario.id,
//           category: "Moderate complications",
//           v: scenario.complications.nModerateComplications,
//         },
//         {
//           scenario: scenario.id,
//           category: "Severe complications",
//           v: scenario.complications.nSevereComplications,
//         },
//         {
//           scenario: scenario.id,
//           category: "No complications",
//           v: scenario.complications.nNoComplications,
//         },
//       ];
//     })
//     .flat();

//   return {
//     chartData: {
//       jsonArray,
//       jsonDataConfig: {
//         seriesProp: "category",
//         indicatorProp: "scenario",
//         valueProps: ["v"],
//         sortHeaders: false,
//         labelReplacementsAfterSorting: scenarioLabelMap,
//       },
//     },
//     style: {
//       seriesColorFunc: (info) =>
//         [_WARNING_COLOR, getCSSColor("danger"), getCSSColor("success")][
//           info.i_series
//         ],
//       yScaleAxis: {
//         tickLabelFormatter: toNum0,
//       },
//       content: {
//         dataLabelFormatter: (info) => {
//           const vals = info.seriesValArrays.map((s) => s.at(info.i_val) ?? 0);
//           const total = sum(vals);
//           return (
//             toAbbrev1(info.val) +
//             "\n" +
//             toPct0(divideOrZero(info.val ?? 0, total))
//           );
//         },
//       },
//     },
//   };
// }

////////////////////////////////////////////////////////////////////////
//   ______   __                              __             ______   //
//  /      \ /  |                            /  |           /      \  //
// /$$$$$$  |$$ |____    ______    ______   _$$ |_         /$$$$$$  | //
// $$ |  $$/ $$      \  /      \  /      \ / $$   |        $$ ___$$ | //
// $$ |      $$$$$$$  | $$$$$$  |/$$$$$$  |$$$$$$/           /   $$<  //
// $$ |   __ $$ |  $$ | /    $$ |$$ |  $$/   $$ | __        _$$$$$  | //
// $$ \__/  |$$ |  $$ |/$$$$$$$ |$$ |        $$ |/  |      /  \__$$ | //
// $$    $$/ $$ |  $$ |$$    $$ |$$ |        $$  $$/       $$    $$/  //
//  $$$$$$/  $$/   $$/  $$$$$$$/ $$/          $$$$/         $$$$$$/   //
//                                                                    //
////////////////////////////////////////////////////////////////////////

export function getChart3(results: Results): ChartOVInputs {
  const allScenarios = [results.baseline, ...results.scenarios];
  const scenarioLabelMap = allScenarios.reduce((acc, s, i) => {
    acc[s.id] = i === 0 ? td(s.name) : `${t("Scenario")} ${i}. ${s.name}`;
    return acc;
  }, {} as Record<string, string>);

  const jsonArray = allScenarios
    .map((scenario) => {
      const valS = scenario.postAbortionCare.totals.pReceivingEffectiveCare;
      const valB =
        results.baseline.postAbortionCare.totals.pReceivingEffectiveCare;
      if (valS < valB - 0.0001) {
        return [
          {
            scenario: scenario.id,
            category: "baseline",
            v: 0,
          },
          {
            scenario: scenario.id,
            category: "scenario",
            v: valS,
          },
        ];
      }
      return [
        {
          scenario: scenario.id,
          category: "baseline",
          v: valB,
        },
        {
          scenario: scenario.id,
          category: "scenario",
          v: valS - valB,
        },
      ];
    })
    .flat();

  return {
    caption: t(
      "Proportion of women with abortion complications who receive effective care"
    ),
    chartData: {
      jsonArray,
      jsonDataConfig: {
        indicatorProp: "scenario",
        seriesProp: "category",
        valueProps: ["v"],
        sortHeaders: false,
        labelReplacementsAfterSorting: {
          ...scenarioLabelMap,
          baseline: t(
            "Base case proportion of women with abortion complications who receive effective care"
          ),
          scenario: t("Improvement due to scenario"),
        },
      },
    },
    style: {
      surrounds: {
        padding: { top: 20 },
      },
      yScaleAxis: {
        tickLabelFormatter: toPct0,
        max: 1,
      },
      seriesColorFunc: (info) => {
        return info.i_series === 0 ? getCSSColor("neutral") : _CF_GREEN;
      },
      content: {
        dataLabelFormatter: (info) => {
          const baselinePct = info.seriesValArrays?.[0]?.[0] ?? 0;

          if (info.i_val === 0) {
            return toPct0(baselinePct);
          }

          const totalPct =
            (info.val ?? 0) +
            (info.seriesValArrays?.[info.i_series - 1]?.[info.i_val] ?? 0);

          const diff = (totalPct - baselinePct) * 100;

          const diffAbs = Math.abs(diff);

          if (diffAbs < 0.5) {
            return `${toPct0(baselinePct)} (${t("No change")})`;
          }
          return `${toPct0(baselinePct)} → ${toPct0(totalPct)}`;

          // return `${toPct0(totalPct)} (${sign}${diffAbs.toFixed(0)}pp)`;
        },
        bars: {
          stacking: "stacked",
          func: (info) => {
            const baselinePct = info.seriesValArrays?.[0]?.[0] ?? 0;

            if (info.i_val === 0) {
              return {
                fillColor: 666,
              };
            }

            const totalPct =
              (info.val ?? 0) +
              (info.seriesValArrays?.[info.i_series - 1]?.[info.i_val] ?? 0);

            const diff = (totalPct - baselinePct) * 100;
            const diffAbs = Math.abs(diff);
            if (info.seriesValArrays?.[0]?.[info.i_val] === 0) {
              return {
                fillColor: diffAbs >= 0.5 ? _CF_RED : getCSSColor("neutral"),
              };
            }
            return {
              fillColor: 666,
            };
          },
        },
      },
    },
  };
}

export function getAllChartConfigs(results: Results) {
  return [
    {
      id: "safety-outcomes",
      description:
        "Safety outcomes comparing safe, less safe, and least safe abortions across scenarios",
      inputs: getChart1(results),
    },
    {
      id: "safe-abortion-proportion",
      description: "Proportion of abortions that are safe",
      inputs: getChart2(results),
    },
    {
      id: "post-abortion-care",
      description:
        "Proportion of women with abortion complications who receive effective care",
      inputs: getChart3(results),
    },
  ];
}
