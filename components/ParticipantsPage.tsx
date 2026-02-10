/**
 * ParticipantsPage — displays the participants table.
 *
 * Loads the CSV data lazily (on button click or via IntersectionObserver)
 * and renders a sortable, grouped table of ~1064 participants.
 */

"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  Fragment,
} from "react";
import type { Page, ParticipantsContent } from "@/lib/types";

// ─── Types ──────────────────────────────────────────────────────

interface Participant {
  country: string;
  name: string;
  /** One boolean per year column (true = attended) */
  attended: boolean[];
}

interface ParticipantsData {
  years: number[];
  participants: Participant[];
}

type SortMode = "country" | "name";

const EMPTY_YEARS: number[] = [];

interface Group {
  label: string;
  participants: Participant[];
}

// ─── CSV Parser ─────────────────────────────────────────────────

/**
 * Parse a single CSV line, handling quoted fields (e.g. "Surname, First").
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped double-quote
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current); // last field
  return result;
}

/**
 * Parse the full CSV text into structured data.
 */
function parseCSV(text: string): ParticipantsData {
  const lines = text.trim().split("\n");
  const header = parseCSVLine(lines[0]);
  const years = header.slice(2).map(Number);

  const participants: Participant[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const fields = parseCSVLine(line);
    participants.push({
      country: fields[0],
      name: fields[1],
      attended: years.map((_, j) => fields[j + 2] === "1"),
    });
  }

  return { years, participants };
}

// ─── Grouping & Sorting ────────────────────────────────────────

/**
 * Extract the base country for grouping purposes.
 * E.g. "BRD/D (NL)" → "BRD", "DDR?" → "DDR", "USA (GB)" → "USA"
 */
function countryGroupKey(country: string): string {
  return country.split(/[\/\?\(]/)[0].trim();
}

function groupByCountry(participants: Participant[]): Group[] {
  const map = new Map<string, Participant[]>();
  for (const p of participants) {
    const key = countryGroupKey(p.country);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }
  return Array.from(map.entries())
    .toSorted(([a], [b]) => a.localeCompare(b, "de"))
    .map(([label, items]) => ({
      label,
      participants: items.toSorted((a, b) => a.name.localeCompare(b.name, "de")),
    }));
}

function groupByInitial(participants: Participant[]): Group[] {
  const sorted = participants.toSorted((a, b) =>
    a.name.localeCompare(b.name, "de")
  );
  const map = new Map<string, Participant[]>();
  for (const p of sorted) {
    const initial = p.name.charAt(0).toUpperCase();
    if (!map.has(initial)) map.set(initial, []);
    map.get(initial)!.push(p);
  }
  return Array.from(map.entries()).map(([label, items]) => ({
    label,
    participants: items,
  }));
}

// ─── Component ──────────────────────────────────────────────────

interface ParticipantsPageProps {
  page: Page<ParticipantsContent>;
}

export function ParticipantsPage({ page }: ParticipantsPageProps) {
  const [data, setData] = useState<ParticipantsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("country");
  const articleRef = useRef<HTMLElement>(null);
  const loadTriggered = useRef(false);

  const csvUrl = `/participants.csv`;

  const loadData = useCallback(async () => {
    if (loadTriggered.current) return;
    loadTriggered.current = true;
    setLoading(true);
    try {
      const res = await fetch(csvUrl);
      const text = await res.text();
      setData(parseCSV(text));
    } catch (e) {
      console.error("Failed to load participants data", e);
    } finally {
      setLoading(false);
    }
  }, [csvUrl]);

  // Auto-load when section is within 1000px of viewport
  useEffect(() => {
    const el = articleRef.current;
    if (!el || loadTriggered.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadData();
          observer.disconnect();
        }
      },
      { rootMargin: "1000px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadData]);

  // Prefetch when user hovers the nav link (fires custom event)
  useEffect(() => {
    const handlePrefetch = () => loadData();
    window.addEventListener("prefetch-participants", handlePrefetch);
    return () =>
      window.removeEventListener("prefetch-participants", handlePrefetch);
  }, [loadData]);

  const years = data?.years ?? EMPTY_YEARS;

  // Compute totals per year from the data
  const yearTotals = useMemo(
    () =>
      years.map(
        (_, i) => data?.participants.filter((p) => p.attended[i]).length ?? 0
      ),
    [data, years]
  );

  // Group participants by current sort mode
  const groups = useMemo(
    () =>
      data
        ? sortMode === "country"
          ? groupByCountry(data.participants)
          : groupByInitial(data.participants)
        : [],
    [data, sortMode]
  );

  return (
    <article
      id={`participants-${page.slug}`}
      className="participants span2 add-nav"
      ref={articleRef}
    >
      <div className="wrapper">
        <header>
          <h3>Teilnehmer 1976–2013</h3>
        </header>
        <section>
          {!data && !loading && (
            <button onClick={loadData} className="load-participants">
              Teilnehmer anzeigen
            </button>
          )}
          {loading && <p className="mono small opacity-60">Laden…</p>}
          {data && (
            <ParticipantsTable
              years={years}
              yearTotals={yearTotals}
              groups={groups}
              sortMode={sortMode}
              onSort={setSortMode}
            />
          )}
        </section>
      </div>
    </article>
  );
}

// ─── Table Sub-Component ────────────────────────────────────────

function ParticipantsTable({
  years,
  yearTotals,
  groups,
  sortMode,
  onSort,
}: {
  years: number[];
  yearTotals: number[];
  groups: Group[];
  sortMode: SortMode;
  onSort: (mode: SortMode) => void;
}) {
  return (
    <table className="participants-table" id="participants-table">
      <thead>
        <tr>
          <th className="c">
            <button
              className={sortMode === "country" ? "active" : ""}
              onClick={() => onSort("country")}
            >
              Land
            </button>
          </th>
          <th className="n">
            <button
              className={sortMode === "name" ? "active" : ""}
              onClick={() => onSort("name")}
            >
              Name
            </button>
          </th>
          {years.map((y) => (
            <th key={y} className="r">
              <span>{y}</span>
            </th>
          ))}
        </tr>
      </thead>

      <tfoot>
        <tr>
          <th className="c">Land</th>
          <th className="n">Name</th>
          {years.map((y) => (
            <th key={y} className="r">
              <span>{y}</span>
            </th>
          ))}
        </tr>
      </tfoot>

      <tbody>
        {/* Visitor count per year */}
        <tr className="num">
          <th className="n" colSpan={2}>
            Anzahl Besucher
          </th>
          {yearTotals.map((count, i) => (
            <th key={years[i]} className="r">
              <span>{count}</span>
            </th>
          ))}
        </tr>
        {/* Grouped participant rows */}
        {groups.map((group) => (
          <Fragment key={group.label}>
            <tr className="group-sep">
              <td colSpan={years.length + 2} />
            </tr>
            <tr className="group-header">
              <td className="c" />
              <th className="n" colSpan={years.length + 1}>
                {group.label}
              </th>
            </tr>
            {group.participants.map((p, i) => (
              <tr key={i}>
                <td className="c">{p.country}</td>
                <td className="n">{p.name}</td>
                {p.attended.map((a, j) => (
                  <td key={years[j]} className={a ? "y" : ""} />
                ))}
              </tr>
            ))}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}
