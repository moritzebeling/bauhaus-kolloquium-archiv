/**
 * ProgramSection — displays a program image (bordered).
 * Based on legacy b_program.php snippet.
 */

import type { ImageMeta, ProgramItem } from "@/lib/types";
import { Figure } from "./Figure";

interface ProgramSectionProps {
  item: ProgramItem;
  dirPath: string;
  images: Record<string, ImageMeta>;
  fallbackTitle?: string;
}

export function ProgramSection({
  item,
  dirPath,
  images,
  fallbackTitle,
}: ProgramSectionProps) {
  return (
    <section className="program">
      <Figure
        filename={item.image}
        dirPath={dirPath}
        images={images}
        fallbackTitle={fallbackTitle}
      />
    </section>
  );
}
