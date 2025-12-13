import type { Goal } from "~/components/results/_result_goals";
import { getAdjustedColor } from "panther";

export type ComparisonResult = "better" | "worse" | "neutral";

export function compareToBaseline(
  value: number,
  baseline: number,
  goal: Goal
): ComparisonResult {
  if (goal === "neutral" || value === baseline) {
    return "neutral";
  }

  const increased = value > baseline;

  if (goal === "increase") {
    return increased ? "better" : "worse";
  } else {
    return increased ? "worse" : "better";
  }
}

export function getFlowBoxColor(comparison: ComparisonResult): string {
  switch (comparison) {
    case "better":
      return getAdjustedColor("#27AE60", { brighten: 0.6 });
    case "worse":
      return getAdjustedColor("#EB5757", { brighten: 0.6 });
    case "neutral":
      return "#F5F5F5";
  }
}
