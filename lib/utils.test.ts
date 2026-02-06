/**
 * Tests for shared utility functions.
 *
 * Run with: npx tsx --test lib/utils.test.ts
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getImageUrl,
  normalizeColumn,
  normalizePosition,
  formatDateRange,
  sortIntoColumns,
  mergeColumnItems,
  getImageAlt,
  getImageCopyright,
  getImageCaption,
} from "./utils";
import type { ImageMeta, GalleryItem } from "./types";

// ─── getImageUrl ─────────────────────────────────────────────────

describe("getImageUrl", () => {
  it("should return the correct public URL path", () => {
    assert.equal(
      getImageUrl("4-1979", "photo.jpg"),
      "/content/4-1979/photo.jpg"
    );
  });

  it("should handle directory names with multiple segments", () => {
    assert.equal(
      getImageUrl("10-2019", "image.png"),
      "/content/10-2019/image.png"
    );
  });

  it("should handle filenames with spaces or special characters", () => {
    assert.equal(
      getImageUrl("4-1979", "BHK_02_150.jpg"),
      "/content/4-1979/BHK_02_150.jpg"
    );
  });
});

// ─── normalizeColumn ─────────────────────────────────────────────

describe("normalizeColumn", () => {
  it("should return 'left' for undefined", () => {
    assert.equal(normalizeColumn(undefined), "left");
  });

  it("should return 'left' for empty string", () => {
    assert.equal(normalizeColumn(""), "left");
  });

  it("should return 'left' for 'left'", () => {
    assert.equal(normalizeColumn("left"), "left");
  });

  it("should return 'right' for 'right'", () => {
    assert.equal(normalizeColumn("right"), "right");
  });

  it("should handle case-insensitive input", () => {
    assert.equal(normalizeColumn("Right"), "right");
    assert.equal(normalizeColumn("RIGHT"), "right");
    assert.equal(normalizeColumn("Left"), "left");
  });

  it("should handle German 'rechts' value", () => {
    assert.equal(normalizeColumn("rechts"), "right");
    assert.equal(normalizeColumn("Rechts"), "right");
  });

  it("should handle shorthand 'r'", () => {
    assert.equal(normalizeColumn("r"), "right");
    assert.equal(normalizeColumn("R"), "right");
  });

  it("should handle whitespace", () => {
    assert.equal(normalizeColumn("  right  "), "right");
    assert.equal(normalizeColumn("  left  "), "left");
  });

  it("should default to 'left' for unknown values", () => {
    assert.equal(normalizeColumn("center"), "left");
    assert.equal(normalizeColumn("middle"), "left");
  });
});

// ─── normalizePosition ──────────────────────────────────────────

describe("normalizePosition", () => {
  it("should return fallback for undefined", () => {
    assert.equal(normalizePosition(undefined), 1);
    assert.equal(normalizePosition(undefined, 5), 5);
  });

  it("should return fallback for empty string", () => {
    assert.equal(normalizePosition(""), 1);
    assert.equal(normalizePosition("", 3), 3);
  });

  it("should parse valid numeric strings", () => {
    assert.equal(normalizePosition("1"), 1);
    assert.equal(normalizePosition("5"), 5);
    assert.equal(normalizePosition("0"), 0);
  });

  it("should clamp to 0–9 range", () => {
    assert.equal(normalizePosition("-1"), 0);
    assert.equal(normalizePosition("10"), 9);
    assert.equal(normalizePosition("100"), 9);
  });

  it("should return fallback for non-numeric strings", () => {
    assert.equal(normalizePosition("abc"), 1);
    assert.equal(normalizePosition("abc", 7), 7);
  });
});

// ─── formatDateRange ────────────────────────────────────────────

describe("formatDateRange", () => {
  it("should format a standard date range", () => {
    assert.equal(formatDateRange("1979-06-27", "1979-06-29"), "27.–29. Juni");
  });

  it("should handle different months", () => {
    assert.equal(
      formatDateRange("2019-10-23", "2019-10-25"),
      "23.–25. Oktober"
    );
  });

  it("should return empty string for missing start", () => {
    assert.equal(formatDateRange(undefined, "1979-06-29"), "");
  });

  it("should return empty string for missing end", () => {
    assert.equal(formatDateRange("1979-06-27", undefined), "");
  });

  it("should return empty string for both missing", () => {
    assert.equal(formatDateRange(undefined, undefined), "");
  });

  it("should return empty string for empty strings", () => {
    assert.equal(formatDateRange("", ""), "");
  });

  it("should return empty string for malformed dates", () => {
    assert.equal(formatDateRange("bad", "also-bad"), "");
  });

  it("should handle January", () => {
    assert.equal(formatDateRange("2020-01-10", "2020-01-12"), "10.–12. Januar");
  });

  it("should handle December", () => {
    assert.equal(
      formatDateRange("2020-12-01", "2020-12-03"),
      "1.–3. Dezember"
    );
  });
});

// ─── sortIntoColumns ────────────────────────────────────────────

describe("sortIntoColumns", () => {
  it("should sort items into left and right columns", () => {
    const items = [
      { column: "left", position: "2" },
      { column: "right", position: "1" },
      { column: "left", position: "1" },
    ];

    const result = sortIntoColumns(items, "gallery");
    assert.equal(result.left.length, 2);
    assert.equal(result.right.length, 1);
  });

  it("should sort by position within each column", () => {
    const items = [
      { column: "left", position: "3" },
      { column: "left", position: "1" },
      { column: "left", position: "2" },
    ];

    const result = sortIntoColumns(items, "gallery");
    assert.equal(result.left[0].position, 1);
    assert.equal(result.left[1].position, 2);
    assert.equal(result.left[2].position, 3);
  });

  it("should default to left column when column is undefined", () => {
    const items = [{ position: "1" }, { position: "2" }];

    const result = sortIntoColumns(items, "gallery");
    assert.equal(result.left.length, 2);
    assert.equal(result.right.length, 0);
  });

  it("should set the template on each item", () => {
    const items = [{ column: "left", position: "1" }];

    const result = sortIntoColumns(items, "program");
    assert.equal(result.left[0].template, "program");
  });

  it("should use defaultPosition when position is missing", () => {
    const items = [{ column: "left" }];

    const result = sortIntoColumns(items, "gallery", 5);
    assert.equal(result.left[0].position, 5);
  });

  it("should handle an empty array", () => {
    const result = sortIntoColumns([], "gallery");
    assert.equal(result.left.length, 0);
    assert.equal(result.right.length, 0);
  });
});

// ─── mergeColumnItems ───────────────────────────────────────────

describe("mergeColumnItems", () => {
  it("should merge and sort multiple arrays by position", () => {
    const a = [
      { template: "gallery", position: 3, item: { image: "a.jpg" } as GalleryItem },
    ];
    const b = [
      { template: "gallery", position: 1, item: { image: "b.jpg" } as GalleryItem },
    ];
    const c = [
      { template: "gallery", position: 2, item: { image: "c.jpg" } as GalleryItem },
    ];

    const result = mergeColumnItems(a, b, c);
    assert.equal(result.length, 3);
    assert.equal(result[0].position, 1);
    assert.equal(result[1].position, 2);
    assert.equal(result[2].position, 3);
  });

  it("should handle empty arrays", () => {
    const result = mergeColumnItems([], []);
    assert.equal(result.length, 0);
  });

  it("should handle a single array", () => {
    const a = [
      { template: "gallery", position: 1, item: { image: "a.jpg" } as GalleryItem },
    ];
    const result = mergeColumnItems(a);
    assert.equal(result.length, 1);
  });
});

// ─── getImageAlt ────────────────────────────────────────────────

describe("getImageAlt", () => {
  const images: Record<string, ImageMeta> = {
    "photo.jpg": { copyright: "John Doe", caption: "A photo" },
    "logo.png": { caption: "Company logo" },
    "plain.jpg": {},
  };

  it("should return copyright with © prefix when available", () => {
    assert.equal(getImageAlt(images, "photo.jpg"), "© John Doe");
  });

  it("should return caption when no copyright", () => {
    assert.equal(getImageAlt(images, "logo.png"), "Company logo");
  });

  it("should return fallback title when no meta", () => {
    assert.equal(getImageAlt(images, "plain.jpg", "Page Title"), "Page Title");
  });

  it("should return empty string when no meta and no fallback", () => {
    assert.equal(getImageAlt(images, "plain.jpg"), "");
  });

  it("should return empty string for unknown image", () => {
    assert.equal(getImageAlt(images, "unknown.jpg"), "");
  });

  it("should return fallback for unknown image", () => {
    assert.equal(getImageAlt(images, "unknown.jpg", "Fallback"), "Fallback");
  });
});

// ─── getImageCopyright ──────────────────────────────────────────

describe("getImageCopyright", () => {
  const images: Record<string, ImageMeta> = {
    "photo.jpg": { copyright: "John Doe" },
    "no-copy.jpg": { caption: "A photo" },
  };

  it("should return copyright when available", () => {
    assert.equal(getImageCopyright(images, "photo.jpg"), "John Doe");
  });

  it("should return undefined when no copyright", () => {
    assert.equal(getImageCopyright(images, "no-copy.jpg"), undefined);
  });

  it("should return undefined for unknown image", () => {
    assert.equal(getImageCopyright(images, "unknown.jpg"), undefined);
  });
});

// ─── getImageCaption ────────────────────────────────────────────

describe("getImageCaption", () => {
  const images: Record<string, ImageMeta> = {
    "photo.jpg": { caption: "A nice photo" },
    "no-cap.jpg": { copyright: "Someone" },
  };

  it("should return caption when available", () => {
    assert.equal(getImageCaption(images, "photo.jpg"), "A nice photo");
  });

  it("should return undefined when no caption", () => {
    assert.equal(getImageCaption(images, "no-cap.jpg"), undefined);
  });

  it("should return undefined for unknown image", () => {
    assert.equal(getImageCaption(images, "unknown.jpg"), undefined);
  });
});
