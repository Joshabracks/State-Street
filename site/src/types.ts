import type { State } from "@state-street/state-street";

/**
 * The context object every State Street component and method receives.
 * `state` is always injected; components also receive their coerced props,
 * methods also receive their event args plus the DOM `event`.
 */
export interface Ctx {
  state: State;
  [key: string]: any;
}

/** A State Street component: pure function returning an HTML template string. */
export type Component = (ctx: Ctx) => string;
