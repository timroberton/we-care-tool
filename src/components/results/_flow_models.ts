import type { SimpleVizInputs } from "panther";
import type { ScenarioResults } from "~/types/mod";
import { _CF_GREEN, _CF_RED, _CF_YELLOW } from "./_chart_inputs";
import { getBoxInfo } from "./_flow_inputs";
import { t } from "~/translate/mod";

export type FlowModelKey = "standard" | "summary" | "full-detail";

export const FLOW_COLOR_PALETTES = {
  bright: {
    upperBoxes: "#ffffff",
    noSeekNoAccess: "#ebebec",
    safe: _CF_GREEN,
    lessSafe: _CF_YELLOW,
    leastSafe: _CF_RED,
    default: "#ebebec",
    changedFromBaseline: "#D0E8FF",
    text: {
      primary: "#000000",
      secondary: "#000000",
    },
  },
  current: {
    upperBoxes: "#ffffff",
    noSeekNoAccess: "#ebebec",
    safe: "#e8f5ec",
    lessSafe: "#fff5e6",
    leastSafe: "#fdeaea",
    default: "#ebebec",
    changedFromBaseline: "#D0E8FF",
    text: {
      primary: "#000000",
      secondary: "#000000",
    },
  },
  softPastel: {
    upperBoxes: "#ffffff",
    noSeekNoAccess: "#E8E8E8",
    safe: "#A8E6A8",
    lessSafe: "#FFCE7D",
    leastSafe: "#FFA8A0",
    default: "#F5F5F5",
    changedFromBaseline: "#D0E8FF",
    text: {
      primary: "#2C3E50",
      secondary: "#2C3E50",
    },
  },
  warmPastel: {
    upperBoxes: "#FFE5D9",
    noSeekNoAccess: "#E8E8E8",
    safe: "#A8E6CF",
    lessSafe: "#FFD3B6",
    leastSafe: "#FFAAA5",
    default: "#F5F5F5",
    changedFromBaseline: "#D0E8FF",
    text: {
      primary: "#37474F",
      secondary: "#37474F",
    },
  },
  coolMuted: {
    upperBoxes: "#D1E8E2",
    noSeekNoAccess: "#E8E8E8",
    safe: "#9FD7C7",
    lessSafe: "#FFD89B",
    leastSafe: "#F5A593",
    default: "#F5F5F5",
    changedFromBaseline: "#D0E8FF",
    text: {
      primary: "#2C3E50",
      secondary: "#2C3E50",
    },
  },
} as const;

export const FLOW_COLORS = FLOW_COLOR_PALETTES.current;

export function getFlowModelOptions(): { value: FlowModelKey; label: string }[] {
  return [
    { value: "standard", label: t("Standard") },
    { value: "summary", label: t("Summary") },
    { value: "full-detail", label: t("Full detail") },
  ];
}

type FlowModelGenerator = (
  s: ScenarioResults,
  baseline?: ScenarioResults
) => SimpleVizInputs["simpleVizData"];

