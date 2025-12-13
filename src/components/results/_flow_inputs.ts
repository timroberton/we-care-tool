import type { SimpleVizInputs } from "panther";
import { toNum0, toPct0, toPct1 } from "panther";
import type { Results, ScenarioResults } from "~/types/mod";
import { FLOW_MODELS, FLOW_COLORS, type FlowModelKey } from "./_flow_models";
import { APP_COLORS } from "~/config/colors";
import { t } from "~/translate/mod";

export type BoxInfo = {
  val: number;
  secondaryText: string | string[];
  baselineColor: string;
  conditionalColor: string;
};

function formatComparison(
  baselineValue: string,
  scenarioValue: string,
  hasBaseline: boolean
): string {
  if (!hasBaseline) return scenarioValue;
  return baselineValue === scenarioValue
    ? scenarioValue
    : `${baselineValue} → ${scenarioValue}`;
}

function formatComparisonArray(
  baselineArray: string[],
  scenarioArray: string[],
  hasBaseline: boolean
): string[] {
  if (!hasBaseline) return scenarioArray;
  return scenarioArray.map((val, idx) =>
    baselineArray[idx] === val ? val : `${baselineArray[idx]} → ${val}`
  );
}

type ColorGroup =
  | "upperBoxes"
  | "miscarriageLiveBirth"
  | "noSeekNoAccess"
  | "safe"
  | "lessSafe"
  | "leastSafe";

function getColorForGroup(group: ColorGroup): string {
  switch (group) {
    case "upperBoxes":
      return FLOW_COLORS.upperBoxes;
    case "miscarriageLiveBirth":
      return "#EBD5E4";
    case "noSeekNoAccess":
      return FLOW_COLORS.noSeekNoAccess;
    case "safe":
      return FLOW_COLORS.safe;
    case "lessSafe":
      return FLOW_COLORS.lessSafe;
    case "leastSafe":
      return FLOW_COLORS.leastSafe;
  }
}

function createSimpleBoxInfo(
  val: number,
  baselineVal: number | undefined,
  colorGroup: ColorGroup,
  baseline?: ScenarioResults
): BoxInfo {
  const isBaseline = !baseline;
  return {
    val,
    secondaryText: formatComparison(
      toNum0(baselineVal ?? 0),
      toNum0(val),
      !!baseline
    ),
    baselineColor: getColorForGroup(colorGroup),
    conditionalColor: isBaseline
      ? getColorForGroup(colorGroup)
      : val !== baselineVal
      ? FLOW_COLORS.changedFromBaseline
      : "#ffffff",
  };
}

function createOutcomeBoxInfo(
  n: number,
  pAmongAbortions: number,
  baselineN: number | undefined,
  baselinePAmongAbortions: number | undefined,
  colorGroup: ColorGroup,
  baseline?: ScenarioResults
): BoxInfo {
  const isBaseline = !baseline;
  return {
    val: pAmongAbortions,
    secondaryText: formatComparisonArray(
      [toNum0(baselineN ?? 0), toPct0(baselinePAmongAbortions ?? 0)],
      [toNum0(n), toPct0(pAmongAbortions)],
      !!baseline
    ),
    baselineColor: getColorForGroup(colorGroup),
    conditionalColor: isBaseline
      ? getColorForGroup(colorGroup)
      : pAmongAbortions !== baselinePAmongAbortions
      ? FLOW_COLORS.changedFromBaseline
      : "#ffffff",
  };
}

