import { Router, Route } from "@solidjs/router";
import { Suspense } from "solid-js";
import "./app.css";
import { Home } from "./routes/index";
import { Welcome } from "./routes/welcome";
import { Projects } from "./routes/projects";
import { Project } from "./routes/project";

export function App() {
  return (
    <Router
      root={(props) => (
        <>
          <Suspense>{props.children}</Suspense>
        </>
      )}
    >
      <Route path="/" component={Home} />
      <Route path="/welcome" component={Welcome} />
      <Route path="/projects" component={Projects} />
      <Route path="/project" component={Project} />
    </Router>
  );
}
