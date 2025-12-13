import type { Results } from "~/types/mod";
import { toNum0, toPct1 } from "panther";
import { getReadableTextFromTable } from "./table";
import {
  formatComparison,
  formatPercentageComparison,
  sectionHeader,
} from "./_shared";

export type ReadableResultsOptions = {
  includeDetailedTable: boolean;
  country?: string;
};

function getScenarioLabel(
  scenario: { name: string; id: string },
  index: number
): string {
  return index === 0 ? scenario.name : `Scenario ${index}. ${scenario.name}`;
}

export function getReadableTextFromResults(
  results: Results,
  options: ReadableResultsOptions
): string {
  const { includeDetailedTable, country } = options;

  const sections: string[] = [];

  sections.push("═".repeat(70));
  sections.push("  ABORTION CARE MODEL RESULTS");
  sections.push("═".repeat(70));
  sections.push("");

  sections.push("⚠️  MODEL LIMITATIONS");
  sections.push("");
  sections.push(
    "This model provides a simplified representation of abortion care"
  );
  sections.push(
    "pathways and does not reflect the full complexity of real-world"
  );
  sections.push(
    "health systems. Input data may be incomplete, outdated, or unreliable."
  );
  sections.push("Use results as insights for exploration and planning, not as");
  sections.push("definitive predictions.");
  sections.push("");
  sections.push("─".repeat(70));
  sections.push("");

  if (country) {
    sections.push(`PROJECT COUNTRY: ${country.toUpperCase()}`);
    sections.push("");
    sections.push(
      `IMPORTANT: All data and results refer specifically to ${country}.`
    );
    sections.push("");
    sections.push("─".repeat(70));
    sections.push("");
  }

  const allScenarios = [results.baseline, ...results.scenarios];
  sections.push("SCENARIOS:");
  allScenarios.forEach((s, i) => {
    sections.push(`  - ${getScenarioLabel(s, i)} (id: ${s.id})`);
  });
  sections.push("");

  sections.push(generateExecutiveSummary(results));
  sections.push("");

  sections.push(generateKeyMetrics(results));
  sections.push("");

  if (includeDetailedTable) {
    sections.push(sectionHeader("Detailed Results Table"));
    sections.push("");
    sections.push(getReadableTextFromTable(results));
    sections.push("");
  }

  return sections.join("\n");
}

