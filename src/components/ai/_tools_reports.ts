import type { AITool } from "panther";
import type { Parameters, Results } from "~/types/mod";
import type { Report } from "~/types/reports";
import { generateReport, editReport } from "~/utils/report_generation";
import { captureAvailableCharts } from "~/utils/image_capture";
import { getAllChartConfigs } from "~/components/results/_chart_inputs";
import { projectStore } from "~/stores/project";
import { uiStore } from "~/stores/ui";

type CreateReportInput = {
  focus?: string;
  includeRecommendations?: boolean;
};

type ViewReportInput = {
  reportId?: string;
};

type EditReportInput = {
  reportId?: string;
  changePrompt?: string;
};

type ToolsContext = {
  results: () => Results;
  params: () => Parameters;
};

export function createReportTools(context: ToolsContext) {
  const createReportTool: AITool<CreateReportInput, string> = {
    name: "create_report",
    description:
      "GENERATE A NEW REPORT analyzing scenarios. Use when the user asks to create a report, document, or analysis comparing scenarios. Creates a formatted markdown report with embedded charts that gets saved to the Reports tab. Specify what the report should focus on (e.g., 'compare all scenarios', 'analyze family planning impact'). This creates NEW reports - use edit_report to modify existing ones.",
    input_schema: {
      type: "object",
      properties: {
        focus: {
          type: "string",
          description:
            "REQUIRED. Description of what the report should focus on (e.g., 'Compare family planning outcomes across all scenarios', 'Analyze impact of access barriers'). This is the user's prompt for what they want the report to cover.",
        },
        includeRecommendations: {
          type: "boolean",
          description:
            "Whether to include policy recommendations in the report (default: true)",
        },
      },
      required: ["focus"],
    },
    handler: async (input: CreateReportInput) => {
      try {
        if (!input.focus?.trim()) {
          return "Error: focus parameter is required. Please specify what the report should analyze.";
        }

        const results = context.results();
        const params = context.params();
        const chartConfigs = getAllChartConfigs(results);
        const availableImages = await captureAvailableCharts(chartConfigs);

        const country = projectStore.currentProject?.country || "Unknown";

        const userContext = projectStore.userContext;

        const { name, markdown, imageIds } = await generateReport(
          input.focus,
          results,
          params,
          availableImages,
          country,
          userContext,
          undefined,
          projectStore.uploadedFiles
        );

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

        return `Successfully created report "${name}". The report has been saved to the project and is now displayed in the Reports tab.`;
      } catch (error) {
        return `Error creating report: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    },
    inProgressLabel: "Generating report...",
  };

  const listReportsTool: AITool<Record<string, never>, string> = {
    name: "list_reports",
    description:
      "SHOW ALL SAVED REPORTS in the project. Returns report IDs (needed for viewing/editing), names, dates, and which is currently selected. Use this first when the user asks about existing reports or wants to view/edit a report.",
    input_schema: {
      type: "object",
      properties: {},
    },
    handler: async () => {
      const reports = projectStore.reports;

      if (reports.length === 0) {
        return "No reports found in the current project. Use create_report to generate a new report.";
      }

      const selectedId = uiStore.selectedReportId;

      const reportList = reports.map((report, index) => {
        const created = report.createdAt.toLocaleString();
        const updated = report.updatedAt?.toLocaleString();
        const imageCount = report.images.length;
        const selected = report.id === selectedId ? " [SELECTED]" : "";
        const dates = updated ? `Created: ${created}\n   Updated: ${updated}` : `Created: ${created}`;
        return `${index + 1}. "${report.name}" (id: ${report.id})${selected}
   ${dates}
   Images: ${imageCount}`;
      });

      return `AVAILABLE REPORTS:\n\n${reportList.join("\n\n")}`;
    },
    inProgressLabel: "Listing reports...",
  };

  const viewReportTool: AITool<ViewReportInput, string> = {
    name: "view_report",
    description:
      "READ AN EXISTING REPORT'S CONTENT. Returns the full markdown text and metadata of a saved report. Use when the user wants to see what's in a report. For making changes to a report, use edit_report instead. Get reportId from list_reports.",
    input_schema: {
      type: "object",
      properties: {
        reportId: {
          type: "string",
          description:
            "REQUIRED. The unique ID of the report to view. Use list_reports tool to see report IDs.",
        },
      },
      required: ["reportId"],
      additionalProperties: false,
    },
    handler: async (input: ViewReportInput) => {
      if (!input.reportId) {
        return "Error: reportId is required. Use list_reports to see available report IDs.";
      }

      const report = projectStore.reports.find((r) => r.id === input.reportId);

      if (!report) {
        const available = projectStore.reports
          .map((r) => `"${r.name}" (id: ${r.id})`)
          .join(", ");
        return `Error: Report with ID '${input.reportId}' not found. Available reports: [${available}]`;
      }

      const created = report.createdAt.toLocaleString();
      const updated = report.updatedAt?.toLocaleString();
      const imageIds = report.images.map((img) => img.id).join(", ");

      return `REPORT: "${report.name}"
Created: ${created}${updated ? `\nUpdated: ${updated}` : ""}
Images: ${imageIds || "none"}

CONTENT:
${report.markdown}`;
    },
    inProgressLabel: "Viewing report...",
  };

  const editReportTool: AITool<EditReportInput, string> = {
    name: "edit_report",
    description:
      "MODIFY AN EXISTING REPORT with AI-generated changes. Use when the user wants to update, revise, or change a saved report (e.g., 'add a section about...', 'make it shorter', 'update with new data'). This UPDATES existing reports - use create_report for new ones. Requires reportId from list_reports and a description of what changes to make.",
    input_schema: {
      type: "object",
      properties: {
        reportId: {
          type: "string",
          description:
            "REQUIRED. The unique ID of the report to edit. Use list_reports tool to see report IDs.",
        },
        changePrompt: {
          type: "string",
          description:
            "REQUIRED. Description of what changes to make to the report (e.g., 'Add more detail about family planning outcomes', 'Update the conclusion to emphasize policy recommendations').",
        },
      },
      required: ["reportId", "changePrompt"],
      additionalProperties: false,
    },
    handler: async (input: EditReportInput) => {
      try {
        if (!input.reportId) {
          return "Error: reportId is required. Use list_reports to see available report IDs.";
        }

        if (!input.changePrompt?.trim()) {
          return "Error: changePrompt is required. Please specify what changes to make to the report.";
        }

        const existingReport = projectStore.reports.find(
          (r) => r.id === input.reportId
        );

        if (!existingReport) {
          const available = projectStore.reports
            .map((r) => `"${r.name}" (id: ${r.id})`)
            .join(", ");
          return `Error: Report with ID '${input.reportId}' not found. Available reports: [${available}]`;
        }

        const results = context.results();
        const params = context.params();
        const chartConfigs = getAllChartConfigs(results);
        const availableImages = await captureAvailableCharts(chartConfigs);

        const country = projectStore.currentProject?.country || "Unknown";
        const userContext = projectStore.userContext;

        const { name, markdown, imageIds } = await editReport(
          { name: existingReport.name, markdown: existingReport.markdown },
          input.changePrompt,
          results,
          params,
          availableImages,
          country,
          userContext,
          undefined,
          projectStore.uploadedFiles
        );

        const reportImages = imageIds
          .map((id) => {
            const img = availableImages.find((i) => i.id === id);
            return img ? { id: img.id, data: img.data } : null;
          })
          .filter((img): img is { id: string; data: string } => img !== null);

        const updatedReport: Report = {
          ...existingReport,
          name,
          markdown,
          images: reportImages,
          updatedAt: new Date(),
        };

        projectStore.updateReport(updatedReport);

        uiStore.setSelectedReportId(input.reportId);

        return `Successfully updated report "${name}". The changes have been saved and the report is now displayed in the Reports tab.`;
      } catch (error) {
        return `Error editing report: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    },
    inProgressLabel: "Editing report...",
  };

  return [
    createReportTool,
    listReportsTool,
    viewReportTool,
    editReportTool,
  ] as AITool[];
}
