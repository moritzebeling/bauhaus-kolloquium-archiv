/**
 * Main page — loads all content and renders the entire site.
 *
 * This is a server component that loads content at build time
 * (for static export) and renders all pages in the horizontal
 * scroll layout.
 */

import { loadAllContent } from "@/lib/content";
import { PageRenderer } from "@/components/PageRenderer";
import { Navigation } from "@/components/Navigation";
import { WallBackground } from "@/components/WallBackground";
import type { ColloquiaContent } from "@/lib/types";

/**
 * Build navigation items from page data.
 * Navigation shows: Start, year numbers, and Teilnehmer (participants).
 */
function buildNavItems(
  pages: ReturnType<typeof loadAllContent>["pages"]
): { id: string; label: string; template: string }[] {
  const items: { id: string; label: string; template: string }[] = [];

  for (const page of pages) {
    switch (page.template) {
      case "start":
        items.push({
          id: "start",
          label: "Start",
          template: page.template,
        });
        break;

      case "colloquia": {
        const content = page.de as ColloquiaContent;
        items.push({
          id: `ibhk-${content.edition}`,
          label: content.year || content.title,
          template: page.template,
        });
        break;
      }

      case "participants":
        items.push({
          id: `participants-${page.slug}`,
          label: "Teilnehmer",
          template: page.template,
        });
        break;

      // addon, gallery, credits don't get their own nav entry
      default:
        break;
    }
  }

  return items;
}

export default function Home() {
  const { site, pages } = loadAllContent();
  const navItems = buildNavItems(pages);

  return (
    <>
      <Navigation items={navItems} />
      <main>
        {pages.map((page) => {
          const el = <PageRenderer key={page.slug} page={page} site={site} />;
          // Add empty spacer column after the start page (like legacy)
          if (page.template === "start") {
            return (
              <>
                {el}
                <article key="spacer-start" className="empty" />
              </>
            );
          }
          return el;
        })}
      </main>
      <WallBackground />
    </>
  );
}
