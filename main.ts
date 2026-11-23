// GTA VI trophy guide entry (Node 22, standard library only).
//
// The guide itself is plain static files under app/: an index page, a
// stylesheet, one script and the trophy data in app/data/trophies.json.
// It opens in a desktop browser, works with the network off, and needs
// no build step. This program is only the hand-in: it copies app/ and
// screenshots/ next to this file into the output folder the grader
// provides, then writes the dossier summary the judge reads, using the
// vendored make.fun library. vendor/makefun-frontend.ts stays untouched:
// the scorer rebuilds the dossier with its own copy and compares bytes.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the guide while you work on it with: node serve.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const appDir = join(rootDir, "app");
const shotsDir = join(rootDir, "screenshots");

mkdirSync(outputDir, { recursive: true });
cpSync(appDir, join(outputDir, "app"), { recursive: true });
mkdirSync(join(outputDir, "screenshots"), { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, "screenshots"), { recursive: true });
}

// Caps mirror the scorer's gate so a local run refuses what the
// scorer would refuse: at most 4 screenshots, each at most 256 KiB,
// app/ at most 993 files and directories and 48 MiB, dossier text
// at most 160 KiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, "dossier.json"), dossier);
