# Agent Guidelines

## Project overview

Archive website for the Internationales Bauhaus-Kolloquium (1976–2019). Single-page horizontal scroll layout, bilingual (DE/EN side by side), deployed on Vercel. See README.md for full details.

## Tech stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS 4, React 19
- Content from Kirby CMS flat-file export (`content/` directory)
- Images/PDFs hosted on Vercel Blob Storage (not in repo on production)
- npm as package manager (not yarn/pnpm)

## Architecture

- **Single page app**: `app/page.tsx` loads all content at build time via `lib/content.ts` and renders everything horizontally using `PageRenderer`
- **No routing**: there are no subpages, everything is one page with horizontal scroll
- **Server components**: all rendering is server-side / static, no client-side data fetching
- **Content is read-only at build time**: the `content/` directory is read by `lib/content.ts` and parsed by `lib/parser.ts` into typed `Page` objects
- **Templates**: each page type has a template component in `components/` (e.g. `ColloquiaPage.tsx`, `StartPage.tsx`, `GalleryPage.tsx`, `ParticipantsPage.tsx`)

## Key files

- `app/page.tsx` — entry point, loads content, builds nav, renders all pages
- `lib/content.ts` — content loader, scans `content/` directory
- `lib/parser.ts` — Kirby `.txt` file parser (key/value with `----` separators, structured fields as YAML)
- `lib/types.ts` — TypeScript types for all page templates and content models
- `components/PageRenderer.tsx` — dispatches pages to their template component
- `components/Navigation.tsx` — top navigation bar

## Content format

Content lives in `content/` as Kirby CMS flat-file format:
- Folders are prefixed with sort order: `2-1976/`, `8-1983/`, etc.
- Each folder has a `.txt` file named after its template: `colloquia.txt`, `start.txt`, `retrospect.txt`
- Fields are separated by `----` lines, format is `Key: Value`
- Image metadata files: `photo.jpg.txt` (caption, copyright, alt)
- Bilingual content uses suffixed fields: `text` (DE) and `text_en` (EN)
- Structured fields (gallery, program, quotes, videos) are YAML arrays within the `.txt` files

## Scripts to know about

- `npm run image-dimensions` — regenerate `content/image-dimensions.json` after adding/replacing images
- `npm run file-sizes` — regenerate `content/file-sizes.json` after adding/replacing PDFs
- `npm run upload-images` — upload images/PDFs to Vercel Blob (needs `BLOB_READ_WRITE_TOKEN` in `.env.local`)
- `npm run parse-participants-table` — parse `content/37-participants/list.html` → `public/participants.csv`

## Code conventions

- Use TypeScript strict mode
- Components are in `components/`, one file per component
- Utility/library code in `lib/`
- Scripts in `scripts/`, run via `npx tsx`
- Tailwind for styling (utility classes, no CSS modules)
- No client components unless absolutely necessary (`"use client"` directive)
- Tests live alongside source files: `lib/*.test.ts`, run with `npm run test`

## Things to watch out for

- Images are NOT on disk in production (Vercel Blob). `content/image-dimensions.json` and `content/file-sizes.json` are pre-generated and committed so build can access dimensions/sizes without the actual files.
- The `.vercelignore` excludes `public/content` from deployment.
- `NEXT_PUBLIC_BLOB_URL` env var controls image URL prefix. When unset, images are served locally from `content/`.
- The participants table is rendered from `public/participants.csv`, not from the Kirby content system. The CSV is generated from `content/37-participants/list.html` via the parse script.
