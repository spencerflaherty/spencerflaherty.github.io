#!/usr/bin/env node
import { readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const COLLECTIONS_DIR = join(ROOT, "src/static/collections");
const SHARED_DIR = join(COLLECTIONS_DIR, "shared");
const IMAGE_EXT = /\.(webp|png|jpe?g|gif|svg)$/i;
const PAGES = ["home", "about", "demand-gen", "ai-systems", "digital-media"];
const OUT = join(ROOT, "keystatic.image-options.json");

function collectImages(dir, results) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      collectImages(full, results);
    } else if (IMAGE_EXT.test(entry)) {
      results.push(full);
    }
  }
}

function toPublic(full) {
  const rel = full.slice(ROOT.length).replace(/^\/+/, "");
  return "/" + rel.replace(/^src\//, "");
}

function buildOptions(pageSlug) {
  const options = [
    { label: "— No selection (use upload or manual path) —", value: "" },
  ];
  const pageImages = [];
  collectImages(join(COLLECTIONS_DIR, pageSlug), pageImages);
  pageImages.sort();
  for (const full of pageImages) {
    const publicPath = toPublic(full);
    const display = publicPath.replace(`/static/collections/${pageSlug}/`, "");
    options.push({ label: display, value: publicPath });
  }
  const sharedImages = [];
  collectImages(SHARED_DIR, sharedImages);
  sharedImages.sort();
  for (const full of sharedImages) {
    const publicPath = toPublic(full);
    const display = `shared/${publicPath.replace("/static/collections/shared/", "")}`;
    options.push({ label: display, value: publicPath });
  }
  return options;
}

const result = {};
for (const slug of PAGES) {
  result[slug] = buildOptions(slug);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(result, null, 2) + "\n");
console.log(`Wrote ${OUT}`);
