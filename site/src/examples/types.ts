/** A self-contained example app: the runnable parts (spawned as a child State via
 *  mountTarget) plus an authored, copy-pasteable `source` string for display. */
export interface Example {
  id: string;
  title: string;
  blurb: string;
  template: string;
  data: Record<string, any>;
  components: Record<string, (ctx: any) => string>;
  methods: Record<string, (ctx: any) => void>;
  source: string;
}

/** Minimal HTML-escape for user-entered text rendered into templates. */
export const esc = (s: any): string =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
