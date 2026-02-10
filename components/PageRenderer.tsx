/**
 * PageRenderer — renders a page based on its template type.
 * Dispatches to the appropriate page component.
 */

import type {
  Page,
  PageContent,
  StartContent,
  ColloquiaContent,
  AddonContent,
  RetrospectContent,
  VideoGalleryContent,
  PublicationContent,
  GalleryPageContent,
  ParticipantsContent,
  SiteContent,
} from "@/lib/types";

import { StartPage } from "./StartPage";
import { ColloquiaPage } from "./ColloquiaPage";
import { AddonPage } from "./AddonPage";
import { RetrospectPage } from "./RetrospectPage";
import { VideoGalleryPage } from "./VideoGalleryPage";
import { PublicationPage } from "./PublicationPage";
import { GalleryPage } from "./GalleryPage";
import { ParticipantsPage } from "./ParticipantsPage";

interface PageRendererProps {
  page: Page<PageContent>;
  site: { de: SiteContent; en?: Partial<SiteContent> };
}

export function PageRenderer({ page, site }: PageRendererProps) {
  switch (page.template) {
    case "start":
      return (
        <StartPage
          page={page as Page<StartContent>}
          site={site}
        />
      );
    case "colloquia":
      return <ColloquiaPage page={page as Page<ColloquiaContent>} />;
    case "addon":
      return <AddonPage page={page as Page<AddonContent>} />;
    case "retrospect":
      return <RetrospectPage page={page as Page<RetrospectContent>} />;
    case "video-gallery":
      return <VideoGalleryPage page={page as Page<VideoGalleryContent>} />;
    case "publication":
      return <PublicationPage page={page as Page<PublicationContent>} />;
    case "gallery":
      return <GalleryPage page={page as Page<GalleryPageContent>} />;
    case "participants":
      return <ParticipantsPage page={page as Page<ParticipantsContent>} />;
    default:
      return null;
  }
}
