/**
 * Figure — displays an image with optional copyright protection overlay
 * and caption. Uses next/image for automatic optimization (srcset, WebP/AVIF)
 * on bitmap images, and plain <img> for SVGs.
 */

import Image from "next/image";
import type { ImageMeta } from "@/lib/types";
import {
  getImageUrl,
  getImageCopyright,
  getImageCaption,
  getImageAlt,
} from "@/lib/utils";

interface FigureProps {
  /** Image filename */
  filename: string;
  /** Content directory path */
  dirPath: string;
  /** Image metadata records for this page */
  images: Record<string, ImageMeta>;
  /** Fallback alt/title text */
  fallbackTitle?: string;
  /** Additional CSS class */
  className?: string;
}

function isBitmap(filename: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
}

export function Figure({
  filename,
  dirPath,
  images,
  fallbackTitle,
  className,
}: FigureProps) {
  if (!filename) return null;

  const copyright = getImageCopyright(images, filename);
  const caption = getImageCaption(images, filename);
  const alt = getImageAlt(images, filename, fallbackTitle);
  const src = getImageUrl(dirPath, filename);

  const isProtected = !!copyright;

  // Use next/image for bitmap images (automatic srcset, WebP/AVIF, CDN optimization)
  // SVGs are already resolution-independent and don't need optimization
  const imageElement = isBitmap(filename) ? (
    <Image
      src={src}
      alt={alt}
      width={2000}
      height={1500}
      sizes="(max-width: 900px) 100vw, 33vw"
      style={{ width: "100%", height: "auto" }}
      loading="lazy"
    />
  ) : (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img alt={alt} width="100%" height="auto" loading="lazy" src={src} />
  );

  return (
    <figure className={`${isProtected ? "protect" : ""} ${className || ""}`}>
      {isProtected ? (
        <div className="img protection">
          <div>&copy; {copyright}</div>
          {imageElement}
        </div>
      ) : (
        imageElement
      )}

      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
