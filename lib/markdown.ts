/**
 * Markdown rendering utility.
 * Converts Kirby content (which includes markdown) to HTML.
 */

import { marked } from "marked";
import { parseKirbytext } from "./parser";

// Configure marked for synchronous rendering
marked.use({
  async: false,
  gfm: true,
  breaks: false,
});

/**
 * Render Kirby-flavoured markdown to HTML string.
 * Applies Kirbytext transformations first (link syntax, hr syntax),
 * then standard markdown rendering.
 */
export function renderMarkdown(text: string): string {
  if (!text) return "";
  const kirbyProcessed = parseKirbytext(text);
  return marked.parse(kirbyProcessed) as string;
}
