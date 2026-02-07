/**
 * PublicationPage — displays a publication with gallery and text.
 * Based on legacy t_publication.php snippet.
 */

import type { Page, PublicationContent, GalleryItem } from "@/lib/types";
import { Markdown } from "./Markdown";
import { Figure } from "./Figure";

interface PublicationPageProps {
  page: Page<PublicationContent>;
}

export function PublicationPage({ page }: PublicationPageProps) {
  const de = page.de;

  const galleryItems = (de.gallery || []) as GalleryItem[];

  return (
    <article id={`pub-${page.slug}`} className="publication span1">
      <div className="wrapper">
        <header>
          <h3>{de.title}</h3>
        </header>

        {/* Gallery images */}
        {galleryItems.map((item, i) => (
          <section key={i} className="gallery">
            <Figure
              filename={item.image}
              dirPath={page.dirPath}
              images={page.images}
              fallbackTitle={de.title}
            />
          </section>
        ))}

        {/* External link */}
        {de.website && (
          <section>
            <div className="official-page-link">
              <a target="_blank" href={de.website} rel="noreferrer">
                Mehr Informationen
              </a>
            </div>
          </section>
        )}

        {/* German text */}
        {de.text && (
          <section className="text">
            <div>
              <Markdown content={de.text} />
            </div>
          </section>
        )}

        {/* English text */}
        {de.text_en && (
          <section className="text en">
            <div>
              <Markdown content={de.text_en} />
            </div>
          </section>
        )}

        {/* Info box */}
        {de.info && (
          <section className="text box mono small">
            <div>
              <Markdown content={de.info} />
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
