import { trackStore } from "@solid-primitives/deep";
import { useNavigate, useSearchParams } from "@solidjs/router";
import {
  AlertProvider,
  Button,
  FrameThreeColumnResizable,
  FrameTop,
  getPixelsFromPctClientWidth,
  openComponent,
  openAlert,
} from "panther";
import { Show, createMemo, createSignal, onMount } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import { getResults } from "~/calc_funcs/mod";
import { EditProjectForm } from "~/components/EditProjectForm";
import { DuplicateProjectForm } from "~/components/DuplicateProjectForm";
import { TopNav } from "~/components/TopNav";
import { AIAssistant } from "~/components/ai";
import { ParamEditor } from "~/components/inputs";
import { ResultsPresentation } from "~/components/results";
import { projectStore, type Project } from "~/stores/project";
import { uiStore } from "~/stores/ui";
import { t } from "~/translate/mod";
import type { Parameters, Results } from "~/types/mod";

export function Project() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = Array.isArray(searchParams.id)
    ? searchParams.id[0]
    : searchParams.id;

  const [isLoading, setIsLoading] = createSignal(true);

  onMount(async () => {
    if (projectId) {
      await projectStore.loadProject(projectId);
    }
    setIsLoading(false);

    const handleBeforeUnload = () => {
      projectStore.flushPendingSync();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handleBeforeUnload);
    };
  });

  return (
    <Show
      when={projectId}
      fallback={<ErrorPage message={t("No project ID provided")} />}
    >
      {(id) => (
        <Show
          when={!isLoading()}
          fallback={<div class="ui-pad">{t("Loading...")}</div>}
        >
          <Show
            when={projectStore.currentProject}
            fallback={<ErrorPage message={`${t("Project not found:")} ${id()}`} />}
          >
            {(project) => (
              <ProjectContent
                project={project()}
                projectId={id()}
                navigate={navigate}
              />
            )}
          </Show>
        </Show>
      )}
    </Show>
  );
}

function ProjectContent(props: {
  project: Project;
  projectId: string;
  navigate: (path: string) => void;
}) {
  const params = () => props.project.params;

  const setParams: SetStoreFunction<Parameters> = (...args: any[]) => {
    projectStore.updateParams(...args);
  };

  const handleEditProject = async () => {
    const result = await openComponent({
      element: EditProjectForm,
      props: { project: props.project },
    });

    if (result === "DELETED") {
      props.navigate("/projects");
    } else if (result === "NEEDS_UPDATE") {
      await projectStore.flushPendingSync();
      await projectStore.reloadCurrentProject();
    } else if (
      typeof result === "object" &&
      result?.action === "DUPLICATE_REQUESTED"
    ) {
      await handleDuplicateFromEdit(result.projectId, result.projectName);
    }
  };

  const handleDuplicateFromEdit = async (
    projectId: string,
    projectName: string
  ) => {
    const result = await openComponent({
      element: DuplicateProjectForm,
      props: { currentName: projectName },
    });

    if (!result) {
      return;
    }

    try {
      await projectStore.flushPendingSync();
      const duplicatedProject = await projectStore.duplicateProject(
        projectId,
        result.name
      );
      window.location.href = `/project?id=${duplicatedProject.id}`;
    } catch (error) {
      await openAlert({
        text: `Failed to duplicate project: ${
          error instanceof Error ? error.message : t("Unknown error")
        }`,
        intent: "danger",
      });
    }
  };

  const results = createMemo<Results>(() => {
    const p = params();
    trackStore(p);
    return getResults(p);
  });

  const visiblePaneCount = createMemo(() => {
    const visibility = uiStore.paneVisibility;
    return Object.values(visibility).filter((v) => v).length;
  });

  const [resetKey, setResetKey] = createSignal(new Date().toISOString());

  const updateResetKey = () => {
    setResetKey(new Date().toISOString());
  };

  return (
    <>
      <FrameTop
        panelChildren={
          <TopNav
            title={
              <>
                <a href="/" class="text-base-content hover:underline">
                  We Care
                </a>
                <span class="mx-3">/</span>
                <span>
                  {projectStore.currentProject?.name}
                  <span class="mx-3 text-neutral font-400">/</span>
                  <span class="text-neutral font-400">
                    {projectStore.currentProject?.country}
                  </span>
                </span>
              </>
            }
            navLinks={[
              { label: t("About"), href: "/welcome" },
              { label: t("Projects"), href: "/projects" },
            ]}
            buttons={[
              {
                label: t("Edit project"),
                onClick: handleEditProject,
                intent: "base-100",
                outline: true,
                iconName: "pencil",
              },
            ]}
          />
        }
      >
        <FrameThreeColumnResizable
          resetKey={resetKey()}
          startingWidths={[
            getPixelsFromPctClientWidth("36%"),
            getPixelsFromPctClientWidth("33%"),
            getPixelsFromPctClientWidth("33%"),
          ]}
          minWidths={[
            getPixelsFromPctClientWidth("15%"),
            getPixelsFromPctClientWidth("15%"),
            getPixelsFromPctClientWidth("15%"),
          ]}
          maxWidths={[
            getPixelsFromPctClientWidth("70%"),
            getPixelsFromPctClientWidth("70%"),
            getPixelsFromPctClientWidth("70%"),
          ]}
          leftChild={
            uiStore.paneVisibility.inputs ? (
              <ParamEditor
                params={params()}
                setParams={setParams}
                onClose={
                  visiblePaneCount() > 1
                    ? () => {
                        uiStore.setPaneVisibility("inputs", false);
                        updateResetKey();
                      }
                    : undefined
                }
              />
            ) : undefined
          }
          leftLabel={t("Inputs")}
          onLeftExpand={() => {
            uiStore.setPaneVisibility("inputs", true);
            updateResetKey();
          }}
          centerChild={
            uiStore.paneVisibility.results ? (
              <ResultsPresentation
                results={results()}
                params={params()}
                projectId={props.projectId}
                onClose={
                  visiblePaneCount() > 1
                    ? () => {
                        uiStore.setPaneVisibility("results", false);
                        updateResetKey();
                      }
                    : undefined
                }
              />
            ) : undefined
          }
          centerLabel={t("Results")}
          onCenterExpand={() => {
            uiStore.setPaneVisibility("results", true);
            updateResetKey();
          }}
          rightChild={
            uiStore.paneVisibility.ai ? (
              <AIAssistant
                results={results()}
                params={params()}
                setParams={setParams}
                projectId={props.projectId}
                country={props.project.country}
                userContext={props.project.userContext || ""}
                onClose={
                  visiblePaneCount() > 1
                    ? () => {
                        uiStore.setPaneVisibility("ai", false);
                        updateResetKey();
                      }
                    : undefined
                }
              />
            ) : undefined
          }
          rightLabel={t("AI")}
          onRightExpand={() => {
            uiStore.setPaneVisibility("ai", true);
            updateResetKey();
          }}
        />
      </FrameTop>
      <AlertProvider />
    </>
  );
}

function ErrorPage(p: { message: string }) {
  return (
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
      <div class="ui-pad ui-spy-sm">
        <h1 class="text-xl font-700 text-danger">{t("Error")}</h1>
        <p class="">{p.message}</p>
        <Button onClick={() => (window.location.href = "/")} intent="primary">
          {t("Return to Home")}
        </Button>
      </div>
    </FrameTop>
  );
}
