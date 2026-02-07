/**
 * WallBackground — parallax background image of the Bauhaus wall.
 * Based on legacy wall object in action.js.
 *
 * The wall image scrolls at a slower rate than the content,
 * creating a parallax effect.
 */

"use client";

import { useEffect, useRef } from "react";

export function WallBackground() {
  const wallRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const wall = wallRef.current;
    const main = document.querySelector("main");
    if (!wall || !main) return;

    let rafId: number;
    let lastOffset = -1;

    const updateWall = () => {
      const wallWidth = wall.offsetWidth;
      const viewportWidth = window.innerWidth;
      const scrollLeft = main.scrollLeft;
      const maxScroll = main.scrollWidth - viewportWidth;
      const wallMaxOffset = wallWidth - viewportWidth;

      if (maxScroll <= 0 || wallMaxOffset <= 0) {
        wall.style.left = "0px";
        return;
      }

      const progress = scrollLeft / maxScroll;
      const offset = Math.round(Math.max(0, Math.min(progress * wallMaxOffset, wallMaxOffset)));

      if (offset !== lastOffset) {
        lastOffset = offset;
        wall.style.left = `-${offset}px`;
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateWall);
    };

    main.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateWall);
    updateWall();

    return () => {
      main.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateWall);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div id="wall-container">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={wallRef}
        id="wall"
        src="/images/wall.svg"
        alt=""
      />
    </div>
  );
}
