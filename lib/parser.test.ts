/**
 * Tests for the Kirby content file parser.
 *
 * Run with: npx tsx --test lib/parser.test.ts
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeFieldName,
  isStructuredField,
  parseStructuredField,
  parseKirbyLinks,
  parseKirbyHr,
  parseKirbytext,
  parseKirbyFile,
  parseKirbyFileTyped,
  STRUCTURED_FIELDS,
} from "./parser";

// ─── normalizeFieldName ──────────────────────────────────────────

describe("normalizeFieldName", () => {
  it("should lowercase field names", () => {
    assert.equal(normalizeFieldName("Title"), "title");
    assert.equal(normalizeFieldName("YEAR"), "year");
  });

  it("should replace dashes with underscores", () => {
    assert.equal(normalizeFieldName("Date-start"), "date_start");
    assert.equal(normalizeFieldName("Text-en"), "text_en");
    assert.equal(normalizeFieldName("Text-intro-en"), "text_intro_en");
    assert.equal(normalizeFieldName("Is-retrospect"), "is_retrospect");
  });

  it("should handle already-normalized names", () => {
    assert.equal(normalizeFieldName("title"), "title");
    assert.equal(normalizeFieldName("date_start"), "date_start");
  });
});

// ─── isStructuredField ───────────────────────────────────────────

describe("isStructuredField", () => {
  it("should detect YAML list fields with key-value pairs", () => {
    assert.equal(isStructuredField("- \n  image: test.jpg"), true);
    assert.equal(
      isStructuredField("- \n  image: test.jpg\n  position: 1"),
      true
    );
  });

  it("should not detect regular text as structured", () => {
    assert.equal(isStructuredField("Just a plain text value"), false);
    assert.equal(isStructuredField("## A heading\nSome text"), false);
  });

  it("should handle empty values", () => {
    assert.equal(isStructuredField(""), false);
    assert.equal(isStructuredField("  "), false);
  });

  it("should NOT detect simple markdown lists as structured", () => {
    // Simple markdown lists should NOT be detected as structured YAML
    assert.equal(isStructuredField("- item one\n- item two"), false);
    assert.equal(isStructuredField("- Ines Weizman\n- Robin Weißenborn"), false);
  });
});

// ─── parseStructuredField ────────────────────────────────────────

describe("parseStructuredField", () => {
  it("should parse a simple gallery item", () => {
    const input = `- 
  group: "2"
  image: BHK_02_150.jpg
  position: "1"
  column: left`;

    const result = parseStructuredField(input);
    assert.equal(result.length, 1);
    assert.equal(result[0].group, "2");
    assert.equal(result[0].image, "BHK_02_150.jpg");
    assert.equal(result[0].position, "1");
    assert.equal(result[0].column, "left");
  });

  it("should parse multiple gallery items", () => {
    const input = `- 
  group: "2"
  image: BHK_02_150.jpg
  position: "1"
  column: left
- 
  group: "2"
  image: BHK_02_25.jpg
  position: "3"
  column: left`;

    const result = parseStructuredField(input);
    assert.equal(result.length, 2);
    assert.equal(result[0].image, "BHK_02_150.jpg");
    assert.equal(result[1].image, "BHK_02_25.jpg");
    assert.equal(result[1].position, "3");
  });

  it("should parse quote items with YAML folded text", () => {
    const input = `- 
  group: "4"
  blockquote: 'A quoted text here'
  source: >
    Marco De Michelis im Gespräch mit Lena
    Laine, 2016
  position: "4"
  column: left`;

    const result = parseStructuredField(input);
    assert.equal(result.length, 1);
    assert.equal(result[0].blockquote, "A quoted text here");
    assert.equal(
      result[0].source,
      "Marco De Michelis im Gespräch mit Lena Laine, 2016"
    );
    assert.equal(result[0].group, "4");
  });

  it("should parse video items", () => {
    const input = `- 
  title: Introduction, Ines Weizman
  thumbnail: panel-1a-keynote-ines-weizman.jpg
  filename: panel-1a-keynote-Ines-weizman
  sizes: 720, 480, 360
  duration_min: "9"
  duration_sec: "46"`;

    const result = parseStructuredField(input);
    assert.equal(result.length, 1);
    assert.equal(result[0].title, "Introduction, Ines Weizman");
    assert.equal(result[0].thumbnail, "panel-1a-keynote-ines-weizman.jpg");
    assert.equal(result[0].filename, "panel-1a-keynote-Ines-weizman");
    assert.equal(result[0].sizes, "720, 480, 360");
    assert.equal(result[0].duration_min, "9");
    assert.equal(result[0].duration_sec, "46");
  });

  it("should parse logo items", () => {
    const input = `- 
  image: cda_logo.svg
  position: "3"
- 
  image: uni-weimar_logo.svg
  position: "2"`;

    const result = parseStructuredField(input);
    assert.equal(result.length, 2);
    assert.equal(result[0].image, "cda_logo.svg");
    assert.equal(result[0].position, "3");
    assert.equal(result[1].image, "uni-weimar_logo.svg");
  });

  it("should return empty array for empty input", () => {
    assert.deepEqual(parseStructuredField(""), []);
    assert.deepEqual(parseStructuredField("  "), []);
  });

  it("should normalize field names in structured items", () => {
    const input = `- 
  Duration-min: "5"
  Duration-sec: "30"`;

    const result = parseStructuredField(input);
    assert.equal(result[0].duration_min, "5");
    assert.equal(result[0].duration_sec, "30");
  });
});

// ─── parseKirbyLinks ─────────────────────────────────────────────

describe("parseKirbyLinks", () => {
  it("should parse a link with text", () => {
    const input = "(link: http://example.com text: Example Site)";
    const result = parseKirbyLinks(input);
    assert.equal(result, '<a href="http://example.com">Example Site</a>');
  });

  it("should parse a link with text and target", () => {
    const input =
      "(link: http://example.com text: Example Site target: _blank)";
    const result = parseKirbyLinks(input);
    assert.equal(
      result,
      '<a href="http://example.com" target="_blank">Example Site</a>'
    );
  });

  it("should handle multiple links in text", () => {
    const input =
      "Visit (link: http://a.com text: A) and (link: http://b.com text: B target: _blank)";
    const result = parseKirbyLinks(input);
    assert.equal(
      result,
      'Visit <a href="http://a.com">A</a> and <a href="http://b.com" target="_blank">B</a>'
    );
  });

  it("should handle links within markdown", () => {
    const input =
      "*(link: http://spectorbooks.com/dust-data text: Dust & Data target: _blank)*";
    const result = parseKirbyLinks(input);
    assert.equal(
      result,
      '*<a href="http://spectorbooks.com/dust-data" target="_blank">Dust & Data</a>*'
    );
  });
});

// ─── parseKirbyHr ────────────────────────────────────────────────

describe("parseKirbyHr", () => {
  it("should replace **** with <hr>", () => {
    assert.equal(parseKirbyHr("text\n****\nmore text"), "text\n<hr>\nmore text");
  });

  it("should handle multiple ****", () => {
    assert.equal(parseKirbyHr("****\ntext\n****"), "<hr>\ntext\n<hr>");
  });

  it("should not replace inline asterisks", () => {
    assert.equal(parseKirbyHr("**bold** text"), "**bold** text");
  });
});

// ─── parseKirbyFile ──────────────────────────────────────────────

describe("parseKirbyFile", () => {
  it("should parse a simple content file", () => {
    const input = `Title: Hello World

----

Year: 1979

----

Name: Test`;

    const result = parseKirbyFile(input);
    assert.equal(result.title, "Hello World");
    assert.equal(result.year, "1979");
    assert.equal(result.name, "Test");
  });

  it("should handle multiline text fields", () => {
    const input = `Text: 

This is a paragraph.

And another paragraph with **bold** text.

----

Title: Test`;

    const result = parseKirbyFile(input);
    assert.ok(result.text.includes("This is a paragraph."));
    assert.ok(result.text.includes("**bold**"));
    assert.equal(result.title, "Test");
  });

  it("should handle empty field values", () => {
    const input = `Website: 

----

Text: Hello`;

    const result = parseKirbyFile(input);
    assert.equal(result.website, "");
    assert.equal(result.text, "Hello");
  });

  it("should normalize field names", () => {
    const input = `Date-start: 1979-06-27

----

Text-en: English text

----

Is-retrospect: 1`;

    const result = parseKirbyFile(input);
    assert.equal(result.date_start, "1979-06-27");
    assert.equal(result.text_en, "English text");
    assert.equal(result.is_retrospect, "1");
  });

  it("should handle structured field values", () => {
    const input = `Gallery: 

- 
  group: "2"
  image: test.jpg
  position: "1"
  column: left

----

Title: Test`;

    const result = parseKirbyFile(input);
    assert.ok(result.gallery.includes("image: test.jpg"));
    assert.equal(result.title, "Test");
  });

  it("should parse the colloquia.de.txt format", () => {
    const input = `Year: 1979

----

Title: 1979

----

Name: II. Bauhaus-Kolloquium

----

Website: 

----

Edition: 2

----

Date-start: 1979-06-27

----

Date-end: 1979-06-29

----

Poster: ibhk1979-poster.jpg

----

Program: 

- 
  image: IBHK1979-Program-1.jpg
  group: "1"
  position: "1"
  column: right

----

Text: Main text content`;

    const result = parseKirbyFile(input);
    assert.equal(result.year, "1979");
    assert.equal(result.title, "1979");
    assert.equal(result.name, "II. Bauhaus-Kolloquium");
    assert.equal(result.website, "");
    assert.equal(result.edition, "2");
    assert.equal(result.date_start, "1979-06-27");
    assert.equal(result.date_end, "1979-06-29");
    assert.equal(result.poster, "ibhk1979-poster.jpg");
    assert.ok(result.program.includes("IBHK1979-Program-1.jpg"));
    assert.equal(result.text, "Main text content");
  });

  it("should handle image metadata files", () => {
    const input = `Caption: Gruppenfoto

----

Copyright: Archiv der Moderne`;

    const result = parseKirbyFile(input);
    assert.equal(result.caption, "Gruppenfoto");
    assert.equal(result.copyright, "Archiv der Moderne");
  });
});

// ─── parseKirbyFileTyped ─────────────────────────────────────────

describe("parseKirbyFileTyped", () => {
  it("should auto-detect and parse structured fields", () => {
    const input = `Gallery: 

- 
  group: "2"
  image: test.jpg
  position: "1"
  column: left
- 
  group: "3"
  image: test2.jpg
  position: "2"
  column: right

----

Title: Test`;

    const result = parseKirbyFileTyped(input);
    assert.equal(result.title, "Test");

    const gallery = result.gallery;
    assert.ok(Array.isArray(gallery));
    assert.equal((gallery as Record<string, string>[]).length, 2);
    assert.equal((gallery as Record<string, string>[])[0].image, "test.jpg");
    assert.equal((gallery as Record<string, string>[])[1].image, "test2.jpg");
    assert.equal((gallery as Record<string, string>[])[1].column, "right");
  });

  it("should use template hints for structured fields", () => {
    const input = `Quotes: 

- 
  blockquote: 'A quote'
  source: Someone
  blockquote_en: 'A quote in English'
  source_en: Someone
  position: "4"
  column: left

----

Text: Regular text`;

    const result = parseKirbyFileTyped(
      input,
      STRUCTURED_FIELDS["colloquia"]
    );
    assert.ok(Array.isArray(result.quotes));
    const quotes = result.quotes as Record<string, string>[];
    assert.equal(quotes.length, 1);
    assert.equal(quotes[0].blockquote, "A quote");
    assert.equal(quotes[0].source, "Someone");
    assert.equal(result.text, "Regular text");
  });

  it("should parse video items in video-gallery template", () => {
    const input = `Panel1-videos: 

- 
  title: Introduction
  thumbnail: thumb.jpg
  filename: video-file
  sizes: 720, 480, 360
  duration_min: "9"
  duration_sec: "46"

----

Title: Videos`;

    const result = parseKirbyFileTyped(
      input,
      STRUCTURED_FIELDS["video-gallery"]
    );
    assert.ok(Array.isArray(result.panel1_videos));
    const videos = result.panel1_videos as Record<string, string>[];
    assert.equal(videos.length, 1);
    assert.equal(videos[0].title, "Introduction");
    assert.equal(videos[0].duration_min, "9");
  });

  it("should handle files with many fields like real colloquia", () => {
    const input = `Year: 1979

----

Title: 1979

----

Name: II. Bauhaus-Kolloquium

----

Edition: 2

----

Date-start: 1979-06-27

----

Date-end: 1979-06-29

----

Gallery: 

- 
  group: "2"
  image: BHK_02_150.jpg
  position: "1"
  column: left
- 
  group: "2"
  image: BHK_02_25.jpg
  position: "3"
  column: left

----

Quotes: 

- 
  group: "4"
  blockquote: 'A quote here'
  source: >
    Someone, 2016
  position: "4"
  column: left

----

Text-intro: 

#### 60 Jahre Gründung des Bauhauses

**Prof. Dr. Christian Schädlich**

----

Text: Main content here`;

    const result = parseKirbyFileTyped(
      input,
      STRUCTURED_FIELDS["colloquia"]
    );

    // Simple fields
    assert.equal(result.year, "1979");
    assert.equal(result.title, "1979");
    assert.equal(result.name, "II. Bauhaus-Kolloquium");
    assert.equal(result.edition, "2");
    assert.equal(result.date_start, "1979-06-27");

    // Structured fields
    const gallery = result.gallery as Record<string, string>[];
    assert.equal(gallery.length, 2);
    assert.equal(gallery[0].image, "BHK_02_150.jpg");
    assert.equal(gallery[1].position, "3");

    const quotes = result.quotes as Record<string, string>[];
    assert.equal(quotes.length, 1);
    assert.equal(quotes[0].blockquote, "A quote here");
    assert.ok(quotes[0].source.includes("Someone"));

    // Text fields
    assert.ok((result.text_intro as string).includes("60 Jahre"));
    assert.equal(result.text, "Main content here");
  });
});

// ─── STRUCTURED_FIELDS configuration ────────────────────────────

describe("STRUCTURED_FIELDS", () => {
  it("should have correct fields for colloquia", () => {
    assert.ok(STRUCTURED_FIELDS["colloquia"].has("program"));
    assert.ok(STRUCTURED_FIELDS["colloquia"].has("gallery"));
    assert.ok(STRUCTURED_FIELDS["colloquia"].has("quotes"));
  });

  it("should have correct fields for video-gallery", () => {
    assert.ok(STRUCTURED_FIELDS["video-gallery"].has("panel1_videos"));
    assert.ok(STRUCTURED_FIELDS["video-gallery"].has("panel4_videos"));
  });

  it("should have correct fields for start", () => {
    assert.ok(STRUCTURED_FIELDS["start"].has("logos"));
  });

  it("should have correct fields for retrospect", () => {
    assert.ok(STRUCTURED_FIELDS["retrospect"].has("videosource"));
    assert.ok(STRUCTURED_FIELDS["retrospect"].has("quotes"));
  });
});
