import type { Example } from "./types";
import { todo } from "./todo";
import { form } from "./form";
import { tabs } from "./tabs";
import { modal } from "./modal";
import { fetchEx } from "./fetch";
import { stopwatch } from "./stopwatch";

export type { Example } from "./types";

/** Ordered set of useful examples, shown paged in the sidebar. */
export const EXAMPLES: Example[] = [todo, form, tabs, modal, fetchEx, stopwatch];

export const EXAMPLE_MAP: Record<string, Example> = {};
for (const e of EXAMPLES) EXAMPLE_MAP[e.id] = e;

export const DEFAULT_EXAMPLE = EXAMPLES[0].id;
