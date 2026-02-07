/**
 * Tests for the markdown rendering utility.
 *
 * Run with: npx tsx --test lib/markdown.test.ts
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderMarkdown } from "./markdown";

// ─── renderMarkdown ─────────────────────────────────────────────

describe("renderMarkdown", () => {
  it("should return empty string for empty input", () => {
    assert.equal(renderMarkdown(""), "");
  });

  it("should render a simple paragraph", () => {
    const result = renderMarkdown("Hello World");
    assert.ok(result.includes("<p>Hello World</p>"));
  });

  it("should render headings", () => {
    const result = renderMarkdown("## Heading 2");
    assert.ok(result.includes("<h2>"));
    assert.ok(result.includes("Heading 2"));
  });

  it("should render bold text", () => {
    const result = renderMarkdown("**bold text**");
    assert.ok(result.includes("<strong>bold text</strong>"));
  });

  it("should render italic text", () => {
    const result = renderMarkdown("*italic text*");
    assert.ok(result.includes("<em>italic text</em>"));
  });

  it("should render standard markdown links", () => {
    const result = renderMarkdown("[Example](http://example.com)");
    assert.ok(result.includes('<a href="http://example.com" target="_blank" rel="noreferrer">Example</a>'));
  });

  it("should process Kirby link syntax before markdown", () => {
    const result = renderMarkdown(
      "(link: http://example.com text: Example Site target: _blank)"
    );
    assert.ok(result.includes('href="http://example.com"'));
    assert.ok(result.includes('target="_blank"'));
    assert.ok(result.includes("Example Site"));
  });

  it("should convert Kirby **** to <hr>", () => {
    const result = renderMarkdown("text\n\n****\n\nmore text");
    assert.ok(result.includes("<hr>"));
  });

  it("should render unordered lists", () => {
    const result = renderMarkdown("- Item 1\n- Item 2\n- Item 3");
    assert.ok(result.includes("<ul>"));
    assert.ok(result.includes("<li>Item 1</li>"));
    assert.ok(result.includes("<li>Item 2</li>"));
  });

  it("should render multiline markdown with mixed elements", () => {
    const input = `## Title

Some **bold** and *italic* text.

- List item 1
- List item 2`;

    const result = renderMarkdown(input);
    assert.ok(result.includes("<h2>"));
    assert.ok(result.includes("<strong>bold</strong>"));
    assert.ok(result.includes("<em>italic</em>"));
    assert.ok(result.includes("<ul>"));
  });

  it("should handle Kirby links within markdown formatting", () => {
    const input =
      "*(link: http://spectorbooks.com text: Dust & Data target: _blank)*";
    const result = renderMarkdown(input);
    assert.ok(result.includes("Dust &amp; Data") || result.includes("Dust & Data"));
    assert.ok(result.includes('href="http://spectorbooks.com"'));
  });
});
