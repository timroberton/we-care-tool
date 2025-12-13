import { For, Show } from "solid-js";
import { _FORMAL_SERVICES, _OUT_OF_FACILITY_SERVICES } from "~/config/services";
import { _COMPLICATIONS, getComplicationLabel } from "~/config/complications";
import type { Results, ScenarioResults } from "~/types/mod";
import { Button, downloadCsv, stringifyCsv, toNum0, toPct1 } from "panther";
import { RESULT_GOALS } from "./_result_goals";
import { compareToBaseline } from "~/utils/result_comparison";
import { SafetyBadge, ComplicationCategoryBadge } from "~/components/Badges";
import { t, td } from "~/translate/mod";

type Props = {
  results: Results;
};

export function ResultsTable(p: Props) {
  const allResults = () => [p.results.baseline, ...p.results.scenarios];

  const handleDownload = () => {
    const rows: string[][] = [];

    const headerRow1 = [t("Indicator")];
    const headerRow2 = [""];
    allResults().forEach((s, i) => {
      const label = i === 0 ? s.name : `${t("Scenario")} ${i}. ${s.name}`;
      headerRow1.push(label, "");
      headerRow2.push("N", "%");
    });
    rows.push(headerRow1);
    rows.push(headerRow2);

    const addRow = (
      label: string,
      getValue: (s: ScenarioResults) => number,
      formatter: (v: number) => string,
      getValue2?: (s: ScenarioResults) => number,
      formatter2?: (v: number) => string
    ) => {
      const values: string[] = [label];
      allResults().forEach((s) => {
        if (getValue2 && formatter2) {
          values.push(formatter2(getValue2(s)));
          values.push(formatter(getValue(s)));
        } else {
          values.push(formatter(getValue(s)));
          values.push("");
        }
      });
      rows.push(values);
    };

    const toNumPlain = (v: number) => v.toFixed(0);

    rows.push([t("Pregnancies")]);
    addRow(
      "    " + t("All pregnancies"),
      (s) => s.familyPlanning.nPregnancies,
      toNumPlain
    );
    addRow(
      "    " + t("Intended pregnancies"),
      (s) => s.familyPlanning.nIntendedPregnancies,
      toNumPlain
    );
    addRow(
      "    " + t("Unintended pregnancies"),
      (s) => s.familyPlanning.nUnintendedPregnancies,
      toNumPlain
    );

    rows.push([t("Demand")]);
    addRow(
      "    " + t("Seek an induced abortion"),
      (s) => s.demand.nSeeksInducedAbortion,
      toNumPlain
    );

    rows.push([t("Access")]);
    addRow(
      "    " + t("Abortion initiated in a facility"),
      (s) => s.access.totals.pArriveFacility,
      toPct1,
      (s) => s.access.totals.nArriveFacility,
      toNumPlain
    );
    addRow(
      "    " + t("Abortion initiated out of a facility"),
      (s) => s.access.totals.pArriveOutOfFacility,
      toPct1,
      (s) => s.access.totals.nArriveOutOfFacility,
      toNumPlain
    );
    addRow(
      "    " + t("No access"),
      (s) => s.access.totals.pNoAccess,
      toPct1,
      (s) => s.access.totals.nNoAccess,
      toNumPlain
    );

    rows.push([t("Service provision at facilities")]);
    for (const service of _FORMAL_SERVICES) {
      addRow(
        `    ${td(service.label)} - ${t(service.safety.toUpperCase() as "SAFE" | "LESS SAFE" | "LEAST SAFE")}`,
        (s) => s.facilityReceipt[service.id].p,
        toPct1,
        (s) => s.facilityReceipt[service.id].n,
        toNumPlain
      );
    }
    addRow(
      "    " + t("No abortion after initiating in a facility"),
      (s) => s.facilityReceipt.noAbortion.p,
      toPct1,
      (s) => s.facilityReceipt.noAbortion.n,
      toNumPlain
    );

    rows.push([t("Service provision at out-of-facility providers")]);
    for (const service of _OUT_OF_FACILITY_SERVICES) {
      addRow(
        `    ${td(service.label)} - ${t(service.safety.toUpperCase() as "SAFE" | "LESS SAFE" | "LEAST SAFE")}`,
        (s) => s.outOfFacilityReceipt[service.id].p,
        toPct1,
        (s) => s.outOfFacilityReceipt[service.id].n,
        toNumPlain
      );
    }
    addRow(
      "    " + t("No abortion after initiating out of a facility"),
      (s) => s.outOfFacilityReceipt.noAbortion.p,
      toPct1,
      (s) => s.outOfFacilityReceipt.noAbortion.n,
      toNumPlain
    );

    rows.push([t("Abortion outcomes")]);
    addRow(
      "    " + t("Live births"),
      (s) => s.abortionOutcomes.liveBirths.nTotal,
      toNumPlain
    );
    addRow(
      "    " + t("Miscarriages"),
      (s) => s.abortionOutcomes.miscarriages.nTotal,
      toNumPlain
    );
    addRow(
      "    " + t("Abortions"),
      (s) => s.abortionOutcomes.abortions.nTotal,
      toNumPlain
    );
    addRow(
      "     → " + t("Safe abortion"),
      (s) => s.abortionOutcomes.abortions.safe.pAmongAbortions,
      toPct1,
      (s) => s.abortionOutcomes.abortions.safe.n,
      toNumPlain
    );
    addRow(
      "     → " + t("Less safe abortion"),
      (s) => s.abortionOutcomes.abortions.lessSafe.pAmongAbortions,
      toPct1,
      (s) => s.abortionOutcomes.abortions.lessSafe.n,
      toNumPlain
    );
    addRow(
      "     → " + t("Least safe abortion"),
      (s) => s.abortionOutcomes.abortions.leastSafe.pAmongAbortions,
      toPct1,
      (s) => s.abortionOutcomes.abortions.leastSafe.n,
      toNumPlain
    );

    rows.push([t("Complications")]);
    addRow(
      "    " + t("Total complications"),
      (s) =>
        (s.complications.nModerateComplications +
          s.complications.nSevereComplications) /
        s.abortionOutcomes.abortions.nTotal,
      toPct1,
      (s) =>
        s.complications.nModerateComplications +
        s.complications.nSevereComplications,
      toNumPlain
    );
    for (let i = 0; i < _COMPLICATIONS.length; i++) {
      const complication = _COMPLICATIONS[i];
      addRow(
        `     → ${getComplicationLabel(complication.label)} (${t(complication.category === "moderate" ? "MODERATE" : "SEVERE")})`,
        (s) =>
          s.complications.nSpecificComplications[i]?.pAmongComplications || 0,
        toPct1,
        (s) => s.complications.nSpecificComplications[i]?.n || 0,
        toNumPlain
      );
    }
    addRow(
      "    " + t("Moderate complications (total)"),
      (s) => s.complications.pModerateComplications,
      toPct1,
      (s) => s.complications.nModerateComplications,
      toNumPlain
    );
    addRow(
      "    " + t("Severe complications (total)"),
      (s) => s.complications.pSevereComplications,
      toPct1,
      (s) => s.complications.nSevereComplications,
      toNumPlain
    );
    addRow(
      "    " + t("No complications"),
      (s) => s.complications.pNoComplications,
      toPct1,
      (s) => s.complications.nNoComplications,
      toNumPlain
    );

    rows.push([t("Post-abortion care for abortion complications")]);
    addRow(
      "    " + t("Total moderate complications needing care"),
      (s) => s.postAbortionCare.moderate.nTotal,
      toNumPlain
    );
    addRow(
      "     → " + t("Receiving effective care"),
      (s) => s.postAbortionCare.moderate.pReceivingEffectiveCare,
      toPct1,
      (s) => s.postAbortionCare.moderate.nReceivingEffectiveCare,
      toNumPlain
    );
    addRow(
      "     → " + t("Not receiving effective care"),
      (s) => s.postAbortionCare.moderate.pNotReceivingEffectiveCare,
      toPct1,
      (s) => s.postAbortionCare.moderate.nNotReceivingEffectiveCare,
      toNumPlain
    );
    addRow(
      "    " + t("Total severe complications needing care"),
      (s) => s.postAbortionCare.severe.nTotal,
      toNumPlain
    );
    addRow(
      "     → " + t("Receiving effective care"),
      (s) => s.postAbortionCare.severe.pReceivingEffectiveCare,
      toPct1,
      (s) => s.postAbortionCare.severe.nReceivingEffectiveCare,
      toNumPlain
    );
    addRow(
      "     → " + t("Not receiving effective care"),
      (s) => s.postAbortionCare.severe.pNotReceivingEffectiveCare,
      toPct1,
      (s) => s.postAbortionCare.severe.nNotReceivingEffectiveCare,
      toNumPlain
    );
    addRow(
      "    " + t("Total complications needing care"),
      (s) => s.postAbortionCare.totals.nTotalComplications,
      toNumPlain
    );
    addRow(
      "     → " + t("Receiving effective care"),
      (s) => s.postAbortionCare.totals.pReceivingEffectiveCare,
      toPct1,
      (s) => s.postAbortionCare.totals.nReceivingEffectiveCare,
      toNumPlain
    );
    addRow(
      "     → " + t("Not receiving effective care"),
      (s) => s.postAbortionCare.totals.pNotReceivingEffectiveCare,
      toPct1,
      (s) => s.postAbortionCare.totals.nNotReceivingEffectiveCare,
      toNumPlain
    );

    const csv = stringifyCsv(rows, { bom: true });
    downloadCsv(csv, "results.csv");
  };

  return (
    <div class="h-full flex flex-col">
      <div class="ui-pad border-b border-base-300 flex items-center ui-gap-sm justify-end">
        <Button onClick={handleDownload} outline iconName="download">
          CSV
        </Button>
      </div>
      <div class="flex-1 h-0 ui-pad overflow-auto">
        <div id="results-table" class="">
          <table class="min-w-full border-collapse border border-base-300">
            <thead class="bg-base-200 z-10">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-700 border-b border-r border-base-300 min-w-[250px]"></th>
                <For each={allResults()}>
                  {(s, i) => {
                    const label =
                      i() === 0 ? (
                        td(s.name)
                      ) : (
                        <>
                          {t("Scenario")} {i()}.<br />
                          {s.name}
                        </>
                      );
                    return (
                      <th class="px-4 py-3 text-left align-bottom text-sm font-700 border-b border-r border-base-300 w-40">
                        {label}
                      </th>
                    );
                  }}
                </For>
              </tr>
            </thead>
            <tbody>
              <SectionHeader
                label={t("Pregnancies")}
                colSpan={allResults().length + 1}
              />
              <DataRow
                label={t("All pregnancies")}
                scenarios={allResults()}
                value={(s) => ({ n: s.familyPlanning.nPregnancies })}
                goalKey="familyPlanning.nPregnancies"
              />
              <DataRow
                label={t("Intended pregnancies")}
                scenarios={allResults()}
                value={(s) => ({ n: s.familyPlanning.nIntendedPregnancies })}
                goalKey="familyPlanning.nIntendedPregnancies"
              />
              <DataRow
                label={t("Unintended pregnancies")}
                scenarios={allResults()}
                value={(s) => ({ n: s.familyPlanning.nUnintendedPregnancies })}
                goalKey="familyPlanning.nUnintendedPregnancies"
              />
              <SectionHeader label={t("Demand")} colSpan={allResults().length + 1} />
              <DataRow
                label={t("Pregnant women seeking an induced abortion")}
                scenarios={allResults()}
                value={(s) => ({ n: s.demand.nSeeksInducedAbortion })}
                goalKey="demand.nSeeksInducedAbortion"
              />
              <SectionHeader label={t("Access")} colSpan={allResults().length + 1} />
              <DataRow
                label={t("Abortion initiated in a facility")}
                scenarios={allResults()}
                value={(s) => ({
                  n: s.access.totals.nArriveFacility,
                  p: s.access.totals.pArriveFacility,
                })}
                goalKey="access.totals.nArriveFacility"
              />
              <DataRow
                label={t("Abortion initiated out of a facility")}
                scenarios={allResults()}
                value={(s) => ({
                  n: s.access.totals.nArriveOutOfFacility,
                  p: s.access.totals.pArriveOutOfFacility,
                })}
                goalKey="access.totals.nArriveOutOfFacility"
              />
              {/* <DataRow
              label="Rerouted from facility to out-of-facility"
              scenarios={allResults()}
              value={(s) => ({ n: s.access.facilitySeekers.nRerouteToOutOfFacility })}
              goalKey="access.facilitySeekers.nRerouteToOutOfFacility"
            /> */}
              <DataRow
                label={t("No access")}
                scenarios={allResults()}
                value={(s) => ({
                  n: s.access.totals.nNoAccess,
                  p: s.access.totals.pNoAccess,
                })}
                goalKey="access.totals.nNoAccess"
              />
              <SectionHeader
                label={t("Abortion service provision at facilities")}
                colSpan={allResults().length + 1}
              />
              <For each={_FORMAL_SERVICES}>
                {(service) => (
                  <DataRow
                    label={td(service.label)}
                    scenarios={allResults()}
                    value={(s) => ({
                      n: s.facilityReceipt[service.id].n,
                      p: s.facilityReceipt[service.id].p,
                    })}
                    safety={service.safety}
                  />
                )}
              </For>
              <DataRow
                label={t("No abortion after initiating in a facility")}
                scenarios={allResults()}
                value={(s) => ({
                  n: s.facilityReceipt.noAbortion.n,
                  p: s.facilityReceipt.noAbortion.p,
                })}
                goalKey="facilityReceipt.noAbortion"
              />
              <SectionHeader
                label={t("Abortion service provision at out-of-facility providers")}
                colSpan={allResults().length + 1}
              />
              <For each={_OUT_OF_FACILITY_SERVICES}>
                {(service) => (
                  <DataRow
                    label={td(service.label)}
                    scenarios={allResults()}
                    value={(s) => ({
                      n: s.outOfFacilityReceipt[service.id].n,
                      p: s.outOfFacilityReceipt[service.id].p,
                    })}
                    safety={service.safety}
                  />
                )}
              </For>
              <DataRow
                label={t("No abortion after initiating out of a facility")}
                scenarios={allResults()}
                value={(s) => ({
                  n: s.outOfFacilityReceipt.noAbortion.n,
                  p: s.outOfFacilityReceipt.noAbortion.p,
                })}
                goalKey="outOfFacilityReceipt.noAbortion"
              />
              <SectionHeader
                label={t("Abortions")}
                colSpan={allResults().length + 1}
              />
              {/* <DataRow
                label="Live births"
                scenarios={allResults()}
                value={(s) => ({ n: s.abortionOutcomes.liveBirths.nTotal })}
                goalKey="finalOutcomes.liveBirths.nTotal"
              />
              <DataRow
                label="Miscarriages"
                scenarios={allResults()}
                value={(s) => ({ n: s.abortionOutcomes.miscarriages.nTotal })}
                goalKey="finalOutcomes.miscarriages.nTotal"
              /> */}
              <DataRow
                label={t("Total abortions")}
                scenarios={allResults()}
                value={(s) => ({ n: s.abortionOutcomes.abortions.nTotal })}
                goalKey="finalOutcomes.abortions.nTotal"
              />
              <DataRow
                label={" → " + t("Safe abortion")}
                scenarios={allResults()}
                value={(s) => ({
                  n: s.abortionOutcomes.abortions.safe.n,
                  p: s.abortionOutcomes.abortions.safe.pAmongAbortions,
                })}
                safety="safe"
                goalKey="finalOutcomes.abortions.safe"
              />
              <DataRow
                label={" → " + t("Less safe abortion")}
                scenarios={allResults()}
                value={(s) => ({
                  n: s.abortionOutcomes.abortions.lessSafe.n,
                  p: s.abortionOutcomes.abortions.lessSafe.pAmongAbortions,
                })}
                goalKey="finalOutcomes.abortions.lessSafe"
                safety="less"
              />
              <DataRow
                label={" → " + t("Least safe abortion")}
                scenarios={allResults()}
                value={(s) => ({
                  n: s.abortionOutcomes.abortions.leastSafe.n,
                  p: s.abortionOutcomes.abortions.leastSafe.pAmongAbortions,
                })}
                goalKey="finalOutcomes.abortions.leastSafe"
                safety="least"
              />
              <SectionHeader
                label={t("Abortion complications")}
                colSpan={allResults().length + 1}
              />
              <DataRow
                label={t("Total abortion complications")}
                scenarios={allResults()}
                value={(s) => ({
                  n:
                    s.complications.nModerateComplications +
                    s.complications.nSevereComplications,
                })}
              />
              <For each={_COMPLICATIONS}>
                {(complication, i) => (
                  <DataRow
                    label={" → " + getComplicationLabel(complication.label)}
                    scenarios={allResults()}
                    value={(s) => {
                      const obj = s.complications.nSpecificComplications[i()];
                      return {
                        n: obj?.n ?? 0,
                        p: obj?.pAmongComplications,
                      };
                    }}
                    complicationCategory={complication.category}
                  />
                )}
              </For>
              {/* <SectionHeader
                label="Complication categories"
                colSpan={allResults().length + 1}
              />
              <DataRow
                label="Total moderate complications"
                scenarios={allResults()}
                value={(s) => ({
                  n: s.complications.nModerateComplications,
                  p: s.complications.pModerateComplications,
                })}
              />
              <DataRow
                label="Total severe complications"
                scenarios={allResults()}
                value={(s) => ({
                  n: s.complications.nSevereComplications,
                  p: s.complications.pSevereComplications,
                })}
              /> */}
              {/* <DataRow
                label="No complications"
                scenarios={allResults()}
                value={(s) => ({
                  n: s.complications.nNoComplications,
                  // p: s.complications.pNoComplications,
                })}
              /> */}
              <SectionHeader
                label={t("Post-abortion care for abortion complications")}
                colSpan={allResults().length + 1}
              />
              {/* <SectionHeader
                label="Moderate complications"
                colSpan={allResults().length + 1}
              /> */}
              <DataRow
                label={t("Total moderate complications needing care")}
                scenarios={allResults()}
                value={(s) => ({
                  n: s.postAbortionCare.moderate.nTotal,
                })}
                complicationCategory="moderate"
              />
              {/* <DataRow
                label="With access to post-abortion care"
                scenarios={allResults()}
                value={(s) => ({
                  n: s.postAbortionCare.moderate.access.nTotalWithAccess,
                })}
              /> */}
              <DataRow
                label={" → " + t("Receiving effective care")}
                scenarios={allResults()}
                value={(s) => ({
                  n: s.postAbortionCare.moderate.nReceivingEffectiveCare,
                  p: s.postAbortionCare.moderate.pReceivingEffectiveCare,
                })}
                complicationCategory="moderate"
              />
              <DataRow
                label={" → " + t("Not receiving effective care")}
                scenarios={allResults()}
                value={(s) => ({
                  n: s.postAbortionCare.moderate.nNotReceivingEffectiveCare,
                  p: s.postAbortionCare.moderate.pNotReceivingEffectiveCare,
                })}
                complicationCategory="moderate"
              />
              {/* <SectionHeader
                label="Severe complications"
                colSpan={allResults().length + 1}
              /> */}
              <DataRow
                label={t("Total severe complications needing care")}
                scenarios={allResults()}
                value={(s) => ({
                  n: s.postAbortionCare.severe.nTotal,
                })}
                complicationCategory="severe"
              />
              {/* <DataRow
                label="With access to post-abortion care"
                scenarios={allResults()}
                value={(s) => ({
                  n: s.postAbortionCare.severe.access.nTotalWithAccess,
                })}
              /> */}
              <DataRow
                label={" → " + t("Receiving effective care")}
                scenarios={allResults()}
                value={(s) => ({
                  n: s.postAbortionCare.severe.nReceivingEffectiveCare,
                  p: s.postAbortionCare.severe.pReceivingEffectiveCare,
                })}
                complicationCategory="severe"
              />
              <DataRow
                label={" → " + t("Not receiving effective care")}
                scenarios={allResults()}
                value={(s) => ({
                  n: s.postAbortionCare.severe.nNotReceivingEffectiveCare,
                  p: s.postAbortionCare.severe.pNotReceivingEffectiveCare,
                })}
                complicationCategory="severe"
              />
              <DataRow
                label={t("Total complications needing care")}
                scenarios={allResults()}
                value={(s) => ({
                  n: s.postAbortionCare.totals.nTotalComplications,
                })}
              />
              <DataRow
                label={" → " + t("Receiving effective care")}
                scenarios={allResults()}
                value={(s) => ({
                  n: s.postAbortionCare.totals.nReceivingEffectiveCare,
                  p: s.postAbortionCare.totals.pReceivingEffectiveCare,
                })}
              />
              <DataRow
                label={" → " + t("Not receiving effective care")}
                scenarios={allResults()}
                value={(s) => ({
                  n: s.postAbortionCare.totals.nNotReceivingEffectiveCare,
                  p: s.postAbortionCare.totals.pNotReceivingEffectiveCare,
                })}
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SectionHeader(p: { label: string; colSpan: number }) {
  return (
    <tr>
      <td
        colspan={p.colSpan}
        class="px-4 pb-3 pt-8 font-700 text-base bg-base-100 border-t border-base-300"
      >
        {p.label}
      </td>
    </tr>
  );
}

function DataRow(p: {
  scenarios: ScenarioResults[];
  label: string;
  value: (s: ScenarioResults) => { n: number; p?: number };
  formatter?: (v: number) => string;
  goalKey?: string;
  safety?: "safe" | "less" | "least";
  complicationCategory?: "moderate" | "severe";
}) {
  const getValue = (s: ScenarioResults) => p.value(s);

  return (
    <tr class="border-t border-base-300 hover:bg-base-50">
      <td class="px-4 py-2 text-sm">
        <div class="flex items-start justify-between gap-2">
          <span>{p.label}</span>
          <Show when={p.safety}>
            <SafetyBadge safety={p.safety!} size="sm" />
          </Show>
          <Show when={p.complicationCategory}>
            <ComplicationCategoryBadge
              category={p.complicationCategory!}
              size="sm"
            />
          </Show>
        </div>
      </td>
      <For each={p.scenarios}>
        {(s) => {
          const { n, p: pct } = getValue(s);
          return (
            <td class="px-4 py-2 text-right text-sm border-l border-base-300">
              <Show
                when={pct !== undefined}
                fallback={p.formatter ? p.formatter(n) : toNum0(n)}
              >
                {toNum0(n)} ({toPct1(pct!)})
              </Show>
            </td>
          );
        }}
      </For>
    </tr>
  );
}
