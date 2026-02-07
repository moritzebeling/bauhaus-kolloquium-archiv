/**
 * ColloquiaPage — a single colloquium page with two columns.
 * Based on legacy t_colloquia.php snippet.
 */

import type {
  Page,
  ColloquiaContent,
  GalleryItem,
  ProgramItem,
  QuoteItem,
} from "@/lib/types";
import { Markdown } from "./Markdown";
import { Figure } from "./Figure";
import { GallerySection } from "./GallerySection";
import { ProgramSection } from "./ProgramSection";
import { Quote } from "./Quote";
import {
  formatDateRange,
  sortIntoColumns,
  mergeColumnItems,
  getImageUrl,
} from "@/lib/utils";

interface ColloquiaPageProps {
  page: Page<ColloquiaContent>;
}

export function ColloquiaPage({ page }: ColloquiaPageProps) {
  const de = page.de;

  // Sort program, gallery, and quote items into columns
  const programColumns = de.program
    ? sortIntoColumns(
        de.program as (ProgramItem & { column?: string; position?: string })[],
        "program",
        1
      )
    : { left: [], right: [] };

  const galleryColumns = de.gallery
    ? sortIntoColumns(
        de.gallery as (GalleryItem & { column?: string; position?: string })[],
        "gallery",
        2
      )
    : { left: [], right: [] };

  const quoteColumns = de.quotes
    ? sortIntoColumns(
        de.quotes as (QuoteItem & { column?: string; position?: string })[],
        "quote",
        3
      )
    : { left: [], right: [] };

  const leftItems = mergeColumnItems(
    programColumns.left,
    galleryColumns.left,
    quoteColumns.left
  );

  const rightItems = mergeColumnItems(
    programColumns.right,
    galleryColumns.right,
    quoteColumns.right
  );

  const dateRange = formatDateRange(de.date_start, de.date_end);

  return (
    <article id={`ibhk-${de.edition}`} className="colloquia span2 add-nav">
      <div className="wrapper">
        <header>
          {de.website && (
            <div className="official-page-link">
              <a target="_blank" href={de.website} rel="noreferrer">
                Offizielle Webseite
              </a>
            </div>
          )}
          <h2>{de.title}</h2>
          <h3>
            {de.name}
            {dateRange && <span className="date">{dateRange}</span>}
          </h3>
        </header>

        <div className="grid-2col">
          {/* Left column — German text + content */}
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

            {/* Poster */}
            {de.poster && (
              <section className="poster">
                <Figure
                  filename={de.poster}
                  dirPath={page.dirPath}
                  images={page.images}
                  fallbackTitle={de.title}
                />
              </section>
            )}

            {/* Left column items (program, gallery, quotes) */}
            {leftItems.map((entry, i) => {
              if (entry.template === "program") {
                return (
                  <ProgramSection
                    key={`l-${i}`}
                    item={entry.item as ProgramItem}
                    dirPath={page.dirPath}
                    images={page.images}
                    fallbackTitle={de.title}
                  />
                );
              }
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

            {/* Photo Album download */}
            {de.album && (
              <section className="text box album">
                <a
                  className="album-download"
                  target="_blank"
                  href={getImageUrl(page.dirPath, de.album)}
                  rel="noreferrer"
                >
                  {de.album_cover && (
                    <Figure
                      filename={de.album_cover}
                      dirPath={page.dirPath}
                      images={page.images}
                    />
                  )}
                  <span>Fotoalbum Kolloquiums&nbsp;{de.title}</span>
                  <span className="small mono">Download PDF</span>
                </a>
              </section>
            )}
          </div>

          {/* Right column — English text + content */}
          <div className="column">
            <section className="text box en">
              {de.text_intro_en && (
                <div>
                  <Markdown content={de.text_intro_en} />
                </div>
              )}
              {de.text_en && (
                <div>
                  <Markdown content={de.text_en} />
                </div>
              )}
            </section>

            {/* Right column items */}
            {rightItems.map((entry, i) => {
              if (entry.template === "program") {
                return (
                  <ProgramSection
                    key={`r-${i}`}
                    item={entry.item as ProgramItem}
                    dirPath={page.dirPath}
                    images={page.images}
                    fallbackTitle={de.title}
                  />
                );
              }
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
