# Bauhaus-Kolloquium Archiv

Archive website for the **Internationales Bauhaus-Kolloquium** — a series of conferences held at the Bauhaus-Universität Weimar from 1976 to 2019. The site presents all editions side by side in a horizontal scroll layout, bilingual (German/English), with conference programs, image galleries, interview videos, publications, and a participants table.

Live: deployed on Vercel

## Tech Stack

- **Next.js 16** (App Router, server components, static rendering)
- **TypeScript**
- **Tailwind CSS 4**
- **Vercel Blob Storage** for images and PDFs (not served from the repo)
- Content originates from a **Kirby CMS** export (plain `.txt` files in `content/`)

## Project Structure

```
app/              → Next.js app (single page: layout + page)
components/       → React components (one per page template + shared UI)
content/          → All content as Kirby-style .txt files + image metadata
  1-start/        → Intro page
  2-1976/         → Colloquium editions (year by year)
  37-participants/ → Participants table (source HTML)
  credits/        → Credits page
lib/              → Content loading, parsing, types, utilities
  content.ts      → Loads content/ directory into typed page objects
  parser.ts       → Kirby .txt file parser
  types.ts        → TypeScript types for all page templates
scripts/          → One-off helper scripts (see below)
public/           → Static assets (fonts, favicons, participants.csv)
```

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000. The page auto-reloads on changes.

### Image hosting (Vercel Blob)

Images and PDFs live in `content/` locally but are **not deployed to Vercel** (see `.vercelignore`). Instead they are served from Vercel Blob Storage.

To set up image hosting:

1. Create a Blob store in Vercel Dashboard → Storage → Create → Blob
2. Link the project: `vercel link`
3. Pull env vars: `vercel env pull .env.local` (this gives you `BLOB_READ_WRITE_TOKEN`)
4. Upload all images: `npm run upload-images`
5. The script saves `NEXT_PUBLIC_BLOB_URL` to `.env.local` and tells you how to set it on Vercel

In local development, if `NEXT_PUBLIC_BLOB_URL` is not set, images are served from the local filesystem (`content/` directory).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript check (no emit) |
| `npm run test` | Run tests (`lib/*.test.ts`) |
| `npm run upload-images` | Upload all images/PDFs from `content/` to Vercel Blob |
| `npm run image-dimensions` | Generate `content/image-dimensions.json` (width/height for all images, needed at build time since images aren't on disk on Vercel) |
| `npm run file-sizes` | Generate `content/file-sizes.json` (byte sizes for PDFs, displayed as download sizes on the site) |
| `npm run parse-participants-table` | Parse `content/37-participants/list.html` into `public/participants.csv` |

### When to run which script

- **Added or replaced images?** → `npm run image-dimensions` then `npm run upload-images`
- **Added or replaced PDFs?** → `npm run file-sizes` then `npm run upload-images`
- **Changed the participants HTML table?** → `npm run parse-participants-table`

The generated JSON files (`content/image-dimensions.json`, `content/file-sizes.json`) and `public/participants.csv` are committed to the repo.

## Content

All content lives in `content/` as Kirby CMS flat-file format. Each subfolder is a page, prefixed with a sort number (e.g. `2-1976/`). Inside each folder:

- `colloquia.txt`, `start.txt`, etc. — the content file (template name = filename)
- `photo.jpg.txt` — image metadata (caption, copyright, alt text)
- Actual image files (`.jpg`, `.png`, `.svg`) — only used locally, hosted in Blob for production

The content loader (`lib/content.ts`) reads these at build time and produces typed page objects.

## How the Site Works

The entire site is a **single page** rendered as a horizontal scroll. The main `app/page.tsx` loads all content, builds a navigation bar, and renders every page template side by side using `PageRenderer`. Each template (`ColloquiaPage`, `StartPage`, `GalleryPage`, etc.) is a component in `components/`.

The layout flows left to right: Start → Colloquia editions (with interleaved interview videos and retrospects) → Publications → Participants → Credits.