function generateExecutiveSummary(results: Results): string {
  const sections: string[] = [];
  sections.push(sectionHeader("Executive Summary", "-"));
  sections.push("");

  const baseline = results.baseline;

  sections.push("BASELINE:");
  sections.push(
    `  Unintended pregnancies: ${toNum0(
      baseline.familyPlanning.nUnintendedPregnancies
    )}`
  );
  sections.push(
    `  Seeking abortion: ${toNum0(
      baseline.demand.nSeeksInducedAbortion
    )} (${toPct1(
      baseline.demand.nSeeksInducedAbortion /
        baseline.familyPlanning.nUnintendedPregnancies
    )})`
  );
  sections.push(
    `  Safe abortions: ${toNum0(
      baseline.abortionOutcomes.abortions.safe.n
    )} (${toPct1(
      baseline.abortionOutcomes.abortions.safe.pAmongAbortions
    )} of all abortions)`
  );
  sections.push(
    `  Total complications: ${toNum0(
      baseline.complications.nModerateComplications +
        baseline.complications.nSevereComplications
    )} (${toPct1(
      (baseline.complications.nModerateComplications +
        baseline.complications.nSevereComplications) /
        baseline.abortionOutcomes.abortions.nTotal
    )} of all abortions)`
  );
  sections.push(
    `  Receiving effective post-abortion care: ${toNum0(
      baseline.postAbortionCare.totals.nReceivingEffectiveCare
    )} (${toPct1(
      baseline.postAbortionCare.totals.pReceivingEffectiveCare
    )} of those with complications)`
  );
  sections.push("");

  if (results.scenarios.length > 0) {
    sections.push("SCENARIO IMPACTS:");
    sections.push("");

    results.scenarios.forEach((scenario, i) => {
      sections.push(`${getScenarioLabel(scenario, i + 1)}:`);

      const unintendedChange =
        scenario.familyPlanning.nUnintendedPregnancies -
        baseline.familyPlanning.nUnintendedPregnancies;
      if (Math.abs(unintendedChange) > 0.5) {
        sections.push(
          `  Unintended pregnancies: ${formatComparison(
            baseline.familyPlanning.nUnintendedPregnancies,
            scenario.familyPlanning.nUnintendedPregnancies
          )}`
        );
      }

      const seekingChange =
        scenario.demand.nSeeksInducedAbortion -
        baseline.demand.nSeeksInducedAbortion;
      if (Math.abs(seekingChange) > 0.5) {
        sections.push(
          `  Seeking abortion: ${formatComparison(
            baseline.demand.nSeeksInducedAbortion,
            scenario.demand.nSeeksInducedAbortion
          )}`
        );
      }

      sections.push(
        `  Safe abortions: ${formatComparison(
          baseline.abortionOutcomes.abortions.safe.n,
          scenario.abortionOutcomes.abortions.safe.n
        )}`
      );
      sections.push(
        `  Safe abortion proportion: ${formatPercentageComparison(
          baseline.abortionOutcomes.abortions.safe.pAmongAbortions,
          scenario.abortionOutcomes.abortions.safe.pAmongAbortions
        )}`
      );

      const totalComplicationsChange =
        scenario.complications.nModerateComplications +
        scenario.complications.nSevereComplications -
        (baseline.complications.nModerateComplications +
          baseline.complications.nSevereComplications);
      if (Math.abs(totalComplicationsChange) > 0.5) {
        sections.push(
          `  Total complications: ${formatComparison(
            baseline.complications.nModerateComplications +
              baseline.complications.nSevereComplications,
            scenario.complications.nModerateComplications +
              scenario.complications.nSevereComplications
          )}`
        );
      }

      const accessFacilityChange =
        scenario.access.totals.nArriveFacility -
        baseline.access.totals.nArriveFacility;
      if (Math.abs(accessFacilityChange) > 0.5) {
        sections.push(
          `  Facility access: ${formatComparison(
            baseline.access.totals.nArriveFacility,
            scenario.access.totals.nArriveFacility
          )}`
        );
      }

      const postAbortionCareChange =
        scenario.postAbortionCare.totals.nReceivingEffectiveCare -
        baseline.postAbortionCare.totals.nReceivingEffectiveCare;
      if (Math.abs(postAbortionCareChange) > 0.5) {
        sections.push(
          `  Receiving effective post-abortion care: ${formatComparison(
            baseline.postAbortionCare.totals.nReceivingEffectiveCare,
            scenario.postAbortionCare.totals.nReceivingEffectiveCare
          )}`
        );
        sections.push(
          `  Post-abortion care effectiveness: ${formatPercentageComparison(
            baseline.postAbortionCare.totals.pReceivingEffectiveCare,
            scenario.postAbortionCare.totals.pReceivingEffectiveCare
          )}`
        );
      }

      sections.push("");
    });
  }

  return sections.join("\n");
}

function generateKeyMetrics(results: Results): string {
  const sections: string[] = [];
  sections.push(sectionHeader("Key Pathway Summary", "-"));
  sections.push("");

  const allScenarios = [results.baseline, ...results.scenarios];
  const scenarioLabels = allScenarios.map((s, i) => getScenarioLabel(s, i));
  const maxNameLength = Math.max(...scenarioLabels.map((s) => s.length));

  allScenarios.forEach((scenario, i) => {
    const name = scenarioLabels[i].padEnd(maxNameLength);

    sections.push(
      `${name}  →  Unintended: ${toNum0(
        scenario.familyPlanning.nUnintendedPregnancies
      ).padStart(10)}  →  Seeking: ${toNum0(
        scenario.demand.nSeeksInducedAbortion
      ).padStart(10)}  →  Safe: ${toNum0(
        scenario.abortionOutcomes.abortions.safe.n
      ).padStart(10)} (${toPct1(
        scenario.abortionOutcomes.abortions.safe.pAmongAbortions
      )})  →  Complications: ${toNum0(
        scenario.complications.nTotalComplications
      ).padStart(10)}  →  Effective PAC: ${toNum0(
        scenario.postAbortionCare.totals.nReceivingEffectiveCare
      ).padStart(10)} (${toPct1(
        scenario.postAbortionCare.totals.pReceivingEffectiveCare
      )})`
    );
  });

  sections.push("");
  sections.push(
    "For detailed breakdowns including service provision, specific complication types,"
  );
  sections.push("and PAC access/effectiveness by severity, use includeDetailedTable=true");

  return sections.join("\n");
}
