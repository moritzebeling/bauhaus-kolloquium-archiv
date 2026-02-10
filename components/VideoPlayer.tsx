/**
 * VideoPlayer — interactive video player with play/pause and progress.
 * Based on legacy videoplayer.php snippet and action.js video control.
 */

"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
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
  "https://documentary-architecture.fra1.cdn.digitaloceanspaces.com/ibhk/retrospects/";

/** Format seconds as "m:ss" string */
function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Media queries for smaller video sizes (largest size gets no media attr) */
const SIZE_MEDIA: Record<string, string> = {
  "360": "all and (max-width:640)",
  "480": "all and (max-width:854)",
};

export function VideoPlayer({
  video,
  dirPath,
  // images,
  cdnBase = CDN_BASE,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<
    "ready" | "play" | "pause" | "please-wait"
  >("ready");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const thumbnailSrc = video.thumbnail
    ? getImageUrl(dirPath, video.thumbnail)
    : "";

  const durationMin = parseInt(video.duration_min || "0", 10);
  const durationSec = parseInt(video.duration_sec || "0", 10);
  const staticDuration = `${durationMin}:${String(durationSec).padStart(2, "0")}`;

  // Build video sources from sizes, sorted ascending (smallest first)
  const sizes = video.sizes
    ? video.sizes
        .split(",")
        .map((s) => s.trim())
        .toSorted((a, b) => parseInt(a) - parseInt(b))
    : [];

  // Aspect ratio: default 16:9, can be overridden per video (e.g. "4:3")
  const aspectRatio = video.aspect_ratio || "16:9";

  const togglePlay = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (vid.paused || vid.ended) {
      // Notify all other players to pause
      document.dispatchEvent(
        new CustomEvent("videoplayer:play", { detail: vid })
      );
      setState("please-wait");
      vid
        .play()
        .then(() => {
          setState("play");
        })
        .catch(() => {
          setState("ready");
        });
    } else {
      vid.pause();
      setState("pause");
    }
  }, []);

  const handleProgress = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const vid = videoRef.current;
    const bar = controlsRef.current;
    if (!vid || !bar || !vid.duration) return;

    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, x / rect.width));
    vid.currentTime = fraction * vid.duration;
  }, []);

  // Pause this player when another player starts
  useEffect(() => {
    const onOtherPlay = (e: Event) => {
      const vid = videoRef.current;
      const active = (e as CustomEvent).detail as HTMLVideoElement;
      if (vid && active !== vid && !vid.paused) {
        vid.pause();
        setState("pause");
      }
    };

    document.addEventListener("videoplayer:play", onOtherPlay);
    return () => {
      document.removeEventListener("videoplayer:play", onOtherPlay);
    };
  }, []);

  // Stable video event listeners — don't depend on component state
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const onTimeUpdate = () => {
      startTransition(() => setCurrentTime(vid.currentTime));
    };
    const onDurationChange = () => {
      setDuration(vid.duration);
    };
    const onEnded = () => {
      setState("ready");
    };

    vid.addEventListener("timeupdate", onTimeUpdate);
    vid.addEventListener("durationchange", onDurationChange);
    vid.addEventListener("ended", onEnded);

    return () => {
      vid.removeEventListener("timeupdate", onTimeUpdate);
      vid.removeEventListener("durationchange", onDurationChange);
      vid.removeEventListener("ended", onEnded);
    };
  }, []);

  // canplay listener — needs current state to check "please-wait"
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const onCanPlay = () => {
      if (state === "please-wait") {
        setState("play");
      }
    };

    vid.addEventListener("canplay", onCanPlay);
    return () => vid.removeEventListener("canplay", onCanPlay);
  }, [state]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const hasStarted = state !== "ready";
  const timeNow = duration > 0 ? formatTime(currentTime) : "0:00";
  const timeTotal = duration > 0 ? formatTime(duration) : staticDuration;

  return (
    <section className="video">
      <div className={`video-player ${state}`} data-filename={video.filename}>
        <div
          className="video-screen"
          onClick={togglePlay}
          style={{ aspectRatio: aspectRatio.replace(":", " / ") }}
        >
          {sizes.length > 0 ? (
            <video
              ref={videoRef}
              preload="none"
              playsInline
              poster={thumbnailSrc || undefined}
              width="100%"
              height="auto"
            >
              {sizes.map((size) => (
                <source
                  key={size}
                  src={`${cdnBase}${video.filename}/${video.filename}-${size}.mp4`}
                  type="video/mp4"
                  media={SIZE_MEDIA[size] || undefined}
                />
              ))}
              {/* Fallback image for browsers without video support */}
              {thumbnailSrc && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={thumbnailSrc}
                  alt={video.title || "Video thumbnail"}
                  width="100%"
                  height="auto"
                />
              )}
            </video>
          ) : (
            thumbnailSrc && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={thumbnailSrc}
                alt={video.title || "Video thumbnail"}
                width="100%"
                height="auto"
                loading="lazy"
              />
            )
          )}
        </div>
        <div
          className="video-controls"
          ref={controlsRef}
          onClick={handleProgress}
        >
          <div
            className="video-progress-bar"
            style={{ width: `${progress}%` }}
          />
          <div className="video-controls-content">
            <span
              className="button play"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
            >
              {state === "play" ? "Pause" : "Play"}
            </span>
            {hasStarted && <span className="time-now">{timeNow}</span>}
            <span className="flex-spacer" />
            <span className="time-total">{timeTotal}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
