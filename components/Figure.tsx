/**
 * Figure — displays an image with optional copyright protection overlay
 * and caption. Based on legacy b_figure.php snippet.
 */

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

  return (
    <figure className={`${isProtected ? "protect" : ""} ${className || ""}`}>
      {isProtected ? (
        <div className="img protection">
          <div>&copy; {copyright}</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={alt} width="100%" height="auto" loading="lazy" src={src} />
        </div>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img alt={alt} width="100%" height="auto" loading="lazy" src={src} />
      )}

      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
