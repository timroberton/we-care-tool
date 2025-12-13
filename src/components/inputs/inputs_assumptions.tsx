import { For, Show } from "solid-js";
import { _FORMAL_ITEMS, _INFORMAL_ITEMS } from "~/config/items";
import { _FORMAL_SERVICES, _OUT_OF_FACILITY_SERVICES } from "~/config/services";
import { _COMPLICATIONS, getComplicationLabel, getComplicationCategoryLabel } from "~/config/complications";
import type { Parameters } from "~/types/mod";
import { Section } from "~/components/Section";
import { SafetyBadge, ComplicationCategoryBadge } from "~/components/Badges";
import { Button, downloadCsv, stringifyCsv } from "~/panther/mod.ui";
import { t, td } from "~/translate/mod";

type ParamEditorProps = {
  params: Parameters;
};

export function AssumptionsTab(p: ParamEditorProps) {
  const facilityItemLabels = _FORMAL_ITEMS.reduce((acc, item) => {
    acc[item.id] = item.label;
    return acc;
  }, {} as Record<string, string>);

  const outOfFacilityItemLabels = _INFORMAL_ITEMS.reduce((acc, item) => {
    acc[item.id] = item.label;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div class="ui-pad overflow-auto ui-spy">
      <Section header={t("Facility services")}>
        <div class="py-1"></div>
        <div class="ui-spy border-base-300 rounded border ui-pad">
          <For each={_FORMAL_SERVICES}>
            {(service) => (
              <div class="">
                <div class="flex items-start ui-gap-sm">
                  <div class="font-700 flex-1">{td(service.label)}</div>
                  <SafetyBadge safety={service.safety} />
                </div>
                <div class="ui-spy-sm mt-2">
                  <For each={service.componentCombos}>
                    {(combo, index) => (
                      <div class="text-sm">
                        <Show
                          when={service.componentCombos.length > 1}
                          fallback={
                            <span class="text-base-content/70">
                              {combo
                                .map((id) => td(facilityItemLabels[id]))
                                .join(" + ")}
                            </span>
                          }
                        >
                          <span class="font-700">{t("Combo")} {index() + 1}:</span>{" "}
                          <span class="text-base-content/70">
                            {combo
                              .map((id) => td(facilityItemLabels[id]))
                              .join(" + ")}
                          </span>
                        </Show>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>
      </Section>

      <Section header={t("Out-of-facility services")}>
        <div class="py-1"></div>
        <div class="ui-spy border-base-300 rounded border ui-pad">
          <For each={_OUT_OF_FACILITY_SERVICES}>
            {(service) => (
              <div class="">
                <div class="flex items-center ui-gap-sm">
                  <div class="font-700 flex-1">{td(service.label)}</div>
                  <SafetyBadge safety={service.safety} />
                </div>
                <div class="ui-spy-sm mt-2">
                  <For each={service.componentCombos}>
                    {(combo, index) => (
                      <div class="text-sm">
                        <Show
                          when={service.componentCombos.length > 1}
                          fallback={
                            <span class="text-base-content/70">
                              {combo
                                .map((id) => td(outOfFacilityItemLabels[id]))
                                .join(" + ")}
                            </span>
                          }
                        >
                          <span class="font-700">{t("Combo")} {index() + 1}:</span>{" "}
                          <span class="text-base-content/70">
                            {combo
                              .map((id) => td(outOfFacilityItemLabels[id]))
                              .join(" + ")}
                          </span>
                        </Show>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>
      </Section>

      {/* <Section header="Global model values">
        <div class="py-1"></div>
        <div class="ui-spy border-base-300 rounded border ui-pad text-sm">
          <div class="text-base-content/70">
            The following pregnancy outcome parameters apply globally to all
            scenarios:
          </div>
          <ul class="mt-2 space-y-1 text-base-content/70">
            <li>
              <span class="font-700">
                Proportion of pregnancies resulting in miscarriage:
              </span>{" "}
              {Math.round(
                p.params.baseline.pregnancyOutcomes.pResultingInMiscarriage *
                  100
              )}
              %
            </li>
          </ul>
        </div>
      </Section> */}

      <Section
        header={t("Complication rates")}
        rightPanel={
          <Button
            onClick={handleDownloadComplicationRates}
            iconName="download"
            outline
          >
            CSV
          </Button>
        }
      >
        <div class="py-1"></div>
        <div class="border-base-300 rounded border overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-base-300">
                <th class="px-3 py-2 text-left font-700 sticky left-0 bg-base-100 min-w-[200px] z-10">
                  {t("Service")}
                </th>
                <For each={_COMPLICATIONS}>
                  {(complication) => (
                    <th class="px-3 py-2 text-center font-400 whitespace-nowrap">
                      <div class="flex flex-col items-center gap-1">
                        <span>{getComplicationLabel(complication.label)}</span>
                        <ComplicationCategoryBadge
                          category={complication.category}
                          size="sm"
                        />
                      </div>
                    </th>
                  )}
                </For>
              </tr>
            </thead>
            <tbody>
              <tr class="border-t border-base-300 bg-base-200/50">
                <td class="px-3 py-2 font-700 text-sm sticky left-0 bg-base-200/50 z-10">
                  {t("Facility services")}
                </td>
                <td colspan={_COMPLICATIONS.length} class="bg-base-200/50"></td>
              </tr>
              <For each={_FORMAL_SERVICES}>
                {(service) => (
                  <tr class="border-t border-base-300">
                    <td class="px-3 py-2 sticky left-0 bg-base-100 z-10">
                      <span class="font-600">{td(service.label)}</span>{" "}
                      <SafetyBadge safety={service.safety} size="sm" />
                    </td>
                    <For each={service.complicationRates}>
                      {(rate) => (
                        <td class="px-3 py-2 text-center text-base-content/70">
                          {(rate * 100).toFixed(1)}%
                        </td>
                      )}
                    </For>
                  </tr>
                )}
              </For>
              <tr class="border-t border-base-300 bg-base-200/50">
                <td class="px-3 py-2 font-700 text-sm sticky left-0 bg-base-200/50 z-10">
                  {t("Out-of-facility services")}
                </td>
                <td colspan={_COMPLICATIONS.length} class="bg-base-200/50"></td>
              </tr>
              <For each={_OUT_OF_FACILITY_SERVICES}>
                {(service) => (
                  <tr class="border-t border-base-300">
                    <td class="px-3 py-2 sticky left-0 bg-base-100 z-10">
                      <span class="font-600">{td(service.label)}</span>{" "}
                      <SafetyBadge safety={service.safety} size="sm" />
                    </td>
                    <For each={service.complicationRates}>
                      {(rate) => (
                        <td class="px-3 py-2 text-center text-base-content/70">
                          {(rate * 100).toFixed(1)}%
                        </td>
                      )}
                    </For>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function handleDownloadComplicationRates() {
  const rows: string[][] = [];

  rows.push([t("Service"), ..._COMPLICATIONS.map((c) => getComplicationLabel(c.label))]);

  rows.push([t("Facility services"), ...Array(_COMPLICATIONS.length).fill("")]);

  _FORMAL_SERVICES.forEach((service) => {
    const rates = service.complicationRates.map(
      (rate) => `${(rate * 100).toFixed(1)}%`
    );
    rows.push([td(service.label), ...rates]);
  });

  rows.push([
    t("Out-of-facility services"),
    ...Array(_COMPLICATIONS.length).fill(""),
  ]);

  _OUT_OF_FACILITY_SERVICES.forEach((service) => {
    const rates = service.complicationRates.map(
      (rate) => `${(rate * 100).toFixed(1)}%`
    );
    rows.push([td(service.label), ...rates]);
  });

  const csv = stringifyCsv(rows, { bom: true });
  downloadCsv(csv, "complication_rates.csv");
}
