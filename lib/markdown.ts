/**
 * Markdown rendering utility.
 * Converts Kirby content (which includes markdown) to HTML.
 */

import { marked, type Tokens } from "marked";
import { parseKirbytext } from "./parser";

// Custom renderer: open external links in new tab
const renderer = {
  link({ href, text }: Tokens.Link): string {
    const isExternal =
      href && (href.startsWith("http://") || href.startsWith("https://"));
    if (isExternal) {
      return `<a href="${href}" target="_blank" rel="noreferrer">${text}</a>`;
    }
    return `<a href="${href}">${text}</a>`;
  },
};

// Configure marked for synchronous rendering
marked.use({
  async: false,
  gfm: true,
  breaks: false,
  renderer,
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
