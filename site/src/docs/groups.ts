/**
 * Docs information architecture. Each group is one "page" in the sidebar; its
 * `component` is the registered component name rendered in the content pane, and
 * `sections` drive the right-hand "on this page" TOC + scroll-spy.
 * Labels are plain text (no `<` or `{{`) so they render safely inside templates.
 */
export interface DocSection {
  id: string;
  label: string;
}
export interface DocGroup {
  key: string;
  label: string;
  component: string;
  sections: DocSection[];
}

export const DOC_GROUPS: DocGroup[] = [
  {
    key: "getting-started",
    label: "Getting Started",
    component: "DocGettingStarted",
    sections: [
      { id: "why", label: "Why State Street" },
      { id: "install", label: "Install" },
      { id: "quick-direct", label: "Quick start — direct" },
      { id: "quick-registry", label: "Quick start — registry" },
    ],
  },
  {
    key: "core-concepts",
    label: "Core Concepts",
    component: "DocCoreConcepts",
    sections: [
      { id: "reactive-state", label: "Reactive state" },
      { id: "dep-gating", label: "Dep gating" },
      { id: "return-strings", label: "Components return strings" },
      { id: "tag-vs-call", label: "Tags vs inline calls" },
    ],
  },
  {
    key: "templates",
    label: "Templates & Rendering",
    component: "DocTemplates",
    sections: [
      { id: "interpolation", label: "State Bindings" },
      { id: "component-tags", label: "Component tags" },
      { id: "events", label: "Event directives" },
      { id: "coercion", label: "Attribute coercion" },
      { id: "no-directives", label: "No if / for / bind" },
      { id: "raw", label: "Raw content & formatters" },
      { id: "svg", label: "Inline SVG & namespaces" },
      { id: "preserve", label: "Preserving elements" },
    ],
  },
  {
    key: "api",
    label: "API Reference",
    component: "DocApi",
    sections: [
      { id: "constructor", label: "Constructor" },
      { id: "options", label: "Options" },
      { id: "instance", label: "Instance members" },
      { id: "mounting", label: "Mounting & lifecycle" },
      { id: "nested-states", label: "Nested States" },
      { id: "methods", label: "Methods" },
    ],
  },
  {
    key: "reactivity",
    label: "Reactivity & Perf",
    component: "DocReactivity",
    sections: [
      { id: "model", label: "Reactivity model" },
      { id: "scheduling", label: "Render scheduling" },
      { id: "image-cache", label: "Image cache" },
    ],
  },
  {
    key: "patterns",
    label: "Patterns & Tooling",
    component: "DocPatterns",
    sections: [
      { id: "production-patterns", label: "Production patterns" },
      { id: "registry", label: "Registry pattern" },
      { id: "gotchas", label: "Gotchas" },
      { id: "tooling", label: "Tooling" },
    ],
  },
  {
    key: "ai-agents",
    label: "AI Coding Agents",
    component: "DocAiAgents",
    sections: [
      { id: "ai-why", label: "Why agents need a primer" },
      { id: "ai-setup", label: "Set up your agent" },
      { id: "ai-rules", label: "The rules, in brief" },
      { id: "ai-resources", label: "Resources" },
    ],
  },
  {
    key: "faq",
    label: "FAQ",
    component: "DocFaq",
    sections: [
      { id: "faq", label: "FAQ" },
      { id: "license", label: "License" },
    ],
  },
];

export const DOC_GROUP_MAP: Record<string, DocGroup> = {};
for (const g of DOC_GROUPS) DOC_GROUP_MAP[g.key] = g;

export const DEFAULT_DOC_GROUP = DOC_GROUPS[0].key;
