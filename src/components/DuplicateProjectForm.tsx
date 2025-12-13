import { AlertComponentProps, Button, Input } from "panther";
import { createSignal, Show } from "solid-js";
import { t } from "~/translate/mod";
import { FormModal } from "./FormModal";

type DuplicateProjectResult = {
  name: string;
};

type DuplicateProjectFormProps = {
  currentName: string;
};

export function DuplicateProjectForm(
  p: AlertComponentProps<DuplicateProjectFormProps, DuplicateProjectResult>
) {
  const [projectName, setProjectName] = createSignal<string>("");
  const [isSaving, setIsSaving] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  async function handleSave() {
    setError(null);
    setIsSaving(true);

    const goodName = projectName().trim();
    if (!goodName) {
      setError(t("You must enter a project name"));
      setIsSaving(false);
      return;
    }

    if (goodName === p.currentName) {
      setError(t("New name must be different from current name"));
      setIsSaving(false);
      return;
    }

    p.close({
      name: goodName,
    });
  }

  return (
    <FormModal
      title={t("Duplicate project")}
      width="md"
      actions={
        <>
          <Button
            onClick={handleSave}
            intent="primary"
            loading={isSaving()}
            iconName="copy"
          >
            {t("Duplicate")}
          </Button>
          <Button onClick={() => p.close(undefined)} outline>
            {t("Cancel")}
          </Button>
        </>
      }
    >
      <div class="mb-2">
        {t("Duplicating project")} <span class="font-700">{p.currentName}</span>
      </div>

      <Input
        label={t("New project name")}
        value={projectName()}
        onChange={setProjectName}
        fullWidth
        autoFocus
      />

      <Show when={error()}>
        <div class="text-danger text-sm">{error()}</div>
      </Show>
    </FormModal>
  );
}
