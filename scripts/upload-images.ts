/**
 * Upload all content images and PDFs to Vercel Blob Storage.
 *
 * Usage:
 *   npm run upload-images
 *
 * This script:
 * 1. Loads env vars from .env.local (where Vercel CLI stores them)
 * 2. Scans the content/ directory for binary files (jpg, jpeg, png, svg, pdf)
 * 3. Uploads each file to Vercel Blob (skips unchanged, overwrites if needed)
 * 4. Saves NEXT_PUBLIC_BLOB_URL to .env.local
 * 5. Shows how to set the env var on Vercel for production
 *
 * Prerequisites:
 *   1. Create a Blob store in Vercel Dashboard → Storage → Create → Blob
 *   2. Link your project: vercel link
 *   3. Pull env vars: vercel env pull .env.local
 *      (or manually add BLOB_READ_WRITE_TOKEN to .env.local)
 */

import { put, list } from "@vercel/blob";
import fs from "fs";
import path from "path";

// ─── Load .env.local ────────────────────────────────────────────

function loadEnvFile(filename: string): Record<string, string> {
  const filepath = path.resolve(process.cwd(), filename);
  const vars: Record<string, string> = {};
  if (!fs.existsSync(filepath)) return vars;
  const content = fs.readFileSync(filepath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const raw = trimmed.slice(eqIndex + 1).trim();
    const value = raw.replace(/^["']|["']$/g, "");
    vars[key] = value;
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
  return vars;
}

function saveEnvVar(filename: string, key: string, value: string) {
  const filepath = path.resolve(process.cwd(), filename);
  let content = "";
  if (fs.existsSync(filepath)) {
    content = fs.readFileSync(filepath, "utf-8");
    // Replace existing key or append
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(content)) {
      content = content.replace(regex, `${key}="${value}"`);
    } else {
      content = content.trimEnd() + `\n${key}="${value}"\n`;
    }
  } else {
    content = `${key}="${value}"\n`;
  }
  fs.writeFileSync(filepath, content);
}

// Load .env.local first (Vercel CLI default), then .env as fallback
loadEnvFile(".env.local");
loadEnvFile(".env");

// ─── File scanning ──────────────────────────────────────────────

const CONTENT_DIR = path.join(process.cwd(), "content");

const UPLOAD_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".svg",
  ".pdf",
  ".gif",
  ".webp",
]);

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

// ─── Blob URL detection ─────────────────────────────────────────

async function detectBlobBaseUrl(): Promise<string | null> {
  try {
    const result = await list({ limit: 1 });
    if (result.blobs.length > 0) {
      const url = new URL(result.blobs[0].url);
      return url.origin;
    }
  } catch {
    // Ignore — will detect from first upload
  }
  return null;
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

  // Detect blob base URL from existing blobs
  let blobBaseUrl = await detectBlobBaseUrl();
  if (blobBaseUrl) {
    console.log(`Blob store: ${blobBaseUrl}\n`);
  }

  console.log("Scanning content/ for images and PDFs...");
  const files = findFiles(CONTENT_DIR);
  console.log(`Found ${files.length} files.\n`);

  if (files.length === 0) {
    console.log(
      "No files found. Make sure the content/ directory contains images."
    );
    return;
  }

  let uploaded = 0;
  let failed = 0;

  for (const file of files) {
    const blobPath = `content/${file.relativePath}`;
    const fileBuffer = fs.readFileSync(file.absolutePath);

    try {
      const blob = await put(blobPath, fileBuffer, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
      });

      if (!blobBaseUrl) {
        const url = new URL(blob.url);
        blobBaseUrl = url.origin;
        console.log(`Blob store: ${blobBaseUrl}\n`);
      }

      uploaded++;
      console.log(`  ✓ ${blobPath}`);
    } catch (error) {
      console.error(
        `  ✗ ${blobPath}: ${error instanceof Error ? error.message : error}`
      );
      failed++;
    }
  }

  console.log(`\nDone! Uploaded: ${uploaded}, Failed: ${failed}\n`);

  if (blobBaseUrl) {
    // Save to .env.local for local development
    saveEnvVar(".env.local", "NEXT_PUBLIC_BLOB_URL", blobBaseUrl);
    console.log(`Saved NEXT_PUBLIC_BLOB_URL to .env.local\n`);

    console.log("─".repeat(60));
    console.log("\nNow set it on Vercel for production:\n");
    console.log(
      `  vercel env add NEXT_PUBLIC_BLOB_URL production preview development\n`
    );
    console.log(`  (paste: ${blobBaseUrl})\n`);
    console.log("Then redeploy:\n");
    console.log("  vercel --prod\n");
    console.log("─".repeat(60));
  }
}

main().catch((err) => {
  console.error("Upload failed:", err);
  process.exit(1);
});
