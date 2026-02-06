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
  "credits",
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
 * "colloquia.de.txt" → "colloquia"
 * "start.en.txt" → "start"
 */
export function extractTemplate(filename: string): string | null {
  const match = filename.match(/^(.+?)\.(?:de|en)\.txt$/);
  return match ? match[1] : null;
}

/**
 * Extract language from a content filename.
 * "colloquia.de.txt" → "de"
 * "start.en.txt" → "en"
 */
export function extractLang(filename: string): "de" | "en" | null {
  const match = filename.match(/\.(?:de|en)\.txt$/);
  if (!match) return null;
  return filename.includes(".de.txt") ? "de" : "en";
}

/**
 * Check if a filename is an image metadata file.
 * "photo.jpg.de.txt" → true (metadata for photo.jpg)
 */
export function isImageMetaFile(filename: string): boolean {
  return /\.(jpg|jpeg|png|gif|svg|webp)\.(de|en)\.txt$/i.test(filename);
}

/**
 * Extract the image filename from an image metadata filename.
 * "photo.jpg.de.txt" → "photo.jpg"
 */
export function extractImageFilename(metaFilename: string): string | null {
  const match = metaFilename.match(
    /^(.+\.(jpg|jpeg|png|gif|svg|webp))\.(de|en)\.txt$/i
  );
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

  // Find content files (template.lang.txt)
  let template: PageTemplate | null = null;
  let deContent: Record<string, string | Record<string, string>[]> | null =
    null;
  let enContent: Record<string, string | Record<string, string>[]> | null =
    null;

  for (const file of files) {
    if (isImageMetaFile(file)) continue;

    const tpl = extractTemplate(file);
    const lang = extractLang(file);

    if (tpl && lang && VALID_TEMPLATES.has(tpl)) {
      template = tpl as PageTemplate;
      const filePath = path.join(dirPath, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const structuredHints = STRUCTURED_FIELDS[tpl];
      const parsed = parseKirbyFileTyped(raw, structuredHints);
      const withKirbytext = applyKirbytext(parsed);

      if (lang === "de") {
        deContent = withKirbytext;
      } else {
        enContent = withKirbytext;
      }
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
    en: enContent ? (enContent as unknown as Partial<PageContent>) : undefined,
    images,
    dirPath: dirName,
  };
}

/**
 * Load site-level content (site.de.txt / site.en.txt).
 */
function loadSiteContent(): { de: SiteContent; en?: Partial<SiteContent> } {
  const dePath = path.join(CONTENT_DIR, "site.de.txt");
  const enPath = path.join(CONTENT_DIR, "site.en.txt");

  let de: SiteContent = { title: "" };
  let en: Partial<SiteContent> | undefined;

  if (fs.existsSync(dePath)) {
    const raw = fs.readFileSync(dePath, "utf-8");
    de = parseKirbyFile(raw) as unknown as SiteContent;
  }

  if (fs.existsSync(enPath)) {
    const raw = fs.readFileSync(enPath, "utf-8");
    en = parseKirbyFile(raw) as unknown as Partial<SiteContent>;
  }

  return { de, en };
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

    // Skip special directories
    if (entry === "error") continue;

    const page = loadPage(entry);
    if (page) {
      pages.push(page);
    }
  }

  // Sort by order number
  pages.sort((a, b) => a.sortOrder - b.sortOrder);

  return { site, pages };
}

/**
 * Get the public URL path for a content image.
 * Images are served from /content/[dirPath]/[filename]
 */
export function getImageUrl(dirPath: string, filename: string): string {
  return `/content/${dirPath}/${filename}`;
}
