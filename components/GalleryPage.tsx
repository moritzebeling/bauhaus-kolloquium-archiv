/**
 * GalleryPage — displays a gallery of images.
 * Based on legacy t_gallery.php snippet.
 */

import type { Page, GalleryPageContent, GalleryItem } from "@/lib/types";
import { Figure } from "./Figure";

interface GalleryPageProps {
  page: Page<GalleryPageContent>;
}

export function GalleryPage({ page }: GalleryPageProps) {
  const de = page.de;
  const galleryItems = (de.gallery || []) as GalleryItem[];

  return (
    <article id={page.slug} className="colloquia span2 addon">
      <div className="wrapper">
        <header>
          <h3>{de.title}</h3>
        </header>

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
      </div>
    </article>
  );
}
