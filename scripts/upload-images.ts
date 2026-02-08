/**
 * Upload all content images and PDFs to Vercel Blob Storage.
 *
 * Usage:
 *   npx tsx scripts/upload-images.ts
 *
 * This script:
 * 1. Loads env vars from .env.local (where Vercel CLI stores them)
 * 2. Scans the content/ directory for binary files (jpg, jpeg, png, svg, pdf)
 * 3. Uploads each file to Vercel Blob with a deterministic path
 * 4. Outputs the NEXT_PUBLIC_BLOB_URL to set as an environment variable
 *
 * Prerequisites:
 *   1. Create a Blob store in Vercel Dashboard → Storage → Create → Blob
 *   2. Link your project: vercel link
 *   3. Pull env vars: vercel env pull .env.local
 *      (or manually add BLOB_READ_WRITE_TOKEN to .env.local)
 */

import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";

// ─── Load .env.local ────────────────────────────────────────────

function loadEnvFile(filename: string) {
  const filepath = path.resolve(process.cwd(), filename);
  if (!fs.existsSync(filepath)) return;
  const content = fs.readFileSync(filepath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const raw = trimmed.slice(eqIndex + 1).trim();
    // Strip surrounding quotes
    const value = raw.replace(/^["']|["']$/g, "");
    // Don't override existing env vars
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

// Load .env.local first (Vercel CLI default), then .env as fallback
loadEnvFile(".env.local");
loadEnvFile(".env");

// ─── File scanning ──────────────────────────────────────────────

const CONTENT_DIR = path.join(process.cwd(), "content");

/** File extensions to upload */
const UPLOAD_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".svg",
  ".pdf",
  ".gif",
  ".webp",
]);

/** Recursively find all uploadable files in a directory */
function findFiles(
  dir: string,
  base = ""
): { relativePath: string; absolutePath: string }[] {
  const results: { relativePath: string; absolutePath: string }[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = base ? `${base}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      results.push(...findFiles(fullPath, relPath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (UPLOAD_EXTENSIONS.has(ext)) {
        results.push({ relativePath: relPath, absolutePath: fullPath });
      }
    }
  }

  return results;
}

// ─── Upload ─────────────────────────────────────────────────────

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error(
      "Error: BLOB_READ_WRITE_TOKEN environment variable is required.\n"
    );
    console.error("Make sure it's set in .env.local:\n");
    console.error('  BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."\n');
    console.error(
      "You can pull it from Vercel with: vercel env pull .env.local\n"
    );
    process.exit(1);
  }

  console.log("Scanning content/ for images and PDFs...\n");
  const files = findFiles(CONTENT_DIR);
  console.log(`Found ${files.length} files to upload.\n`);

  if (files.length === 0) {
    console.log(
      "No files found. Make sure the content/ directory contains images."
    );
    return;
  }

  let blobBaseUrl = "";
  let uploaded = 0;
  let failed = 0;

  for (const file of files) {
    const blobPath = `content/${file.relativePath}`;
    const fileBuffer = fs.readFileSync(file.absolutePath);

    try {
      const blob = await put(blobPath, fileBuffer, {
        access: "public",
        addRandomSuffix: false,
      });

      if (!blobBaseUrl) {
        // Extract base URL from first upload
        // URL format: https://xxx.public.blob.vercel-storage.com/content/...
        const url = new URL(blob.url);
        blobBaseUrl = url.origin;
      }

      uploaded++;
      console.log(`  ✓ ${blobPath}`);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message &&
        error.message.includes("This blob already exists")
      ) {
        console.log(`  ◦ ${blobPath}: Already exists`);
      } else {
        console.error(
          `  ✗ ${blobPath}: ${error instanceof Error ? error.message : error}`
        );
      }
      failed++;
    }
  }

  console.log(`\nDone! Uploaded: ${uploaded}, Failed: ${failed}\n`);

  if (blobBaseUrl) {
    console.log("─".repeat(60));
    console.log("\nSet this environment variable in your Vercel project:\n");
    console.log(`  NEXT_PUBLIC_BLOB_URL=${blobBaseUrl}\n`);
    console.log(
      "You can set it in: Vercel Dashboard → Settings → Environment Variables"
    );
    console.log("─".repeat(60));
  }
}

main().catch((err) => {
  console.error("Upload failed:", err);
  process.exit(1);
});
