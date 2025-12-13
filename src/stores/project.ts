import { createStore, unwrap } from "solid-js/store";
import { get, set, del } from "idb-keyval";
import type { Report } from "~/types/reports";
import type { Parameters, ScenarioParameters, SourceInfo } from "~/types/mod";
import { _FORMAL_ITEMS } from "~/config/items";

const STORAGE_KEY = "who_abortion_care_projects";

export type BaselineMetadata =
  | {
      type: "project-creation";
      importedAt: Date;
      dataSource: {
        id: string;
        label: string;
        columnName: string;
      };
    }
  | {
      type: "csv-upload";
      importedAt: Date;
      filename: string;
    };

export type UploadedFile = {
  file_id: string;
  filename: string;
  uploadedAt: Date;
  size_bytes: number;
};

export type Project = {
  id: string;
  name: string;
  country: string;
  lastModified: Date;
  baselineMetadata?: BaselineMetadata;
  params: Parameters;
  reports: Report[];
  userContext?: string;
  uploadedFiles?: UploadedFile[];
};

type StoredReport = Omit<Report, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt?: string;
};

type StoredUploadedFile = Omit<UploadedFile, "uploadedAt"> & {
  uploadedAt: string;
};

type StoredBaselineMetadata =
  | {
      type: "project-creation";
      importedAt: string;
      dataSource: {
        id: string;
        label: string;
        columnName: string;
      };
    }
  | {
      type: "csv-upload";
      importedAt: string;
      filename: string;
    };

type StoredProject = Omit<
  Project,
  "lastModified" | "baselineMetadata" | "reports" | "uploadedFiles"
> & {
  lastModified: string;
  baselineMetadata?: StoredBaselineMetadata;
  reports: StoredReport[];
  uploadedFiles?: StoredUploadedFile[];
};

type ProjectStoreState = {
  currentProjectId: string | null;
  currentProject: Project | null;
  allProjects: Project[];
};

const [state, setState] = createStore<ProjectStoreState>({
  currentProjectId: null,
  currentProject: null,
  allProjects: [],
});

