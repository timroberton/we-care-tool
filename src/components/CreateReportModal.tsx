import { AlertComponentProps, Button, TextArea, MultiSelect } from "panther";
import { createSignal, Show } from "solid-js";
import type { Parameters, Results } from "~/types/mod";
import type { Report } from "~/types/reports";
import { captureAvailableCharts } from "~/utils/image_capture";
import { generateReport } from "~/utils/report_generation";
import { projectStore } from "~/stores/project";
import { uiStore } from "~/stores/ui";
import { getAllChartConfigs } from "~/components/results/_chart_inputs";
import { t } from "~/translate/mod";
import { FormModal } from "./FormModal";

type CustomProps = {
  results: Results;
  params: Parameters;
  projectId: string;
};

export function CreateReportModal(p: AlertComponentProps<CustomProps, void>) {
  const [prompt, setPrompt] = createSignal("");
  const allScenarios = () => p.results.scenarios;
  const [selectedScenarioIndices, setSelectedScenarioIndices] = createSignal<
    number[]
  >(
    allScenarios().map((_, i) => i) // Select all scenarios by default (baseline always included)
  );
  const [isGenerating, setIsGenerating] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [progress, setProgress] = createSignal<string>("");

  async function handleGenerate() {
    if (!prompt().trim()) {
      setError(t("Please enter a prompt"));
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(t("Capturing charts..."));

    try {
      // Filter scenarios (baseline is always included)
      const selected = selectedScenarioIndices();
      const filteredScenarios = allScenarios().filter((_, i) =>
        selected.includes(i)
      );

      // Reconstruct Results object (baseline always included)
      const filteredResults: Results = {
        baseline: p.results.baseline,
        scenarios: filteredScenarios,
      };

      const chartConfigs = getAllChartConfigs(filteredResults);

      setProgress(t("Rendering charts to images..."));
      const availableImages = await captureAvailableCharts(chartConfigs);

      setProgress(t("Generating report with AI..."));

      const country = projectStore.currentProject?.country || "Unknown";
      const userContext = projectStore.userContext;

      const { name, markdown, imageIds } = await generateReport(
        prompt(),
        filteredResults,
        p.params,
        availableImages,
        country,
        userContext,
        (wordCount) => setProgress(`Generating report... ${wordCount} words`),
        projectStore.uploadedFiles
      );

      setProgress(t("Saving report..."));

      // Map used image IDs to their data
      const reportImages = imageIds
        .map((id) => {
          const img = availableImages.find((i) => i.id === id);
          return img ? { id: img.id, data: img.data } : null;
        })
        .filter((img): img is { id: string; data: string } => img !== null);

      const report: Report = {
        id: projectStore.generateReportId(),
        name,
        createdAt: new Date(),
        markdown,
        images: reportImages,
      };

      projectStore.addReport(report);
      uiStore.setSelectedReportId(report.id);
      p.close();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("Failed to generate report")
      );
      setProgress("");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <FormModal
      title={t("Create new report")}
      width="lg"
      actions={
        <>
          <Button
            onClick={handleGenerate}
            intent="primary"
            disabled={isGenerating() || !prompt().trim()}
            iconName="sparkles"
          >
            {isGenerating() ? t("Generating...") : t("Generate report")}
          </Button>
          <Button onClick={() => p.close()} outline disabled={isGenerating()}>
            {t("Cancel")}
          </Button>
        </>
      }
    >
      <Show
        when={allScenarios().length > 0}
        fallback={
          <div class="text-sm">
            {t("You have not yet created any scenarios, so this report will concern the base case only.")}
          </div>
        }
      >
        <div class="ui-spy-sm">
          <div class="font-700 text-sm">
            {t("Select scenarios to include (the base case is always included)")}
          </div>
          <MultiSelect
            values={selectedScenarioIndices().map(String)}
            onChange={(values) =>
              setSelectedScenarioIndices(values.map((v) => parseInt(v)))
            }
            options={allScenarios().map((result, i) => ({
              value: String(i),
              label: `${t("Scenario")} ${i + 1}. ${result.name}`,
            }))}
            // showSelectAll
          />
        </div>
      </Show>

      <div class="ui-spy-sm">
        <div class="font-700 text-sm">
          {t("What would you like the report to focus on?")}
        </div>
        <TextArea
          value={prompt()}
          onChange={setPrompt}
          placeholder={
            allScenarios().length > 0
              ? t("e.g., Compare family planning outcomes across all scenarios")
              : t("e.g., Summarize the baseline abortion care pathways and outcomes")
          }
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