export const FLOW_MODELS: Record<FlowModelKey, FlowModelGenerator> = {
  standard: (s, baseline) => {
    const unintendedInfo = getBoxInfo("unintended", s, baseline);
    const seekInfo = getBoxInfo("seek", s, baseline);
    const noSeekInfo = getBoxInfo("no-seek", s, baseline);
    const accessFacilityInfo = getBoxInfo("access-facility", s, baseline);
    const accessOutOfFacilityInfo = getBoxInfo(
      "access-outOfFacility",
      s,
      baseline
    );
    const noAccessInfo = getBoxInfo("no-access", s, baseline);
    const facilitySafeInfo = getBoxInfo("facility-safe", s, baseline);
    const facilityLessInfo = getBoxInfo("facility-less", s, baseline);
    const facilityLeastInfo = getBoxInfo("facility-least", s, baseline);
    const outOfFacilitySafeInfo = getBoxInfo("outOfFacility-safe", s, baseline);
    const outOfFacilityLessInfo = getBoxInfo("outOfFacility-less", s, baseline);
    const outOfFacilityLeastInfo = getBoxInfo(
      "outOfFacility-least",
      s,
      baseline
    );
    const noAbortionBox = getBoxInfo("no-abortion", s, baseline);
    const outcomeSafeInfo = getBoxInfo("outcome-safe", s, baseline);
    const outcomeLessInfo = getBoxInfo("outcome-less", s, baseline);
    const outcomeLeastInfo = getBoxInfo("outcome-least", s, baseline);

    const complications = getBoxInfo("complications", s, baseline);
    const returning = getBoxInfo("returning", s, baseline);
    const paCare = getBoxInfo("pa-care", s, baseline);
    const paNoCare = getBoxInfo("pa-no-care", s, baseline);

    return {
      layerPlacementOrder: [
        [3, 2, 4],
        [1, 0],
        [5, 6],
      ],
      boxes: [
        {
          id: "unintended",
          layer: 0,
          order: 0,
          text: t("Unintended pregnancies"),
          secondaryText: unintendedInfo.secondaryText,
          fillColor: unintendedInfo.conditionalColor,
        },
        {
          id: "seek",
          layer: 1,
          order: 0,
          text: t("Seek an induced abortion"),
          secondaryText: seekInfo.secondaryText,
          fillColor: seekInfo.conditionalColor,
        },
        {
          id: "no-seek",
          layer: 1,
          order: 1,
          text: t("Do not seek an abortion"),
          secondaryText: noSeekInfo.secondaryText,
          fillColor: noSeekInfo.conditionalColor,
          leftOffset: 50,
        },
        {
          id: "access-facility",
          layer: 2,
          order: 0,
          text: t("Abortion initiated in a facility"),
          secondaryText: accessFacilityInfo.secondaryText,
          fillColor: accessFacilityInfo.conditionalColor,
        },
        {
          id: "access-outOfFacility",
          layer: 2,
          order: 1,
          text: t("Abortion initiated out of a facility"),
          secondaryText: accessOutOfFacilityInfo.secondaryText,
          fillColor: accessOutOfFacilityInfo.conditionalColor,
        },
        {
          id: "no-access",
          layer: 2,
          order: 2,
          text: t("No access"),
          leftOffset: 100,
          secondaryText: noAccessInfo.secondaryText,
          fillColor: noAccessInfo.conditionalColor,
        },
        {
          id: "facility-safe",
          layer: 3,
          order: 0,
          text: t("Safe"),
          secondaryText: facilitySafeInfo.secondaryText,
          fillColor: facilitySafeInfo.conditionalColor,
        },
        {
          id: "facility-less",
          layer: 3,
          order: 1,
          text: t("Less safe"),
          secondaryText: facilityLessInfo.secondaryText,
          fillColor: facilityLessInfo.conditionalColor,
        },
        {
          id: "facility-least",
          layer: 3,
          order: 2,
          text: t("Least safe"),
          secondaryText: facilityLeastInfo.secondaryText,
          fillColor: facilityLeastInfo.conditionalColor,
        },
        {
          id: "outOfFacility-safe",
          layer: 3,
          order: 3,
          text: t("Safe"),
          secondaryText: outOfFacilitySafeInfo.secondaryText,
          fillColor: outOfFacilitySafeInfo.conditionalColor,
          leftOffset: 20,
        },
        {
          id: "outOfFacility-less",
          layer: 3,
          order: 4,
          text: t("Less safe"),
          secondaryText: outOfFacilityLessInfo.secondaryText,
          fillColor: outOfFacilityLessInfo.conditionalColor,
        },
        {
          id: "outOfFacility-least",
          layer: 3,
          order: 5,
          text: t("Least safe"),
          secondaryText: outOfFacilityLeastInfo.secondaryText,
          fillColor: outOfFacilityLeastInfo.conditionalColor,
        },
        {
          id: "no-abortion",
          layer: 3,
          order: 6,
          text: t("No abortion"),
          secondaryText: noAbortionBox.secondaryText,
          leftOffset: 20,
          fillColor: noAbortionBox.conditionalColor,
        },
        {
          id: "outcome-safe",
          layer: 4,
          order: 0,
          text: t("Safe abortion"),
          secondaryText: outcomeSafeInfo.secondaryText,
          fillColor: outcomeSafeInfo.conditionalColor,
          arrowEndPoint: "top-center",
        },
        {
          id: "outcome-less",
          layer: 4,
          order: 0,
          text: t("Less safe abortion"),
          secondaryText: outcomeLessInfo.secondaryText,
          fillColor: outcomeLessInfo.conditionalColor,
          arrowEndPoint: "top-center",
        },
        {
          id: "outcome-least",
          layer: 4,
          order: 0,
          text: t("Least safe abortion"),
          secondaryText: outcomeLeastInfo.secondaryText,
          fillColor: outcomeLeastInfo.conditionalColor,
          arrowEndPoint: "top-center",
        },
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //  _______                        __                      __                              __      __                      //
        // /       \                      /  |                    /  |                            /  |    /  |                     //
        // $$$$$$$  | ______    _______  _$$ |_           ______  $$ |____    ______    ______   _$$ |_   $$/   ______   _______   //
        // $$ |__$$ |/      \  /       |/ $$   |  ______ /      \ $$      \  /      \  /      \ / $$   |  /  | /      \ /       \  //
        // $$    $$//$$$$$$  |/$$$$$$$/ $$$$$$/  /      |$$$$$$  |$$$$$$$  |/$$$$$$  |/$$$$$$  |$$$$$$/   $$ |/$$$$$$  |$$$$$$$  | //
        // $$$$$$$/ $$ |  $$ |$$      \   $$ | __$$$$$$/ /    $$ |$$ |  $$ |$$ |  $$ |$$ |  $$/   $$ | __ $$ |$$ |  $$ |$$ |  $$ | //
        // $$ |     $$ \__$$ | $$$$$$  |  $$ |/  |      /$$$$$$$ |$$ |__$$ |$$ \__$$ |$$ |        $$ |/  |$$ |$$ \__$$ |$$ |  $$ | //
        // $$ |     $$    $$/ /     $$/   $$  $$/       $$    $$ |$$    $$/ $$    $$/ $$ |        $$  $$/ $$ |$$    $$/ $$ |  $$ | //
        // $$/       $$$$$$/  $$$$$$$/     $$$$/         $$$$$$$/ $$$$$$$/   $$$$$$/  $$/          $$$$/  $$/  $$$$$$/  $$/   $$/  //
        //                                                                                                                         //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        {
          id: "complications",
          layer: 5,
          order: 0,
          text: t("Abortion complication"),
          secondaryText: complications.secondaryText,
          fillColor: complications.conditionalColor,
          // arrowEndPoint: "top-center",
        },
        {
          id: "returning",
          layer: 5,
          order: 1,
          text: t("Return to a state of non-pregnancy"),
          secondaryText: returning.secondaryText,
          fillColor: returning.conditionalColor,
          // arrowEndPoint: "top-center",
          leftOffset: 150,
        },
        {
          id: "pa-care",
          layer: 6,
          order: 0,
          text: t("Effective post-abortion care"),
          secondaryText: paCare.secondaryText,
          fillColor: paCare.conditionalColor,
          // arrowEndPoint: "top-center",
        },
        {
          id: "pa-no-care",
          layer: 6,
          order: 0,
          text: t("No care or ineffective care"),
          secondaryText: paNoCare.secondaryText,
          fillColor: paNoCare.conditionalColor,
          // arrowEndPoint: "top-center",
        },
      ],
      arrows: [
        {
          type: "box-ids",
          id: "a1",
          fromBoxID: "unintended",
          toBoxID: "seek",
        },
        {
          type: "box-ids",
          id: "a2",
          fromBoxID: "unintended",
          toBoxID: "no-seek",
        },
        {
          type: "box-ids",
          id: "a3",
          fromBoxID: "seek",
          toBoxID: "access-facility",
        },
        {
          type: "box-ids",
          id: "a4",
          fromBoxID: "seek",
          toBoxID: "access-outOfFacility",
        },
        {
          type: "box-ids",
          id: "a5",
          fromBoxID: "seek",
          toBoxID: "no-access",
          ignoreDuringPlacement: true,
        },
        {
          type: "box-ids",
          id: "a6",
          fromBoxID: "access-facility",
          toBoxID: "facility-safe",
        },
        {
          type: "box-ids",
          id: "a7",
          fromBoxID: "access-facility",
          toBoxID: "facility-less",
        },
        {
          type: "box-ids",
          id: "a8",
          fromBoxID: "access-facility",
          toBoxID: "facility-least",
        },
        {
          type: "box-ids",
          id: "a9",
          fromBoxID: "access-outOfFacility",
          toBoxID: "outOfFacility-safe",
        },
        {
          type: "box-ids",
          id: "a10",
          fromBoxID: "access-outOfFacility",
          toBoxID: "outOfFacility-less",
        },
        {
          type: "box-ids",
          id: "a11",
          fromBoxID: "access-outOfFacility",
          toBoxID: "outOfFacility-least",
        },
        {
          type: "box-ids",
          id: "a2216",
          fromBoxID: "access-facility",
          toBoxID: "no-abortion",
          ignoreDuringPlacement: true,
        },
        {
          type: "box-ids",
          id: "a2217",
          fromBoxID: "access-outOfFacility",
          toBoxID: "no-abortion",
          ignoreDuringPlacement: true,
        },
        {
          type: "box-ids",
          id: "a12",
          fromBoxID: "facility-safe",
          toBoxID: "outcome-safe",
        },
        {
          type: "box-ids",
          id: "a13",
          fromBoxID: "outOfFacility-safe",
          toBoxID: "outcome-safe",
        },
        {
          type: "box-ids",
          id: "a14",
          fromBoxID: "facility-less",
          toBoxID: "outcome-less",
        },
        {
          type: "box-ids",
          id: "a15",
          fromBoxID: "outOfFacility-less",
          toBoxID: "outcome-less",
        },
        {
          type: "box-ids",
          id: "a16",
          fromBoxID: "facility-least",
          toBoxID: "outcome-least",
        },
        {
          type: "box-ids",
          id: "a17",
          fromBoxID: "outOfFacility-least",
          toBoxID: "outcome-least",
        },
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //  _______                        __                      __                              __      __                      //
        // /       \                      /  |                    /  |                            /  |    /  |                     //
        // $$$$$$$  | ______    _______  _$$ |_           ______  $$ |____    ______    ______   _$$ |_   $$/   ______   _______   //
        // $$ |__$$ |/      \  /       |/ $$   |  ______ /      \ $$      \  /      \  /      \ / $$   |  /  | /      \ /       \  //
        // $$    $$//$$$$$$  |/$$$$$$$/ $$$$$$/  /      |$$$$$$  |$$$$$$$  |/$$$$$$  |/$$$$$$  |$$$$$$/   $$ |/$$$$$$  |$$$$$$$  | //
        // $$$$$$$/ $$ |  $$ |$$      \   $$ | __$$$$$$/ /    $$ |$$ |  $$ |$$ |  $$ |$$ |  $$/   $$ | __ $$ |$$ |  $$ |$$ |  $$ | //
        // $$ |     $$ \__$$ | $$$$$$  |  $$ |/  |      /$$$$$$$ |$$ |__$$ |$$ \__$$ |$$ |        $$ |/  |$$ |$$ \__$$ |$$ |  $$ | //
        // $$ |     $$    $$/ /     $$/   $$  $$/       $$    $$ |$$    $$/ $$    $$/ $$ |        $$  $$/ $$ |$$    $$/ $$ |  $$ | //
        // $$/       $$$$$$/  $$$$$$$/     $$$$/         $$$$$$$/ $$$$$$$/   $$$$$$/  $$/          $$$$/  $$/  $$$$$$/  $$/   $$/  //
        //                                                                                                                         //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        {
          type: "box-ids",
          id: "pa01",
          fromBoxID: "outcome-safe",
          toBoxID: "complications",
        },
        {
          type: "box-ids",
          id: "pa02",
          fromBoxID: "outcome-less",
          toBoxID: "complications",
        },
        {
          type: "box-ids",
          id: "pa03",
          fromBoxID: "outcome-least",
          toBoxID: "complications",
        },
        {
          type: "box-ids",
          id: "pa11",
          fromBoxID: "outcome-safe",
          toBoxID: "returning",
        },
        {
          type: "box-ids",
          id: "pa12",
          fromBoxID: "outcome-less",
          toBoxID: "returning",
        },
        {
          type: "box-ids",
          id: "pa13",
          fromBoxID: "outcome-least",
          toBoxID: "returning",
        },
        {
          type: "box-ids",
          id: "pa21",
          fromBoxID: "complications",
          toBoxID: "pa-care",
        },
        {
          type: "box-ids",
          id: "pa22",
          fromBoxID: "complications",
          toBoxID: "pa-no-care",
        },
      ],
    };
  },
  // medium: (s, baseline) => {
  //   const unintendedInfo = getBoxInfo("unintended", s, baseline);
  //   const seekInfo = getBoxInfo("seek", s, baseline);
  //   const noSeekInfo = getBoxInfo("no-seek", s, baseline);
  //   const accessFacilityInfo = getBoxInfo("access-facility", s, baseline);
  //   const accessOutOfFacilityInfo = getBoxInfo(
  //     "access-outOfFacility",
  //     s,
  //     baseline
  //   );
  //   const noAccessInfo = getBoxInfo("no-access", s, baseline);
  //   const outcomeSafeInfo = getBoxInfo("outcome-safe", s, baseline);
  //   const outcomeLessInfo = getBoxInfo("outcome-less", s, baseline);
  //   const outcomeLeastInfo = getBoxInfo("outcome-least", s, baseline);
  //   const noAbortionBox = getBoxInfo("no-abortion", s, baseline);

  //   return {
  //     layerPlacementOrder: [
  //       [3, 2],
  //       [1, 0],
  //     ],
  //     boxes: [
  //       {
  //         id: "unintended",
  //         layer: 0,
  //         order: 0,
  //         text: "Unintended pregnancies",
  //         secondaryText: unintendedInfo.secondaryText,
  //         fillColor: unintendedInfo.conditionalColor,
  //       },
  //       {
  //         id: "seek",
  //         layer: 1,
  //         order: 0,
  //         text: "Seek an induced abortion",
  //         secondaryText: seekInfo.secondaryText,
  //         fillColor: seekInfo.conditionalColor,
  //       },
  //       {
  //         id: "no-seek",
  //         layer: 1,
  //         order: 1,
  //         text: "Do not seek an abortion",
  //         secondaryText: noSeekInfo.secondaryText,
  //         fillColor: noSeekInfo.conditionalColor,
  //         leftOffset: 50,
  //       },
  //       {
  //         id: "access-facility",
  //         layer: 2,
  //         order: 0,
  //         text: "Abortion initiated in a facility",
  //         secondaryText: accessFacilityInfo.secondaryText,
  //         fillColor: accessFacilityInfo.conditionalColor,
  //       },
  //       {
  //         id: "access-outOfFacility",
  //         layer: 2,
  //         order: 0,
  //         text: "Abortion initiated out of a facility",
  //         secondaryText: accessOutOfFacilityInfo.secondaryText,
  //         fillColor: accessOutOfFacilityInfo.conditionalColor,
  //       },
  //       {
  //         id: "no-access",
  //         layer: 2,
  //         order: 2,
  //         text: "No access",
  //         leftOffset: 100,
  //         secondaryText: noAccessInfo.secondaryText,
  //         fillColor: noAccessInfo.conditionalColor,
  //       },
  //       {
  //         id: "outcome-safe",
  //         layer: 3,
  //         order: 0,
  //         text: "Safe abortion",
  //         secondaryText: outcomeSafeInfo.secondaryText,
  //         fillColor: outcomeSafeInfo.conditionalColor,
  //       },
  //       {
  //         id: "outcome-less",
  //         layer: 3,
  //         order: 1,
  //         text: "Less safe abortion",
  //         secondaryText: outcomeLessInfo.secondaryText,
  //         fillColor: outcomeLessInfo.conditionalColor,
  //       },
  //       {
  //         id: "outcome-least",
  //         layer: 3,
  //         order: 2,
  //         text: "Least safe abortion",
  //         secondaryText: outcomeLeastInfo.secondaryText,
  //         fillColor: outcomeLeastInfo.conditionalColor,
  //       },
  //       {
  //         id: "no-abortion",
  //         layer: 3,
  //         order: 3,
  //         text: "No abortion",
  //         secondaryText: noAbortionBox.secondaryText,
  //         fillColor: noAbortionBox.conditionalColor,
  //         leftOffset: 50,
  //       },
  //     ],
  //     arrows: [
  //       {
  //         type: "box-ids",
  //         id: "a1",
  //         fromBoxID: "unintended",
  //         toBoxID: "seek",
  //       },
  //       {
  //         type: "box-ids",
  //         id: "a2",
  //         fromBoxID: "unintended",
  //         toBoxID: "no-seek",
  //       },
  //       {
  //         type: "box-ids",
  //         id: "a3",
  //         fromBoxID: "seek",
  //         toBoxID: "access-facility",
  //       },
  //       {
  //         type: "box-ids",
  //         id: "a4",
  //         fromBoxID: "seek",
  //         toBoxID: "access-outOfFacility",
  //       },
  //       {
  //         type: "box-ids",
  //         id: "a5",
  //         fromBoxID: "seek",
  //         toBoxID: "no-access",
  //         ignoreDuringPlacement: true,
  //       },
  //       {
  //         type: "box-ids",
  //         id: "a6",
  //         fromBoxID: "access-facility",
  //         toBoxID: "outcome-safe",
  //       },
  //       {
  //         type: "box-ids",
  //         id: "a7",
  //         fromBoxID: "access-facility",
  //         toBoxID: "outcome-less",
  //       },
  //       {
  //         type: "box-ids",
  //         id: "a8",
  //         fromBoxID: "access-facility",
  //         toBoxID: "outcome-least",
  //       },
  //       {
  //         type: "box-ids",
  //         id: "a9",
  //         fromBoxID: "access-outOfFacility",
  //         toBoxID: "outcome-safe",
  //       },
  //       {
  //         type: "box-ids",
  //         id: "a10",
  //         fromBoxID: "access-outOfFacility",
  //         toBoxID: "outcome-less",
  //       },
  //       {
  //         type: "box-ids",
  //         id: "a11",
  //         fromBoxID: "access-outOfFacility",
  //         toBoxID: "outcome-least",
  //       },
  //       {
  //         type: "box-ids",
  //         id: "a2216",
  //         fromBoxID: "access-facility",
  //         toBoxID: "no-abortion",
  //         ignoreDuringPlacement: true,
  //       },
  //       {
  //         type: "box-ids",
  //         id: "a2217",
  //         fromBoxID: "access-outOfFacility",
  //         toBoxID: "no-abortion",
  //         ignoreDuringPlacement: true,
  //       },
  //       {
  //         type: "box-ids",
  //         id: "a18a",
  //         fromBoxID: "no-access",
  //         toBoxID: "no-abortion",
  //       },
  //     ],
  //   };
  // },
  summary: (s, baseline) => {
    const unintendedInfo = getBoxInfo("unintended", s, baseline);
    const seekInfo = getBoxInfo("seek", s, baseline);
    const noSeekInfo = getBoxInfo("no-seek", s, baseline);
    const outcomeSafeInfo = getBoxInfo("outcome-safe", s, baseline);
    const outcomeLessInfo = getBoxInfo("outcome-less", s, baseline);
    const outcomeLeastInfo = getBoxInfo("outcome-least", s, baseline);
    const noAccessOrAbortionBox = getBoxInfo(
      "no-access-or-abortion",
      s,
      baseline
    );

    const complications = getBoxInfo("complications", s, baseline);
    const returning = getBoxInfo("returning", s, baseline);
    const paCare = getBoxInfo("pa-care", s, baseline);
    const paNoCare = getBoxInfo("pa-no-care", s, baseline);

    return {
      layerPlacementOrder: [[2], [1, 0], [3, 4]],
      boxes: [
        {
          id: "unintended",
          layer: 0,
          order: 0,
          text: t("Unintended pregnancies"),
          secondaryText: unintendedInfo.secondaryText,
          fillColor: unintendedInfo.conditionalColor,
        },
        {
          id: "seek",
          layer: 1,
          order: 0,
          text: t("Seek an induced abortion"),
          secondaryText: seekInfo.secondaryText,
          fillColor: seekInfo.conditionalColor,
        },
        {
          id: "no-seek",
          layer: 1,
          order: 1,
          text: t("Do not seek an abortion"),
          secondaryText: noSeekInfo.secondaryText,
          fillColor: noSeekInfo.conditionalColor,
          leftOffset: 50,
        },
        {
          id: "outcome-safe",
          layer: 2,
          order: 0,
          text: t("Safe abortion"),
          secondaryText: outcomeSafeInfo.secondaryText,
          fillColor: outcomeSafeInfo.conditionalColor,
        },
        {
          id: "outcome-less",
          layer: 2,
          order: 1,
          text: t("Less safe abortion"),
          secondaryText: outcomeLessInfo.secondaryText,
          fillColor: outcomeLessInfo.conditionalColor,
        },
        {
          id: "outcome-least",
          layer: 2,
          order: 2,
          text: t("Least safe abortion"),
          secondaryText: outcomeLeastInfo.secondaryText,
          fillColor: outcomeLeastInfo.conditionalColor,
        },
        {
          id: "no-access-or-abortion",
          layer: 2,
          order: 3,
          text: t("No access or abortion"),
          secondaryText: noAccessOrAbortionBox.secondaryText,
          fillColor: noAccessOrAbortionBox.conditionalColor,
          leftOffset: 50,
        },
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //  _______                        __                      __                              __      __                      //
        // /       \                      /  |                    /  |                            /  |    /  |                     //
        // $$$$$$$  | ______    _______  _$$ |_           ______  $$ |____    ______    ______   _$$ |_   $$/   ______   _______   //
        // $$ |__$$ |/      \  /       |/ $$   |  ______ /      \ $$      \  /      \  /      \ / $$   |  /  | /      \ /       \  //
        // $$    $$//$$$$$$  |/$$$$$$$/ $$$$$$/  /      |$$$$$$  |$$$$$$$  |/$$$$$$  |/$$$$$$  |$$$$$$/   $$ |/$$$$$$  |$$$$$$$  | //
        // $$$$$$$/ $$ |  $$ |$$      \   $$ | __$$$$$$/ /    $$ |$$ |  $$ |$$ |  $$ |$$ |  $$/   $$ | __ $$ |$$ |  $$ |$$ |  $$ | //
        // $$ |     $$ \__$$ | $$$$$$  |  $$ |/  |      /$$$$$$$ |$$ |__$$ |$$ \__$$ |$$ |        $$ |/  |$$ |$$ \__$$ |$$ |  $$ | //
        // $$ |     $$    $$/ /     $$/   $$  $$/       $$    $$ |$$    $$/ $$    $$/ $$ |        $$  $$/ $$ |$$    $$/ $$ |  $$ | //
        // $$/       $$$$$$/  $$$$$$$/     $$$$/         $$$$$$$/ $$$$$$$/   $$$$$$/  $$/          $$$$/  $$/  $$$$$$/  $$/   $$/  //
        //                                                                                                                         //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        {
          id: "complications",
          layer: 3,
          order: 0,
          text: t("Abortion complication"),
          secondaryText: complications.secondaryText,
          fillColor: complications.conditionalColor,
          // arrowEndPoint: "top-center",
        },
        {
          id: "returning",
          layer: 3,
          order: 1,
          text: t("Return to a state of non-pregnancy"),
          secondaryText: returning.secondaryText,
          fillColor: returning.conditionalColor,
          // arrowEndPoint: "top-center",
          leftOffset: 150,
        },
        {
          id: "pa-care",
          layer: 4,
          order: 0,
          text: t("Effective post-abortion care"),
          secondaryText: paCare.secondaryText,
          fillColor: paCare.conditionalColor,
          // arrowEndPoint: "top-center",
        },
        {
          id: "pa-no-care",
          layer: 4,
          order: 0,
          text: t("No care or ineffective care"),
          secondaryText: paNoCare.secondaryText,
          fillColor: paNoCare.conditionalColor,
          // arrowEndPoint: "top-center",
        },
      ],
      arrows: [
        {
          type: "box-ids",
          id: "a1",
          fromBoxID: "unintended",
          toBoxID: "seek",
        },
        {
          type: "box-ids",
          id: "a2",
          fromBoxID: "unintended",
          toBoxID: "no-seek",
        },
        {
          type: "box-ids",
          id: "a3",
          fromBoxID: "seek",
          toBoxID: "outcome-safe",
        },
        {
          type: "box-ids",
          id: "a4",
          fromBoxID: "seek",
          toBoxID: "outcome-less",
        },
        {
          type: "box-ids",
          id: "a5",
          fromBoxID: "seek",
          toBoxID: "outcome-least",
        },
        {
          type: "box-ids",
          id: "a6",
          fromBoxID: "seek",
          toBoxID: "no-access-or-abortion",
          ignoreDuringPlacement: true,
        },
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //  _______                        __                      __                              __      __                      //
        // /       \                      /  |                    /  |                            /  |    /  |                     //
        // $$$$$$$  | ______    _______  _$$ |_           ______  $$ |____    ______    ______   _$$ |_   $$/   ______   _______   //
        // $$ |__$$ |/      \  /       |/ $$   |  ______ /      \ $$      \  /      \  /      \ / $$   |  /  | /      \ /       \  //
        // $$    $$//$$$$$$  |/$$$$$$$/ $$$$$$/  /      |$$$$$$  |$$$$$$$  |/$$$$$$  |/$$$$$$  |$$$$$$/   $$ |/$$$$$$  |$$$$$$$  | //
        // $$$$$$$/ $$ |  $$ |$$      \   $$ | __$$$$$$/ /    $$ |$$ |  $$ |$$ |  $$ |$$ |  $$/   $$ | __ $$ |$$ |  $$ |$$ |  $$ | //
        // $$ |     $$ \__$$ | $$$$$$  |  $$ |/  |      /$$$$$$$ |$$ |__$$ |$$ \__$$ |$$ |        $$ |/  |$$ |$$ \__$$ |$$ |  $$ | //
        // $$ |     $$    $$/ /     $$/   $$  $$/       $$    $$ |$$    $$/ $$    $$/ $$ |        $$  $$/ $$ |$$    $$/ $$ |  $$ | //
        // $$/       $$$$$$/  $$$$$$$/     $$$$/         $$$$$$$/ $$$$$$$/   $$$$$$/  $$/          $$$$/  $$/  $$$$$$/  $$/   $$/  //
        //                                                                                                                         //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        {
          type: "box-ids",
          id: "pa01",
          fromBoxID: "outcome-safe",
          toBoxID: "complications",
        },
        {
          type: "box-ids",
          id: "pa02",
          fromBoxID: "outcome-less",
          toBoxID: "complications",
        },
        {
          type: "box-ids",
          id: "pa03",
          fromBoxID: "outcome-least",
          toBoxID: "complications",
        },
        {
          type: "box-ids",
          id: "pa11",
          fromBoxID: "outcome-safe",
          toBoxID: "returning",
        },
        {
          type: "box-ids",
          id: "pa12",
          fromBoxID: "outcome-less",
          toBoxID: "returning",
        },
        {
          type: "box-ids",
          id: "pa13",
          fromBoxID: "outcome-least",
          toBoxID: "returning",
        },
        {
          type: "box-ids",
          id: "pa21",
          fromBoxID: "complications",
          toBoxID: "pa-care",
        },
        {
          type: "box-ids",
          id: "pa22",
          fromBoxID: "complications",
          toBoxID: "pa-no-care",
        },
      ],
    };
  },
  ///////////////////////////////////////////////////////////////////////////////
  //  __     __                                      ______            __  __  //
  // /  |   /  |                                    /      \          /  |/  | //
  // $$ |   $$ | ______    ______   __    __       /$$$$$$  |__    __ $$ |$$ | //
  // $$ |   $$ |/      \  /      \ /  |  /  |      $$ |_ $$//  |  /  |$$ |$$ | //
  // $$  \ /$$//$$$$$$  |/$$$$$$  |$$ |  $$ |      $$   |   $$ |  $$ |$$ |$$ | //
  //  $$  /$$/ $$    $$ |$$ |  $$/ $$ |  $$ |      $$$$/    $$ |  $$ |$$ |$$ | //
  //   $$ $$/  $$$$$$$$/ $$ |      $$ \__$$ |      $$ |     $$ \__$$ |$$ |$$ | //
  //    $$$/   $$       |$$ |      $$    $$ |      $$ |     $$    $$/ $$ |$$ | //
  //     $/     $$$$$$$/ $$/        $$$$$$$ |      $$/       $$$$$$/  $$/ $$/  //
  //                               /  \__$$ |                                  //
  //                               $$    $$/                                   //
  //                                $$$$$$/                                    //
  //                                                                           //
  ///////////////////////////////////////////////////////////////////////////////
  "full-detail": (s, baseline) => {
    const totalPregnanciesInfo = getBoxInfo("totalPregnancies", s, baseline);
    const intendedInfo = getBoxInfo("intended", s, baseline);
    const unintendedInfo = getBoxInfo("unintended", s, baseline);
    const miscarriageInfo = getBoxInfo("miscarriage", s, baseline);
    const liveBirthInfo = getBoxInfo("live-birth", s, baseline);
    const seekInfo = getBoxInfo("seek", s, baseline);
    const accessFacilityInfo = getBoxInfo("access-facility", s, baseline);
    const accessOutOfFacilityInfo = getBoxInfo(
      "access-outOfFacility",
      s,
      baseline
    );
    const noAccessInfo = getBoxInfo("no-access", s, baseline);
    const facilitySafeInfo = getBoxInfo("facility-safe", s, baseline);
    const facilityLessInfo = getBoxInfo("facility-less", s, baseline);
    const facilityLeastInfo = getBoxInfo("facility-least", s, baseline);
    const outOfFacilitySafeInfo = getBoxInfo("outOfFacility-safe", s, baseline);
    const outOfFacilityLessInfo = getBoxInfo("outOfFacility-less", s, baseline);
    const outOfFacilityLeastInfo = getBoxInfo(
      "outOfFacility-least",
      s,
      baseline
    );
    const noAbortionBox = getBoxInfo("no-abortion", s, baseline);
    const outcomeSafeInfo = getBoxInfo("outcome-safe", s, baseline);
    const outcomeLessInfo = getBoxInfo("outcome-less", s, baseline);
    const outcomeLeastInfo = getBoxInfo("outcome-least", s, baseline);

    const complicationsModerate = getBoxInfo(
      "complications-moderate",
      s,
      baseline
    );
    const complicationsSevere = getBoxInfo("complications-severe", s, baseline);
    const returning = getBoxInfo("returning", s, baseline);
    const paCare = getBoxInfo("pa-care", s, baseline);
    const paNoCare = getBoxInfo("pa-no-care", s, baseline);

    return {
      layerPlacementOrder: [[4, 3, 5], [2], [1], [0], [6, 7]],
      boxes: [
        {
          id: "totalPregnancies",
          layer: 0,
          order: 0,
          text: t("All pregnancies"),
          secondaryText: totalPregnanciesInfo.secondaryText,
          fillColor: totalPregnanciesInfo.conditionalColor,
        },
        {
          id: "unintended",
          layer: 1 + 0,
          order: 0,
          text: t("Unintended pregnancies"),
          secondaryText: unintendedInfo.secondaryText,
          fillColor: unintendedInfo.conditionalColor,
        },
        {
          id: "intended",
          layer: 1 + 0,
          order: 1,
          text: t("Intended pregnancies"),
          secondaryText: intendedInfo.secondaryText,
          fillColor: intendedInfo.conditionalColor,
          leftOffset: 50,
        },
        {
          id: "seek",
          layer: 1 + 1,
          order: 0,
          text: t("Seek an induced abortion"),
          secondaryText: seekInfo.secondaryText,
          fillColor: seekInfo.conditionalColor,
        },
        {
          id: "miscarriage",
          layer: 1 + 1,
          order: 1,
          text: t("Miscarriage"),
          secondaryText: miscarriageInfo.secondaryText,
          fillColor: miscarriageInfo.conditionalColor,
          leftOffset: 150,
        },
        {
          id: "live-birth",
          layer: 1 + 1,
          order: 2,
          text: t("Live birth"),
          secondaryText: liveBirthInfo.secondaryText,
          fillColor: liveBirthInfo.conditionalColor,
          leftOffset: 50,
        },
        {
          id: "access-facility",
          layer: 1 + 2,
          order: 0,
          text: t("Abortion initiated in a facility"),
          secondaryText: accessFacilityInfo.secondaryText,
          fillColor: accessFacilityInfo.conditionalColor,
        },
        {
          id: "access-outOfFacility",
          layer: 1 + 2,
          order: 1,
          text: t("Abortion initiated out of a facility"),
          secondaryText: accessOutOfFacilityInfo.secondaryText,
          fillColor: accessOutOfFacilityInfo.conditionalColor,
        },
        {
          id: "no-access",
          layer: 1 + 2,
          order: 2,
          text: t("No access"),
          leftOffset: 150,
          secondaryText: noAccessInfo.secondaryText,
          fillColor: noAccessInfo.conditionalColor,
        },
        {
          id: "facility-safe",
          layer: 1 + 3,
          order: 0,
          text: t("Safe"),
          secondaryText: facilitySafeInfo.secondaryText,
          fillColor: facilitySafeInfo.conditionalColor,
        },
        {
          id: "facility-less",
          layer: 1 + 3,
          order: 1,
          text: t("Less safe"),
          secondaryText: facilityLessInfo.secondaryText,
          fillColor: facilityLessInfo.conditionalColor,
        },
        {
          id: "facility-least",
          layer: 1 + 3,
          order: 2,
          text: t("Least safe"),
          secondaryText: facilityLeastInfo.secondaryText,
          fillColor: facilityLeastInfo.conditionalColor,
        },
        {
          id: "outOfFacility-safe",
          layer: 1 + 3,
          order: 3,
          text: t("Safe"),
          secondaryText: outOfFacilitySafeInfo.secondaryText,
          fillColor: outOfFacilitySafeInfo.conditionalColor,
          leftOffset: 20,
        },
        {
          id: "outOfFacility-less",
          layer: 1 + 3,
          order: 4,
          text: t("Less safe"),
          secondaryText: outOfFacilityLessInfo.secondaryText,
          fillColor: outOfFacilityLessInfo.conditionalColor,
        },
        {
          id: "outOfFacility-least",
          layer: 1 + 3,
          order: 5,
          text: t("Least safe"),
          secondaryText: outOfFacilityLeastInfo.secondaryText,
          fillColor: outOfFacilityLeastInfo.conditionalColor,
        },
        {
          id: "no-abortion",
          layer: 1 + 3,
          order: 6,
          text: t("No abortion"),
          secondaryText: noAbortionBox.secondaryText,
          leftOffset: 70,
          fillColor: noAbortionBox.conditionalColor,
        },
        {
          id: "outcome-safe",
          layer: 1 + 4,
          order: 0,
          text: t("Safe abortion"),
          secondaryText: outcomeSafeInfo.secondaryText,
          fillColor: outcomeSafeInfo.conditionalColor,
          arrowEndPoint: "top-center",
        },
        {
          id: "outcome-less",
          layer: 1 + 4,
          order: 0,
          text: t("Less safe abortion"),
          secondaryText: outcomeLessInfo.secondaryText,
          fillColor: outcomeLessInfo.conditionalColor,
          arrowEndPoint: "top-center",
        },
        {
          id: "outcome-least",
          layer: 1 + 4,
          order: 0,
          text: t("Least safe abortion"),
          secondaryText: outcomeLeastInfo.secondaryText,
          fillColor: outcomeLeastInfo.conditionalColor,
          arrowEndPoint: "top-center",
        },
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //  _______                        __                      __                              __      __                      //
        // /       \                      /  |                    /  |                            /  |    /  |                     //
        // $$$$$$$  | ______    _______  _$$ |_           ______  $$ |____    ______    ______   _$$ |_   $$/   ______   _______   //
        // $$ |__$$ |/      \  /       |/ $$   |  ______ /      \ $$      \  /      \  /      \ / $$   |  /  | /      \ /       \  //
        // $$    $$//$$$$$$  |/$$$$$$$/ $$$$$$/  /      |$$$$$$  |$$$$$$$  |/$$$$$$  |/$$$$$$  |$$$$$$/   $$ |/$$$$$$  |$$$$$$$  | //
        // $$$$$$$/ $$ |  $$ |$$      \   $$ | __$$$$$$/ /    $$ |$$ |  $$ |$$ |  $$ |$$ |  $$/   $$ | __ $$ |$$ |  $$ |$$ |  $$ | //
        // $$ |     $$ \__$$ | $$$$$$  |  $$ |/  |      /$$$$$$$ |$$ |__$$ |$$ \__$$ |$$ |        $$ |/  |$$ |$$ \__$$ |$$ |  $$ | //
        // $$ |     $$    $$/ /     $$/   $$  $$/       $$    $$ |$$    $$/ $$    $$/ $$ |        $$  $$/ $$ |$$    $$/ $$ |  $$ | //
        // $$/       $$$$$$/  $$$$$$$/     $$$$/         $$$$$$$/ $$$$$$$/   $$$$$$/  $$/          $$$$/  $$/  $$$$$$/  $$/   $$/  //
        //                                                                                                                         //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        {
          id: "complications-moderate",
          layer: 6,
          order: 0,
          text: t("Moderate complication"),
          secondaryText: complicationsModerate.secondaryText,
          fillColor: complicationsModerate.conditionalColor,
          // arrowEndPoint: "top-center",
        },
        {
          id: "complications-severe",
          layer: 6,
          order: 0,
          text: t("Severe complication"),
          secondaryText: complicationsSevere.secondaryText,
          fillColor: complicationsSevere.conditionalColor,
          // arrowEndPoint: "top-center",
        },
        {
          id: "returning",
          layer: 6,
          order: 1,
          text: t("Return to a state of non-pregnancy"),
          secondaryText: returning.secondaryText,
          fillColor: returning.conditionalColor,
          // arrowEndPoint: "top-center",
          leftOffset: 150,
        },
        {
          id: "pa-care",
          layer: 7,
          order: 0,
          text: t("Effective post-abortion care"),
          secondaryText: paCare.secondaryText,
          fillColor: paCare.conditionalColor,
          // arrowEndPoint: "top-center",
        },
        {
          id: "pa-no-care",
          layer: 7,
          order: 0,
          text: t("No care or ineffective care"),
          secondaryText: paNoCare.secondaryText,
          fillColor: paNoCare.conditionalColor,
          // arrowEndPoint: "top-center",
        },
      ],
      arrows: [
        {
          type: "box-ids",
          id: "aa1",
          fromBoxID: "totalPregnancies",
          toBoxID: "unintended",
        },
        {
          type: "box-ids",
          id: "aa2",
          fromBoxID: "totalPregnancies",
          toBoxID: "intended",
        },
        // {
        //   type: "box-ids",
        //   id: "aa3",
        //   fromBoxID: "intended",
        //   toBoxID: "unintended",
        // },
        // {
        //   type: "box-ids",
        //   id: "abcc1",
        //   fromBoxID: "intended",
        //   toBoxID: "unintended",
        //   arrowEndPoint: "center-right",
        //   arrowStartPoint: "center-left",
        //   // truncateEnd: 30,
        // },
        {
          type: "box-ids",
          id: "ab1",
          fromBoxID: "intended",
          toBoxID: "seek",
        },
        {
          type: "box-ids",
          id: "ab2",
          fromBoxID: "intended",
          toBoxID: "miscarriage",
        },
        {
          type: "box-ids",
          id: "ab3",
          fromBoxID: "intended",
          toBoxID: "live-birth",
        },
        {
          type: "box-ids",
          id: "ac1",
          fromBoxID: "unintended",
          toBoxID: "seek",
        },
        {
          type: "box-ids",
          id: "ac2",
          fromBoxID: "unintended",
          toBoxID: "miscarriage",
        },
        {
          type: "box-ids",
          id: "ac3",
          fromBoxID: "unintended",
          toBoxID: "live-birth",
        },
        // {
        //   type: "box-ids",
        //   id: "aa3",
        //   fromBoxID: "unintended",
        //   toBoxID: "no-seek",
        // },
        {
          type: "box-ids",
          id: "a3",
          fromBoxID: "seek",
          toBoxID: "access-facility",
        },
        {
          type: "box-ids",
          id: "a4",
          fromBoxID: "seek",
          toBoxID: "access-outOfFacility",
        },
        {
          type: "box-ids",
          id: "a5",
          fromBoxID: "seek",
          toBoxID: "no-access",
          // ignoreDuringPlacement: true,
          arrowEndPoint: "center",
        },
        {
          type: "box-ids",
          id: "a6",
          fromBoxID: "access-facility",
          toBoxID: "facility-safe",
        },
        {
          type: "box-ids",
          id: "a7",
          fromBoxID: "access-facility",
          toBoxID: "facility-less",
        },
        {
          type: "box-ids",
          id: "a8",
          fromBoxID: "access-facility",
          toBoxID: "facility-least",
        },
        {
          type: "box-ids",
          id: "a9",
          fromBoxID: "access-outOfFacility",
          toBoxID: "outOfFacility-safe",
        },
        {
          type: "box-ids",
          id: "a10",
          fromBoxID: "access-outOfFacility",
          toBoxID: "outOfFacility-less",
        },
        {
          type: "box-ids",
          id: "a11",
          fromBoxID: "access-outOfFacility",
          toBoxID: "outOfFacility-least",
        },
        {
          type: "box-ids",
          id: "a2216",
          fromBoxID: "access-facility",
          toBoxID: "no-abortion",
          ignoreDuringPlacement: true,
        },
        {
          type: "box-ids",
          id: "a2217",
          fromBoxID: "access-outOfFacility",
          toBoxID: "no-abortion",
          ignoreDuringPlacement: true,
        },
        {
          type: "box-ids",
          id: "a12",
          fromBoxID: "facility-safe",
          toBoxID: "outcome-safe",
        },
        {
          type: "box-ids",
          id: "a13",
          fromBoxID: "outOfFacility-safe",
          toBoxID: "outcome-safe",
        },
        {
          type: "box-ids",
          id: "a14",
          fromBoxID: "facility-less",
          toBoxID: "outcome-less",
        },
        {
          type: "box-ids",
          id: "a15",
          fromBoxID: "outOfFacility-less",
          toBoxID: "outcome-less",
        },
        {
          type: "box-ids",
          id: "a16",
          fromBoxID: "facility-least",
          toBoxID: "outcome-least",
        },
        {
          type: "box-ids",
          id: "a17",
          fromBoxID: "outOfFacility-least",
          toBoxID: "outcome-least",
        },
        {
          type: "box-ids",
          id: "a18a",
          fromBoxID: "no-access",
          toBoxID: "miscarriage",
          arrowEndPoint: "center",
          arrowStartPoint: "top-center",
        },
        {
          type: "box-ids",
          id: "a18b",
          fromBoxID: "no-access",
          toBoxID: "live-birth",
          arrowEndPoint: "center",
          arrowStartPoint: "top-center",
        },
        {
          type: "box-ids",
          id: "a18b",
          fromBoxID: "no-abortion",
          toBoxID: "miscarriage",
          arrowEndPoint: "center",
          arrowStartPoint: "top-center",
        },
        {
          type: "box-ids",
          id: "a18b",
          fromBoxID: "no-abortion",
          toBoxID: "live-birth",
          arrowEndPoint: "center",
          arrowStartPoint: "top-center",
        }, /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //  _______                        __                      __                              __      __                      //
        // /       \                      /  |                    /  |                            /  |    /  |                     //
        // $$$$$$$  | ______    _______  _$$ |_           ______  $$ |____    ______    ______   _$$ |_   $$/   ______   _______   //
        // $$ |__$$ |/      \  /       |/ $$   |  ______ /      \ $$      \  /      \  /      \ / $$   |  /  | /      \ /       \  //
        // $$    $$//$$$$$$  |/$$$$$$$/ $$$$$$/  /      |$$$$$$  |$$$$$$$  |/$$$$$$  |/$$$$$$  |$$$$$$/   $$ |/$$$$$$  |$$$$$$$  | //
        // $$$$$$$/ $$ |  $$ |$$      \   $$ | __$$$$$$/ /    $$ |$$ |  $$ |$$ |  $$ |$$ |  $$/   $$ | __ $$ |$$ |  $$ |$$ |  $$ | //
        // $$ |     $$ \__$$ | $$$$$$  |  $$ |/  |      /$$$$$$$ |$$ |__$$ |$$ \__$$ |$$ |        $$ |/  |$$ |$$ \__$$ |$$ |  $$ | //
        // $$ |     $$    $$/ /     $$/   $$  $$/       $$    $$ |$$    $$/ $$    $$/ $$ |        $$  $$/ $$ |$$    $$/ $$ |  $$ | //
        // $$/       $$$$$$/  $$$$$$$/     $$$$/         $$$$$$$/ $$$$$$$/   $$$$$$/  $$/          $$$$/  $$/  $$$$$$/  $$/   $$/  //
        //                                                                                                                         //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        {
          type: "box-ids",
          id: "pa01",
          fromBoxID: "outcome-safe",
          toBoxID: "complications-moderate",
        },
        {
          type: "box-ids",
          id: "pa02",
          fromBoxID: "outcome-less",
          toBoxID: "complications-moderate",
        },
        {
          type: "box-ids",
          id: "pa03",
          fromBoxID: "outcome-least",
          toBoxID: "complications-moderate",
        },
        {
          type: "box-ids",
          id: "pa01b",
          fromBoxID: "outcome-safe",
          toBoxID: "complications-severe",
        },
        {
          type: "box-ids",
          id: "pa02b",
          fromBoxID: "outcome-less",
          toBoxID: "complications-severe",
        },
        {
          type: "box-ids",
          id: "pa03b",
          fromBoxID: "outcome-least",
          toBoxID: "complications-severe",
        },
        {
          type: "box-ids",
          id: "pa11",
          fromBoxID: "outcome-safe",
          toBoxID: "returning",
        },
        {
          type: "box-ids",
          id: "pa12",
          fromBoxID: "outcome-less",
          toBoxID: "returning",
        },
        {
          type: "box-ids",
          id: "pa13",
          fromBoxID: "outcome-least",
          toBoxID: "returning",
        },
        {
          type: "box-ids",
          id: "pa21",
          fromBoxID: "complications-moderate",
          toBoxID: "pa-care",
        },
        {
          type: "box-ids",
          id: "pa22",
          fromBoxID: "complications-moderate",
          toBoxID: "pa-no-care",
        },
        {
          type: "box-ids",
          id: "pa21b",
          fromBoxID: "complications-severe",
          toBoxID: "pa-care",
        },
        {
          type: "box-ids",
          id: "pa22b",
          fromBoxID: "complications-severe",
          toBoxID: "pa-no-care",
        },
      ],
    };
  },
};