export const projectStore = {
  get currentProject() {
    return state.currentProject;
  },

  get currentParams() {
    return state.currentProject?.params;
  },

  get reports() {
    return state.currentProject?.reports || [];
  },

  get userContext() {
    return state.currentProject?.userContext || "";
  },

  get uploadedFiles() {
    return state.currentProject?.uploadedFiles || [];
  },

  get allProjects() {
    return state.allProjects;
  },

  async loadProject(projectId: string) {
    const project = await getProjectFromStorage(projectId);
    setState({
      currentProjectId: projectId,
      currentProject: project,
    });
    // Validate uploaded files in background (don't block load)
    if (project?.uploadedFiles?.length) {
      this.validateUploadedFiles();
    }
  },

  async reloadCurrentProject() {
    if (state.currentProjectId) {
      await this.loadProject(state.currentProjectId);
    }
  },

  async loadAllProjects() {
    const projects = await getAllProjectsFromStorage();
    setState("allProjects", projects);
  },

  async reloadAllProjects() {
    await this.loadAllProjects();
  },

  updateParams(...path: any[]) {
    if (!state.currentProject) {
      throw new Error("No project loaded");
    }
    const value = path[path.length - 1];
    const pathWithoutValue = [
      "currentProject",
      "params",
      ...path.slice(0, -1),
    ] as const;
    (setState as any)(...pathWithoutValue, value);
    debouncedSyncToStorage();
  },

  updateProjectName(name: string) {
    if (!state.currentProject) {
      throw new Error("No project loaded");
    }
    setState("currentProject", "name", name);
    debouncedSyncToStorage();
  },

  updateProjectCountry(country: string) {
    if (!state.currentProject) {
      throw new Error("No project loaded");
    }
    setState("currentProject", "country", country);
    debouncedSyncToStorage();
  },

  updateUserContext(userContext: string) {
    if (!state.currentProject) {
      throw new Error("No project loaded");
    }
    setState("currentProject", "userContext", userContext);
    debouncedSyncToStorage();
  },

  updateBaselineMetadata(filename: string) {
    if (!state.currentProject) {
      throw new Error("No project loaded");
    }
    const baselineMetadata: BaselineMetadata = {
      type: "csv-upload",
      importedAt: new Date(),
      filename,
    };
    setState("currentProject", "baselineMetadata", baselineMetadata);
    debouncedSyncToStorage();
  },

  async createProject(
    name: string,
    country: string,
    params: Parameters,
    dataSource: { id: string; label: string; columnName: string }
  ) {
    const project = await createProjectInStorage(
      name,
      country,
      params,
      dataSource
    );
    await this.loadAllProjects();
    return project;
  },

  async duplicateProject(sourceProjectId: string, newName: string) {
    const project = await duplicateProjectInStorage(sourceProjectId, newName);
    await this.loadAllProjects();
    return project;
  },

  async deleteProject(projectId: string) {
    await deleteProjectFromStorage(projectId);
    await this.loadAllProjects();
    if (state.currentProjectId === projectId) {
      setState({
        currentProjectId: null,
        currentProject: null,
      });
    }
  },

  addReport(report: Report) {
    if (!state.currentProject) {
      throw new Error("No project loaded");
    }
    setState("currentProject", "reports", (reports) => [...reports, report]);
    debouncedSyncToStorage();
  },

  updateReport(updatedReport: Report) {
    if (!state.currentProject) {
      throw new Error("No project loaded");
    }
    const index = state.currentProject.reports.findIndex(
      (r) => r.id === updatedReport.id
    );
    if (index === -1) {
      throw new Error(`Report not found: ${updatedReport.id}`);
    }
    setState("currentProject", "reports", index, updatedReport);
    debouncedSyncToStorage();
  },

  deleteReport(reportId: string) {
    if (!state.currentProject) {
      throw new Error("No project loaded");
    }
    setState("currentProject", "reports", (reports) =>
      reports.filter((r) => r.id !== reportId)
    );
    debouncedSyncToStorage();
  },

  addUploadedFile(file: UploadedFile) {
    if (!state.currentProject) {
      throw new Error("No project loaded");
    }
    const currentFiles = state.currentProject.uploadedFiles || [];
    setState("currentProject", "uploadedFiles", [...currentFiles, file]);
    debouncedSyncToStorage();
  },

  removeUploadedFile(fileId: string) {
    if (!state.currentProject) {
      throw new Error("No project loaded");
    }
    const currentFiles = state.currentProject.uploadedFiles || [];
    setState(
      "currentProject",
      "uploadedFiles",
      currentFiles.filter((f) => f.file_id !== fileId)
    );
    debouncedSyncToStorage();
  },

  async validateUploadedFiles() {
    if (!state.currentProject?.uploadedFiles?.length) {
      return;
    }

    const files = state.currentProject.uploadedFiles;
    const invalidFileIds: string[] = [];

    // Check each file against Anthropic API
    for (const file of files) {
      try {
        const response = await fetch(`/api/files/${file.file_id}`);
        if (!response.ok) {
          // File doesn't exist on Anthropic servers
          invalidFileIds.push(file.file_id);
        }
      } catch {
        // Network error - assume file is invalid
        invalidFileIds.push(file.file_id);
      }
    }

    // Remove invalid files from local storage
    if (invalidFileIds.length > 0) {
      console.warn(
        `Removing ${invalidFileIds.length} invalid file(s) that no longer exist on Anthropic servers:`,
        invalidFileIds
      );
      const validFiles = files.filter((f) => !invalidFileIds.includes(f.file_id));
      setState("currentProject", "uploadedFiles", validFiles);
      debouncedSyncToStorage();
    }
  },

  generateReportId() {
    return crypto.randomUUID();
  },

  async clearAllProjects() {
    await del(STORAGE_KEY);
    setState({
      currentProjectId: null,
      currentProject: null,
      allProjects: [],
    });
  },

  async flushPendingSync() {
    await flushPendingSync();
  },

  resetBaselineToOriginal() {
    if (!state.currentProject) {
      throw new Error("No project loaded");
    }
    if (!state.currentProject.params.originalBaseline) {
      throw new Error("No original baseline data available");
    }

    const originalBaseline = JSON.parse(
      JSON.stringify(state.currentProject.params.originalBaseline)
    );

    originalBaseline.id = state.currentProject.params.baseline.id;
    originalBaseline.name = state.currentProject.params.baseline.name;

    setState("currentProject", "params", "baseline", originalBaseline);

    debouncedSyncToStorage();
  },

  resetBaselineParameter(category: string, property: string) {
    if (!state.currentProject) {
      throw new Error("No project loaded");
    }
    if (!state.currentProject.params.originalBaseline) {
      throw new Error("No original baseline data available");
    }

    const originalValue = (state.currentProject.params.originalBaseline as any)[
      category
    ]?.[property];

    if (originalValue === undefined) {
      throw new Error(`Original value not found for ${category}.${property}`);
    }

    setState(
      "currentProject",
      "params",
      "baseline",
      category as any,
      property as any,
      originalValue
    );

    debouncedSyncToStorage();
  },

  updateBaselineSourceInfo(paramKey: string, sourceInfo: SourceInfo) {
    if (!state.currentProject) {
      throw new Error("No project loaded");
    }

    if (!state.currentProject.params.baselineSourceInfo) {
      setState("currentProject", "params", "baselineSourceInfo", {});
    }

    setState(
      "currentProject",
      "params",
      "baselineSourceInfo",
      paramKey,
      sourceInfo
    );

    debouncedSyncToStorage();
  },
};

