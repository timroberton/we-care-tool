import { AlertComponentProps, Button, TextArea } from "panther";
import { createSignal } from "solid-js";
import type { Parameters, Results } from "~/types/mod";
import type { Report } from "~/types/reports";
import { captureAvailableCharts } from "~/utils/image_capture";
import { editReport } from "~/utils/report_generation";
import { projectStore } from "~/stores/project";
import { uiStore } from "~/stores/ui";
import { getAllChartConfigs } from "~/components/results/_chart_inputs";
import { t } from "~/translate/mod";
import { FormModal } from "./FormModal";

type CustomProps = {
  report: Report;
  results: Results;
  params: Parameters;
  projectId: string;
};

export function EditReportModal(p: AlertComponentProps<CustomProps, void>) {
  const [prompt, setPrompt] = createSignal("");
  const [isGenerating, setIsGenerating] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [progress, setProgress] = createSignal<string>("");

  async function handleEdit() {
    if (!prompt().trim()) {
      setError(t("Please enter what you'd like to change"));
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(t("Capturing charts..."));

    try {
      const chartConfigs = getAllChartConfigs(p.results);

      setProgress(t("Rendering charts to images..."));
      const availableImages = await captureAvailableCharts(chartConfigs);

      setProgress(t("Updating report with AI..."));

      const country = projectStore.currentProject?.country || "Unknown";
      const userContext = projectStore.userContext;

      const { name, markdown, imageIds } = await editReport(
        p.report,
        prompt(),
        p.results,
        p.params,
        availableImages,
        country,
        userContext,
        (wordCount) => setProgress(`Updating report... ${wordCount} words`),
        projectStore.uploadedFiles
      );

      setProgress(t("Saving report..."));

      const reportImages = imageIds
        .map((id) => {
          const img = availableImages.find((i) => i.id === id);
          return img ? { id: img.id, data: img.data } : null;
        })
        .filter((img): img is { id: string; data: string } => img !== null);

      const updatedReport: Report = {
        ...p.report,
        name,
        markdown,
        images: reportImages,
        createdAt: p.report.createdAt,
        updatedAt: new Date(),
      };

      projectStore.updateReport(updatedReport);
      uiStore.setSelectedReportId(updatedReport.id);
      p.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Failed to update report"));
      setProgress("");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <FormModal
      title={t("Edit report")}
      width="lg"
      actions={
        <>
          <Button
            onClick={handleEdit}
            intent="primary"
            disabled={isGenerating() || !prompt().trim()}
            iconName="save"
          >
            {isGenerating() ? t("Updating...") : t("Update report")}
          </Button>
          <Button onClick={() => p.close()} outline disabled={isGenerating()}>
            {t("Cancel")}
          </Button>
        </>
      }
    >
      <div class="text-sm text-neutral">
        {t("Current report:")} <span class="font-700">{p.report.name}</span>
      </div>

      <div class="ui-spy-sm">
        <div class="font-700 text-sm">{t("What would you like to change?")}</div>
        <TextArea
          value={prompt()}
          onChange={setPrompt}
          placeholder={t("e.g., Add a section comparing safety outcomes, or change the tone to be more technical")}
          disabled={isGenerating()}
          height="160px"
          resizable={false}
          fullWidth
        />
      </div>

      {progress() && (
        <div class="ui-pad border-primary bg-primary/10 rounded border text-sm">
          {progress()}
        </div>
      )}

      {error() && (
        <div class="ui-pad border-danger bg-danger/10 rounded border text-sm">
          {error()}
        </div>
      )}
    </FormModal>
  );
}
