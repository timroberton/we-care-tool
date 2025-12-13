import { useNavigate } from "@solidjs/router";
import { onMount } from "solid-js";
import { projectStore } from "~/stores/project";

export function Home() {
  const navigate = useNavigate();

  onMount(async () => {
    await projectStore.loadAllProjects();
    if (projectStore.allProjects.length === 0) {
      navigate("/welcome", { replace: true });
    } else {
      navigate("/projects", { replace: true });
    }
  });

  return null;
}
