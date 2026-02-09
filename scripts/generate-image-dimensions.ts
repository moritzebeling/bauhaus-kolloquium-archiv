/**
 * Generate image dimensions manifest.
 *
 * Scans all bitmap images in content/ and writes their dimensions
 * to lib/image-dimensions.json. This file is committed to the repo
 * so that correct width/height values are available at build time
 * (on Vercel, images live in Blob storage, not on disk).
 *
 * Usage:
 *   npm run image-dimensions
 *
 * Run this whenever images are added or replaced.
 */

import fs from "fs";
import path from "path";
import imageSize from "image-size";

const CONTENT_DIR = path.join(process.cwd(), "content");
const OUTPUT_FILE = path.join(process.cwd(), "content", "image-dimensions.json");

const BITMAP_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

interface Dimensions {
  width: number;
  height: number;
}

function findImages(
  dir: string,
  base = ""
): { relativePath: string; absolutePath: string }[] {
  const results: { relativePath: string; absolutePath: string }[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = base ? `${base}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      results.push(...findImages(fullPath, relPath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (BITMAP_EXTENSIONS.has(ext)) {
        results.push({ relativePath: relPath, absolutePath: fullPath });
      }
    }
  }

  return results;
}

function main() {
  console.log("Scanning content/ for bitmap images...");
  const images = findImages(CONTENT_DIR);
  console.log(`Found ${images.length} images.\n`);

  const dimensions: Record<string, Dimensions> = {};
  let succeeded = 0;
  let failed = 0;

  for (const image of images) {
    try {
      const buffer = fs.readFileSync(image.absolutePath);
      const result = imageSize(buffer);
      if (result.width && result.height) {
        dimensions[image.relativePath] = {
          width: result.width,
          height: result.height,
        };
        succeeded++;
      } else {
        console.warn(`  ⚠ No dimensions for ${image.relativePath}`);
        failed++;
      }
    } catch (error) {
      console.error(
        `  ✗ ${image.relativePath}: ${error instanceof Error ? error.message : error}`
      );
      failed++;
    }
  }

  // Sort keys for stable output (no unnecessary diffs)
  const sorted: Record<string, Dimensions> = {};
  for (const key of Object.keys(dimensions).sort()) {
    sorted[key] = dimensions[key];
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sorted, null, 2) + "\n");

  console.log(`\nDone! ${succeeded} images, ${failed} failures.`);
  console.log(`Written to ${path.relative(process.cwd(), OUTPUT_FILE)}`);
}

main();
