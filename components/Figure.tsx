/**
 * Figure — displays an image with optional copyright protection overlay
 * and caption. Uses next/image for automatic optimization (srcset, WebP/AVIF)
 * on bitmap images, and plain <img> for SVGs.
 *
 * Images are rendered with loading="lazy" for SSR, but an IntersectionObserver
 * with a generous rootMargin flips them to "eager" well before they enter the
 * viewport, so they're already loaded by the time the user scrolls to them.
 */

"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { ImageMeta } from "@/lib/types";
import {
  getImageUrl,
  getImageCopyright,
  getImageCaption,
  getImageAlt,
  getImageDimensions,
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
  const figureRef = useRef<HTMLElement>(null);
  const [loaded, setLoaded] = useState(false);
  const handleLoad = useCallback(() => setLoaded(true), []);

  // Preload images before they scroll into view by flipping loading="lazy"
  // to "eager" when the figure is within 1500px of the viewport.
  useEffect(() => {
    const el = figureRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.querySelectorAll<HTMLImageElement>("img[loading='lazy']").forEach(
            (img) => {
              img.loading = "eager";
            }
          );
          observer.disconnect();
        }
      },
      { rootMargin: "1000px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Images that are already cached won't fire onLoad after hydration,
  // so check img.complete on mount to immediately reveal them.
  useEffect(() => {
    if (loaded) return;
    const el = figureRef.current;
    if (!el) return;
    const img = el.querySelector<HTMLImageElement>("img");
    if (img?.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [loaded]);

  if (!filename) return null;

  const copyright = getImageCopyright(images, filename);
  const caption = getImageCaption(images, filename);
  const alt = getImageAlt(images, filename, fallbackTitle);
  const src = getImageUrl(dirPath, filename);

  const isProtected = !!copyright;

  // Look up real image dimensions to prevent layout shift
  const { width, height } = getImageDimensions(dirPath, filename);

  // Use next/image for bitmap images (automatic srcset, WebP/AVIF, CDN optimization)
  // SVGs are already resolution-independent and don't need optimization
  const imageElement = isBitmap(filename) ? (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes="(max-width: 900px) 100vw, 33vw"
      style={{
        width: "100%",
        height: "auto",
        aspectRatio: `${width} / ${height}`,
      }}
      loading="lazy"
      onLoad={handleLoad}
    />
  ) : (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      alt={alt}
      width="100%"
      height="auto"
      loading="lazy"
      src={src}
      onLoad={handleLoad}
    />
  );

  return (
    <figure
      ref={figureRef}
      className={`${loaded ? "loaded" : ""} ${isProtected ? "protect" : ""} ${className || ""}`}
    >
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
