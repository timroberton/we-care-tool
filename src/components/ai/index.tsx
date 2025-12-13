import {
  AIChat,
  AIChatProvider,
  Button,
  FrameTop,
  TabsNavigation,
  useAIChat,
  openComponent,
  type SelectOption,
  getColor,
  getAdjustedColor,
} from "panther";
import { Show, Switch, Match, createMemo, createEffect } from "solid-js";
import { type SetStoreFunction } from "solid-js/store";
import type { Parameters, Results } from "~/types/mod";
import { createAITools } from "./_tools";
import { AIDebugText, AIUserContext } from "./ai_context";
import { FileUploadPanel } from "./file_upload";
import { uiStore } from "~/stores/ui";
import { loadAIAssistantSystemPrompt } from "~/ai_context/loader";
import { AIAssistantInfoModal } from "~/components/AIAssistantInfoModal";
import { t, language } from "~/translate/mod";
import { projectStore, type UploadedFile } from "~/stores/project";

type Props = {
  results: Results;
  params: Parameters;
  setParams: SetStoreFunction<Parameters>;
  projectId: string;
  country: string;
  userContext: string;
  onClose?: () => void;
};

export function AIAssistant(p: Props) {
  const tools = createAITools({
    results: () => p.results,
    params: () => p.params,
    setParams: p.setParams,
    projectId: p.projectId,
  });

  const systemPrompt = createMemo(() =>
    loadAIAssistantSystemPrompt(p.country, p.userContext, language())
  );

  const isDev = true;

  const tabOptions = createMemo(() => {
    const baseTabs: SelectOption<string>[] = [
      { value: "ai", label: t("AI") },
      { value: "userContext", label: t("User context") },
      { value: "documents", label: t("Documents") },
    ];
    if (uiStore.debugMode) {
      baseTabs.push({ value: "debug", label: t("System context") });
    }
    return baseTabs;
  });

  const tabs = {
    currentTab: () => uiStore.activeAITab,
    setCurrentTab: (tab: string | ((prev: string) => string)) =>
      uiStore.setActiveAITab(tab),
    get tabs() {
      return tabOptions();
    },
    isTabActive: (tab: string) => uiStore.activeAITab === tab,
    getAllTabs: () => tabOptions().map((t) => t.value),
  };

  const getDocumentRefs = () =>
    projectStore.uploadedFiles.map((f) => ({
      file_id: f.file_id,
      title: f.filename,
    }));

  return (
    <AIChatProvider
      config={{
        apiConfig: {
          endpoint: "/api/ai",
        },
        conversationId: p.projectId,
        modelConfig: {
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 32768,
          temperature: 0.3,
        },
        enableStreaming: true,
        tools: tools,
        system: systemPrompt,
        getDocumentRefs,
      }}
    >
      <ChatWithHeader
        tabs={tabs}
        onClose={p.onClose}
        results={p.results}
        country={p.country}
        isDev={isDev}
        uploadedFiles={projectStore.uploadedFiles}
      />
    </AIChatProvider>
  );
}

function ChatWithHeader(props: {
  tabs: {
    currentTab: () => string;
    setCurrentTab: (tab: string | ((prev: string) => string)) => void;
    tabs: SelectOption<string>[];
    isTabActive: (tab: string) => boolean;
    getAllTabs: () => string[];
  };
  onClose?: () => void;
  results: Results;
  country: string;
  isDev: boolean;
  uploadedFiles: UploadedFile[];
}) {
  const { clearConversation, messages } = useAIChat();

  createEffect(() => {
    if (!uiStore.debugMode && props.tabs.currentTab() === "debug") {
      props.tabs.setCurrentTab("ai");
    }
  });

  async function showInfoModal() {
    await openComponent({
      element: AIAssistantInfoModal,
      props: {},
    });
  }

  return (
    <div class="h-full w-full border-l-2 border-base-content">
      <FrameTop
        panelChildren={
          <div class="flex items-center justify-between border-b border-base-300 overflow-y-hidden">
            <div class="flex-1 overflow-x-auto">
              <TabsNavigation tabs={props.tabs} />
            </div>
            <div class="ui-pad flex ui-gap-sm -my-2">
              <Button onClick={showInfoModal} outline iconName="info"></Button>
              <Show when={messages().length > 0}>
                <Button onClick={clearConversation} outline iconName="refresh">
                  {t("Clear")}
                </Button>
              </Show>
              <Show when={props.onClose}>
                <Button
                  onClick={props.onClose}
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
          <Match when={props.tabs.currentTab() === "ai"}>
            <AIChat
              placeholder={t("Type your message... (Shift+Enter for new line)")}
              thinkingText={t("Thinking...")}
              markdownStyle={{
                table: {
                  headerShading: {
                    color: getAdjustedColor(
                      { key: "primary" },
                      { opacity: 0.15 }
                    ),
                  },
                  border: {
                    color: getAdjustedColor(
                      { key: "primary" },
                      { opacity: 0.4 }
                    ),
                  },
                },
                code: {
                  backgroundColor: getAdjustedColor(
                    { key: "primary" },
                    { opacity: 0.15 }
                  ),
                },
                horizontalRule: {
                  strokeColor: getAdjustedColor(
                    { key: "primary" },
                    { opacity: 0.4 }
                  ),
                },
              }}
              fallbackContent={() => (
                <div class="text-neutral text-center ui-pad ui-spy-sm">
                  <p class="text-lg">{t("AI Analysis Assistant")}</p>
                  <p class="text-sm">
                    {t(
                      "Ask me to analyze your scenario results or create reports or add new scenarios."
                    )}
                  </p>
                </div>
              )}
            />
          </Match>
          <Match when={props.tabs.currentTab() === "documents"}>
            <FileUploadPanel uploadedFiles={props.uploadedFiles} />
          </Match>
          <Match when={props.tabs.currentTab() === "userContext"}>
            <AIUserContext />
          </Match>
          <Match when={props.tabs.currentTab() === "debug"}>
            <AIDebugText results={props.results} country={props.country} />
          </Match>
        </Switch>
      </FrameTop>
    </div>
  );
}
