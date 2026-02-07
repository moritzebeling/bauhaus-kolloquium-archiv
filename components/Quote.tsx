/**
 * Quote — displays a bilingual quote block.
 * Based on legacy b_quote.php snippet.
 */

import type { QuoteItem } from "@/lib/types";

interface QuoteProps {
  item: QuoteItem;
}

export function Quote({ item }: QuoteProps) {
  return (
    <section className="quotes">
      <div className="quote">
        <blockquote>{item.blockquote}</blockquote>
        {item.source && <p className="source">{item.source}</p>}
      </div>
      {item.blockquote_en && (
        <div className="quote en">
          <blockquote>{item.blockquote_en}</blockquote>
          {item.source_en && <p className="source">{item.source_en}</p>}
        </div>
      )}
    </section>
  );
}
