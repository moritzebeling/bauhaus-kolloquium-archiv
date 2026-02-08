/**
 * Shared utility functions for content processing and display.
 */

import type { ImageMeta, GalleryItem, ProgramItem, QuoteItem } from "./types";

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

/**
 * Normalize column value from content (handles various formats).
 */
export function normalizeColumn(
  column: string | undefined
): "left" | "right" {
  if (!column) return "left";
  const val = column.toLowerCase().trim();
  if (val === "right" || val === "r" || val === "rechts") return "right";
  return "left";
}

/**
 * Normalize position value from content.
 */
export function normalizePosition(
  position: string | undefined,
  fallback = 1
): number {
  if (!position) return fallback;
  const n = parseInt(position, 10);
  return isNaN(n) ? fallback : Math.max(0, Math.min(9, n));
}

/**
 * Format a German date range from start and end date strings.
 * "1979-06-27" and "1979-06-29" → "27.–29. Juni"
 */
export function formatDateRange(start?: string, end?: string): string {
  if (!start || !end) return "";

  const months: Record<string, string> = {
    "01": "Januar",
    "02": "Februar",
    "03": "März",
    "04": "April",
    "05": "Mai",
    "06": "Juni",
    "07": "Juli",
    "08": "August",
    "09": "September",
    "10": "Oktober",
    "11": "November",
    "12": "Dezember",
  };

  const startParts = start.split("-");
  const endParts = end.split("-");

  if (startParts.length < 3 || endParts.length < 3) return "";

  const startDay = parseInt(startParts[2], 10);
  const endDay = parseInt(endParts[2], 10);
  const endMonth = months[endParts[1]] || "";

  return `${startDay}.–${endDay}. ${endMonth}`;
}

/**
 * Sort items by position and group into left/right columns.
 * Used for galleries, programs, and quotes in colloquia pages.
 */
export interface ColumnItem<T> {
  template: string;
  position: number;
  item: T;
}

export function sortIntoColumns<
  T extends { column?: string; position?: string }
>(
  items: T[],
  template: string,
  defaultPosition = 1
): { left: ColumnItem<T>[]; right: ColumnItem<T>[] } {
  const left: ColumnItem<T>[] = [];
  const right: ColumnItem<T>[] = [];

  for (const item of items) {
    const column = normalizeColumn(item.column);
    const position = normalizePosition(item.position, defaultPosition);

    const entry = { template, position, item };

    if (column === "right") {
      right.push(entry);
    } else {
      left.push(entry);
    }
  }

  // Sort by position
  left.sort((a, b) => a.position - b.position);
  right.sort((a, b) => a.position - b.position);

  return { left, right };
}

/**
 * Merge and sort multiple column item arrays.
 */
export function mergeColumnItems(
  ...arrays: ColumnItem<GalleryItem | ProgramItem | QuoteItem>[][]
): ColumnItem<GalleryItem | ProgramItem | QuoteItem>[] {
  const merged = arrays.flat();
  merged.sort((a, b) => a.position - b.position);
  return merged;
}

/**
 * Get image metadata, with fallback to page title.
 */
export function getImageAlt(
  images: Record<string, ImageMeta>,
  filename: string,
  fallbackTitle?: string
): string {
  const meta = images[filename];
  if (meta?.copyright) return `© ${meta.copyright}`;
  if (meta?.caption) return meta.caption;
  return fallbackTitle || "";
}

/**
 * Get copyright text for an image.
 */
export function getImageCopyright(
  images: Record<string, ImageMeta>,
  filename: string
): string | undefined {
  return images[filename]?.copyright;
}

/**
 * Get caption text for an image.
 */
export function getImageCaption(
  images: Record<string, ImageMeta>,
  filename: string
): string | undefined {
  return images[filename]?.caption;
}
