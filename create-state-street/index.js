#!/usr/bin/env node
/**
 * create-state-street — scaffolds a new State Street app.
 *
 *   npm create @state-street@latest my-app            # plain JS, no build step
 *   npm create @state-street@latest my-app -- --typescript   # TS + webpack
 *
 * Zero dependencies: Node built-ins only.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES = path.join(__dirname, "templates");

const c = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

function fail(msg) {
  console.error("\n" + c.red("✗ " + msg) + "\n");
  process.exit(1);
}

const argv = process.argv.slice(2);
const useTs = argv.includes("--typescript") || argv.includes("--ts");
const dirArg = argv.find((a) => !a.startsWith("-")) || "state-street-app";

const target = path.resolve(process.cwd(), dirArg);
const pkgName =
  path.basename(target).toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^[._-]+/, "") ||
  "state-street-app";

if (fs.existsSync(target) && fs.readdirSync(target).length > 0) {
  fail(`Target directory "${dirArg}" already exists and is not empty.`);
}

const variant = useTs ? "ts" : "js";
const replace = (s) => s.split("{{PROJECT_NAME}}").join(pkgName);
const TEXT = /\.(json|md|html|js|mjs|cjs|ts|css|txt)$/;

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    // npm strips a literal `.gitignore` from published packages, so it's stored as
    // `gitignore` in the template and restored here.
    const destName = entry.name === "gitignore" ? ".gitignore" : entry.name;
    const dest = path.join(to, destName);
    if (entry.isDirectory()) {
      copyDir(src, dest);
    } else if (TEXT.test(entry.name) || destName === ".gitignore") {
      fs.writeFileSync(dest, replace(fs.readFileSync(src, "utf8")));
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

copyDir(path.join(TEMPLATES, "common"), target);
copyDir(path.join(TEMPLATES, variant), target);

const rel = path.relative(process.cwd(), target) || ".";
console.log(
  "\n" +
    c.green("✔") +
    " Created a State Street " +
    c.bold(useTs ? "TypeScript" : "JavaScript") +
    " app in " +
    c.bold(rel) +
    "\n"
);
console.log(c.bold("Next steps:"));
console.log("  cd " + rel);
if (useTs) {
  console.log("  npm install");
  console.log("  npm run dev        " + c.dim("# webpack dev server"));
} else {
  console.log("  npm run dev        " + c.dim("# serves the folder (or just open index.html)"));
}
console.log(
  "\n" +
    c.dim("AGENTS.md is included — copy it to your AI assistant's rules (AGENTS.md / CLAUDE.md)") +
    "\n" +
    c.dim("for idiomatic State Street. Docs: https://joshabracks.github.io/State-Street/") +
    "\n"
);
