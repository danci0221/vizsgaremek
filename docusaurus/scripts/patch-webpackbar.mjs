/**
 * Patches webpackbar to fix webpack ProgressPlugin validation error on Node.js v25+.
 *
 * webpackbar stores its config in `this.options`, which collides with
 * webpack's ProgressPlugin `this.options` validation. This patch renames
 * the webpackbar-specific references to `this._barOpts`.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const nodeModules = join(__dirname, "..", "node_modules", "webpackbar", "dist");

const MARKER = "/* patched-for-node25 */";

const replacements = [
  // Rename the public field declaration
  [`__publicField(this, "options");`, `__publicField(this, "_barOpts");`],
  // Rename assignment in constructor
  [`this.options = Object.assign({}, DEFAULTS, options);`, `this._barOpts = Object.assign({}, DEFAULTS, options);`],
  // All property accesses
  [`this.options.reporters`, `this._barOpts.reporters`],
  [`this.options.reporter`, `this._barOpts.reporter`],
  [`this.options.profile`, `this._barOpts.profile`],
  [`this.options[reporter]`, `this._barOpts[reporter]`],
  [`this.options.name`, `this._barOpts.name`],
  [`this.options.color`, `this._barOpts.color`],
];

for (const file of ["index.mjs", "index.cjs"]) {
  const filePath = join(nodeModules, file);
  if (!existsSync(filePath)) continue;

  let src = readFileSync(filePath, "utf8");

  if (src.includes(MARKER)) {
    console.log(`  webpackbar/${file} already patched, skipping.`);
    continue;
  }

  // Only patch inside the WebpackBarPlugin class (after the class declaration)
  const classStart = src.indexOf("class WebpackBarPlugin extends");
  if (classStart === -1) {
    console.warn(`  Could not find WebpackBarPlugin class in ${file}, skipping.`);
    continue;
  }

  let before = src.slice(0, classStart);
  let after = src.slice(classStart);

  for (const [from, to] of replacements) {
    after = after.replaceAll(from, to);
  }

  src = before + MARKER + "\n" + after;
  writeFileSync(filePath, src, "utf8");
  console.log(`  webpackbar/${file} patched successfully.`);
}
