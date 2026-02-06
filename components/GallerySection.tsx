/**
 * GallerySection — displays a single gallery image.
 * Based on legacy b_gallery.php snippet.
 */

import type { ImageMeta, GalleryItem } from "@/lib/types";
import { Figure } from "./Figure";

interface GallerySectionProps {
  item: GalleryItem;
  dirPath: string;
  images: Record<string, ImageMeta>;
  fallbackTitle?: string;
}

export function GallerySection({
  item,
  dirPath,
  images,
  fallbackTitle,
}: GallerySectionProps) {
  return (
    <section className="gallery-section">
      <Figure
        filename={item.image}
        dirPath={dirPath}
        images={images}
        fallbackTitle={fallbackTitle}
      />
    </section>
  );
}