function validateScenarioParameters(params: ScenarioParameters): void {
  // Validate that all required readiness parameters exist
  for (const item of _FORMAL_ITEMS) {
    if (params.facilityReadiness[item.id] === undefined) {
      throw new Error(
        `Missing readiness parameter: facilityReadiness.${item.id}`
      );
    }
  }

  // Validate access parameters
  if (params.facilityAccess.pFacilityOffersPostAbortionCare === undefined) {
    throw new Error(
      `Missing access parameter: facilityAccess.pFacilityOffersPostAbortionCare`
    );
  }
}

async function getProjectsMap(): Promise<Record<string, StoredProject>> {
  try {
    const stored = await get<Record<string, StoredProject>>(STORAGE_KEY);
    return stored || {};
  } catch (error) {
    console.error("Error loading projects from storage, clearing:", error);
    await del(STORAGE_KEY);
    return {};
  }
}

async function saveProjectsMap(
  map: Record<string, StoredProject>
): Promise<void> {
  await set(STORAGE_KEY, map);
}

function deserializeProject(stored: StoredProject): Project {
  let baselineMetadata: BaselineMetadata | undefined;

  if (stored.baselineMetadata) {
    if (stored.baselineMetadata.type === "project-creation") {
      baselineMetadata = {
        type: "project-creation",
        importedAt: new Date(stored.baselineMetadata.importedAt),
        dataSource: stored.baselineMetadata.dataSource,
      };
    } else {
      baselineMetadata = {
        type: "csv-upload",
        importedAt: new Date(stored.baselineMetadata.importedAt),
        filename: stored.baselineMetadata.filename,
      };
    }
  }

  const project: Project = {
    ...stored,
    lastModified: new Date(stored.lastModified),
    baselineMetadata,
    reports: (stored.reports || []).map((r) => ({
      ...r,
      createdAt: new Date(r.createdAt),
      updatedAt: r.updatedAt ? new Date(r.updatedAt) : undefined,
      markdown:
        r.markdown ||
        "# " +
          (r.name || "Report") +
          "\n\n*This report was created before markdown support.*",
      images: r.images || [],
    })),
    uploadedFiles: (stored.uploadedFiles || []).map((f) => ({
      ...f,
      uploadedAt: new Date(f.uploadedAt),
    })),
  };

  // Validate parameters - will throw if missing required fields
  validateScenarioParameters(project.params.baseline);
  project.params.scenarios.forEach((scenario) => {
    validateScenarioParameters(scenario);
  });

  if (!project.params.baseline.id) {
    project.params.baseline.id = crypto.randomUUID();
  }
  project.params.scenarios.forEach((scenario) => {
    if (!scenario.id) {
      scenario.id = crypto.randomUUID();
    }
  });

  // Validate data structure - throw error if anything is missing
  if (!project.country) {
    throw new Error("Invalid stored project: missing country");
  }
  if (!project.params.baseline.pregnancyOutcomes) {
    throw new Error("Invalid stored project: missing pregnancyOutcomes");
  }
  if (!project.params.baseline.facilityAccess) {
    throw new Error("Invalid stored project: missing facilityAccess");
  }
  if (!project.params.baseline.outOfFacilityAccess) {
    throw new Error("Invalid stored project: missing outOfFacilityAccess");
  }
  if (typeof project.params.baseline.demand?.pPreferFacility !== "number") {
    throw new Error("Invalid stored project: missing pPreferFacility");
  }

  // Force contraindication to 0 for all scenarios
  project.params.baseline.pregnancyOutcomes.pResultingInContraindication = 0;
  project.params.scenarios.forEach((scenario) => {
    scenario.pregnancyOutcomes.pResultingInContraindication = 0;
  });

  // Ensure baselineSourceInfo exists for old projects
  if (!project.params.baselineSourceInfo) {
    project.params.baselineSourceInfo = {};
  }

  return project;
}

function serializeProject(project: Project): StoredProject {
  let baselineMetadata: StoredBaselineMetadata | undefined;

  if (project.baselineMetadata) {
    if (project.baselineMetadata.type === "project-creation") {
      baselineMetadata = {
        type: "project-creation",
        importedAt: project.baselineMetadata.importedAt.toISOString(),
        dataSource: project.baselineMetadata.dataSource,
      };
    } else {
      baselineMetadata = {
        type: "csv-upload",
        importedAt: project.baselineMetadata.importedAt.toISOString(),
        filename: project.baselineMetadata.filename,
      };
    }
  }

  return {
    ...project,
    lastModified: project.lastModified.toISOString(),
    baselineMetadata,
    reports: project.reports.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt?.toISOString(),
    })),
    uploadedFiles: (project.uploadedFiles || []).map((f) => ({
      ...f,
      uploadedAt: f.uploadedAt.toISOString(),
    })),
  };
}

