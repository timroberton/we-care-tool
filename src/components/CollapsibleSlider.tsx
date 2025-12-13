import { Show } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import type { ParamField } from "~/config/param_fields";
import type { Parameters, SourceType, SourceClassification } from "~/types/mod";
import type { Setter } from "solid-js";
import {
  toPct0,
  toNum0,
  IconRenderer,
  SliderWithInput,
  toAbbrev0,
  Select,
  Input,
  type SelectOption,
  TextArea,
} from "panther";
import { uiStore } from "~/stores/ui";
import { BuildingBlocks } from "./BuildingBlocks";
import { projectStore } from "~/stores/project";
import { ConfidenceBadge, SourceTypeBadge } from "./Badges";
import { t, td } from "~/translate/mod";

function getSourceTypeOptions(): SelectOption<SourceType>[] {
  return [
    { value: "unknown", label: t("Unknown") },
    { value: "survey", label: t("Survey") },
    { value: "administrative", label: t("Administrative") },
    { value: "estimate", label: t("Estimate") },
    { value: "assumption", label: t("Assumption") },
    { value: "literature", label: t("Literature") },
    { value: "expert_opinion", label: t("Expert opinion") },
  ];
}

function getSourceClassificationOptions(): SelectOption<SourceClassification>[] {
  return [
    { value: "unclassified", label: t("Unclassified") },
    { value: "high_confidence", label: t("Strong evidence") },
    { value: "medium_confidence", label: t("Moderate evidence") },
    { value: "low_confidence", label: t("Weak evidence") },
  ];
}

type CollapsibleSliderProps = {
  field: ParamField;
  params: Parameters;
  setParams: SetStoreFunction<Parameters>;
  showBottomBorder?: boolean;
  formatAs: "number" | "percent";
  expandedFieldId: string | null;
  setExpandedFieldId: Setter<string | null>;
  max?: number;
  step?: number;
  formatter?: (v: number) => string;
  isNonRecommended?: boolean;
  labelPrefix?: string;
};

export function CollapsibleSlider(p: CollapsibleSliderProps) {
  const fieldId = () => `${p.field.category}-${p.field.property}`;
  const sourceKey = () => `${p.field.category}.${p.field.property}`;
  const expanded = () => p.expandedFieldId === fieldId();

  const toggleExpanded = () => {
    p.setExpandedFieldId(expanded() ? null : fieldId());
  };

  const formatter = p.formatter ?? (p.formatAs === "percent" ? toPct0 : toNum0);

  const currentValue = () =>
    (p.params.baseline as any)[p.field.category]?.[p.field.property] ?? 0;

  const originalValue = () =>
    (p.params.originalBaseline as any)?.[p.field.category]?.[p.field.property];

  const hasOriginal = () => originalValue() !== undefined;

  const isDifferentFromOriginal = () => {
    if (!hasOriginal()) return false;
    return Math.abs(currentValue() - originalValue()) > 0.0001;
  };

  const handleReset = () => {
    projectStore.resetBaselineParameter(p.field.category, p.field.property);
  };

  const sourceInfo = () => p.params.baselineSourceInfo?.[sourceKey()];
  const sourceDescription = () => sourceInfo()?.description ?? "";
  const sourceType = () => sourceInfo()?.type ?? "unknown";
  const sourceClassification = () =>
    sourceInfo()?.classification ?? "unclassified";

  const handleSourceDescriptionChange = (value: string) => {
    projectStore.updateBaselineSourceInfo(sourceKey(), {
      description: value,
      type: sourceType(),
      classification: sourceClassification(),
    });
  };

  const handleSourceTypeChange = (value: string) => {
    projectStore.updateBaselineSourceInfo(sourceKey(), {
      description: sourceDescription(),
      type: value as SourceType,
      classification: sourceClassification(),
    });
  };

  const handleSourceClassificationChange = (value: string) => {
    projectStore.updateBaselineSourceInfo(sourceKey(), {
      description: sourceDescription(),
      type: sourceType(),
      classification: value as SourceClassification,
    });
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
        <Show when={sourceType() !== "unknown"}>
          <SourceTypeBadge
            label={String(
              getSourceTypeOptions().find((o) => o.value === sourceType())
                ?.label ?? sourceType()
            )}
            size="sm"
          />
        </Show>
        <Show when={sourceClassification() !== "unclassified"}>
          <ConfidenceBadge
            confidence={
              sourceClassification() as
                | "high_confidence"
                | "medium_confidence"
                | "low_confidence"
            }
            size="sm"
          />
        </Show>
        <div
          class="font-700 pl-2"
          // classList={{ "text-warning": isDifferentFromOriginal() }}
        >
          {formatter(currentValue())}
        </div>
      </div>
      <Show when={expanded()}>
        <div class="ui-pad ui-spy-sm border-primary bg-base-100 border rounded mb-2 relative">
          <div class="text-xs italic pr-10">
            <span class="font-700">{t("Definition:")}</span> {td(p.field.description)}
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
          <div class="flex flex-wrap items-start gap-x-4 text-xs w-full">
            <span class="font-700 flex-none">{t("Data source:")}</span>
            <div class="flex-1 min-w-[260px]">
              <TextArea
                value={sourceDescription()}
                onChange={handleSourceDescriptionChange}
                placeholder={t("Data source description")}
                size="sm"
                fullWidth
                height="55px"
                resizable
              />
            </div>
            <div class="flex-none flex items-start ui-gap">
              <div class="flex-none w-[140px] flex flex-col">
                <div class="font-700 flex-none mb-1">{t("Source type:")}</div>
                <Select
                  value={sourceType()}
                  options={getSourceTypeOptions()}
                  onChange={handleSourceTypeChange}
                  size="sm"
                  fullWidth
                />
              </div>
              <div class="flex-none w-[140px] flex flex-col">
                <div class="font-700 flex-none mb-1">{t("Evidence strength:")}</div>
                <Select
                  value={sourceClassification()}
                  options={getSourceClassificationOptions()}
                  onChange={handleSourceClassificationChange}
                  size="sm"
                  fullWidth
                />
              </div>
            </div>
          </div>
          <SliderWithInput
            value={currentValue()}
            onChange={(v) => {
              uiStore.setSelectedScenarioIndex(-1);
              p.setParams(
                "baseline",
                p.field.category as any,
                p.field.property as any,
                v
              );
            }}
            step={p.step ?? (p.formatAs === "percent" ? 0.01 : 100000)}
            min={0}
            max={p.max ?? (p.formatAs === "percent" ? 1 : 10000000)}
            inputMultiplier={p.formatAs === "percent" ? 100 : undefined}
            inputDisplayFormatter={formatter}
            ticks={{
              major: 11,
              showLabels: true,
              labelFormatter: p.formatAs === "percent" ? toPct0 : toAbbrev0,
            }}
            inputWidth={p.formatAs === "percent" ? "70px" : "110px"}
          />
          <Show when={hasOriginal() && isDifferentFromOriginal()}>
            <div
              class="absolute top-1 right-7 p-1 h-6 w-6 rounded ui-hoverable text-primary"
              onClick={handleReset}
              title={t("Reset to original value")}
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
