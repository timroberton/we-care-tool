import type { SimpleVizInputs } from "panther";
import type { ScenarioResults } from "~/types/mod";
import { formatTreeBranch } from "./_shared";

type BoxWithConnections = {
  id: string;
  layer: number;
  order: number;
  text: string;
  secondaryText: string;
  children: string[];
  parents: string[];
};

export function getReadableTextFromFlow(
  flowData: SimpleVizInputs["simpleVizData"],
  scenarioName: string,
  modelType: "standard" | "summary" | "full-detail",
  baseline?: ScenarioResults,
  scenarioId?: string
): string {
  const sections: string[] = [];

  sections.push(
    `FLOW DIAGRAM: ${getModelTypeLabel(modelType)} (model_type: ${modelType})`
  );
  if (baseline) {
    sections.push(
      `Scenario: ${scenarioName} (compared to Baseline)${
        scenarioId ? ` (id: ${scenarioId})` : ""
      }`
    );
  } else {
    sections.push(
      `Scenario: ${scenarioName}${scenarioId ? ` (id: ${scenarioId})` : ""}`
    );
  }
  sections.push("");
  sections.push("PATHWAY STRUCTURE:");
  sections.push("");

  const boxMap = new Map<string, BoxWithConnections>();

  for (const box of flowData.boxes) {
    const text = Array.isArray(box.text) ? box.text.join(" ") : box.text || "";
    const secondaryText = Array.isArray(box.secondaryText)
      ? box.secondaryText.join(", ")
      : box.secondaryText || "";

    boxMap.set(box.id, {
      id: box.id,
      layer: box.layer ?? 0,
      order: box.order ?? 0,
      text,
      secondaryText,
      children: [],
      parents: [],
    });
  }

  for (const arrow of flowData.arrows) {
    if (arrow.type === "box-ids" && !arrow.ignoreDuringPlacement) {
      const fromBox = boxMap.get(arrow.fromBoxID);
      const toBox = boxMap.get(arrow.toBoxID);

      if (fromBox && toBox) {
        fromBox.children.push(arrow.toBoxID);
        toBox.parents.push(arrow.fromBoxID);
      }
    }
  }

  const rootBoxes = Array.from(boxMap.values())
    .filter((box) => box.parents.length === 0)
    .sort((a, b) => a.layer - b.layer || a.order - b.order);

  const visited = new Set<string>();

  for (const root of rootBoxes) {
    renderBox(root, 0, true, boxMap, visited, sections);
  }

  if (modelType === "standard" || modelType === "full-detail") {
    sections.push("");
    sections.push("ABORTION OUTCOMES SUMMARY:");
    sections.push("");

    const outcomeBoxes = Array.from(boxMap.values())
      .filter((box) => box.id.startsWith("outcome-"))
      .sort((a, b) => a.order - b.order);

    for (const box of outcomeBoxes) {
      sections.push(`  ${box.text}: ${box.secondaryText}`);
    }

    const noAbortionBox = boxMap.get("no-abortion");
    if (noAbortionBox) {
      sections.push(`  ${noAbortionBox.text}: ${noAbortionBox.secondaryText}`);
    }
  }

  return sections.join("\n");
}

function renderBox(
  box: BoxWithConnections,
  level: number,
  isLast: boolean,
  boxMap: Map<string, BoxWithConnections>,
  visited: Set<string>,
  sections: string[]
): void {
  if (visited.has(box.id)) {
    return;
  }

  visited.add(box.id);

  const branch = formatTreeBranch(isLast, level, box.children.length > 0);
  const line = `${branch}${box.text}: ${box.secondaryText}`;

  sections.push(line);

  const childBoxes = box.children
    .map((childId) => boxMap.get(childId))
    .filter((child): child is BoxWithConnections => child !== undefined)
    .sort((a, b) => a.layer - b.layer || a.order - b.order);

  childBoxes.forEach((child, index) => {
    const isLastChild = index === childBoxes.length - 1;
    renderBox(child, level + 1, isLastChild, boxMap, visited, sections);
  });
}

function getModelTypeLabel(modelType: string): string {
  const labels: Record<string, string> = {
    standard: "Standard Detail",
    summary: "Summary",
    "full-detail": "Full Detail (with all intermediate steps)",
  };

  return labels[modelType] || modelType;
}
