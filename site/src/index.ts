import { State } from "@state-street/state-street";
import "./styles/index.css";

import { data, methods, VIEWS } from "./state";
import { AppRoot, Content } from "./app.sst";
import { SiteHeader } from "./components/SiteHeader.sst";
import { SiteFooter } from "./components/SiteFooter.sst";
import { CodeBlock } from "./components/CodeBlock.sst";
import { Landing } from "./views/Landing.sst";
import { StyleGuide } from "./views/StyleGuide.sst";
import { Docs } from "./views/Docs.sst";
import { Examples } from "./views/Examples.sst";

// Component registry. State Street matches `<Tag/>` against these keys, so the
// view names here must line up with the VIEWS map in state.ts.
const components = {
  AppRoot,
  Content,
  SiteHeader,
  SiteFooter,
  CodeBlock,
  Landing,
  StyleGuide,
  Docs,
  Examples,
};

const template = `<AppRoot/>`;

function boot(): void {
  const app = new State(template, data, components, methods);

  // Keep the view in sync with browser back/forward (hash changes not driven by setView).
  window.addEventListener("hashchange", () => {
    const key = (location.hash || "").replace(/^#/, "");
    if (VIEWS[key] && app.data.view !== key) app.data.view = key;
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
