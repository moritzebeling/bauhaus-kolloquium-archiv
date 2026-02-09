/**
 * Generate file sizes manifest for PDF downloads.
 *
 * Scans all PDFs in content/ and writes their file sizes
 * to content/file-sizes.json. This file is committed to the repo
 * so that human-readable file sizes can be displayed at build time.
 *
 * Usage:
 *   npm run file-sizes
 *
 * Run this whenever PDFs are added or replaced.
 */

import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content");
const OUTPUT_FILE = path.join(process.cwd(), "content", "file-sizes.json");

function findPdfs(
  dir: string,
  base = ""
): { relativePath: string; absolutePath: string }[] {
  const results: { relativePath: string; absolutePath: string }[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = base ? `${base}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      results.push(...findPdfs(fullPath, relPath));
    } else if (entry.isFile()) {
      if (path.extname(entry.name).toLowerCase() === ".pdf") {
        results.push({ relativePath: relPath, absolutePath: fullPath });
      }
    }
  }

  return results;
}

function main() {
  console.log("Scanning content/ for PDFs...");
  const pdfs = findPdfs(CONTENT_DIR);
  console.log(`Found ${pdfs.length} PDFs.\n`);

  const sizes: Record<string, number> = {};

  for (const pdf of pdfs) {
    const stat = fs.statSync(pdf.absolutePath);
    sizes[pdf.relativePath] = stat.size;
    const mb = (stat.size / (1024 * 1024)).toFixed(1);
    console.log(`  ${pdf.relativePath}  (${mb} MB)`);
  }

  // Sort keys for stable output
  const sorted: Record<string, number> = {};
  for (const key of Object.keys(sizes).sort()) {
    sorted[key] = sizes[key];
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sorted, null, 2) + "\n");

  console.log(`\nDone! ${pdfs.length} PDFs.`);
  console.log(`Written to ${path.relative(process.cwd(), OUTPUT_FILE)}`);
}

main();
