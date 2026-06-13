import type { Ctx } from "../../types";
import { DOC_GROUPS } from "../groups";

/** Prev/next group links at the foot of a docs page. <DocPrevNext group="key"/> */
export function DocPrevNext({ group }: Ctx): string {
  const i = DOC_GROUPS.findIndex((g) => g.key === group);
  const prev = i > 0 ? DOC_GROUPS[i - 1] : null;
  const next = i >= 0 && i < DOC_GROUPS.length - 1 ? DOC_GROUPS[i + 1] : null;
  const prevLink = prev
    ? `<a href="#docs/${prev.key}" :click=setDocGroup(group=${prev.key})>&larr; ${prev.label}</a>`
    : `<span></span>`;
  const nextLink = next
    ? `<a class="is-next" href="#docs/${next.key}" :click=setDocGroup(group=${next.key})>${next.label} &rarr;</a>`
    : ``;
  return `<nav class="docs-prevnext">${prevLink}${nextLink}</nav>`;
}
