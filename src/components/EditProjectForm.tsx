import {
  AlertComponentProps,
  Button,
  Checkbox,
  Input,
  timActionDelete,
} from "panther";
import { createSignal, Show } from "solid-js";
import { projectStore, type Project } from "~/stores/project";
import { uiStore } from "~/stores/ui";
import { t } from "~/translate/mod";
import { FormModal } from "./FormModal";

export function EditProjectForm(
  p: AlertComponentProps<
    {
      project: Project;
    },
    | "NEEDS_UPDATE"
    | "DELETED"
    | { action: "DUPLICATE_REQUESTED"; projectId: string; projectName: string }
  >
) {
  const [tempName, setTempName] = createSignal<string>(p.project.name);
  const [isSaving, setIsSaving] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  async function handleSave() {
    setError(null);
    setIsSaving(true);

    const goodName = tempName().trim();
    if (!goodName) {
      setError(t("You must enter a project name"));
      setIsSaving(false);
      return;
    }

    projectStore.updateProjectName(goodName);
    p.close("NEEDS_UPDATE");
  }

  async function handleDelete() {
    const deleteAction = timActionDelete(
      {
        text: t("Are you sure you want to delete this project?"),
        itemList: [p.project.name],
      },
      async () => {
        await projectStore.deleteProject(p.project.id);
        return { success: true };
      },
      () => p.close("DELETED")
    );

    await deleteAction.click();
  }

  async function handleDuplicate() {
    p.close({
      action: "DUPLICATE_REQUESTED",
      projectId: p.project.id,
      projectName: p.project.name,
    });
  }

  return (
    <FormModal
      title={t("Edit project")}
      width="md"
      actions={
        <>
          <Button
            onClick={handleSave}
            intent="primary"
            loading={isSaving()}
            iconName="save"
          >
            {t("Save")}
          </Button>
          <Button onClick={() => p.close(undefined)} outline>
            {t("Cancel")}
          </Button>
          <div class="flex-1"></div>
          <Button
            onClick={handleDuplicate}
            outline
            iconName="copy"
            intent="neutral"
          >
            {t("Duplicate project")}
          </Button>
          <Button
            onClick={handleDelete}
            intent="danger"
            outline
            iconName="trash"
          >
            {t("Delete project")}
          </Button>
        </>
      }
    >
      <Show when={error()}>
        <div class="text-danger text-sm">{error()}</div>
      </Show>
      <Input
        label={t("Project name")}
        value={tempName()}
        onChange={setTempName}
        fullWidth
        autoFocus
      />

      <Show when={p.project.baselineMetadata}>
        <div class="border border-base-300 rounded ui-pad-sm bg-base-200 ui-spy-sm">
          <div class="text-sm font-700">{t("Baseline data source")}</div>
          <Show
            when={
              p.project.baselineMetadata?.type === "project-creation"
                ? p.project.baselineMetadata
                : null
            }
          >
            {(metadata) => (
              <div>
                <div class="text-sm">
                  <span class="text-base-content/60">{t("Source:")}</span>{" "}
                  {metadata().dataSource.label}
                </div>
                {/* <div class="text-sm">
                  <span class="text-base-content/60">File:</span>{" "}
                  {metadata().dataSource.filename}
                </div> */}
                <div class="text-sm">
                  <span class="text-base-content/60">{t("Imported:")}</span>{" "}
                  {metadata().importedAt.toLocaleDateString()}{" "}
                  {metadata().importedAt.toLocaleTimeString()}
                </div>
              </div>
            )}
          </Show>
          <Show
            when={
              p.project.baselineMetadata?.type === "csv-upload"
                ? p.project.baselineMetadata
                : null
            }
          >
            {(metadata) => (
              <div>
                <div class="text-sm">
                  <span class="text-base-content/60">{t("Source:")}</span> {t("CSV upload")}
                </div>
                <div class="text-sm">
                  <span class="text-base-content/60">{t("File:")}</span>{" "}
                  {metadata().filename}
                </div>
                <div class="text-sm">
                  <span class="text-base-content/60">{t("Imported:")}</span>{" "}
                  {metadata().importedAt.toLocaleDateString()}{" "}
                  {metadata().importedAt.toLocaleTimeString()}
                </div>
              </div>
            )}
          </Show>
        </div>
      </Show>

      <div class="ui-spy-sm">
        <Checkbox
          label={t("Show system context tab in AI pane")}
          checked={uiStore.debugMode}
          onChange={uiStore.toggleDebugMode}
        />
        <Checkbox
          label={t("Show R script tab in Results pane")}
          checked={uiStore.showRScript}
          onChange={uiStore.toggleShowRScript}
        />
      </div>
    </FormModal>
  );
}
