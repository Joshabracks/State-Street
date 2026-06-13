import { State } from "@state-street/state-street";
import "./styles/index.css";

import { data, methods, parseHash } from "./state";
import { DOC_GROUP_MAP } from "./docs/groups";
import { AppRoot, Content } from "./app.sst";
import { SiteHeader } from "./components/SiteHeader.sst";
import { SiteFooter } from "./components/SiteFooter.sst";
import { CodeBlock } from "./components/CodeBlock.sst";
import { Landing } from "./views/Landing.sst";
import { StyleGuide } from "./views/StyleGuide.sst";
import { Examples } from "./views/Examples.sst";

// Docs shell + helpers + group pages.
import { Docs, DocsSidebar, DocsContent, DocsToc } from "./views/Docs.sst";
import { DocCode } from "./docs/components/DocCode.sst";
import { DocPrevNext } from "./docs/components/DocPrevNext.sst";
import { DocGettingStarted } from "./docs/groups/GettingStarted.sst";
import { DocCoreConcepts } from "./docs/groups/CoreConcepts.sst";
import { DocTemplates } from "./docs/groups/Templates.sst";
import { DocApi } from "./docs/groups/Api.sst";
import { DocReactivity } from "./docs/groups/Reactivity.sst";
import { DocPatterns } from "./docs/groups/Patterns.sst";
import { DocFaq } from "./docs/groups/Faq.sst";

// Component registry. State Street matches `<Tag/>` against these keys.
const components = {
  AppRoot, Content, SiteHeader, SiteFooter, CodeBlock,
  Landing, StyleGuide, Examples,
  // docs shell + parts
  Docs, DocsSidebar, DocsContent, DocsToc, DocCode, DocPrevNext,
  // docs group pages (names match DOC_GROUPS[].component)
  DocGettingStarted, DocCoreConcepts, DocTemplates, DocApi, DocReactivity, DocPatterns, DocFaq,
};

const template = `<AppRoot/>`;

function boot(): void {
  const app = new State(template, data, components, methods);

  // Keep view + docs group in sync with the URL (back/forward, deep links).
  window.addEventListener("hashchange", () => {
    const { view, group } = parseHash();
    if (app.data.view !== view) app.data.view = view;
    if (group && DOC_GROUP_MAP[group] && app.data.docGroup !== group) app.data.docGroup = group;
  });

  // Docs scroll-spy: rAF-throttled, only while on the docs view. Sets the active
  // section (the last one scrolled past the header); only DocsToc reads it.
  let spyScheduled = false;
  window.addEventListener("scroll", () => {
    if (spyScheduled) return;
    spyScheduled = true;
    requestAnimationFrame(() => {
      spyScheduled = false;
      if (app.data.view !== "docs") return;
      const secs = document.querySelectorAll(".docs-section");
      if (!secs.length) return;
      let current = secs[0].id;   // default to first when scrolled above all of them
      for (let i = 0; i < secs.length; i++) {
        if (secs[i].getBoundingClientRect().top <= 120) current = secs[i].id;
        else break;
      }
      if (app.data.docActiveSection !== current) app.data.docActiveSection = current;
    });
  }, { passive: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
