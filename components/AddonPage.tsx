/**
 * AddonPage — additional colloquia content page.
 * Based on legacy t_addon.php snippet.
 * Similar to ColloquiaPage but without header year/dates.
 */

import type {
  Page,
  AddonContent,
  GalleryItem,
  ProgramItem,
  QuoteItem,
} from "@/lib/types";
import { Markdown } from "./Markdown";
import { GallerySection } from "./GallerySection";
import { Quote } from "./Quote";
import { sortIntoColumns, mergeColumnItems } from "@/lib/utils";

interface AddonPageProps {
  page: Page<AddonContent>;
}

export function AddonPage({ page }: AddonPageProps) {
  const de = page.de;
  const en = page.en as Partial<AddonContent> | undefined;

  const galleryColumns = de.gallery
    ? sortIntoColumns(de.gallery as (GalleryItem & { column?: string; position?: string })[], "gallery", 2)
    : { left: [], right: [] };

  const quoteColumns = de.quotes
    ? sortIntoColumns(de.quotes as (QuoteItem & { column?: string; position?: string })[], "quote", 3)
    : { left: [], right: [] };

  const leftItems = mergeColumnItems(galleryColumns.left, quoteColumns.left);
  const rightItems = mergeColumnItems(
    galleryColumns.right,
    quoteColumns.right
  );

  return (
    <article className="colloquia span2 addon add-nav">
      <div className="wrapper">
        <div className="grid-2col">
          {/* Left column — German */}
          <div className="column">
            <section className="text box">
              {de.text_intro && (
                <div>
                  <Markdown content={de.text_intro} />
                </div>
              )}
              {de.text && (
                <div>
                  <Markdown content={de.text} />
                </div>
              )}
            </section>

            {leftItems.map((entry, i) => {
              if (entry.template === "gallery") {
                return (
                  <GallerySection
                    key={`l-${i}`}
                    item={entry.item as GalleryItem}
                    dirPath={page.dirPath}
                    images={page.images}
                    fallbackTitle={de.title}
                  />
                );
              }
              if (entry.template === "quote") {
                return <Quote key={`l-${i}`} item={entry.item as QuoteItem} />;
              }
              return null;
            })}
          </div>

          {/* Right column — English */}
          <div className="column">
            <section className="text box en">
              {(en?.text_intro_en || de.text_intro_en) && (
                <div>
                  <Markdown
                    content={(en?.text_intro_en || de.text_intro_en) as string}
                  />
                </div>
              )}
              {(en?.text_en || de.text_en) && (
                <div>
                  <Markdown content={(en?.text_en || de.text_en) as string} />
                </div>
              )}
            </section>

            {rightItems.map((entry, i) => {
              if (entry.template === "gallery") {
                return (
                  <GallerySection
                    key={`r-${i}`}
                    item={entry.item as GalleryItem}
                    dirPath={page.dirPath}
                    images={page.images}
                    fallbackTitle={de.title}
                  />
                );
              }
              if (entry.template === "quote") {
                return <Quote key={`r-${i}`} item={entry.item as QuoteItem} />;
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
