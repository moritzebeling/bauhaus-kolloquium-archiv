/**
 * Type definitions for all content models.
 * Based on Kirby CMS blueprints in __legacy/site/blueprints/
 */

// ─── Structured Field Item Types ─────────────────────────────────

export interface GalleryItem {
  image: string;
  group?: string;
  position?: string;
  column?: "left" | "right";
}

export interface ProgramItem {
  image: string;
  group?: string;
  position?: string;
  column?: "left" | "right";
}

export interface QuoteItem {
  blockquote: string;
  source: string;
  blockquote_en?: string;
  source_en?: string;
  position?: string;
  column?: "left" | "right";
  group?: string;
}

export interface VideoItem {
  title: string;
  thumbnail: string;
  filename: string;
  sizes: string;
  duration_min: string;
  duration_sec: string;
}

export interface LogoItem {
  image: string;
  position?: string;
}

export interface PersonItem {
  name: string;
  country?: string;
  [year: string]: string | undefined;
}

export interface ImageMeta {
  caption?: string;
  copyright?: string;
  archiveid?: string;
  alt?: string;
}

// ─── Page Content Types ──────────────────────────────────────────

export interface SiteContent {
  title: string;
  description?: string;
  author?: string;
  copyright?: string;
  imprint_url?: string;
}

export interface StartContent {
  title: string;
  title_en?: string;
  subtitle?: string;
  subtitle_en?: string;
  text?: string;
  text_en?: string;
  credits_title?: string;
  credits?: string;
  literature_title?: string;
  literature?: string;
  logos?: LogoItem[];
}

export interface ColloquiaContent {
  year: string;
  title: string;
  name: string;
  edition: string;
  date_start?: string;
  date_end?: string;
  website?: string;
  poster?: string;
  album?: string;
  album_cover?: string;
  text_intro?: string;
  text_intro_en?: string;
  text?: string;
  text_en?: string;
  program?: ProgramItem[];
  gallery?: GalleryItem[];
  quotes?: QuoteItem[];
}

export interface AddonContent {
  title: string;
  text?: string;
  text_en?: string;
  text_intro?: string;
  text_intro_en?: string;
  gallery?: GalleryItem[];
  quotes?: QuoteItem[];
}

export interface RetrospectContent {
  title: string;
  subtitle?: string;
  is_retrospect?: string;
  production?: string;
  production_en?: string;
  copyright?: string;
  copyright_url?: string;
  copyright_city?: string;
  copyright_year?: string;
  videosource?: VideoItem[];
  portrait?: string;
  biography?: string;
  biography_en?: string;
  quotes?: QuoteItem[];
}

export interface VideoGalleryContent {
  title: string;
  panel1_title?: string;
  panel1_videos?: VideoItem[];
  panel2_title?: string;
  panel2_videos?: VideoItem[];
  panel3_title?: string;
  panel3_videos?: VideoItem[];
  panel4_title?: string;
  panel4_videos?: VideoItem[];
  production?: string;
  production_en?: string;
  copyright?: string;
  copyright_url?: string;
  copyright_city?: string;
  copyright_year?: string;
}

export interface PublicationContent {
  title: string;
  website?: string;
  gallery?: GalleryItem[];
  text?: string;
  text_en?: string;
  info?: string;
}

export interface GalleryPageContent {
  title: string;
  gallery?: GalleryItem[];
}

export interface ParticipantsContent {
  title: string;
  persons?: PersonItem[];
}

export interface CreditsContent {
  title: string;
  credits?: string;
  literature?: string;
}

// ─── Page Types ──────────────────────────────────────────────────

export type PageTemplate =
  | "start"
  | "colloquia"
  | "addon"
  | "retrospect"
  | "video-gallery"
  | "publication"
  | "gallery"
  | "participants"
  | "credits"
  | "default";

export type PageContent =
  | StartContent
  | ColloquiaContent
  | AddonContent
  | RetrospectContent
  | VideoGalleryContent
  | PublicationContent
  | GalleryPageContent
  | ParticipantsContent
  | CreditsContent;

export interface Page<T extends PageContent = PageContent> {
  /** Directory name, e.g. "4-1979" */
  slug: string;
  /** Sort order number extracted from directory prefix */
  sortOrder: number;
  /** Template name derived from content filename, e.g. "colloquia" */
  template: PageTemplate;
  /** German content (always present) */
  de: T;
  /** English content (may be partial or absent) */
  en?: Partial<T>;
  /** Image metadata keyed by filename */
  images: Record<string, ImageMeta>;
  /** Directory path relative to content root */
  dirPath: string;
}

export interface SiteData {
  site: {
    de: SiteContent;
    en?: Partial<SiteContent>;
  };
  pages: Page[];
}
