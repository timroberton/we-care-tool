import { Button, IconRenderer, openComponent } from "panther";
import { For, Show, createSignal } from "solid-js";
import { type SetStoreFunction } from "solid-js/store";
import { CreateScenarioModal } from "~/components/CreateScenarioModal";
import { EditScenarioModal } from "~/components/EditScenarioModal";
import { ReorderScenariosModal } from "~/components/ReorderScenariosModal";
import { PARAM_FIELD_SECTIONS } from "~/config/param_fields";
import { uiStore } from "~/stores/ui";
import type { Parameters } from "~/types/mod";
import { CollapsibleComparisonSlider } from "~/components/CollapsibleComparisonSlider";
import { Section } from "~/components/Section";
import { t, td } from "~/translate/mod";

type ParamEditorProps = {
  params: Parameters;
  setParams: SetStoreFunction<Parameters>;
};

export function ScenariosTab(p: ParamEditorProps) {
  const [expandedFieldId, setExpandedFieldId] = createSignal<string | null>(
    null
  );

  const addScenario = async () => {
    await openComponent({
      element: CreateScenarioModal,
      props: {
        params: p.params,
        setParams: p.setParams,
      },
    });
  };

  const editScenario = async (index: number) => {
    await openComponent({
      element: EditScenarioModal,
      props: {
        params: p.params,
        setParams: p.setParams,
        scenarioIndex: index,
      },
    });
  };

  const reorderScenarios = async () => {
    await openComponent({
      element: ReorderScenariosModal,
      props: {
        params: p.params,
        setParams: p.setParams,
      },
    });
  };

  // const resetScenario = (index: number) => {
  //   ScenarioActions.resetScenario(p.params, p.setParams, index);
  // };

  return (
    <div class="h-full w-full flex flex-col">
      <div class="flex-none ui-pad flex items-center justify-end ui-gap-sm border-b border-base-300">
        <Button intent="primary" onClick={addScenario} iconName="plus">
          {t("Add scenarios")}
        </Button>
        <Show when={p.params.scenarios.length > 0}>
          <Button
            intent="primary"
            onClick={reorderScenarios}
            iconName="move"
            outline
          >
            {t("Edit and reorder")}
          </Button>
        </Show>
      </div>

      <div class="ui-spy ui-pad overflow-y-scroll flex-1 h-0">
        <For
          each={p.params.scenarios}
          fallback={
            <div class="ui-pad ui-spy-sm text-center text-base-content/60">
              <div class="text-lg">{t("No scenarios yet")}</div>
              <div class="text-sm">{t("Click \"Add scenarios\" to create one")}</div>
            </div>
          }
        >
          {(scenario, index) => {
            return (
              <div class="border rounded border-base-300">
                <div
                  class="ui-pad flex items-center ui-gap-sm bg-base-200 ui-hoverable"
                  onClick={() =>
                    uiStore.setExpandedScenarioIndex(
                      uiStore.expandedScenarioIndex === index() ? null : index()
                    )
                  }
                >
                  {/* <Show
                    when={uiStore.expandedScenarioIndex === index()}
                    fallback={<IconRenderer iconName="chevronRight" />}
                  >
                    <div class="-mr-2">
                      <IconRenderer iconName="chevronDown" />
                    </div>
                  </Show> */}
                  <div class="flex-1">
                    <div class="text-primary text-sm pb-0.5">
                      {t("Scenario")} {index() + 1}
                    </div>
                    <div class="font-700 text-xl">{scenario.name}</div>
                  </div>

                  <div
                    class="flex flex-none ui-gap-sm items-center -my-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Show when={uiStore.expandedScenarioIndex === index()}>
                      <Button
                        onClick={() => editScenario(index())}
                        iconName="pencil"
                        outline
                        fillBase100
                      />
                    </Show>
                  </div>
                </div>
                <Show when={uiStore.expandedScenarioIndex === index()}>
                  <div class="ui-spy ui-pad  border-t border-base-300">
                    <For each={PARAM_FIELD_SECTIONS}>
                      {(section) => (
                        <Show
                          when={scenario.adjustments[section.adjustmentKey]}
                        >
                          <Section header={td(section.header)}>
                            <div class="">
                              <For each={section.fields}>
                                {(field, i_field) => (
                                  <CollapsibleComparisonSlider
                                    field={field}
                                    params={p.params}
                                    setParams={p.setParams}
                                    scenarioIndex={index()}
                                    showBottomBorder={
                                      i_field() !== section.fields.length - 1
                                    }
                                    expandedFieldId={expandedFieldId()}
                                    setExpandedFieldId={setExpandedFieldId}
                                    isNonRecommended={
                                      field.property === "dilcur"
                                    }
                                    labelPrefix={section.labelPrefix}
                                  />
                                )}
                              </For>
                            </div>
                          </Section>
                        </Show>
                      )}
                    </For>
                  </div>
                </Show>
              </div>
            );
          }}
        </For>
        <div class="p-6"></div>
      </div>
    </div>
  );
}
