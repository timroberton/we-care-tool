import { createMemo, createSignal, Show } from "solid-js";
import type { Results } from "~/types/mod";
import { getReadableTextFromResults } from "~/utils/text_for_ai/mod";
import { Button, Select, TextArea, type SelectOption } from "panther";
import { loadAIAssistantSystemPrompt } from "~/ai_context/loader";
import { projectStore } from "~/stores/project";
import { t, language } from "~/translate/mod";

type Props = {
  results: Results;
  country: string;
};

type ViewMode = "results" | "systemPrompt";

export function AIDebugText(p: Props) {
  const [viewMode, setViewMode] = createSignal<ViewMode>("systemPrompt");

  const viewModeOptions = (): SelectOption<ViewMode>[] => [
    { value: "systemPrompt", label: t("System prompt") },
    { value: "results", label: t("Results text") },
  ];

  const text = createMemo(() => {
    if (viewMode() === "systemPrompt") {
      return loadAIAssistantSystemPrompt(p.country, projectStore.userContext, language());
    }
    return getReadableTextFromResults(p.results, {
      includeDetailedTable: true,
      country: p.country,
    });
  });

  return (
    <div class="h-full flex flex-col">
      <div class="border-b border-base-300 ui-pad bg-base-100 flex-none">
        {/* <div class="flex items-start justify-between mb-3">
          <h3 class="text-sm font-700">AI Context Debug</h3>
        </div> */}
        <div class="flex ui-gap">
          <Select
            // label="View"
            value={viewMode()}
            options={viewModeOptions()}
            onChange={setViewMode}
            fullWidth
          />
          <Button
            outline
            onClick={() => {
              navigator.clipboard.writeText(text());
            }}
          >
            {t("Copy")}
          </Button>
        </div>
      </div>
      <div class="flex-1 overflow-auto ui-pad h-0">
        <pre class="text-xs font-mono whitespace-pre-wrap">{text()}</pre>
      </div>
    </div>
  );
}

export function AIUserContext() {
  const [isEditing, setIsEditing] = createSignal(false);
  const [draft, setDraft] = createSignal("");

  function handleEdit() {
    setDraft(projectStore.userContext);
    setIsEditing(true);
  }

  function handleSave() {
    projectStore.updateUserContext(draft());
    setIsEditing(false);
  }

  function handleCancel() {
    setIsEditing(false);
  }

  return (
    <div class="h-full flex flex-col">
      <div class="border-b border-base-300 ui-pad bg-base-100 flex-none flex items-center justify-between ui-gap">
        <p class="text-sm text-neutral flex-1 italic">
          {t("Add custom context to include in all AI interactions")}
        </p>
        <Show
          when={isEditing()}
          fallback={
            <Button onClick={handleEdit} outline iconName="pencil">
              {t("Edit")}
            </Button>
          }
        >
          <div class="flex ui-gap-sm">
            <Button onClick={handleCancel} outline>
              {t("Cancel")}
            </Button>
            <Button onClick={handleSave} intent="primary" iconName="check">
              {t("Save")}
            </Button>
          </div>
        </Show>
      </div>
      <div class="flex-1 ui-pad h-0 overflow-auto">
        <Show
          when={isEditing()}
          fallback={
            <Show
              when={projectStore.userContext}
              fallback={
                <p class="text-neutral italic text-sm">
                  {t("No user context provided")}
                </p>
              }
            >
              <pre class="text-xs whitespace-pre-wrap">
                {projectStore.userContext}
              </pre>
            </Show>
          }
        >
          <TextArea
            value={draft()}
            onChange={setDraft}
            placeholder={t("Enter additional context for the AI assistant...")}
            fullHeight
            fullWidth
            mono
          />
        </Show>
      </div>
    </div>
  );
}
