#!/usr/bin/env node
/**
 * Copies the repo-root AGENTS.md into templates/common so the published package ships
 * the same guide every State Street project is seeded with. Run via `npm run sync-agents`
 * (and automatically on `prepack`).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, "..", "..", "AGENTS.md"); // repo root
const dest = path.resolve(here, "..", "templates", "common", "AGENTS.md");

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
console.log("Synced AGENTS.md -> " + path.relative(path.resolve(here, ".."), dest));
