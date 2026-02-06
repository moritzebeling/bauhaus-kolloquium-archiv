/**
 * Tests for content loader helper functions.
 *
 * Run with: npx tsx --test lib/content.test.ts
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  extractSortOrder,
  extractTemplate,
  extractLang,
  isImageMetaFile,
  extractImageFilename,
  applyKirbytext,
  getImageUrl,
} from "./content";

// ─── extractSortOrder ───────────────────────────────────────────

describe("extractSortOrder", () => {
  it("should extract number prefix from directory name", () => {
    assert.equal(extractSortOrder("4-1979"), 4);
    assert.equal(extractSortOrder("1-start"), 1);
    assert.equal(extractSortOrder("10-2019"), 10);
    assert.equal(extractSortOrder("22-credits"), 22);
  });

  it("should return 999 for directories without a number prefix", () => {
    assert.equal(extractSortOrder("error"), 999);
    assert.equal(extractSortOrder("no-number-here"), 999);
  });

  it("should handle single-digit prefixes", () => {
    assert.equal(extractSortOrder("0-intro"), 0);
    assert.equal(extractSortOrder("9-something"), 9);
  });
});

// ─── extractTemplate ────────────────────────────────────────────

describe("extractTemplate", () => {
  it("should extract template from German content files", () => {
    assert.equal(extractTemplate("colloquia.de.txt"), "colloquia");
    assert.equal(extractTemplate("start.de.txt"), "start");
    assert.equal(extractTemplate("retrospect.de.txt"), "retrospect");
  });

  it("should extract template from English content files", () => {
    assert.equal(extractTemplate("colloquia.en.txt"), "colloquia");
    assert.equal(extractTemplate("start.en.txt"), "start");
  });

  it("should handle template names with hyphens", () => {
    assert.equal(extractTemplate("video-gallery.de.txt"), "video-gallery");
  });

  it("should return null for non-matching filenames", () => {
    assert.equal(extractTemplate("photo.jpg"), null);
    assert.equal(extractTemplate("readme.txt"), null);
    assert.equal(extractTemplate("file.fr.txt"), null);
  });

  it("should match image meta files (filtered separately by isImageMetaFile)", () => {
    // extractTemplate matches the pattern; image meta files are
    // excluded via isImageMetaFile() before calling extractTemplate()
    assert.equal(extractTemplate("photo.jpg.de.txt"), "photo.jpg");
  });
});

// ─── extractLang ────────────────────────────────────────────────

describe("extractLang", () => {
  it("should extract 'de' from German content files", () => {
    assert.equal(extractLang("colloquia.de.txt"), "de");
    assert.equal(extractLang("start.de.txt"), "de");
  });

  it("should extract 'en' from English content files", () => {
    assert.equal(extractLang("colloquia.en.txt"), "en");
    assert.equal(extractLang("start.en.txt"), "en");
  });

  it("should return null for non-matching filenames", () => {
    assert.equal(extractLang("photo.jpg"), null);
    assert.equal(extractLang("readme.txt"), null);
    assert.equal(extractLang("file.fr.txt"), null);
  });
});

// ─── isImageMetaFile ────────────────────────────────────────────

describe("isImageMetaFile", () => {
  it("should detect image metadata files", () => {
    assert.equal(isImageMetaFile("photo.jpg.de.txt"), true);
    assert.equal(isImageMetaFile("photo.jpg.en.txt"), true);
    assert.equal(isImageMetaFile("image.png.de.txt"), true);
    assert.equal(isImageMetaFile("graphic.svg.de.txt"), true);
    assert.equal(isImageMetaFile("pic.gif.de.txt"), true);
    assert.equal(isImageMetaFile("photo.webp.en.txt"), true);
  });

  it("should be case-insensitive for extensions", () => {
    assert.equal(isImageMetaFile("photo.JPG.de.txt"), true);
    assert.equal(isImageMetaFile("photo.Png.en.txt"), true);
  });

  it("should not match regular content files", () => {
    assert.equal(isImageMetaFile("colloquia.de.txt"), false);
    assert.equal(isImageMetaFile("start.en.txt"), false);
    assert.equal(isImageMetaFile("readme.txt"), false);
  });

  it("should not match image files themselves", () => {
    assert.equal(isImageMetaFile("photo.jpg"), false);
    assert.equal(isImageMetaFile("image.png"), false);
  });
});

// ─── extractImageFilename ───────────────────────────────────────

describe("extractImageFilename", () => {
  it("should extract image filename from metadata filename", () => {
    assert.equal(extractImageFilename("photo.jpg.de.txt"), "photo.jpg");
    assert.equal(extractImageFilename("photo.jpg.en.txt"), "photo.jpg");
    assert.equal(extractImageFilename("image.png.de.txt"), "image.png");
    assert.equal(extractImageFilename("graphic.svg.en.txt"), "graphic.svg");
  });

  it("should handle filenames with underscores and hyphens", () => {
    assert.equal(
      extractImageFilename("BHK_02_150.jpg.de.txt"),
      "BHK_02_150.jpg"
    );
    assert.equal(
      extractImageFilename("panel-1a-thumb.jpg.en.txt"),
      "panel-1a-thumb.jpg"
    );
  });

  it("should return null for non-image metadata files", () => {
    assert.equal(extractImageFilename("colloquia.de.txt"), null);
    assert.equal(extractImageFilename("readme.txt"), null);
    assert.equal(extractImageFilename("photo.jpg"), null);
  });
});

// ─── applyKirbytext ─────────────────────────────────────────────

describe("applyKirbytext", () => {
  it("should transform Kirby link syntax in string values", () => {
    const input = {
      text: "(link: http://example.com text: Example target: _blank)",
      title: "No links here",
    };

    const result = applyKirbytext(input);
    assert.ok((result.text as string).includes('href="http://example.com"'));
    assert.equal(result.title, "No links here");
  });

  it("should transform Kirby hr syntax in string values", () => {
    const input = { text: "before\n****\nafter" };
    const result = applyKirbytext(input);
    assert.ok((result.text as string).includes("<hr>"));
  });

  it("should leave empty strings unchanged", () => {
    const input = { website: "" };
    const result = applyKirbytext(input);
    assert.equal(result.website, "");
  });

  it("should keep structured data arrays unchanged", () => {
    const input = {
      gallery: [{ image: "test.jpg", position: "1" }],
    };

    const result = applyKirbytext(input);
    assert.ok(Array.isArray(result.gallery));
    assert.deepEqual(result.gallery, input.gallery);
  });

  it("should handle mixed content types", () => {
    const input = {
      title: "Title",
      text: "(link: http://a.com text: Link)",
      gallery: [{ image: "b.jpg" }],
      website: "",
    };

    const result = applyKirbytext(input);
    assert.equal(result.title, "Title");
    assert.ok((result.text as string).includes("href"));
    assert.ok(Array.isArray(result.gallery));
    assert.equal(result.website, "");
  });
});

// ─── getImageUrl ────────────────────────────────────────────────

describe("getImageUrl (content module)", () => {
  it("should return the correct public URL path", () => {
    assert.equal(getImageUrl("4-1979", "photo.jpg"), "/content/4-1979/photo.jpg");
  });

  it("should handle various directory and file names", () => {
    assert.equal(
      getImageUrl("10-2019", "BHK_02_150.jpg"),
      "/content/10-2019/BHK_02_150.jpg"
    );
  });
});
