import {
  AlertComponentProps,
  Button,
  Input,
  MultiSelect,
  timActionDelete,
} from "panther";
import { createSignal } from "solid-js";
import type { Parameters } from "~/types/mod";
import type { SetStoreFunction } from "solid-js/store";
import {
  PARAM_FIELD_SECTIONS,
  type AdjustmentKey,
} from "~/config/param_fields";
import * as ScenarioActions from "~/utils/scenario_actions";
import { t, td } from "~/translate/mod";
import { FormModal } from "./FormModal";

type CustomProps = {
  params: Parameters;
  setParams: SetStoreFunction<Parameters>;
  scenarioIndex: number;
};

export function EditScenarioModal(p: AlertComponentProps<CustomProps, void>) {
  const scenario = () => p.params.scenarios[p.scenarioIndex];

  const [name, setName] = createSignal(scenario().name);
  const [selectedAdjustments, setSelectedAdjustments] = createSignal<
    AdjustmentKey[]
  >(
    (Object.keys(scenario().adjustments) as AdjustmentKey[]).filter(
      (key) => scenario().adjustments[key]
    )
  );

  function handleSave() {
    p.setParams("scenarios", p.scenarioIndex, "name", name());

    const allKeys = Object.keys(scenario().adjustments) as AdjustmentKey[];
    allKeys.forEach((key) => {
      p.setParams(
        "scenarios",
        p.scenarioIndex,
        "adjustments",
        key,
        selectedAdjustments().includes(key)
      );
    });

    p.close();
  }

  async function handleDelete() {
    const deleteAction = timActionDelete(
      {
        text: t("Are you sure you want to delete this scenario?"),
        itemList: [scenario().name],
      },
      async () => {
        ScenarioActions.removeScenario(p.params, p.setParams, p.scenarioIndex);
        return { success: true };
      },
      () => p.close()
    );

    await deleteAction.click();
  }

  return (
    <FormModal
      title={t("Edit scenario")}
      width="md"
      actions={
        <>
          <Button onClick={handleSave} intent="primary" iconName="save">
            {t("Save")}
          </Button>
          <Button onClick={() => p.close()} outline>
            {t("Cancel")}
          </Button>
          <div class="flex-1"></div>
          <Button
            onClick={handleDelete}
            intent="danger"
            iconName="trash"
            outline
          >
            {t("Delete scenario")}
          </Button>
        </>
      }
    >
      <Input
        label={t("Scenario name")}
        value={name()}
        onChange={setName}
        fullWidth
      />

      <MultiSelect
        label={t("Select adjustments")}
        values={selectedAdjustments()}
        options={PARAM_FIELD_SECTIONS.map((section) => ({
          value: section.adjustmentKey,
          label: td(section.header),
        }))}
        onChange={setSelectedAdjustments}
        // showSelectAll
      />
    </FormModal>
  );
}
