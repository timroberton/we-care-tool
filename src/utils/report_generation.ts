import type { Parameters, Results } from "~/types/mod";
import type { AvailableImage } from "~/types/reports";
import {
  loadGenerateReportSystemPrompt,
  loadEditReportSystemPrompt,
} from "~/ai_context/loader";
import type { UploadedFile } from "~/stores/project";
import { language, type Language } from "~/translate/mod";
import { getDataSourcesTableMarkdown } from "~/utils/text_for_ai/mod";

type DocumentRef = {
  file_id: string;
  title?: string;
};

type ReportGenerationContext = {
  userPrompt: string;
  results: Results;
  params: Parameters;
  availableImages: AvailableImage[];
};

export function buildReportContext(
  userPrompt: string,
  results: Results,
  params: Parameters,
  availableImages: AvailableImage[]
): ReportGenerationContext {
  return {
    userPrompt,
    results,
    params,
    availableImages,
  };
}

function buildMessageContent(
  textMessage: string,
  documentRefs: DocumentRef[]
): string | Array<{ type: "document"; source: { type: "file"; file_id: string }; title?: string; cache_control: { type: "ephemeral" } } | { type: "text"; text: string }> {
  if (documentRefs.length === 0) {
    return textMessage;
  }

  const documentBlocks = documentRefs.map((ref) => ({
    type: "document" as const,
    source: { type: "file" as const, file_id: ref.file_id },
    title: ref.title,
    cache_control: { type: "ephemeral" as const },
  }));

  return [
    ...documentBlocks,
    { type: "text" as const, text: textMessage },
  ];
}

export async function generateReportWithAI(
  context: ReportGenerationContext,
  country: string,
  userContext?: string,
  onProgress?: (wordCount: number) => void,
  uploadedFiles?: UploadedFile[]
): Promise<{ name: string; markdown: string; imageIds: string[] }> {
  const systemPrompt = loadGenerateReportSystemPrompt(country, userContext, language());

  const imageList = context.availableImages
    .map((img) => `- ${img.id}: ${img.description}`)
    .join("\n");

  const userMessage = `<user_request>
${context.userPrompt}
</user_request>

<results>
${JSON.stringify(context.results, null, 2)}
</results>

<parameters>
${JSON.stringify(context.params, null, 2)}
</parameters>

<available_images>
${imageList}
</available_images>`;

  // Convert uploaded files to document refs
  const documentRefs: DocumentRef[] = (uploadedFiles || []).map((f) => ({
    file_id: f.file_id,
    title: f.filename,
  }));

  const messageContent = buildMessageContent(userMessage, documentRefs);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 600000); // 10 minute timeout

  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 32768,
        temperature: 0.3,
        stream: true,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: messageContent,
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API error (${response.status}): ${errorText || response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    if (!reader) {
      throw new Error("No response body");
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const event = JSON.parse(data);
            if (
              event.type === "content_block_delta" &&
              event.delta?.type === "text_delta"
            ) {
              fullText += event.delta.text;
              if (onProgress && fullText.trim()) {
                const wordCount = fullText.trim().split(/\s+/).length;
                onProgress(wordCount);
              }
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    }

    if (!fullText) {
      throw new Error("No content in AI response");
    }

    // Append deterministic data sources table
    const dataSourcesTable = getDataSourcesTableMarkdown(context.params.baselineSourceInfo);
    if (dataSourcesTable) {
      fullText = fullText.trimEnd() + dataSourcesTable;
    }

    // Extract title from first line (should be # Title)
    const lines = fullText.trim().split("\n");
    const firstLine = lines[0] || "";
    const name = firstLine.startsWith("#")
      ? firstLine.replace(/^#+\s*/, "").trim()
      : "Untitled Report";

    // Extract image IDs used in markdown
    const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const imageIds: string[] = [];
    let match;
    while ((match = imagePattern.exec(fullText)) !== null) {
      imageIds.push(match[2]);
    }

    return {
      name,
      markdown: fullText,
      imageIds,
    };
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error("Request timed out after 10 minutes. Please try again with a simpler prompt.");
    }
    throw error;
  }
}

