import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";

const __dirname = dirname(fileURLToPath(import.meta.url));

const YEARS = [
  "1976",
  "1979",
  "1983",
  "1986",
  "1989",
  "1992",
  "1996",
  "1999",
  "2003",
  "2007",
  "2009",
  "2013",
] as const;

interface Participant {
  country: string;
  name: string;
  years: Set<string>;
}

const htmlPath = join(__dirname, "participants.html");
const csvPath = join(__dirname, "participants.csv");

const html = readFileSync(htmlPath, "utf-8");
const $ = cheerio.load(html);

const participants: Participant[] = [];

$("#participants-table tbody tr").each((_i, row) => {
  const $row = $(row);

  // Skip the "Anzahl Besucher" summary row
  if ($row.hasClass("num")) return;

  // Skip country header rows (they use <th> for the name, not <td>)
  const nameTd = $row.find("td.n");
  if (nameTd.length === 0) return;

  const country = $row.find("td.c").text().trim();
  const name = nameTd.text().trim();

  // Skip rows with empty country (these are subheader rows)
  if (!country || !name) return;

  // Collect all years this participant attended
  const years = new Set<string>();
  $row.find("td.y").each((_j, cell) => {
    const year = $(cell).text().trim();
    if (year) years.add(year);
  });

  participants.push({ country, name, years });
});

// Build CSV
const header = ["country", "name", ...YEARS].join(",");

const rows = participants.map((p) => {
  const yearCols = YEARS.map((y) => (p.years.has(y) ? "1" : ""));
  return [csvEscape(p.country), csvEscape(p.name), ...yearCols].join(",");
});

const csv = [header, ...rows].join("\n") + "\n";

writeFileSync(csvPath, csv, "utf-8");

console.log(`Wrote ${participants.length} participants to ${csvPath}`);

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
