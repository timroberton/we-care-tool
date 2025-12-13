import type { Parameters } from "~/types/mod";
import type { SetStoreFunction } from "solid-js/store";
import * as ScenarioActions from "~/utils/scenario_actions";
import { td } from "~/translate/mod";

export type ScenarioTemplateCategory = "custom" | "default" | "buildingBlock";

export type ScenarioTemplate = {
  id: string;
  name: string;
  description?: string;
  category: ScenarioTemplateCategory;
  apply: (params: Parameters, setParams: SetStoreFunction<Parameters>) => void;
};

export const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  {
    id: "blank",
    name: "Custom scenario",
    category: "custom",
    description: "Set multiple parameters to your own specified values",
    apply: (params, setParams) => {
      ScenarioActions.addScenario(params, setParams, td("New scenario"));
    },
  },

  ////////////////////////////////////////////////////////////////////
  //  _______              ______                     __    __      //
  // /       \            /      \                   /  |  /  |     //
  // $$$$$$$  |  ______  /$$$$$$  |______   __    __ $$ | _$$ |_    //
  // $$ |  $$ | /      \ $$ |_ $$//      \ /  |  /  |$$ |/ $$   |   //
  // $$ |  $$ |/$$$$$$  |$$   |   $$$$$$  |$$ |  $$ |$$ |$$$$$$/    //
  // $$ |  $$ |$$    $$ |$$$$/    /    $$ |$$ |  $$ |$$ |  $$ | __  //
  // $$ |__$$ |$$$$$$$$/ $$ |    /$$$$$$$ |$$ \__$$ |$$ |  $$ |/  | //
  // $$    $$/ $$       |$$ |    $$    $$ |$$    $$/ $$ |  $$  $$/  //
  // $$$$$$$/   $$$$$$$/ $$/      $$$$$$$/  $$$$$$/  $$/    $$$$/   //
  //                                                                //
  ////////////////////////////////////////////////////////////////////
  // {
  //   id: "demand-90",
  //   name: "Improve demand",
  //   description: "Increase all demand parameters to at least 90%",
  //   category: "default",
  //   apply: (params, setParams) => {
  //     ScenarioActions.addScenarioWithTemplate(
  //       params,
  //       setParams,
  //       "Improve demand",
  //       (scenario) => {
  //         scenario.adjustments.demand = true;
  //         Object.keys(scenario.demand).forEach((key) => {
  //           const currentValue = (scenario.demand as Record<string, number>)[
  //             key
  //           ];
  //           (scenario.demand as Record<string, number>)[key] = Math.max(
  //             currentValue,
  //             0.9
  //           );
  //         });
  //       }
  //     );
  //   },
  // },
  {
    id: "access-facility-90",
    name: "Improve facility access",
    description:
      "Increase all facility access parameters to at least 90% (except legal restrictions)",
    category: "default",
    apply: (params, setParams) => {
      ScenarioActions.addScenarioWithTemplate(
        params,
        setParams,
        td("Improve facility access"),
        (scenario) => {
          scenario.adjustments.facilityAccess = true;
          Object.keys(scenario.facilityAccess).forEach((key) => {
            if (key !== "pNoLegalRestrictions") {
              const currentValue = (
                scenario.facilityAccess as Record<string, number>
              )[key];
              (scenario.facilityAccess as Record<string, number>)[key] =
                Math.max(currentValue, 0.9);
            }
          });
        }
      );
    },
  },
  {
    id: "readiness-facility-90",
    name: "Improve facility readiness",
    description:
      "Increase all facility readiness parameters to at least 90% (except D&C)",
    category: "default",
    apply: (params, setParams) => {
      ScenarioActions.addScenarioWithTemplate(
        params,
        setParams,
        td("Improve facility readiness"),
        (scenario) => {
          scenario.adjustments.facilityReadiness = true;
          Object.keys(scenario.facilityReadiness).forEach((key) => {
            if (key !== "dilcur") {
              const currentValue = scenario.facilityReadiness[key];
              scenario.facilityReadiness[key] = Math.max(currentValue, 0.9);
            }
          });
        }
      );
    },
  },
  {
    id: "preference-facility",
    name: "Increase preference for facility-based care",
    description:
      "Increase the proportion of women preferring facility-based care (vs out-of-facility care) to at least 90%",
    category: "default",
    apply: (params, setParams) => {
      ScenarioActions.addScenarioWithTemplate(
        params,
        setParams,
        td("Increase preference for facility-based care"),
        (scenario) => {
          scenario.adjustments.demand = true;
          const currentValue = scenario.demand.pPreferFacility;
          scenario.demand.pPreferFacility = Math.max(currentValue, 0.9);
        }
      );
    },
  },
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //  _______             __  __        __  __                            __        __                      __                  //
  // /       \           /  |/  |      /  |/  |                          /  |      /  |                    /  |                 //
  // $$$$$$$  | __    __ $$/ $$ |  ____$$ |$$/  _______    ______        $$ |____  $$ |  ______    _______ $$ |   __   _______  //
  // $$ |__$$ |/  |  /  |/  |$$ | /    $$ |/  |/       \  /      \       $$      \ $$ | /      \  /       |$$ |  /  | /       | //
  // $$    $$< $$ |  $$ |$$ |$$ |/$$$$$$$ |$$ |$$$$$$$  |/$$$$$$  |      $$$$$$$  |$$ |/$$$$$$  |/$$$$$$$/ $$ |_/$$/ /$$$$$$$/  //
  // $$$$$$$  |$$ |  $$ |$$ |$$ |$$ |  $$ |$$ |$$ |  $$ |$$ |  $$ |      $$ |  $$ |$$ |$$ |  $$ |$$ |      $$   $$<  $$      \  //
  // $$ |__$$ |$$ \__$$ |$$ |$$ |$$ \__$$ |$$ |$$ |  $$ |$$ \__$$ |      $$ |__$$ |$$ |$$ \__$$ |$$ \_____ $$$$$$  \  $$$$$$  | //
  // $$    $$/ $$    $$/ $$ |$$ |$$    $$ |$$ |$$ |  $$ |$$    $$ |      $$    $$/ $$ |$$    $$/ $$       |$$ | $$  |/     $$/  //
  // $$$$$$$/   $$$$$$/  $$/ $$/  $$$$$$$/ $$/ $$/   $$/  $$$$$$$ |      $$$$$$$/  $$/  $$$$$$/   $$$$$$$/ $$/   $$/ $$$$$$$/   //
  //                                                     /  \__$$ |                                                             //
  //                                                     $$    $$/                                                              //
  //                                                      $$$$$$/                                                               //
  //                                                                                                                            //
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  {
    id: "bb-workforce",
    name: "Workforce",
    description:
      "Increase facility health worker abortion competency to at least 90%",
    category: "buildingBlock",
    apply: (params, setParams) => {
      ScenarioActions.addScenarioWithTemplate(
        params,
        setParams,
        td("Workforce"),
        (scenario) => {
          scenario.adjustments.facilityReadiness = true;
          const currentValue = scenario.facilityReadiness.hw;
          scenario.facilityReadiness.hw = Math.max(currentValue, 0.9);
        }
      );
    },
  },
  {
    id: "bb-commodities",
    name: "Commodities",
    description:
      "Increase all facility commodity readiness parameters to at least 90% (except health workers, D&C kits, and CEmONC)",
    category: "buildingBlock",
    apply: (params, setParams) => {
      ScenarioActions.addScenarioWithTemplate(
        params,
        setParams,
        td("Commodities"),
        (scenario) => {
          scenario.adjustments.facilityReadiness = true;
          Object.keys(scenario.facilityReadiness).forEach((key) => {
            if (key !== "dilcur" && key !== "hw" && key !== "cemonc") {
              const currentValue = scenario.facilityReadiness[key];
              scenario.facilityReadiness[key] = Math.max(currentValue, 0.9);
            }
          });
        }
      );
    },
  },
  {
    id: "bb-governance",
    name: "Governance",
    description: "Remove legal restrictions for 100% of abortions",
    category: "buildingBlock",
    apply: (params, setParams) => {
      ScenarioActions.addScenarioWithTemplate(
        params,
        setParams,
        td("Governance"),
        (scenario) => {
          scenario.adjustments.facilityAccess = true;
          const currentValue = scenario.facilityAccess.pNoLegalRestrictions;
          scenario.facilityAccess.pNoLegalRestrictions = Math.max(
            currentValue,
            1
          );
        }
      );
    },
  },
  {
    id: "bb-financing",
    name: "Financing",
    description:
      "Reduce financial barriers such that at least 90% of women can afford facility and out-of-facility care",
    category: "buildingBlock",
    apply: (params, setParams) => {
      ScenarioActions.addScenarioWithTemplate(
        params,
        setParams,
        td("Financing"),
        (scenario) => {
          scenario.adjustments.facilityAccess = true;
          scenario.adjustments.outOfFacilityAccess = true;

          const currentFacilityValue = scenario.facilityAccess.pAffordable;
          scenario.facilityAccess.pAffordable = Math.max(
            currentFacilityValue,
            0.9
          );

          const currentOutOfFacilityValue =
            scenario.outOfFacilityAccess.pAffordable;
          scenario.outOfFacilityAccess.pAffordable = Math.max(
            currentOutOfFacilityValue,
            0.9
          );
        }
      );
    },
  },
];