export async function generateReport(
  userPrompt: string,
  results: Results,
  params: Parameters,
  availableImages: AvailableImage[],
  country: string,
  userContext?: string,
  onProgress?: (wordCount: number) => void,
  uploadedFiles?: UploadedFile[]
): Promise<{ name: string; markdown: string; imageIds: string[] }> {
  const context = buildReportContext(
    userPrompt,
    results,
    params,
    availableImages
  );
  return generateReportWithAI(context, country, userContext, onProgress, uploadedFiles);
}

export async function editReport(
  existingReport: { name: string; markdown: string },
  changePrompt: string,
  results: Results,
  params: Parameters,
  availableImages: AvailableImage[],
  country: string,
  userContext?: string,
  onProgress?: (wordCount: number) => void,
  uploadedFiles?: UploadedFile[]
): Promise<{ name: string; markdown: string; imageIds: string[] }> {
  const systemPrompt = loadEditReportSystemPrompt(userContext, language());

  const imageList = availableImages
    .map((img) => `- ${img.id}: ${img.description}`)
    .join("\n");

  const userMessage = `<existing_report>
${existingReport.markdown}
</existing_report>

<requested_changes>
${changePrompt}
</requested_changes>

<results>
${JSON.stringify(results, null, 2)}
</results>

<parameters>
${JSON.stringify(params, null, 2)}
</parameters>

<available_images>
${imageList}
</available_images>`;

  // Convert uploaded files to document refs
  const documentRefs: DocumentRef[] = (uploadedFiles || []).map((f) => ({
    file_id: f.file_id,
    title: f.filename,
  }));

  const messageContent = buildMessageContent(userMessage, documentRefs);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 600000); // 10 minute timeout

  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 32768,
        temperature: 0.3,
        stream: true,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: messageContent,
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API error (${response.status}): ${errorText || response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    if (!reader) {
      throw new Error("No response body");
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const event = JSON.parse(data);
            if (
              event.type === "content_block_delta" &&
              event.delta?.type === "text_delta"
            ) {
              fullText += event.delta.text;
              if (onProgress && fullText.trim()) {
                const wordCount = fullText.trim().split(/\s+/).length;
                onProgress(wordCount);
              }
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    }

    if (!fullText) {
      throw new Error("No content in AI response");
    }

    // Strip any existing data sources section and append fresh one
    fullText = stripDataSourcesSection(fullText);
    const dataSourcesTable = getDataSourcesTableMarkdown(params.baselineSourceInfo);
    if (dataSourcesTable) {
      fullText = fullText.trimEnd() + dataSourcesTable;
    }

    const lines = fullText.trim().split("\n");
    const firstLine = lines[0] || "";
    const name = firstLine.startsWith("#")
      ? firstLine.replace(/^#+\s*/, "").trim()
      : existingReport.name;

    const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const imageIds: string[] = [];
    let match;
    while ((match = imagePattern.exec(fullText)) !== null) {
      imageIds.push(match[2]);
    }

    return {
      name,
      markdown: fullText,
      imageIds,
    };
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error("Request timed out after 10 minutes. Please try again with a simpler prompt.");
    }
    throw error;
  }
}

function stripDataSourcesSection(markdown: string): string {
  // Remove any existing "## Data Sources" section (in any language)
  // Match "## Data Sources" or translated versions, followed by content until next ## or end
  const patterns = [
    /\n\n## Data Sources\n[\s\S]*?(?=\n\n## |\n*$)/gi,
    /\n\n## Sources de données\n[\s\S]*?(?=\n\n## |\n*$)/gi,
    /\n\n## Fontes de Dados\n[\s\S]*?(?=\n\n## |\n*$)/gi,
  ];

  let result = markdown;
  for (const pattern of patterns) {
    result = result.replace(pattern, "");
  }
  return result;
}
