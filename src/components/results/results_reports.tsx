import {
  Button,
  convertMarkdownToWordDocument,
  openComponent,
  saveAs,
  Select,
  StateHolderWrapper,
  timActionDelete,
  wordDocumentToBlob,
  MarkdownPresentation,
  type StateHolder,
} from "panther";
import { Show, createEffect, createMemo, createSignal } from "solid-js";
import type { Parameters, Results, Report } from "~/types/mod";
import { CreateReportModal } from "~/components/CreateReportModal";
import { EditReportModal } from "~/components/EditReportModal";
import { projectStore } from "~/stores/project";
import { uiStore } from "~/stores/ui";
import { cleanFilename } from "~/utils/clean_filename";
import { trackDeep } from "@solid-primitives/deep";
import { t } from "~/translate/mod";

type Props = {
  results: Results;
  params: Parameters;
  projectId: string;
};

export function ResultsReports(p: Props) {
  const selectedReport = createMemo(() => {
    trackDeep(projectStore.reports);
    void uiStore.selectedReportId;
    return (
      projectStore.reports.find((r) => r.id === uiStore.selectedReportId) ||
      null
    );
  });

  // Auto-select first report if none selected and reports exist
  createEffect(() => {
    trackDeep(projectStore.reports);
    const currentSelectedId = uiStore.selectedReportId;

    // Auto-select first if nothing selected
    if (!currentSelectedId && projectStore.reports.length > 0) {
      uiStore.setSelectedReportId(projectStore.reports[0].id);
      return;
    }

    // Clear selection only if report no longer exists
    // But DON'T clear immediately - give store updates time to complete
    // This prevents race conditions when updateReport is called
    if (
      currentSelectedId &&
      !projectStore.reports.find((r) => r.id === currentSelectedId)
    ) {
      // Use queueMicrotask to run after current batch of updates completes
      queueMicrotask(() => {
        const stillMissing = !projectStore.reports.find(
          (r) => r.id === currentSelectedId
        );
        if (stillMissing) {
          uiStore.setSelectedReportId(
            projectStore.reports.length > 0 ? projectStore.reports[0].id : null
          );
        }
      });
    }
  });

  async function handleCreateReport() {
    await openComponent({
      element: CreateReportModal,
      props: {
        results: p.results,
        params: p.params,
        projectId: p.projectId,
      },
    });
  }

  async function handleEditReport() {
    const report = selectedReport();
    if (!report) return;

    await openComponent({
      element: EditReportModal,
      props: {
        report,
        results: p.results,
        params: p.params,
        projectId: p.projectId,
      },
    });
  }

  async function handleDeleteReport() {
    if (!uiStore.selectedReportId) return;

    const report = selectedReport();
    if (!report) return;

    const deleteAction = timActionDelete(
      {
        text: t("Are you sure you want to delete this report?"),
        itemList: [report.name],
      },
      async () => {
        projectStore.deleteReport(uiStore.selectedReportId!);
        uiStore.setSelectedReportId(null);
        return { success: true };
      }
    );

    await deleteAction.click();
  }

  async function handleDownloadWord() {
    const report = selectedReport();
    if (!report) return;

    let md = report.markdown;

    report.images.forEach((img) => {
      const pattern = new RegExp(`!\\[([^\\]]*)\\]\\(${img.id}\\)`, "g");
      md = md.replace(pattern, `![[$1]](${img.data})`);
    });

    const disclaimer = `---

**${t("AI-Generated Content")}**

${t("This report was generated using artificial intelligence. Please review all content for accuracy and verify any critical information.")}

---

`;

    md = disclaimer + md;

    const wordDocument = convertMarkdownToWordDocument(md);
    const blob = await wordDocumentToBlob(wordDocument);
    const filename = cleanFilename(report.name);
    saveAs(blob, `${filename}.docx`);
  }

  return (
    <div class="h-full flex flex-col">
      <div class="ui-pad border-b border-base-300 flex items-center ui-gap-sm">
        <div class="flex-1">
          <Show
            when={[
              {
                value: "",
                label:
                  projectStore.reports.length === 0
                    ? t("No reports yet")
                    : t("Select a report..."),
              },
              ...projectStore.reports.map((report) => ({
                value: report.id,
                label: report.name,
              })),
            ]}
            keyed
          >
            {(options) => {
              return (
                <Select
                  value={uiStore.selectedReportId || ""}
                  onChange={(value) =>
                    uiStore.setSelectedReportId(value || null)
                  }
                  options={options}
                  fullWidth
                />
              );
            }}
          </Show>
        </div>

        <Show when={uiStore.selectedReportId}>
          <Button onClick={handleEditReport} outline iconName="pencil">
            {/* Edit */}
          </Button>
          <Button onClick={handleDeleteReport} outline iconName="trash">
            {/* Delete */}
          </Button>
          <Button onClick={handleDownloadWord} outline iconName="download">
            {t("Word")}
          </Button>
        </Show>
        <Button onClick={handleCreateReport} intent="primary" iconName="plus">
          {t("Create report")}
        </Button>
      </div>

      <div class="flex-1 overflow-auto">
        <Show
          when={selectedReport()}
          fallback={
            <div class="ui-pad flex items-center justify-center h-full text-neutral">
              <div class="text-center ui-spy-sm">
                <p class="text-lg">{t("No report selected")}</p>
                <p class="text-sm">
                  {t("Create a new report or select one from the dropdown")}
                </p>
              </div>
            </div>
          }
          keyed
        >
          {(r) => {
            return (
              <div class="ui-pad ui-spy">
                <div class="text-sm text-neutral mb-4">
                  {t("Created:")} {r.createdAt.toLocaleString()}
                  {r.updatedAt && (
                    <span class="ml-2">
                      ({t("Updated:")} {r.updatedAt.toLocaleString()})
                    </span>
                  )}
                </div>

                <ReportRenderer report={r} />
              </div>
            );
          }}
        </Show>
      </div>
    </div>
  );
}

function ReportRenderer(p: { report: Report }) {
  const [markdownState, setMarkdownState] = createSignal<StateHolder<string>>({
    status: "loading",
    msg: "Loading...",
  });

  createEffect(() => {
    trackDeep(p.report);

    setMarkdownState({ status: "loading", msg: "Loading..." });

    setTimeout(() => {
      let md = p.report.markdown;

      p.report.images.forEach((img) => {
        const pattern = new RegExp(`!\\[([^\\]]*)\\]\\(${img.id}\\)`, "g");
        md = md.replace(pattern, `![[$1]](${img.data})`);
      });

      setMarkdownState({ status: "ready", data: md });
    }, 0);
  });

  return (
    <div>
      <div class="ui-pad mb-8 bg-danger/12 border text-danger border-danger rounded">
        <div class="font-700 mb-1">{t("AI-Generated Content")}</div>
        <div class="text-sm">
          {t("This report was generated using artificial intelligence. Please review all content for accuracy and verify any critical information.")}
        </div>
      </div>
      <StateHolderWrapper state={markdownState()} noPad>
        {(markdown) => <MarkdownPresentation markdown={markdown} />}
      </StateHolderWrapper>
    </div>
  );
}
