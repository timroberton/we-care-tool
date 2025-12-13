import { TabsNavigation, type SelectOption, Button, FrameTop } from "panther";
import { Match, Switch, Show, createMemo, createEffect } from "solid-js";
import type { Parameters, Results } from "~/types/mod";
import { ResultsCharts } from "./results_charts";
import { ResultsTable } from "./results_table";
import { ResultsFlow } from "./results_flow";
import { ResultsReports } from "./results_reports";
import { ResultsScript } from "./results_script";
import { uiStore } from "~/stores/ui";
import { t } from "~/translate/mod";

type Props = {
  results: Results;
  params: Parameters;
  projectId: string;
  onClose?: () => void;
};

export function ResultsPresentation(p: Props) {
  const tabOptions = createMemo(() => {
    const baseTabs: SelectOption<string>[] = [
      { value: "table", label: t("Table") },
      { value: "flow", label: t("Pathway") },
      { value: "charts", label: t("Charts") },
      { value: "reports", label: t("Reports") },
    ];
    if (uiStore.showRScript) {
      baseTabs.push({ value: "script", label: t("R script") });
    }
    return baseTabs;
  });

  createEffect(() => {
    if (!uiStore.showRScript && uiStore.activeResultsTab === "script") {
      uiStore.setActiveResultsTab("table");
    }
  });

  const tabs = {
    currentTab: () => uiStore.activeResultsTab,
    setCurrentTab: (tab: string | ((prev: string) => string)) =>
      uiStore.setActiveResultsTab(tab),
    get tabs() {
      return tabOptions();
    },
    isTabActive: (tab: string) => uiStore.activeResultsTab === tab,
    getAllTabs: () => tabOptions().map((t) => t.value),
  };

  return (
    <div class="h-full w-full border-l-2 border-base-content">
      <FrameTop
        panelChildren={
          <div class="flex items-center justify-between border-b border-base-300 w-full overflow-y-hidden">
            <div class="flex-1 overflow-x-auto">
              <TabsNavigation tabs={tabs} />
            </div>
            <Show when={p.onClose}>
              <div class="ui-pad  -my-2">
                <Button
                  onClick={p.onClose}
                  outline
                  iconName="minus"
                  intent="base-content"
                ></Button>
              </div>
            </Show>
          </div>
        }
      >
        <Switch>
          <Match when={tabs.isTabActive("table")}>
            <ResultsTable results={p.results} />
          </Match>
          <Match when={tabs.isTabActive("flow")}>
            <ResultsFlow results={p.results} />
          </Match>
          <Match when={tabs.isTabActive("charts")}>
            <ResultsCharts results={p.results} />
          </Match>
          <Match when={tabs.isTabActive("reports")}>
            <ResultsReports
              results={p.results}
              params={p.params}
              projectId={p.projectId}
            />
          </Match>
          <Match when={tabs.isTabActive("script")}>
            <ResultsScript params={p.params} />
          </Match>
        </Switch>
      </FrameTop>
    </div>
  );
}
