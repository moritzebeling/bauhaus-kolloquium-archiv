/**
 * Process content images for static export.
 *
 * Copies all media files from content/ to public/content/ so they are served
 * as static assets. Bitmap images (jpg, png, webp) are compressed with sharp.
 * SVGs, PDFs, and GIFs are copied as-is. Files are skipped when the destination
 * is already newer than the source (incremental), unless --force is passed.
 *
 * Also generates responsive srcset variants at 480, 960, and 1440px wide
 * (named e.g. BHK_01@480.jpg) for use in hand-rolled srcset attributes.
 *
 * Also updates content/image-dimensions.json with the actual output dimensions
 * of any processed images (important if images were resized).
 *
 * Usage:
 *   npm run process-images          # incremental (skip up-to-date files)
 *   npm run process-images -- --force  # reprocess everything
 */

import fs from "fs";
import { readdir, stat, mkdir, copyFile, readFile, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

const CONTENT_DIR = path.join(process.cwd(), "content");
const OUTPUT_DIR = path.join(process.cwd(), "public", "content");
const DIMENSIONS_FILE = path.join(process.cwd(), "content", "image-dimensions.json");

/** Max width in pixels; wider images are resized down (aspect ratio preserved). */
const MAX_WIDTH = 3000;
const JPEG_QUALITY = 85;

/** Responsive srcset breakpoints. Must match SRCSET_WIDTHS in lib/utils.ts. */
const SRCSET_WIDTHS = [480, 960, 1440] as const;

/** Extensions processed through sharp (compressed + optionally resized). */
const SHARP_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

/** Extensions copied verbatim. */
const COPY_EXTENSIONS = new Set([".svg", ".pdf", ".gif"]);

type DimensionsMap = Record<string, { width: number; height: number }>;

const force = process.argv.includes("--force");

/** Returns true when src is newer than dest, or dest doesn't exist. */
async function isOutdated(src: string, dest: string): Promise<boolean> {
  if (!fs.existsSync(dest)) return true;
  const [srcStat, destStat] = await Promise.all([stat(src), stat(dest)]);
  return srcStat.mtimeMs > destStat.mtimeMs;
}

async function walk(
  dir: string,
  updatedDimensions: DimensionsMap,
  existingDimensions: DimensionsMap
): Promise<{ processed: number; copied: number; skipped: number }> {
  let processed = 0;
  let copied = 0;
  let skipped = 0;

  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const srcPath = path.join(dir, entry.name);
    const relPath = path.relative(CONTENT_DIR, srcPath);
    const destPath = path.join(OUTPUT_DIR, relPath);

    if (entry.isDirectory()) {
      const counts = await walk(srcPath, updatedDimensions, existingDimensions);
      processed += counts.processed;
      copied += counts.copied;
      skipped += counts.skipped;
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();

    if (SHARP_EXTENSIONS.has(ext)) {
      await mkdir(path.dirname(destPath), { recursive: true });

      let outputWidth: number | undefined;

      if (force || (await isOutdated(srcPath, destPath))) {
        console.log(`  compress  ${relPath}`);

        let pipeline = sharp(srcPath);
        const meta = await pipeline.metadata();

        if (meta.width && meta.width > MAX_WIDTH) {
          pipeline = pipeline.resize(MAX_WIDTH);
        }

        if (ext === ".jpg" || ext === ".jpeg") {
          pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, progressive: true });
        } else if (ext === ".png") {
          pipeline = pipeline.png({ compressionLevel: 9 });
        }

        const info = await pipeline.toFile(destPath);
        updatedDimensions[relPath] = { width: info.width, height: info.height };
        outputWidth = info.width;
        processed++;
      } else {
        skipped++;
        // Use manifest to get output width for variant decisions
        outputWidth =
          updatedDimensions[relPath]?.width ?? existingDimensions[relPath]?.width;
      }

      // Generate responsive srcset variants for each breakpoint smaller than
      // the output image. Each variant is written as e.g. BHK_01@480.jpg.
      if (outputWidth) {
        const basename = path.basename(entry.name, ext);

        for (const targetWidth of SRCSET_WIDTHS) {
          if (outputWidth <= targetWidth) continue;

          const variantFilename = `${basename}@${targetWidth}${ext}`;
          const variantRelPath = path.join(path.dirname(relPath), variantFilename);
          const variantDestPath = path.join(OUTPUT_DIR, variantRelPath);

          if (!force && !(await isOutdated(srcPath, variantDestPath))) {
            skipped++;
            continue;
          }

          console.log(`  variant   ${variantRelPath}`);

          let variantPipeline = sharp(srcPath).resize(targetWidth);
          if (ext === ".jpg" || ext === ".jpeg") {
            variantPipeline = variantPipeline.jpeg({
              quality: JPEG_QUALITY,
              progressive: true,
            });
          } else if (ext === ".png") {
            variantPipeline = variantPipeline.png({ compressionLevel: 9 });
          }

          await variantPipeline.toFile(variantDestPath);
          processed++;
        }
      }
    } else if (COPY_EXTENSIONS.has(ext)) {
      await mkdir(path.dirname(destPath), { recursive: true });

      if (!force && !(await isOutdated(srcPath, destPath))) {
        skipped++;
        continue;
      }

      console.log(`  copy      ${relPath}`);
      await copyFile(srcPath, destPath);
      copied++;
    }
  }

  return { processed, copied, skipped };
}

async function main(): Promise<void> {
  console.log("Processing content/ → public/content/");
  if (force) console.log("Force mode: reprocessing all files");
  console.log();

  await mkdir(OUTPUT_DIR, { recursive: true });

  // Load existing dimensions upfront so skipped images can still have their
  // output width looked up for variant generation.
  const existingDimensions: DimensionsMap = fs.existsSync(DIMENSIONS_FILE)
    ? JSON.parse(await readFile(DIMENSIONS_FILE, "utf-8"))
    : {};

  const updatedDimensions: DimensionsMap = {};
  const counts = await walk(CONTENT_DIR, updatedDimensions, existingDimensions);

  // Merge updated dimensions into the existing manifest
  if (Object.keys(updatedDimensions).length > 0) {
    const merged = { ...existingDimensions, ...updatedDimensions };

    // Sort keys for a stable, diff-friendly output
    const sorted: DimensionsMap = {};
    for (const key of Object.keys(merged).sort()) {
      sorted[key] = merged[key];
    }

    await writeFile(DIMENSIONS_FILE, JSON.stringify(sorted, null, 2) + "\n");
    console.log(
      `\nUpdated ${Object.keys(updatedDimensions).length} dimension entries in content/image-dimensions.json`
    );
  }

  console.log(
    `\nDone — ${counts.processed} compressed, ${counts.copied} copied, ${counts.skipped} skipped`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
