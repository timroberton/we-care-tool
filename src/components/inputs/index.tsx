import type { SelectOption } from "panther";
import { TabsNavigation, Button, openAlert, openConfirm } from "panther";
import { Match, Switch, Show } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import type { Parameters } from "~/types/mod";
import { FrameTop } from "panther";
import { BaselineTab } from "./inputs_baseline";
import { ScenariosTab } from "./inputs_scenarios";
import { uiStore } from "~/stores/ui";
import { exportParametersToCSV, downloadCSV } from "~/utils/csv_export";
import { importParametersFromCSV } from "~/utils/csv_import";
import { AssumptionsTab } from "./inputs_assumptions";
import { projectStore } from "~/stores/project";
import { t } from "~/translate/mod";

type ParamEditorProps = {
  params: Parameters;
  setParams: SetStoreFunction<Parameters>;
  onClose?: () => void;
};

export function ParamEditor(p: ParamEditorProps) {
  const tabOptions = (): SelectOption<string>[] => [
    { value: "baseline", label: t("Base case") },
    { value: "scenarios", label: t("Scenarios") },
    { value: "assumptions", label: t("Definitions") },
  ];

  const tabs = {
    currentTab: () => uiStore.activeInputTab,
    setCurrentTab: (tab: string | ((prev: string) => string)) =>
      uiStore.setActiveInputTab(tab),
    get tabs() {
      return tabOptions();
    },
    isTabActive: (tab: string) => uiStore.activeInputTab === tab,
    getAllTabs: () => tabOptions().map((t) => t.value),
  };

  const handleDownload = () => {
    const csv = exportParametersToCSV(p.params);
    downloadCSV(csv);
  };

  const handleUpload = async (file: File) => {
    try {
      const text = await file.text();
      const importedParams = importParametersFromCSV(text);

      // Show warning before applying
      const confirmed = await openConfirm({
        title: t("Import confirmation"),
        text: t(
          "Importing this CSV file will replace all current parameters in this project with the data from the CSV file including the base case and all scenarios. This action cannot be undone."
        ),
      });

      if (!confirmed) {
        return;
      }

      p.setParams(importedParams);
      projectStore.updateBaselineMetadata(file.name);
    } catch (error) {
      await openAlert({
        text: `Failed to import CSV: ${
          error instanceof Error ? error.message : t("Unknown error")
        }`,
        intent: "danger",
      });
    }
  };

  let fileInputRef: HTMLInputElement | undefined;

  const handleUploadClick = () => {
    fileInputRef?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={(e) => {
          const target = e.target as HTMLInputElement;
          const file = target.files?.[0];
          if (file) {
            handleUpload(file);
            target.value = "";
          }
        }}
        style="display: none"
      />
      <FrameTop
        panelChildren={
          <div class="flex items-center justify-between border-b border-base-300 overflow-y-hidden">
            <div class="flex-1 overflow-x-auto">
              <TabsNavigation tabs={tabs} />
            </div>
            <div class="ui-pad flex ui-gap-sm -my-2">
              <Button
                onClick={handleDownload}
                outline
                iconName="download"
              ></Button>
              <Button
                onClick={handleUploadClick}
                outline
                iconName="upload"
              ></Button>
              <Show when={p.onClose}>
                <Button
                  onClick={p.onClose}
                  outline
                  iconName="minus"
                  intent="base-content"
                ></Button>
              </Show>
            </div>
          </div>
        }
      >
        <Switch>
          <Match when={tabs.isTabActive("baseline")}>
            <BaselineTab params={p.params} setParams={p.setParams} />
          </Match>
          <Match when={tabs.isTabActive("scenarios")}>
            <ScenariosTab params={p.params} setParams={p.setParams} />
          </Match>
          <Match when={tabs.isTabActive("assumptions")}>
            <AssumptionsTab params={p.params} />
          </Match>
        </Switch>
      </FrameTop>
    </>
  );
}
