/**
 * VideoPlayer — displays a video thumbnail with metadata.
 * Based on legacy videoplayer.php snippet.
 *
 * Note: For the static site, we show the thumbnail and metadata.
 * Actual video playback would require the video files to be hosted
 * on a CDN (as in the legacy site).
 */

import type { VideoItem, ImageMeta } from "@/lib/types";
import { getImageUrl } from "@/lib/utils";

interface VideoPlayerProps {
  video: VideoItem;
  dirPath: string;
  images: Record<string, ImageMeta>;
  /** CDN base URL for video files */
  cdnBase?: string;
}

const CDN_BASE =
  "https://bhk-video.fra1.cdn.digitaloceanspaces.com/";

export function VideoPlayer({
  video,
  dirPath,
  images,
  cdnBase = CDN_BASE,
}: VideoPlayerProps) {
  const thumbnailSrc = video.thumbnail
    ? getImageUrl(dirPath, video.thumbnail)
    : "";

  const durationMin = parseInt(video.duration_min || "0", 10);
  const durationSec = parseInt(video.duration_sec || "0", 10);
  const durationStr = `${durationMin}:${String(durationSec).padStart(2, "0")}`;

  // Build video sources from sizes
  const sizes = video.sizes
    ? video.sizes.split(",").map((s) => s.trim())
    : [];

  return (
    <section className="video">
      <div className="video-player" data-filename={video.filename}>
        <div className="video-screen">
          {thumbnailSrc && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={thumbnailSrc}
              alt={video.title || "Video thumbnail"}
              width="100%"
              height="auto"
              loading="lazy"
            />
          )}
          {sizes.length > 0 && (
            <video preload="none" playsInline>
              {sizes.map((size) => (
                <source
                  key={size}
                  src={`${cdnBase}${video.filename}-${size}p.mp4`}
                  type="video/mp4"
                  data-size={size}
                />
              ))}
            </video>
          )}
        </div>
        <div className="video-controls">
          <span className="flex">{video.title}</span>
          <span>{durationStr}</span>
        </div>
      </div>
    </section>
  );
}
