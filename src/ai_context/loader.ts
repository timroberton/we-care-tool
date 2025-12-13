import background from "./_shared/background.md?raw";
import criticalGuidance from "./_shared/critical_guidance.md?raw";
import dataSources from "./_shared/data_sources.md?raw";
import modelMethodology from "./_shared/model_methodology.md?raw";
import terminology from "./_shared/terminology.md?raw";

import aiAssistantSystemPrompt from "./assistant/system_prompt.md?raw";
import aiAssistantToolInstructions from "./assistant/tool_instructions.md?raw";

import generateReportSystemPrompt from "./report_generator/system_prompt_generate.md?raw";
import editReportSystemPrompt from "./report_generator/system_prompt_edit.md?raw";

import type { Language } from "~/translate/mod";

const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  fr: "French (Français)",
  pt: "Portuguese (Português)",
};

function getLanguageInstruction(lang: Language): string {
  const langName = LANGUAGE_NAMES[lang];
  return `# RESPONSE LANGUAGE: ${langName.toUpperCase()}

**IMPORTANT: The user has selected ${langName} as their language. You MUST write ALL responses in ${langName}.** This includes explanations, analysis, reports, and any other text output. Only use English for technical terms that have no standard translation.`;
}

export function loadAIAssistantSystemPrompt(country: string, userContext?: string, language: Language = "en"): string {
  const countryHeader = `# PROJECT COUNTRY: ${country.toUpperCase()}

**IMPORTANT: All data, parameters, results, and analysis in this project refer specifically to ${country}.**`;

  const parts = [
    countryHeader,
    getLanguageInstruction(language),
    aiAssistantSystemPrompt,
    criticalGuidance,
    background,
    dataSources,
    modelMethodology,
    terminology,
    aiAssistantToolInstructions,
  ];

  if (userContext?.trim()) {
    parts.push(`# USER-PROVIDED CONTEXT

The user has provided the following additional context for this project. Consider this information when responding:

${userContext.trim()}`);
  }

  return parts.join("\n\n");
}

export function loadGenerateReportSystemPrompt(country: string, userContext?: string, language: Language = "en"): string {
  const countryHeader = `# PROJECT COUNTRY: ${country.toUpperCase()}

**IMPORTANT: All data, parameters, results, and analysis in this project refer specifically to ${country}.**`;

  const parts = [
    countryHeader,
    getLanguageInstruction(language),
    generateReportSystemPrompt,
    criticalGuidance,
    background,
    dataSources,
    modelMethodology,
    terminology,
  ];

  if (userContext?.trim()) {
    parts.push(`# USER-PROVIDED CONTEXT

The user has provided the following additional context for this project. Consider this information when generating the report:

${userContext.trim()}`);
  }

  return parts.join("\n\n");
}

export function loadEditReportSystemPrompt(userContext?: string, language: Language = "en"): string {
  const parts = [
    getLanguageInstruction(language),
    editReportSystemPrompt,
    criticalGuidance,
    terminology,
  ];

  if (userContext?.trim()) {
    parts.push(`# USER-PROVIDED CONTEXT

The user has provided the following additional context for this project. Consider this information when editing the report:

${userContext.trim()}`);
  }

  return parts.join("\n\n");
}
