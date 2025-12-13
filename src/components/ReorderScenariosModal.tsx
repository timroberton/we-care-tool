import { AlertComponentProps, Button, TimSortableVertical } from "panther";
import { createSignal, Show } from "solid-js";
import type { Parameters, ScenarioParameters } from "~/types/mod";
import type { SetStoreFunction } from "solid-js/store";
import { uiStore } from "~/stores/ui";
import { t } from "~/translate/mod";
import { FormModal } from "./FormModal";

type CustomProps = {
  params: Parameters;
  setParams: SetStoreFunction<Parameters>;
};

export function ReorderScenariosModal(
  p: AlertComponentProps<CustomProps, void>
) {
  const [localScenarios, setLocalScenarios] = createSignal<
    ScenarioParameters[]
  >([...p.params.scenarios]);

  function handleSave() {
    p.setParams("scenarios", localScenarios());
    uiStore.setExpandedScenarioIndex(null);
    p.close();
  }

  function handleDelete(scenario: ScenarioParameters) {
    setLocalScenarios((prev) => prev.filter((s) => s.id !== scenario.id));
  }

  return (
    <FormModal
      title={t("Edit and reorder scenarios")}
      width="md"
      actions={
        <>
          <Button onClick={handleSave} intent="primary" iconName="save">
            {t("Save")}
          </Button>
          <Button onClick={() => p.close()} outline>
            {t("Cancel")}
          </Button>
        </>
      }
    >
      <Show
        when={localScenarios().length > 0}
        fallback={<div class="text-neutral">{t("No scenarios")}</div>}
      >
        <div class="text-sm text-neutral">
          {t("Drag and drop to reorder scenarios")}
        </div>

        <TimSortableVertical
          items={localScenarios()}
          setItems={setLocalScenarios as any}
          showHandle={true}
          handlePosition="left"
        >
          {(scenario) => (
            <div class="border rounded border-base-300 ui-pad bg-base-100 flex items-center">
              <div class="font-700 flex-1">{scenario.name}</div>
              <div class="flex-none -my-2">
                <Button
                  iconName="trash"
                  outline
                  intent="danger"
                  onClick={() => handleDelete(scenario)}
                />
              </div>
            </div>
          )}
        </TimSortableVertical>
      </Show>
    </FormModal>
  );
}
