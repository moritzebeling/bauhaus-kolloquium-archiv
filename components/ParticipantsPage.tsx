/**
 * ParticipantsPage — displays the participants table.
 * Based on legacy t_participants.php snippet.
 *
 * Note: The legacy site loads a pre-generated HTML table.
 * For now, we show a placeholder. The full table can be
 * implemented later from the participants data.
 */

import type { Page, ParticipantsContent } from "@/lib/types";

interface ParticipantsPageProps {
  page: Page<ParticipantsContent>;
}

export function ParticipantsPage({ page }: ParticipantsPageProps) {
  const de = page.de;

  return (
    <article className="participants span2 add-nav">
      <div className="wrapper">
        <header>
          <h3>{de.title}</h3>
        </header>
        <section>
          <p className="mono small opacity-60">
            Teilnehmer-Tabelle — wird bald hinzugefügt.
          </p>
        </section>
      </div>
    </article>
  );
}
