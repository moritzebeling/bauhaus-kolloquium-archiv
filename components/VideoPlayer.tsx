/**
 * VideoPlayer — interactive video player with play/pause and progress.
 * Based on legacy videoplayer.php snippet and action.js video control.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { VideoItem, ImageMeta } from "@/lib/types";
import { getImageUrl } from "@/lib/utils";

interface VideoPlayerProps {
  video: VideoItem;
  dirPath: string;
  images: Record<string, ImageMeta>;
  /** CDN base URL for video files */
  cdnBase?: string;
}

const CDN_BASE = "https://bhk-video.fra1.cdn.digitaloceanspaces.com/";

export function VideoPlayer({
  video,
  dirPath,
  images,
  cdnBase = CDN_BASE,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"ready" | "play" | "pause" | "please-wait">("ready");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const thumbnailSrc = video.thumbnail
    ? getImageUrl(dirPath, video.thumbnail)
    : "";

  const durationMin = parseInt(video.duration_min || "0", 10);
  const durationSec = parseInt(video.duration_sec || "0", 10);
  const staticDuration = `${durationMin}:${String(durationSec).padStart(2, "0")}`;

  // Build video sources from sizes
  const sizes = video.sizes
    ? video.sizes.split(",").map((s) => s.trim())
    : [];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const togglePlay = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (vid.paused || vid.ended) {
      setState("please-wait");
      vid.play().then(() => {
        setState("play");
      }).catch(() => {
        setState("ready");
      });
    } else {
      vid.pause();
      setState("pause");
    }
  }, []);

  const handleProgress = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const vid = videoRef.current;
    const bar = progressRef.current;
    if (!vid || !bar || !vid.duration) return;

    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, x / rect.width));
    vid.currentTime = fraction * vid.duration;
  }, []);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const onTimeUpdate = () => {
      setCurrentTime(vid.currentTime);
    };
    const onDurationChange = () => {
      setDuration(vid.duration);
    };
    const onEnded = () => {
      setState("ready");
    };
    const onCanPlay = () => {
      if (state === "please-wait") {
        setState("play");
      }
    };

    vid.addEventListener("timeupdate", onTimeUpdate);
    vid.addEventListener("durationchange", onDurationChange);
    vid.addEventListener("ended", onEnded);
    vid.addEventListener("canplay", onCanPlay);

    return () => {
      vid.removeEventListener("timeupdate", onTimeUpdate);
      vid.removeEventListener("durationchange", onDurationChange);
      vid.removeEventListener("ended", onEnded);
      vid.removeEventListener("canplay", onCanPlay);
    };
  }, [state]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const timeNow = duration > 0 ? formatTime(currentTime) : "0:00";
  const timeTotal = duration > 0 ? formatTime(duration) : staticDuration;

  return (
    <section className="video">
      <div className={`video-player ${state}`} data-filename={video.filename}>
        <div className="video-screen" onClick={togglePlay}>
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
                  src={`${cdnBase}${video.filename}-${size}p.mp4`}
                  type="video/mp4"
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
        <div className="video-controls">
          <div className="video-controls-left">
            <span
              className="button play"
              onClick={togglePlay}
            >
              {state === "play" ? "Pause" : "Play"}
            </span>
            <span className="time-now">{timeNow}</span>
          </div>
          <div
            className="video-progress"
            ref={progressRef}
            onClick={handleProgress}
          >
            <div
              className="video-progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="video-controls-right">
            <span className="time-total">{timeTotal}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
