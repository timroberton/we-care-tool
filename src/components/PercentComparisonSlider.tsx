import { SliderWithInput, toPct0 } from "panther";
import type { JSX } from "solid-js";
import { type SetStoreFunction } from "solid-js/store";
import type { ParamCategory } from "~/config/param_fields";
import { uiStore } from "~/stores/ui";
import { type Parameters } from "~/types/mod";

type PercentComparisonSliderProps = {
  category: ParamCategory;
  property: string;
  label: string;
  params: Parameters;
  setParams: SetStoreFunction<Parameters>;
  scenarioIndex: number;
  reverseColors?: boolean;
};

export function PercentComparisonSlider(
  p: PercentComparisonSliderProps
): JSX.Element {
  const baselineValue = () =>
    (p.params.baseline as any)[p.category]?.[p.property] ?? 0;
  const scenarioValue = () =>
    (p.params.scenarios[p.scenarioIndex] as any)[p.category]?.[p.property] ?? 0;

  return (
    <SliderWithInput
      comparisonValue={baselineValue()}
      // label={props.label}
      value={scenarioValue()}
      onChange={(v) => {
        p.setParams(
          "scenarios",
          p.scenarioIndex,
          p.category as any,
          p.property as any,
          v
        );
        uiStore.setSelectedScenarioIndex(p.scenarioIndex);
      }}
      step={0.01}
      min={0}
      max={1}
      inputMultiplier={100}
      inputDisplayFormatter={(v) => `${toPct0(baselineValue())} → ${toPct0(v)}`}
      ticks={{
        major: 6,
        showLabels: true,
        labelFormatter: toPct0,
      }}
      inputWidth="140px"
      colorComparisonInput
      reverseColors={p.reverseColors}
    />
  );
}
