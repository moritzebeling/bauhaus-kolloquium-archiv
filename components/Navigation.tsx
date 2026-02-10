/**
 * Navigation — fixed top navigation bar with chapter links.
 * Based on legacy p_header.php snippet and action.js navigation.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface NavItem {
  id: string;
  label: string;
  template: string;
}

interface NavigationProps {
  items: NavItem[];
}

export function Navigation({ items }: NavigationProps) {
  const indexRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string>("");

  // Scroll to a chapter when clicking a nav link
  const goToChapter = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start", inline: "start" });
      // For horizontal scroll, we need to scroll the main container
      const main = document.querySelector("main");
      if (main) {
        const rect = el.getBoundingClientRect();
        const mainRect = main.getBoundingClientRect();
        main.scrollTo({
          left: main.scrollLeft + rect.left - mainRect.left,
          behavior: "smooth",
        });
      }
    }
    setActiveId(id);
  }, []);

  // Navigate to previous/next chapter
  const navigateChapter = useCallback(
    (direction: "prev" | "next") => {
      const currentIndex = items.findIndex((item) => item.id === activeId);
      const nextIndex =
        direction === "next"
          ? Math.min(currentIndex + 1, items.length - 1)
          : Math.max(currentIndex - 1, 0);
      const nextItem = items[nextIndex];
      if (nextItem) {
        const el = document.getElementById(nextItem.id);
        if (el) {
          const main = document.querySelector("main");
          if (main) {
            const rect = el.getBoundingClientRect();
            const mainRect = main.getBoundingClientRect();
            main.scrollTo({
              left: main.scrollLeft + rect.left - mainRect.left,
              behavior: "smooth",
            });
          }
        }
        setActiveId(nextItem.id);
      }
    },
    [activeId, items]
  );

  // Track active chapter based on scroll position
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;

    const handleScroll = () => {
      const mainRect = main.getBoundingClientRect();
      const centerX = mainRect.width / 2;

      let closestId = "";
      let closestDist = Infinity;

      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const dist = Math.abs(rect.left + rect.width / 2 - centerX);
          if (dist < closestDist) {
            closestDist = dist;
            closestId = item.id;
          }
        }
      }

      if (closestId) {
        setActiveId(closestId);
      }
    };

    main.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => main.removeEventListener("scroll", handleScroll);
  }, [items]);

  // Sync nav scroll to keep active item visible
  useEffect(() => {
    if (!indexRef.current || !activeId) return;
    const activeLink = indexRef.current.querySelector(`[data-id="${activeId}"]`);
    if (activeLink) {
      const linkEl = activeLink as HTMLElement;
      const container = indexRef.current;
      const linkLeft = linkEl.offsetLeft;
      const linkWidth = linkEl.offsetWidth;
      const containerWidth = container.offsetWidth;
      const scrollLeft = container.scrollLeft;

      if (
        linkLeft < scrollLeft + 100 ||
        linkLeft + linkWidth > scrollLeft + containerWidth - 100
      ) {
        container.scrollTo({
          left: linkLeft - containerWidth / 2 + linkWidth / 2,
          behavior: "smooth",
        });
      }
    }
  }, [activeId]);

  // Prefetch participants data when hovering the nav link
  const handleMouseEnter = useCallback((item: NavItem) => {
    if (item.template === "participants") {
      window.dispatchEvent(new CustomEvent("prefetch-participants"));
    }
  }, []);

  return (
    <nav>
      <button
        className="arrow prev"
        onClick={() => navigateChapter("prev")}
        aria-label="Previous chapter"
      />
      <div className="index" ref={indexRef}>
        {items.map((item) => (
          <a
            key={item.id}
            data-id={item.id}
            href={`#${item.id}`}
            className={activeId === item.id ? "active" : ""}
            onClick={(e) => goToChapter(e, item.id)}
            onMouseEnter={() => handleMouseEnter(item)}
          >
            {item.label}
          </a>
        ))}
      </div>
      <button
        className="arrow next"
        onClick={() => navigateChapter("next")}
        aria-label="Next chapter"
      />
    </nav>
  );
}
