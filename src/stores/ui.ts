import { createStore } from "solid-js/store";
import type { FlowModelKey } from "~/components/results/_flow_models";

export type PaneVisibility = {
  inputs: boolean;
  results: boolean;
  ai: boolean;
};

type UIState = {
  selectedReportId: string | null;
  selectedScenarioIndex: number;
  expandedScenarioIndex: number | null;
  activeInputTab: string;
  activeResultsTab: string;
  activeAITab: string;
  paneVisibility: PaneVisibility;
  selectedFlowModel: FlowModelKey;
  debugMode: boolean;
  showRScript: boolean;
};

const [state, setState] = createStore<UIState>({
  selectedReportId: null,
  selectedScenarioIndex: -1,
  expandedScenarioIndex: null,
  activeInputTab: "baseline",
  activeResultsTab: "flow",
  activeAITab: "ai",
  paneVisibility: { inputs: true, results: true, ai: true },
  selectedFlowModel: "standard",
  debugMode: false,
  showRScript: false,
});

export const uiStore = {
  get selectedReportId() {
    return state.selectedReportId;
  },
  setSelectedReportId(id: string | null) {
    setState("selectedReportId", id);
    if (id !== null) {
      this.setPaneVisibility("results", true);
      this.setActiveResultsTab("reports");
    }
  },

  get selectedScenarioIndex() {
    return state.selectedScenarioIndex;
  },
  setSelectedScenarioIndex(index: number) {
    setState("selectedScenarioIndex", index);
    if (index === -1) {
      this.setPaneVisibility("inputs", true);
      this.setActiveInputTab("baseline");
    } else {
      this.setPaneVisibility("inputs", true);
      this.setActiveInputTab("scenarios");
      setState("expandedScenarioIndex", index);
    }
  },

  get expandedScenarioIndex() {
    return state.expandedScenarioIndex;
  },
  setExpandedScenarioIndex(index: number | null) {
    setState("expandedScenarioIndex", index);
    if (index !== null) {
      setState("selectedScenarioIndex", index);
    }
  },

  get activeInputTab() {
    return state.activeInputTab;
  },
  setActiveInputTab(tab: string | ((prev: string) => string)) {
    if (typeof tab === "function") {
      setState("activeInputTab", tab(state.activeInputTab));
    } else {
      setState("activeInputTab", tab);
    }
  },

  get activeResultsTab() {
    return state.activeResultsTab;
  },
  setActiveResultsTab(tab: string | ((prev: string) => string)) {
    if (typeof tab === "function") {
      setState("activeResultsTab", tab(state.activeResultsTab));
    } else {
      setState("activeResultsTab", tab);
    }
  },

  get paneVisibility() {
    return state.paneVisibility;
  },
  setPaneVisibility(pane: keyof PaneVisibility, visible: boolean) {
    setState("paneVisibility", pane, visible);
  },

  get selectedFlowModel() {
    return state.selectedFlowModel;
  },
  setSelectedFlowModel(model: FlowModelKey) {
    setState("selectedFlowModel", model);
  },

  get activeAITab() {
    return state.activeAITab;
  },
  setActiveAITab(tab: string | ((prev: string) => string)) {
    if (typeof tab === "function") {
      setState("activeAITab", tab(state.activeAITab));
    } else {
      setState("activeAITab", tab);
    }
  },

  get debugMode() {
    return state.debugMode;
  },
  toggleDebugMode() {
    setState("debugMode", !state.debugMode);
  },

  get showRScript() {
    return state.showRScript;
  },
  toggleShowRScript() {
    setState("showRScript", !state.showRScript);
  },
};
