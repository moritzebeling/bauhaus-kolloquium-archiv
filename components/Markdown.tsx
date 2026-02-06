/**
 * Markdown — renders Kirby markdown content as HTML.
 * Server component that converts markdown at build time.
 */

import { renderMarkdown } from "@/lib/markdown";

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  if (!content) return null;

  const html = renderMarkdown(content);

  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
