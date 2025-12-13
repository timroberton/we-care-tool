import { useNavigate } from "@solidjs/router";
import {
  AlertProvider,
  Button,
  FrameTop,
  SelectList,
  MarkdownPresentation,
} from "panther";
import { createMemo, createSignal, Match, Switch, onMount } from "solid-js";
import { TopNav } from "~/components/TopNav";
import { projectStore } from "~/stores/project";
import { getAboutContent, type TabId } from "~/about_text/loader";
import { t } from "~/translate/mod";

export function Welcome() {
  const [selectedTab, setSelectedTab] = createSignal<TabId>("welcome");
  const navigate = useNavigate();

  onMount(async () => {
    await projectStore.loadAllProjects();
  });

  const hasProjects = createMemo(() => projectStore.allProjects.length > 0);

  const goToProjects = () => {
    navigate("/projects");
  };

  return (
    <>
      <FrameTop
        panelChildren={
          <TopNav
            title={
              <a href="/" class="text-base-content hover:underline">
                We Care
              </a>
            }
            navLinks={[
              { label: t("About"), href: "/welcome" },
              { label: t("Projects"), href: "/projects" },
            ]}
          />
        }
      >
        <div class="ui-pad-lg ui-spy bg-base-100 w-full h-full overflow-y-scroll">
          <div class="max-w-6xl mx-auto pt-8">
            <div class="grid grid-cols-1 lg:grid-cols-[200px_1fr] ui-gap">
              <div class="lg:sticky lg:top-8 lg:self-start ui-spy">
                <div class="border-base-300 ui-pad rounded border bg-base-100">
                  <SelectList
                    options={[
                      { value: "welcome", label: t("Welcome") },
                      { value: "using", label: t("Using the Tool") },
                      { value: "methodology", label: t("Model Methodology") },
                      { value: "ai", label: t("AI Analysis Assistant") },
                      { value: "faq", label: t("FAQ") },
                    ]}
                    value={selectedTab()}
                    onChange={(value) => setSelectedTab(value as TabId)}
                    fullWidth
                  />
                </div>

                <div class="text-center">
                  <Switch>
                    <Match when={hasProjects()}>
                      <Button onClick={goToProjects} intent="primary" fullWidth>
                        {t("Go to projects")}
                      </Button>
                    </Match>
                    <Match when={true}>
                      <Button onClick={goToProjects} intent="primary" fullWidth>
                        {t("Create your first project")}
                      </Button>
                    </Match>
                  </Switch>
                </div>
              </div>

              <div class="border-base-300 ui-pad-lg ui-spy rounded border bg-base-100">
                <Switch>
                  <Match when={selectedTab() === "welcome"}>
                    <MarkdownPresentation markdown={getAboutContent("welcome")} />
                    <div class="text-center mt-8 pt-6 border-t border-base-300">
                      <Switch>
                        <Match when={hasProjects()}>
                          <Button onClick={goToProjects} intent="primary">
                            {t("Go to projects")}
                          </Button>
                        </Match>
                        <Match when={true}>
                          <Button onClick={goToProjects} intent="primary">
                            {t("Create your first project")}
                          </Button>
                        </Match>
                      </Switch>
                    </div>
                  </Match>
                  <Match when={selectedTab() === "using"}>
                    <MarkdownPresentation markdown={getAboutContent("using")} />
                  </Match>
                  <Match when={selectedTab() === "methodology"}>
                    <MarkdownPresentation
                      markdown={getAboutContent("methodology")}
                    />
                  </Match>
                  <Match when={selectedTab() === "ai"}>
                    <MarkdownPresentation markdown={getAboutContent("ai")} />
                  </Match>
                  <Match when={selectedTab() === "faq"}>
                    <MarkdownPresentation markdown={getAboutContent("faq")} />
                  </Match>
                </Switch>
              </div>
            </div>
          </div>
        </div>
      </FrameTop>
      <AlertProvider />
    </>
  );
}
