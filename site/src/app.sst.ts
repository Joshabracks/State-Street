import type { Ctx } from "./types";
import { VIEWS } from "./state";

/** Root shell: sticky header, the active view, and the footer. */
export function AppRoot(_ctx: Ctx): string {
  return `
    <div class="shell">
      <SiteHeader/>
      <main><Content/></main>
      <SiteFooter/>
    </div>
  `;
}

/**
 * View dispatcher. Reads only `state.data.view`, so it is the single component
 * that re-renders on navigation. `<${name}/>` resolves to a registered view
 * component (State Street matches component tags by registry membership).
 */
export function Content({ state }: Ctx): string {
  const name = VIEWS[state.data.view] || "Landing";
  return `<${name}/>`;
}