export function getBoxInfo(
  boxId: string,
  s: ScenarioResults,
  baseline?: ScenarioResults
): BoxInfo {
  switch (boxId) {
    case "totalPregnancies":
      return createSimpleBoxInfo(
        s.familyPlanning.nPregnancies,
        baseline?.familyPlanning.nPregnancies,
        "upperBoxes",
        baseline
      );

    case "intended":
      return createSimpleBoxInfo(
        s.familyPlanning.nIntendedPregnancies,
        baseline?.familyPlanning.nIntendedPregnancies,
        "upperBoxes",
        baseline
      );

    case "unintended":
      return createSimpleBoxInfo(
        s.familyPlanning.nUnintendedPregnancies,
        baseline?.familyPlanning.nUnintendedPregnancies,
        "upperBoxes",
        baseline
      );

    case "miscarriage":
      return createSimpleBoxInfo(
        s.abortionOutcomes.miscarriages.nTotal,
        baseline?.abortionOutcomes.miscarriages.nTotal,
        "miscarriageLiveBirth",
        baseline
      );

    case "live-birth":
      return createSimpleBoxInfo(
        s.abortionOutcomes.liveBirths.nTotal,
        baseline?.abortionOutcomes.liveBirths.nTotal,
        "miscarriageLiveBirth",
        baseline
      );

    case "seek":
      return createSimpleBoxInfo(
        s.demand.nSeeksInducedAbortion,
        baseline?.demand.nSeeksInducedAbortion,
        "upperBoxes",
        baseline
      );

    case "no-seek":
      return createSimpleBoxInfo(
        s.familyPlanning.nUnintendedPregnancies -
          s.demand.nSeeksInducedAbortion +
          s.demand.nContraindicated,
        baseline
          ? baseline.familyPlanning.nUnintendedPregnancies -
              baseline.demand.nSeeksInducedAbortion +
              baseline.demand.nContraindicated
          : undefined,
        "noSeekNoAccess",
        baseline
      );

    case "access-facility":
      return createSimpleBoxInfo(
        s.access.facilitySeekers.nArrive,
        baseline?.access.facilitySeekers.nArrive,
        "upperBoxes",
        baseline
      );

    case "access-outOfFacility":
      return createSimpleBoxInfo(
        s.access.outOfFacilitySeekers.nArrive,
        baseline?.access.outOfFacilitySeekers.nArrive,
        "upperBoxes",
        baseline
      );

    case "no-access":
      return createSimpleBoxInfo(
        s.access.totals.nNoAccess,
        baseline?.access.totals.nNoAccess,
        "noSeekNoAccess",
        baseline
      );

    case "no-abortion":
      return createSimpleBoxInfo(
        s.facilityReceipt.noAbortion.n + s.outOfFacilityReceipt.noAbortion.n,
        baseline
          ? baseline.facilityReceipt.noAbortion.n +
              baseline.outOfFacilityReceipt.noAbortion.n
          : undefined,
        "noSeekNoAccess",
        baseline
      );

    case "no-access-or-abortion":
      return createSimpleBoxInfo(
        s.access.totals.nNoAccess +
          s.facilityReceipt.noAbortion.n +
          s.outOfFacilityReceipt.noAbortion.n,
        baseline
          ? baseline.access.totals.nNoAccess +
              baseline.facilityReceipt.noAbortion.n +
              baseline.outOfFacilityReceipt.noAbortion.n
          : undefined,
        "noSeekNoAccess",
        baseline
      );

    case "facility-safe":
      return createSimpleBoxInfo(
        s.facilityReceiptBySafety.safe,
        baseline?.facilityReceiptBySafety.safe,
        "safe",
        baseline
      );

    case "facility-less":
      return createSimpleBoxInfo(
        s.facilityReceiptBySafety.lessSafe,
        baseline?.facilityReceiptBySafety.lessSafe,
        "lessSafe",
        baseline
      );

    case "facility-least":
      return createSimpleBoxInfo(
        s.facilityReceiptBySafety.leastSafe,
        baseline?.facilityReceiptBySafety.leastSafe,
        "leastSafe",
        baseline
      );

    case "outOfFacility-safe":
      return createSimpleBoxInfo(
        s.outOfFacilityReceiptBySafety.safe,
        baseline?.outOfFacilityReceiptBySafety.safe,
        "safe",
        baseline
      );

    case "outOfFacility-less":
      return createSimpleBoxInfo(
        s.outOfFacilityReceiptBySafety.lessSafe,
        baseline?.outOfFacilityReceiptBySafety.lessSafe,
        "lessSafe",
        baseline
      );

    case "outOfFacility-least":
      return createSimpleBoxInfo(
        s.outOfFacilityReceiptBySafety.leastSafe,
        baseline?.outOfFacilityReceiptBySafety.leastSafe,
        "leastSafe",
        baseline
      );

    case "outcome-safe":
      return createOutcomeBoxInfo(
        s.abortionOutcomes.abortions.safe.n,
        s.abortionOutcomes.abortions.safe.pAmongAbortions,
        baseline?.abortionOutcomes.abortions.safe.n,
        baseline?.abortionOutcomes.abortions.safe.pAmongAbortions,
        "safe",
        baseline
      );

    case "outcome-less":
      return createOutcomeBoxInfo(
        s.abortionOutcomes.abortions.lessSafe.n,
        s.abortionOutcomes.abortions.lessSafe.pAmongAbortions,
        baseline?.abortionOutcomes.abortions.lessSafe.n,
        baseline?.abortionOutcomes.abortions.lessSafe.pAmongAbortions,
        "lessSafe",
        baseline
      );

    case "outcome-least":
      return createOutcomeBoxInfo(
        s.abortionOutcomes.abortions.leastSafe.n,
        s.abortionOutcomes.abortions.leastSafe.pAmongAbortions,
        baseline?.abortionOutcomes.abortions.leastSafe.n,
        baseline?.abortionOutcomes.abortions.leastSafe.pAmongAbortions,
        "leastSafe",
        baseline
      );

    case "complications":
      return createSimpleBoxInfo(
        s.complications.nTotalComplications,
        baseline?.complications.nTotalComplications,
        "miscarriageLiveBirth",
        baseline
      );
    case "complications-moderate":
      return createSimpleBoxInfo(
        s.complications.nModerateComplications,
        baseline?.complications.nModerateComplications,
        "miscarriageLiveBirth",
        baseline
      );
    case "complications-severe":
      return createSimpleBoxInfo(
        s.complications.nSevereComplications,
        baseline?.complications.nSevereComplications,
        "miscarriageLiveBirth",
        baseline
      );

    case "returning":
      return createSimpleBoxInfo(
        s.postAbortionCare.nReturningToAStateOfNonPregnancy,
        baseline?.postAbortionCare.nReturningToAStateOfNonPregnancy,
        "safe",
        baseline
      );

    case "pa-care":
      return createOutcomeBoxInfo(
        s.postAbortionCare.totals.nReceivingEffectiveCare,
        s.postAbortionCare.totals.pReceivingEffectiveCare,
        baseline?.postAbortionCare.totals.nReceivingEffectiveCare,
        baseline?.postAbortionCare.totals.pReceivingEffectiveCare,
        "safe",
        baseline
      );

    case "pa-no-care":
      return createOutcomeBoxInfo(
        s.postAbortionCare.totals.nNotReceivingEffectiveCare,
        s.postAbortionCare.totals.pNotReceivingEffectiveCare,
        baseline?.postAbortionCare.totals.nNotReceivingEffectiveCare,
        baseline?.postAbortionCare.totals.pNotReceivingEffectiveCare,
        "leastSafe",
        baseline
      );

    default:
      return {
        val: 0,
        secondaryText: "0",
        baselineColor: FLOW_COLORS.default,
        conditionalColor: FLOW_COLORS.default,
      };
  }
}

