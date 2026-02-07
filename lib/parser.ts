/**
 * Kirby CMS content file parser.
 *
 * Kirby content files (.txt) store fields separated by `----`.
 * Each field starts with `FieldName: value` on the first line,
 * with optional multiline content following.
 * Structured fields (lists) use YAML syntax.
 */

import yaml from "js-yaml";

// ─── Field Separator ─────────────────────────────────────────────

const FIELD_SEPARATOR = /\n----\s*\n/;

// ─── Field Name Normalization ────────────────────────────────────

/**
 * Normalize Kirby field names to consistent snake_case.
 * Kirby treats field names as case-insensitive and
 * dashes/underscores are interchangeable.
 *
 * Examples:
 *   "Date-start" → "date_start"
 *   "Text-en"    → "text_en"
 *   "Is-retrospect" → "is_retrospect"
 */
export function normalizeFieldName(name: string): string {
  return name.toLowerCase().replace(/-/g, "_");
}

// ─── Structured Field Detection ──────────────────────────────────

/**
 * Detect whether a field value contains YAML structured data
 * (i.e., a list of items with key-value pairs).
 *
 * We require that after a `- ` list item, there is at least one
 * indented `key: value` pair. This distinguishes YAML structures
 * from simple markdown lists like `- Item text`.
 */
export function isStructuredField(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  // Must start with a YAML list item AND have indented key-value pairs
  // Pattern: starts with `- ` or `- \n`, followed by `  key: value`
  return /^-\s*\n\s+\w[\w-]*:/m.test(trimmed);
}

// ─── YAML Structured Field Parser ────────────────────────────────

/**
 * Parse a YAML-formatted structured field value into an array of objects.
 * Handles Kirby's YAML-like syntax for structure fields.
 */
export function parseStructuredField(value: string): Record<string, string>[] {
  const trimmed = value.trim();
  if (!trimmed) return [];

  try {
    const parsed = yaml.load(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => {
        if (typeof item === "object" && item !== null) {
          // Convert all values to strings for consistency
          const result: Record<string, string> = {};
          for (const [k, v] of Object.entries(item)) {
            result[normalizeFieldName(k)] =
              v === null || v === undefined ? "" : String(v).trim();
          }
          return result;
        }
        return { value: String(item) };
      });
    }
    return [];
  } catch {
    // If YAML parsing fails, return empty array
    console.warn("Failed to parse structured field:", value.slice(0, 100));
    return [];
  }
}

// ─── Kirbytext Link Parser ───────────────────────────────────────

/**
 * Convert Kirby's custom link syntax to HTML anchor tags.
 *
 * Kirby link format:
 *   (link: URL text: LABEL target: _blank)
 *
 * Converts to:
 *   <a href="URL" target="_blank">LABEL</a>
 */
export function parseKirbyLinks(text: string): string {
  return text.replace(
    /\(link:\s*([^\s)]+)\s+text:\s*([^)]*?)(?:\s+target:\s*([^)]*?))?\)/g,
    (_match, url: string, linkText: string, target?: string) => {
      const href = url.trim();
      const isExternal =
        href.startsWith("http://") || href.startsWith("https://");
      const targetVal = target?.trim() || (isExternal ? "_blank" : "");
      const targetAttr = targetVal ? ` target="${targetVal}"` : "";
      const relAttr = targetVal === "_blank" ? ' rel="noreferrer"' : "";
      return `<a href="${href}"${targetAttr}${relAttr}>${linkText.trim()}</a>`;
    }
  );
}

/**
 * Convert Kirby's `****` horizontal rule syntax to `<hr>`.
 */
export function parseKirbyHr(text: string): string {
  return text.replace(/^\*{4,}$/gm, "<hr>");
}

/**
 * Apply all Kirbytext transformations.
 * This handles Kirby-specific syntax that standard markdown doesn't cover.
 */
export function parseKirbytext(text: string): string {
  let result = text;
  result = parseKirbyLinks(result);
  result = parseKirbyHr(result);
  return result;
}

// ─── Main Parser ─────────────────────────────────────────────────

/**
 * A single parsed field from a Kirby content file.
 */
export interface ParsedField {
  /** Normalized field name (snake_case) */
  name: string;
  /** Original field name as it appears in the file */
  originalName: string;
  /** Raw string value (trimmed) */
  rawValue: string;
}

/**
 * Parse a Kirby content file into a flat record of fields.
 *
 * @param content - Raw file content string
 * @returns Record mapping normalized field names to their string values
 */
export function parseKirbyFile(content: string): Record<string, string> {
  const fields: Record<string, string> = {};

  // Split content by field separator
  const blocks = content.split(FIELD_SEPARATOR);

  for (const block of blocks) {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) continue;

    // Extract field name and value
    // The field name is everything before the first colon on the first line
    const firstLineEnd = trimmedBlock.indexOf("\n");
    const firstLine =
      firstLineEnd === -1 ? trimmedBlock : trimmedBlock.slice(0, firstLineEnd);

    const colonIndex = firstLine.indexOf(":");
    if (colonIndex === -1) continue; // No field name found

    const fieldName = firstLine.slice(0, colonIndex).trim();
    const firstLineValue = firstLine.slice(colonIndex + 1).trim();

    // Rest of the block is the continuation of the value
    const restValue =
      firstLineEnd === -1 ? "" : trimmedBlock.slice(firstLineEnd + 1);

    // Combine first line value with rest
    let value: string;
    if (firstLineValue && restValue.trim()) {
      value = firstLineValue + "\n" + restValue;
    } else if (firstLineValue) {
      value = firstLineValue;
    } else {
      value = restValue;
    }

    const normalizedName = normalizeFieldName(fieldName);
    fields[normalizedName] = value.trim();
  }

  return fields;
}

/**
 * Parse a Kirby content file into typed fields, automatically
 * detecting and parsing structured (YAML) fields.
 *
 * @param content - Raw file content string
 * @param structuredFields - Optional set of field names known to contain structured data
 * @returns Record with string values for simple fields and parsed arrays for structured fields
 */
export function parseKirbyFileTyped(
  content: string,
  structuredFields?: Set<string>
): Record<string, string | Record<string, string>[]> {
  const rawFields = parseKirbyFile(content);
  const result: Record<string, string | Record<string, string>[]> = {};

  for (const [name, value] of Object.entries(rawFields)) {
    if (!value) {
      result[name] = value;
      continue;
    }

    // If template hints are provided, only parse those specific fields as structured.
    // If no hints, fall back to auto-detection.
    const shouldParseAsStructured = structuredFields
      ? structuredFields.has(name)
      : isStructuredField(value);

    if (shouldParseAsStructured) {
      result[name] = parseStructuredField(value);
    } else {
      result[name] = value;
    }
  }

  return result;
}

// ─── Known Structured Fields per Template ────────────────────────

/**
 * Fields known to contain structured (YAML list) data, per template type.
 * This helps with correct parsing when the value might be empty.
 */
export const STRUCTURED_FIELDS: Record<string, Set<string>> = {
  colloquia: new Set(["program", "gallery", "quotes"]),
  addon: new Set(["gallery", "quotes"]),
  retrospect: new Set(["videosource", "quotes"]),
  "video-gallery": new Set([
    "panel1_videos",
    "panel2_videos",
    "panel3_videos",
    "panel4_videos",
  ]),
  publication: new Set(["gallery"]),
  gallery: new Set(["gallery"]),
  participants: new Set(["persons"]),
  start: new Set(["logos"]),
};
