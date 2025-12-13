import { useNavigate } from "@solidjs/router";
import {
  AlertProvider,
  Button,
  FrameTop,
  Table,
  openComponent,
  type TableColumn,
  openAlert,
  timActionDelete,
  formatTimeAgo,
} from "panther";
import { onMount, Show } from "solid-js";
import { CreateProjectForm } from "~/components/CreateProjectForm";
import { DuplicateProjectForm } from "~/components/DuplicateProjectForm";
import { TopNav } from "~/components/TopNav";
import { projectStore, type Project } from "~/stores/project";
import { loadDataManifest } from "~/utils/data_manifest";
import { t } from "~/translate/mod";

export function Projects() {
  const navigate = useNavigate();

  onMount(async () => {
    await projectStore.loadAllProjects();
  });

  const projects = () => projectStore.allProjects;

  const handleCreateProject = async () => {
    const result = await openComponent<
      {},
      { name: string; country: string; dataSourceId?: string } | undefined
    >({
      element: CreateProjectForm,
      props: {},
    });
    if (!result) return;

    try {
      const manifestResponse = await loadDataManifest();
      if (!manifestResponse.success) {
        await openAlert({
          text: `Failed to load data manifest: ${manifestResponse.err}`,
          intent: "danger",
        });
        return;
      }

      const dataSource = manifestResponse.data.dataSources.find(
        (ds) => ds.id === result.dataSourceId
      );

      if (!dataSource) {
        await openAlert({
          text: `Data source '${result.dataSourceId}' not found.`,
          intent: "danger",
        });
        return;
      }

      const project = await projectStore.createProject(
        result.name,
        result.country,
        dataSource.parameters,
        {
          id: dataSource.id,
          label: dataSource.label,
          columnName: dataSource.id,
        }
      );
      navigate(`/project?id=${project.id}`);
    } catch (error) {
      await openAlert({
        text: `Failed to create project: ${
          error instanceof Error ? error.message : t("Unknown error")
        }`,
        intent: "danger",
      });
    }
  };

  const handleOpenProject = (project: Project) => {
    navigate(`/project?id=${project.id}`);
  };

  const handleDuplicateProject = async (project: Project) => {
    const result = await openComponent({
      element: DuplicateProjectForm,
      props: { currentName: project.name },
    });
    if (!result) return;

    try {
      const duplicatedProject = await projectStore.duplicateProject(
        project.id,
        result.name
      );
      navigate(`/project?id=${duplicatedProject.id}`);
    } catch (error) {
      await openAlert({
        text: `Failed to duplicate project: ${
          error instanceof Error ? error.message : t("Unknown error")
        }`,
        intent: "danger",
      });
    }
  };

  const handleDeleteProject = async (project: Project) => {
    const deleteAction = timActionDelete(
      {
        text: t("Are you sure you want to delete this project?"),
        itemList: [project.name],
      },
      async () => {
        await projectStore.deleteProject(project.id);
        return { success: true };
      }
    );

    await deleteAction.click();
  };

  const handleClearAllData = async () => {
    const deleteAction = timActionDelete(
      {
        text: t("This will permanently delete all projects. This action cannot be undone."),
        itemList: [],
      },
      async () => {
        await projectStore.clearAllProjects();
        return { success: true };
      }
    );

    await deleteAction.click();
  };

  const columns = (): TableColumn<Project>[] => [
    {
      key: "name",
      header: t("Project name"),
      sortable: true,
      render: (project) => (
        <span class="font-700 text-base">{project.name}</span>
      ),
    },
    {
      key: "country",
      header: t("Country"),
      sortable: true,
      render: (project) => <span class="">{project.country}</span>,
    },
    {
      key: "lastModified",
      header: t("Last modified"),
      sortable: true,
      render: (project) => (
        <span class="">{formatTimeAgo(project.lastModified)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "160px",
      render: (project) => (
        <div class="flex ui-gap-sm justify-end">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleDuplicateProject(project);
            }}
            outline
            iconName="copy"
            intent="neutral"
            size="sm"
          />
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteProject(project);
            }}
            outline
            intent="neutral"
            iconName="trash"
            size="sm"
          />
        </div>
      ),
    },
  ];

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
        <div class="ui-pad ui-spy bg-base-100 min-h-full">
          <div class="max-w-4xl mx-auto ui-spy pt-8">
            <h1 class="text-3xl font-700">{t("Projects")}</h1>

            <Show
              when={projects().length > 0}
              fallback={
                <div class="text-center py-12 border-base-300 rounded border bg-base-200">
                  <p class="text-xl mb-4">
                    {t("No projects found. Create one to get started.")}
                  </p>
                  <Button onClick={handleCreateProject} intent="primary">
                    {t("Create your first project")}
                  </Button>
                </div>
              }
            >
              <div class="ui-spy">
                <Table
                  data={projects()}
                  columns={columns()}
                  keyField="id"
                  onRowClick={handleOpenProject}
                  defaultSort={{ key: "lastModified", direction: "desc" }}
                  paddingX="normal"
                  paddingY="comfortable"
                />
                <div class="flex ui-gap-sm justify-between">
                  <Button
                    onClick={handleCreateProject}
                    intent="primary"
                    iconName="plus"
                  >
                    {t("New project")}
                  </Button>
                  <Button onClick={handleClearAllData} outline iconName="trash">
                    {t("Clear all data")}
                  </Button>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </FrameTop>
      <AlertProvider />
    </>
  );
}
