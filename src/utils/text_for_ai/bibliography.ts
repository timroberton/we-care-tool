import type { SourceInfo, SourceClassification, SourceType } from "~/types/mod";
import { PARAM_FIELD_SECTIONS } from "~/config/param_fields";
import { t, td } from "~/translate/mod";

type SourceEntry = {
  description: string;
  type: string;
  classification: string;
  parameters: string[];
};

const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  survey: "Survey",
  administrative: "Administrative",
  estimate: "Estimate",
  literature: "Literature",
  expert_opinion: "Expert opinion",
  assumption: "Assumption",
  unknown: "",
};

const CLASSIFICATION_LABELS: Record<SourceClassification, string> = {
  high_confidence: "Strong evidence",
  medium_confidence: "Moderate evidence",
  low_confidence: "Weak evidence",
  unclassified: "",
};

export function getBibliography(
  baselineSourceInfo: Record<string, SourceInfo> | undefined
): string {
  if (!baselineSourceInfo || Object.keys(baselineSourceInfo).length === 0) {
    return "";
  }

  const paramLabelMap = new Map<string, string>();
  paramLabelMap.set(
    "pregnancyOutcomes.nUnintendedPregnancies",
    "Number of unintended pregnancies"
  );
  paramLabelMap.set(
    "pregnancyOutcomes.pResultingInMiscarriage",
    "Proportion resulting in miscarriage"
  );

  for (const section of PARAM_FIELD_SECTIONS) {
    for (const field of section.fields) {
      const key = `${field.category}.${field.property}`;
      paramLabelMap.set(key, field.label);
    }
  }

  const sourceMap = new Map<string, SourceEntry>();

  for (const [paramKey, info] of Object.entries(baselineSourceInfo)) {
    if (!info || !info.description) continue;

    const desc = info.description.trim();
    // Skip empty or placeholder-like descriptions
    if (!desc || desc.toLowerCase() === "placeholder" || desc.toLowerCase() === "tbd" || desc.toLowerCase() === "n/a" || desc.toLowerCase() === "none") {
      continue;
    }

    const paramLabel = paramLabelMap.get(paramKey) || paramKey;
    const sourceKey = desc.toLowerCase();

    if (sourceMap.has(sourceKey)) {
      sourceMap.get(sourceKey)!.parameters.push(paramLabel);
    } else {
      const classification = info.classification ?? "unclassified";
      sourceMap.set(sourceKey, {
        description: desc,
        type: info.type && info.type !== "unknown" ? info.type : "",
        classification:
          classification !== "unclassified"
            ? classification.replace("_", " ")
            : "",
        parameters: [paramLabel],
      });
    }
  }

  if (sourceMap.size === 0) {
    return "";
  }

  const lines: string[] = [];
  lines.push("");
  lines.push("DATA SOURCES USED FOR BASE CASE PARAMETERS:");
  lines.push("(Users may refer to this as a bibliography)");
  lines.push("============================================");

  let index = 1;
  for (const entry of sourceMap.values()) {
    lines.push("");
    lines.push(`[${index}] ${entry.description}`);

    const meta: string[] = [];
    if (entry.type) meta.push(`Type: ${entry.type}`);
    if (entry.classification) meta.push(`Confidence: ${entry.classification}`);
    if (meta.length > 0) {
      lines.push(`    ${meta.join(", ")}`);
    }

    lines.push(`    Used for: ${entry.parameters.join("; ")}`);
    index++;
  }

  return lines.join("\n");
}

export function getDataSourcesTableMarkdown(
  baselineSourceInfo: Record<string, SourceInfo> | undefined
): string {
  const rows: string[] = [];
  const sourceInfo = baselineSourceInfo ?? {};

  // Add pregnancy outcomes manually (not in PARAM_FIELD_SECTIONS)
  const pregnancyParams = [
    {
      key: "pregnancyOutcomes.nUnintendedPregnancies",
      category: t("Pregnancy outcomes"),
      label: t("Number of unintended pregnancies"),
    },
    {
      key: "pregnancyOutcomes.pResultingInMiscarriage",
      category: t("Pregnancy outcomes"),
      label: t("Proportion of pregnancies resulting in miscarriage"),
    },
  ];

  for (const param of pregnancyParams) {
    const info = sourceInfo[param.key];
    rows.push(formatTableRow(param.category, param.label, info));
  }

  // Add params from field sections
  for (const section of PARAM_FIELD_SECTIONS) {
    const categoryName = td(section.header);
    for (const field of section.fields) {
      const key = `${field.category}.${field.property}`;
      const info = sourceInfo[key];
      rows.push(formatTableRow(categoryName, td(field.label), info));
    }
  }

  const header = `## ${t("Data Sources")}

| ${t("Parameter category")} | ${t("Indicator")} | ${t("Data source")} | ${t("Source type")} | ${t("Evidence strength")} |
|---|---|---|---|---|`;

  return `\n\n${header}\n${rows.join("\n")}`;
}

function formatTableRow(category: string, indicator: string, info: SourceInfo | undefined): string {
  const notSpecified = `*${t("Not specified")}*`;

  const hasValidDescription = info?.description && !isPlaceholder(info.description);
  const sourceDesc = hasValidDescription ? escapeTableCell(info!.description.trim()) : notSpecified;

  const typeLabel = info?.type ? SOURCE_TYPE_LABELS[info.type] : "";
  const classLabel = info?.classification ? CLASSIFICATION_LABELS[info.classification] : "";

  return `| ${escapeTableCell(category)} | ${escapeTableCell(indicator)} | ${sourceDesc} | ${typeLabel ? td(typeLabel) : notSpecified} | ${classLabel ? td(classLabel) : notSpecified} |`;
}

function isPlaceholder(desc: string): boolean {
  const lower = desc.trim().toLowerCase();
  return !lower || lower === "placeholder" || lower === "tbd" || lower === "n/a" || lower === "none";
}

function escapeTableCell(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\n/g, " ");
}
