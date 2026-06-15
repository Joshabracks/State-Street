/**
 * The full set of design tokens the Studio can edit — manually (the panel) and via
 * the SLM. `name` is the real CSS custom property (the schema's `variable` enum is
 * generated from these, so the model can only ever name a real token); `label` is the
 * token's own name; `desc` explains what the token actually does and where it shows up,
 * so both the user (panel tooltip) and the model (system prompt) treat it correctly.
 * Mirrors styles/tokens.css. Grouped by role: foregrounds, surfaces, accents.
 */
export interface EditableToken {
  name: string;                       // CSS custom property, e.g. "--accent"
  label: string;                      // the token's own name
  desc: string;                       // what it's for / where it's used
  type: "color" | "font" | "length"; // control kind
  group: string;
}

export const EDITABLE_TOKENS: EditableToken[] = [
  // --- Foreground / text colors ---
  { name: "--ink", label: "Ink", type: "color", group: "Text", desc: "Primary text and heavy rules on light backgrounds; also drives every hairline and the page grid." },
  { name: "--ink-soft", label: "Ink soft", type: "color", group: "Text", desc: "Secondary / supporting body text, a touch lighter than Ink." },
  { name: "--ink-faint", label: "Ink faint", type: "color", group: "Text", desc: "Captions, metadata and muted labels." },
  { name: "--invert-fg", label: "Invert fg", type: "color", group: "Text", desc: "Primary text and icons on dark surfaces (header, footer, code). Must contrast with Invert bg." },
  { name: "--invert-faint", label: "Invert faint", type: "color", group: "Text", desc: "Dim text on dark surfaces: code comments and code-bar labels." },
  { name: "--logo-fg", label: "Logo fg", type: "color", group: "Text", desc: "Fill of the State Street logo letterforms, sitting on the dark header." },
  { name: "--accent-ink", label: "Accent ink", type: "color", group: "Text", desc: "Text/icons placed on top of an Accent fill, e.g. buttons. Must contrast with Accent." },
  { name: "--signal-ink", label: "Signal ink", type: "color", group: "Text", desc: "Text placed on top of a Signal fill (link chips). Must contrast with Signal." },
  // --- Surface / background colors ---
  { name: "--paper", label: "Paper", type: "color", group: "Background", desc: "The main page background (warm bone / newsprint)." },
  { name: "--paper-hi", label: "Paper hi", type: "color", group: "Background", desc: "Raised panels and cards that sit above the page." },
  { name: "--paper-lo", label: "Paper lo", type: "color", group: "Background", desc: "Sunken wells and table-row stripes, slightly darker than Paper." },
  { name: "--invert-bg", label: "Invert bg", type: "color", group: "Background", desc: "Background of all dark surfaces: header, footer, table headers, code bars." },
  // --- Accent colors ---
  { name: "--accent", label: "Accent", type: "color", group: "Accent", desc: "Primary accent: buttons, active nav, key highlights (burnt orange by default)." },
  { name: "--accent-hi", label: "Accent hi", type: "color", group: "Accent", desc: "Brighter accent for hover/glow states and the logo badge." },
  { name: "--signal", label: "Signal", type: "color", group: "Accent", desc: "Secondary signal: links of record and signal tags (royal blue by default)." },
  // --- Type ---
  { name: "--font-display", label: "Display font", type: "font", group: "Type", desc: "Techno display headings." },
  { name: "--font-body", label: "Body font", type: "font", group: "Type", desc: "Body prose." },
  { name: "--font-mono", label: "Mono font", type: "font", group: "Type", desc: "Code and technical captions." },
  { name: "--font-poster", label: "Poster font", type: "font", group: "Type", desc: "Huge poster wordmarks and hero numerals." },
  // --- Shape ---
  { name: "--radius", label: "Corner radius", type: "length", group: "Shape", desc: "Corner rounding for buttons, panels and inputs (0 = sharp)." },
];

export const TOKEN_NAMES: string[] = EDITABLE_TOKENS.map((t) => t.name);
export const TOKEN_MAP: Record<string, EditableToken> = {};
for (const t of EDITABLE_TOKENS) TOKEN_MAP[t.name] = t;

/** Font choices for the manual dropdown (and what the SLM is told it may use). */
export const FONT_OPTIONS: { label: string; value: string }[] = [
  { label: "Chakra Petch", value: '"Chakra Petch", sans-serif' },
  { label: "Space Grotesk", value: '"Space Grotesk", system-ui, sans-serif' },
  { label: "JetBrains Mono", value: '"JetBrains Mono", ui-monospace, monospace' },
  { label: "Anton", value: '"Anton", sans-serif' },
  { label: "System sans", value: "system-ui, sans-serif" },
  { label: "Serif", value: 'Georgia, "Times New Roman", serif' },
  { label: "Monospace", value: "ui-monospace, monospace" },
  { label: "Cursive", value: '"Comic Sans MS", "Segoe Script", cursive' },
];
