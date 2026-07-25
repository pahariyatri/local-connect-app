#!/usr/bin/env node
/**
 * Contract-drift check: every backend endpoint the frontend calls must exist
 * in the backend's generated OpenAPI document.
 *
 * Usage:  node scripts/check-api-contract.mjs [path/to/openapi.json] [--scope=/auth]
 * --scope limits enforcement to a path prefix (e.g. the auth contract), so new
 * strict checks can land while pre-existing drift elsewhere is burned down.
 * Default spec path assumes the sibling backend checkout:
 *   ../backend/openapi.json   (generate with: npm run openapi:generate)
 *
 * Static extraction: scans services/ and contexts/ for api.<method>('/path')
 * string literals. Template-literal endpoints (dynamic IDs) are normalized to
 * OpenAPI-style {param} segments.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const args = process.argv.slice(2);
const scopeArg = args.find((a) => a.startsWith('--scope='));
const scope = scopeArg ? scopeArg.slice('--scope='.length) : '';
const specPath = resolve(args.find((a) => !a.startsWith('--')) ?? '../backend/openapi.json');

let spec;
try {
  spec = JSON.parse(readFileSync(specPath, 'utf8'));
} catch {
  console.error(`✖ Cannot read OpenAPI spec at ${specPath}.`);
  console.error('  Generate it in the backend repo first: npm run openapi:generate');
  process.exit(2);
}

const specPaths = new Set(
  Object.keys(spec.paths).map((p) => p.replace(/^\/api(\/v\d+)?/, '').replace(/\{[^}]+\}/g, '{}')),
);

const CALL_RE = /api\.(?:get|post|put|patch|delete)(?:<[^>]*>)?\(\s*[`'"]([^`'"]+)[`'"]/g;

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (/\.(ts|tsx)$/.test(entry)) yield full;
  }
}

const used = new Map(); // normalized path -> [file refs]
for (const dir of ['services', 'contexts', 'lib']) {
  for (const file of walk(dir)) {
    const src = readFileSync(file, 'utf8');
    for (const match of src.matchAll(CALL_RE)) {
      const raw = match[1].split('?')[0];
      const normalized = raw.replace(/\$\{[^}]+\}/g, '{}');
      // Skip endpoints the static parser cannot resolve (nested/complex
      // template literals) — they surface as stray '$' or bare '{}'.
      if (normalized.includes('$') || normalized === '{}' || !normalized.startsWith('/')) continue;
      if (scope && !normalized.startsWith(scope)) continue;
      if (!used.has(normalized)) used.set(normalized, []);
      used.get(normalized).push(file);
    }
  }
}

let missing = 0;
for (const [path, files] of [...used.entries()].sort()) {
  if (!specPaths.has(path)) {
    missing++;
    console.error(`✖ Frontend calls undocumented endpoint: ${path}`);
    files.forEach((f) => console.error(`    referenced in ${f}`));
  }
}

if (missing > 0) {
  console.error(`\n✖ Contract drift: ${missing} endpoint(s) missing from the backend OpenAPI document.`);
  process.exit(1);
}
console.log(`✔ Contract check passed: ${used.size} unique endpoints all documented.`);