async function getProjectFromStorage(id: string): Promise<Project | null> {
  const map = await getProjectsMap();
  const stored = map[id];
  if (!stored) {
    return null;
  }
  try {
    return deserializeProject(stored);
  } catch (error) {
    console.error("Error deserializing project, clearing all storage:", error);
    await del(STORAGE_KEY);
    return null;
  }
}

// IMPORTANT: Project loading validation strategy
// When loading projects from storage, we validate that all required parameters exist.
// If a project has missing parameters (e.g., after model updates add new required fields),
// we SKIP that project rather than providing defaults or failing silently.
// This is a deliberate design decision:
// - Individual project load failures do not break the entire app
// - Projects with missing parameters are silently skipped
// - User will not see incompatible projects in their project list
// - This allows the app to continue working even with legacy projects in storage
// To fix: User must re-import project data from an updated CSV file
async function getAllProjectsFromStorage(): Promise<Project[]> {
  const map = await getProjectsMap();
  const projects: Project[] = [];
  let hasCorruptProjects = false;

  for (const stored of Object.values(map)) {
    try {
      const project = deserializeProject(stored);
      projects.push(project);
    } catch (error) {
      console.warn(
        `Removing corrupt project ${stored.id} (${stored.name}) from IndexedDB due to deserialization error:`,
        error
      );
      delete map[stored.id];
      hasCorruptProjects = true;
    }
  }

  // Save updated map if we removed any corrupt projects
  if (hasCorruptProjects) {
    await saveProjectsMap(map);
  }

  return projects.sort(
    (a, b) => b.lastModified.getTime() - a.lastModified.getTime()
  );
}

async function saveProjectToStorage(project: Project): Promise<void> {
  const map = await getProjectsMap();
  map[project.id] = serializeProject({
    ...project,
    lastModified: new Date(),
  });
  await saveProjectsMap(map);
}

async function createProjectInStorage(
  name: string,
  country: string,
  params: Parameters,
  dataSource: { id: string; label: string; columnName: string }
): Promise<Project> {
  const baselineMetadata: BaselineMetadata = {
    type: "project-creation",
    importedAt: new Date(),
    dataSource,
  };

  const project: Project = {
    id: crypto.randomUUID(),
    name,
    country,
    lastModified: new Date(),
    baselineMetadata,
    params,
    reports: [],
    uploadedFiles: [],
  };
  await saveProjectToStorage(project);
  return project;
}

async function duplicateProjectInStorage(
  sourceProjectId: string,
  newName: string
): Promise<Project> {
  const sourceProject = await getProjectFromStorage(sourceProjectId);
  if (!sourceProject) {
    throw new Error("Source project not found");
  }

  const clonedParams = structuredClone(sourceProject.params);
  clonedParams.baseline.id = crypto.randomUUID();
  clonedParams.scenarios.forEach((scenario: ScenarioParameters) => {
    scenario.id = crypto.randomUUID();
  });

  const clonedReports = structuredClone(sourceProject.reports);
  clonedReports.forEach((report: Report) => {
    report.id = crypto.randomUUID();
    report.createdAt = new Date();
    report.updatedAt = undefined;
  });

  const project: Project = {
    id: crypto.randomUUID(),
    name: newName,
    country: sourceProject.country,
    lastModified: new Date(),
    baselineMetadata: sourceProject.baselineMetadata
      ? structuredClone(sourceProject.baselineMetadata)
      : undefined,
    params: clonedParams,
    reports: clonedReports,
    userContext: sourceProject.userContext,
    uploadedFiles: [],
  };

  await saveProjectToStorage(project);
  return project;
}

async function deleteProjectFromStorage(id: string): Promise<void> {
  const map = await getProjectsMap();
  delete map[id];
  await saveProjectsMap(map);
}

async function syncToStorage(): Promise<void> {
  if (state.currentProject) {
    const unwrapped = unwrap(state.currentProject);
    await saveProjectToStorage(unwrapped);
  }
}

let syncTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingSync: Promise<void> | null = null;

function debouncedSyncToStorage(): void {
  if (syncTimeout !== null) {
    clearTimeout(syncTimeout);
  }

  pendingSync = new Promise((resolve) => {
    syncTimeout = setTimeout(async () => {
      await syncToStorage();
      syncTimeout = null;
      pendingSync = null;
      resolve();
    }, 300);
  });
}

async function flushPendingSync(): Promise<void> {
  if (pendingSync) {
    await pendingSync;
  }
}
