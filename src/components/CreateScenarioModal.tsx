import { AlertComponentProps, Button, Checkbox, MultiSelect } from "panther";
import { createSignal, For, Show } from "solid-js";
import type { Parameters } from "~/types/mod";
import type { SetStoreFunction } from "solid-js/store";
import {
  SCENARIO_TEMPLATES,
  type ScenarioTemplateCategory,
} from "~/config/scenario_templates";
import {
  PARAM_FIELD_SECTIONS,
  type AdjustmentKey,
} from "~/config/param_fields";
import { t, td } from "~/translate/mod";
import { FormModal } from "./FormModal";

type CustomProps = {
  params: Parameters;
  setParams: SetStoreFunction<Parameters>;
};

function getCategoryLabel(category: ScenarioTemplateCategory): string {
  switch (category) {
    case "custom":
      return t("Custom");
    case "default":
      return t("Default scenarios");
    case "buildingBlock":
      return t("Health system scenarios");
  }
}

export function CreateScenarioModal(p: AlertComponentProps<CustomProps, void>) {
  const [selectedTemplates, setSelectedTemplates] = createSignal<Set<string>>(
    new Set()
  );
  const [customAdjustments, setCustomAdjustments] = createSignal<
    AdjustmentKey[]
  >([]);

  const templatesByCategory = () => {
    const categories: ScenarioTemplateCategory[] = [
      "custom",
      "default",
      "buildingBlock",
    ];
    return categories.map((category) => ({
      category,
      templates: SCENARIO_TEMPLATES.filter((t) => t.category === category),
    }));
  };

  // const isCustomSelected = () => selectedTemplates().has("blank");

  function toggleTemplate(id: string) {
    setSelectedTemplates((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleCreate() {
    const selected = selectedTemplates();
    if (selected.size === 0) return;

    SCENARIO_TEMPLATES.filter((t) => selected.has(t.id)).forEach((template) => {
      if (template.id === "blank") {
        // Custom scenario - apply adjustments
        template.apply(p.params, p.setParams);
        const scenarioIndex = p.params.scenarios.length - 1;
        customAdjustments().forEach((key) => {
          p.setParams("scenarios", scenarioIndex, "adjustments", key, true);
        });
      } else {
        template.apply(p.params, p.setParams);
      }
    });
    p.close();
  }

  return (
    <FormModal
      title={t("Create new scenarios")}
      width="xl"
      actions={
        <>
          <Button
            onClick={handleCreate}
            intent="primary"
            disabled={selectedTemplates().size === 0}
          >
            {t("Create")} {selectedTemplates().size > 0 ? selectedTemplates().size : ""}{" "}
            {selectedTemplates().size !== 1 ? t("scenarios") : t("scenario")}
          </Button>
          <Button onClick={() => p.close()} outline>
            {t("Cancel")}
          </Button>
        </>
      }
    >
      <div class="text-sm text-neutral">
        {t("Select one or more templates to create scenarios")}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <For each={templatesByCategory()}>
          {(group) => (
            <div>
              <h3 class="font-700 text-base mb-2">
                {getCategoryLabel(group.category)}
              </h3>
              <div class="ui-spy-sm">
                <For each={group.templates}>
                  {(template) => (
                    <>
                      <div
                        class={`border rounded ui-pad cursor-pointer bg-base-100 flex ui-gap ${
                          selectedTemplates().has(template.id)
                            ? "border-primary bg-primary/10"
                            : "border-base-300 ui-hoverable"
                        }`}
                        onClick={() => toggleTemplate(template.id)}
                      >
                        <div class="pointer-events-none">
                          <Checkbox
                            checked={selectedTemplates().has(template.id)}
                            onChange={() => toggleTemplate(template.id)}
                            label=""
                            intentWhenChecked="primary"
                          />
                        </div>
                        <div class="flex-1">
                          <div class="font-700">{td(template.name)}</div>
                          <Show when={template.description}>
                            <div class="text-sm text-neutral">
                              {td(template.description!)}
                            </div>
                          </Show>
                          <Show
                            when={
                              group.category === "custom" &&
                              selectedTemplates().has(template.id)
                            }
                          >
                            <div
                              class="mt-2"
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                            >
                              <MultiSelect
                                // label="Select adjustments"
                                values={customAdjustments()}
                                options={PARAM_FIELD_SECTIONS.map(
                                  (section) => ({
                                    value: section.adjustmentKey,
                                    label: td(section.header),
                                  })
                                )}
                                onChange={setCustomAdjustments}
                              />
                            </div>
                          </Show>
                        </div>
                      </div>
                    </>
                  )}
                </For>
              </div>
            </div>
          )}
        </For>
      </div>
    </FormModal>
  );
}
