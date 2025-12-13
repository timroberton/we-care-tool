import { createSignal, For, Show } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import { PARAM_FIELD_SECTIONS } from "~/config/param_fields";
import type { Parameters } from "~/types/mod";
import { CollapsibleSlider } from "~/components/CollapsibleSlider";
import { Section } from "~/components/Section";
import { Button, openConfirm } from "panther";
import { projectStore } from "~/stores/project";
import { t, td } from "~/translate/mod";

type ParamEditorProps = {
  params: Parameters;
  setParams: SetStoreFunction<Parameters>;
};

export function BaselineTab(p: ParamEditorProps) {
  const [expandedFieldId, setExpandedFieldId] = createSignal<string | null>(
    null
  );

  const handleResetAll = async () => {
    const project = projectStore.currentProject;
    const metadata = project?.baselineMetadata;

    const confirmed = await openConfirm({
      title: t("Reset base case to original"),
      text: (
        <div class="space-y-3">
          <p>
            {t(
              "This will reset all base case parameters to their original imported values (details below). This action cannot be undone."
            )}
          </p>
          <Show when={metadata}>
            <div class="text-sm text-base-600 space-y-1">
              <Show
                when={
                  metadata?.type === "project-creation" &&
                  metadata.dataSource.label
                }
              >
                {(label) => {
                  return (
                    <div>
                      <span class="font-medium">{t("Original data:")}</span>{" "}
                      {label()}
                    </div>
                  );
                }}
              </Show>
              <Show when={metadata?.type === "csv-upload" && metadata.filename}>
                {(filename) => {
                  return (
                    <div>
                      <span class="font-medium">{t("Original file:")}</span>{" "}
                      {filename()}
                    </div>
                  );
                }}
              </Show>
              <div>
                <span class="font-medium">{t("Imported:")}</span>{" "}
                {new Date(metadata!.importedAt).toLocaleString()}
              </div>
            </div>
          </Show>
        </div>
      ),
    });

    if (confirmed) {
      projectStore.resetBaselineToOriginal();
    }
  };

  return (
    <div class="flex flex-col w-full h-full">
      <Show when={p.params.originalBaseline}>
        <div class="ui-pad border-b border-base-300 flex justify-end flex-none">
          <Button onClick={handleResetAll} outline iconName="refresh">
            {t("Reset all")}
          </Button>
        </div>
      </Show>
      <div class="overflow-auto ui-pad ui-spy h-0 flex-1">
        <Section header={t("Pregnancies")}>
          <div class="ui-spy">
            <CollapsibleSlider
              field={{
                category: "pregnancyOutcomes",
                property: "nUnintendedPregnancies",
                label: t("Number of unintended pregnancies"),
                description: t(
                  "The total number of unintended pregnancies in the population during the time period being modeled."
                ),
                hsBuildingBlocks: [],
              }}
              params={p.params}
              setParams={p.setParams}
              formatAs="number"
              expandedFieldId={expandedFieldId()}
              setExpandedFieldId={setExpandedFieldId}
            />
          </div>
        </Section>
        <For each={PARAM_FIELD_SECTIONS}>
          {(section) => (
            <Section header={td(section.header)}>
              <div class="">
                <For each={section.fields}>
                  {(field, i_field) => (
                    <CollapsibleSlider
                      field={field}
                      params={p.params}
                      setParams={p.setParams}
                      showBottomBorder={i_field() !== section.fields.length - 1}
                      formatAs="percent"
                      expandedFieldId={expandedFieldId()}
                      setExpandedFieldId={setExpandedFieldId}
                      isNonRecommended={field.property === "dilcur"}
                      labelPrefix={section.labelPrefix}
                    />
                  )}
                </For>
              </div>
            </Section>
          )}
        </For>
        <Section header={t("Pregnancy outcomes")}>
          <div class="">
            <CollapsibleSlider
              field={{
                category: "pregnancyOutcomes",
                property: "pResultingInMiscarriage",
                label: t("Proportion of pregnancies resulting in miscarriage"),
                description: t(
                  "The proportion of all pregnancies that naturally end in miscarriage before seeking abortion care."
                ),
                hsBuildingBlocks: [],
              }}
              params={p.params}
              setParams={p.setParams}
              formatAs="percent"
              expandedFieldId={expandedFieldId()}
              setExpandedFieldId={setExpandedFieldId}
              showBottomBorder={false}
              max={1}
              // step={0.001}
              // formatter={toPct1}
            />
            {/* <CollapsibleSlider
            field={{
              category: "pregnancyOutcomes",
              property: "pResultingInContraindication",
              label: t("Proportion of pregnancies resulting in contraindication"),
              description:
                t("The proportion of all pregnancies that have medical contraindications requiring therapeutic abortion."),
              hsBuildingBlocks: [],
            }}
            params={p.params}
            setParams={p.setParams}
            formatAs="percent"
            expandedFieldId={expandedFieldId()}
            setExpandedFieldId={setExpandedFieldId}
            max={0.1}
            step={0.001}
            formatter={toPct1}
          /> */}
          </div>
        </Section>
        <div class="p-1"></div>
      </div>
    </div>
  );
}