export function getFlowInputs(
  results: Results,
  selectedScenarioIndex: number,
  selectedFlowModel: FlowModelKey
): SimpleVizInputs {
  const index = selectedScenarioIndex;
  let s = index === -1 ? results.baseline : results.scenarios[index];

  if (!s) {
    console.warn(
      "Scenario not found at index",
      index,
      "- falling back to baseline"
    );
    s = results.baseline;
  }

  const isBaseline = index === -1 || !results.scenarios[index];
  const baseline = results.baseline;

  return {
    simpleVizData: FLOW_MODELS[selectedFlowModel](
      s,
      isBaseline ? undefined : baseline
    ),
    legendItemsOrLabels: isBaseline
      ? undefined
      : [
          {
            color: APP_COLORS.utility.lightBlue,
            label: t("Change from the base case"),
          },
        ],
    style: {
      scale: 0.8,
      simpleviz: {
        layerGap: 140,
        orderGap: 20,
        layerAlign: "center",
        boxes: {
          padding: [10, 20],
          arrowEndPoint: "top-center",
          arrowStartPoint: "bottom-center",
          strokeWidth: 2,
          strokeColor: { key: "baseContent" },
        },
        arrows: {
          truncateStart: 10,
          truncateEnd: 20,
          strokeWidth: 2,
          strokeColor: { key: "baseContent" },
        },
      },
      surrounds: {
        legendGap: 50,
        legendPosition: "bottom-left",
        padding: 20,
      },
      text: {
        simplevizBoxTextPrimary: {
          font: {
            weight: 700,
            fontFamily: "Roboto",
            italic: false,
          },
          relFontSize: 1,
          color: FLOW_COLORS.text.primary,
        },
        simplevizBoxTextSecondary: {
          relFontSize: isBaseline ? 0.9 : 0.8,
          color: FLOW_COLORS.text.secondary,
          lineBreakGap: 0.4,
        },
      },
    },
  };
}
