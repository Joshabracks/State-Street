import type { Ctx } from "../types";
import { VERSION } from "../state";
import { DOC_GROUPS, DOC_GROUP_MAP, DEFAULT_DOC_GROUP } from "../docs/groups";

/** Docs shell: sidebar (groups) · content · TOC. Reads nothing, so it never
 *  re-renders; the three children each read docGroup and re-render on switch. */
export function Docs(_ctx: Ctx): string {
  return `
    <div class="docs-layout">
      <DocsSidebar/>
      <div class="docs-main"><DocsContent/></div>
      <DocsToc/>
    </div>
  `;
}

/** Left rail: one link per docs group, active one highlighted. */
export function DocsSidebar({ state }: Ctx): string {
  const cur = state.data.docGroup || DEFAULT_DOC_GROUP;
  const links = DOC_GROUPS.map(
    (g) =>
      `<a class="docs-nav__link" href="#docs/${g.key}" aria-current="${g.key === cur}" :click=setDocGroup(group=${g.key})>${g.label}</a>`
  ).join("");
  return `
    <aside class="docs-sidebar">
      <div class="eyebrow">Docs // SS&middot;${VERSION}</div>
      <nav class="docs-nav">${links}</nav>
    </aside>
  `;
}

/** Content pane: dispatch the active group's page component. Reads only docGroup. */
export function DocsContent({ state }: Ctx): string {
  const g = DOC_GROUP_MAP[state.data.docGroup] || DOC_GROUP_MAP[DEFAULT_DOC_GROUP];
  return `<${g.component}/>`;
}

/** Right rail: "on this page" TOC for the active group, with scroll-spy highlight. */
export function DocsToc({ state }: Ctx): string {
  const g = DOC_GROUP_MAP[state.data.docGroup] || DOC_GROUP_MAP[DEFAULT_DOC_GROUP];
  const active = state.data.docActiveSection;
  const items = g.sections
    .map(
      (s) =>
        `<button class="docs-toc__link" aria-current="${s.id === active}" :click=docScrollTo(id=${s.id})>${s.label}</button>`
    )
    .join("");
  return `
    <aside class="docs-toc">
      <div class="docs-toc__label">On this page</div>
      <nav>${items}</nav>
      <a class="docs-toc__readme" href="https://github.com/Joshabracks/State-Street#readme" target="_blank" rel="noopener">Full README &#8599;</a>
    </aside>
  `;
}
