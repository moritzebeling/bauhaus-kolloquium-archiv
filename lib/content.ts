/**
 * Content loader — scans the content/ directory and loads
 * all pages with their typed content and image metadata.
 */

import fs from "fs";
import path from "path";
import {
  parseKirbyFileTyped,
  parseKirbyFile,
  parseKirbytext,
  STRUCTURED_FIELDS,
} from "./parser";
import type {
  Page,
  PageContent,
  PageTemplate,
  SiteContent,
  SiteData,
  ImageMeta,
} from "./types";

// ─── Constants ───────────────────────────────────────────────────

const CONTENT_DIR = path.join(process.cwd(), "content");

/** Valid page templates (matching blueprint filenames) */
const VALID_TEMPLATES = new Set<string>([
  "start",
  "colloquia",
  "addon",
  "retrospect",
  "video-gallery",
  "publication",
  "gallery",
  "participants",
  "default",
]);

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Extract sort order from directory name.
 * Kirby directories are prefixed with a number: "4-1979" → 4
 */
export function extractSortOrder(dirName: string): number {
  const match = dirName.match(/^(\d+)-/);
  return match ? parseInt(match[1], 10) : 999;
}

/**
 * Extract template name from a content filename.
 * "colloquia.txt" → "colloquia"
 */
export function extractTemplate(filename: string): string | null {
  const match = filename.match(/^(.+?)\.txt$/);
  return match ? match[1] : null;
}

/**
 * Check if a content filename is a content file (.txt).
 * "colloquia.txt" → true
 */
export function isContentFile(filename: string): boolean {
  return filename.endsWith(".txt");
}

/**
 * Check if a filename is an image metadata file.
 * "photo.jpg.txt" → true (metadata for photo.jpg)
 */
export function isImageMetaFile(filename: string): boolean {
  return /\.(jpg|jpeg|png|gif|svg|webp)\.txt$/i.test(filename);
}

/**
 * Extract the image filename from an image metadata filename.
 * "photo.jpg.txt" → "photo.jpg"
 */
export function extractImageFilename(metaFilename: string): string | null {
  const match = metaFilename.match(/^(.+\.(jpg|jpeg|png|gif|svg|webp))\.txt$/i);
  return match ? match[1] : null;
}

/**
 * Apply kirbytext transformations to all string values in content.
 */
export function applyKirbytext(
  content: Record<string, string | Record<string, string>[]>
): Record<string, string | Record<string, string>[]> {
  const result: Record<string, string | Record<string, string>[]> = {};

  for (const [key, value] of Object.entries(content)) {
    if (typeof value === "string" && value) {
      result[key] = parseKirbytext(value);
    } else if (Array.isArray(value)) {
      // Keep structured data as-is
      result[key] = value;
    } else {
      result[key] = value;
    }
  }

  return result;
}

// ─── Content Loading ─────────────────────────────────────────────

/**
 * Load a single page directory and return a Page object.
 */
function loadPage(dirName: string): Page | null {
  const dirPath = path.join(CONTENT_DIR, dirName);
  const stat = fs.statSync(dirPath);
  if (!stat.isDirectory()) return null;

  const files = fs.readdirSync(dirPath);

  // Find the .txt content file
  let template: PageTemplate | null = null;
  let deContent: Record<string, string | Record<string, string>[]> | null =
    null;

  for (const file of files) {
    if (isImageMetaFile(file)) continue;
    if (!isContentFile(file)) continue;

    const tpl = extractTemplate(file);

    if (tpl && VALID_TEMPLATES.has(tpl)) {
      template = tpl as PageTemplate;
      const filePath = path.join(dirPath, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const structuredHints = STRUCTURED_FIELDS[tpl];
      const parsed = parseKirbyFileTyped(raw, structuredHints);
      deContent = applyKirbytext(parsed);
    }
  }

  if (!template || !deContent) return null;

  // Load image metadata
  const images: Record<string, ImageMeta> = {};
  for (const file of files) {
    if (isImageMetaFile(file)) {
      const imageFilename = extractImageFilename(file);
      if (!imageFilename) continue;

      const filePath = path.join(dirPath, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = parseKirbyFile(raw);

      images[imageFilename] = {
        caption: parsed.caption || undefined,
        copyright: parsed.copyright || undefined,
        archiveid: parsed.archiveid || undefined,
        alt: parsed.alt || undefined,
      };
    }
  }

  return {
    slug: dirName,
    sortOrder: extractSortOrder(dirName),
    template,
    de: deContent as unknown as PageContent,
    images,
    dirPath: dirName,
  };
}

/**
 * Load site-level content (site.txt).
 */
function loadSiteContent(): { de: SiteContent } {
  const dePath = path.join(CONTENT_DIR, "site.txt");

  let de: SiteContent = { title: "" };

  if (fs.existsSync(dePath)) {
    const raw = fs.readFileSync(dePath, "utf-8");
    de = parseKirbyFile(raw) as unknown as SiteContent;
  }

  return { de };
}

// ─── Public API ──────────────────────────────────────────────────

/**
 * Load all content from the content/ directory.
 * Returns site-level content and all pages sorted by their order number.
 */
export function loadAllContent(): SiteData {
  const site = loadSiteContent();

  const entries = fs.readdirSync(CONTENT_DIR);
  const pages: Page[] = [];

  for (const entry of entries) {
    // Skip files (only process directories)
    const fullPath = path.join(CONTENT_DIR, entry);
    if (!fs.statSync(fullPath).isDirectory()) continue;

    const page = loadPage(entry);
    if (page) {
      pages.push(page);
    }
  }

  // Sort by order number
  const sortedPages = pages.toSorted((a, b) => a.sortOrder - b.sortOrder);

  return { site, pages: sortedPages };
}

/**
 * Get the public URL for a content image.
 * Uses Vercel Blob CDN in production, local files in development.
 */
export function getImageUrl(dirPath: string, filename: string): string {
  const blobUrl = process.env.NEXT_PUBLIC_BLOB_URL;
  if (blobUrl) {
    return `${blobUrl}/content/${dirPath}/${filename}`;
  }
  return `/content/${dirPath}/${filename}`;
}
