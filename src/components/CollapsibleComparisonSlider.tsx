import { Show } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import type { ParamField } from "~/config/param_fields";
import type { Parameters } from "~/types/mod";
import type { Setter } from "solid-js";
import { toPct0, IconRenderer } from "panther";
import { BuildingBlocks } from "./BuildingBlocks";
import { PercentComparisonSlider } from "./PercentComparisonSlider";
import { t, td } from "~/translate/mod";

type CollapsibleComparisonSliderProps = {
  field: ParamField;
  params: Parameters;
  setParams: SetStoreFunction<Parameters>;
  scenarioIndex: number;
  showBottomBorder?: boolean;
  expandedFieldId: string | null;
  setExpandedFieldId: Setter<string | null>;
  isNonRecommended?: boolean;
  labelPrefix?: string;
};

export function CollapsibleComparisonSlider(
  p: CollapsibleComparisonSliderProps
) {
  const fieldId = () => `${p.field.category}-${p.field.property}`;
  const expanded = () => p.expandedFieldId === fieldId();

  const toggleExpanded = () => {
    p.setExpandedFieldId(expanded() ? null : fieldId());
  };

  const baselineValue = () =>
    (p.params.baseline as any)[p.field.category]?.[p.field.property] ?? 0;

  const scenarioValue = () =>
    (p.params.scenarios[p.scenarioIndex] as any)[p.field.category]?.[
      p.field.property
    ] ?? 0;

  const comparisonColorClass = () => {
    const scenario = scenarioValue();
    const baseline = baselineValue();
    const reverse = p.field.reverseColors;

    if (scenario > baseline) {
      return reverse ? "text-danger" : "text-success";
    }
    if (scenario < baseline) {
      return reverse ? "text-success" : "text-danger";
    }
    return "";
  };

  const isDifferentFromOriginal = () => {
    return Math.abs(baselineValue() - scenarioValue()) > 0.0001;
  };

  return (
    <div
      class="ui-spy-sm border-base-300"
      classList={{ "border-b": p.showBottomBorder && !expanded() }}
    >
      <div
        class="text-sm cursor-pointer pt-2 hover:text-primary flex items-start ui-gap-sm"
        classList={{ "pb-2": !expanded() }}
        onClick={toggleExpanded}
      >
        <IconRenderer iconName={expanded() ? "chevronDown" : "chevronRight"} />
        <div class="flex-1">
          {p.labelPrefix ? t(p.labelPrefix as any) : ""}{td(p.field.label)}
          <Show when={p.isNonRecommended}>
            <span class="text-neutral ml-2 italic">{t("Non-recommended")}</span>
          </Show>
        </div>
        <div class={`font-700 pl-2 ${comparisonColorClass()}`}>
          {toPct0(baselineValue())} → {toPct0(scenarioValue())}
        </div>
      </div>
      <Show when={expanded()}>
        <div class="ui-pad ui-spy-sm border-primary border rounded mb-2 relative">
          <div class="text-xs italic pr-10">
            <span class="font-700">Definition:</span> {td(p.field.description)}
          </div>
          {/* <Show when={p.field.source}>
            <div class="text-xs italic truncate">
              <span class="font-700">Source:</span>{" "}
              <a
                href={p.field.source}
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary hover:underline"
              >
                {p.field.source}
              </a>
            </div>
          </Show> */}
          <BuildingBlocks hsBuildingBlocks={p.field.hsBuildingBlocks} />
          <PercentComparisonSlider
            category={p.field.category}
            property={p.field.property}
            label={p.field.label}
            params={p.params}
            setParams={p.setParams}
            scenarioIndex={p.scenarioIndex}
            reverseColors={p.field.reverseColors}
          />
          <Show when={isDifferentFromOriginal()}>
            <div
              class="absolute top-1 right-7 p-1 h-6 w-6 rounded ui-hoverable text-primary"
              onClick={() => {
                p.setParams(
                  "scenarios",
                  p.scenarioIndex,
                  p.field.category as any,
                  p.field.property as any,
                  baselineValue()
                );
              }}
            >
              <IconRenderer iconName="refresh" />
            </div>
          </Show>
          <div
            class="absolute top-1 right-1 p-1 h-6 w-6 rounded ui-hoverable text-primary"
            onClick={() => p.setExpandedFieldId(null)}
          >
            <IconRenderer iconName="x" />
          </div>
        </div>
      </Show>
    </div>
  );
}
