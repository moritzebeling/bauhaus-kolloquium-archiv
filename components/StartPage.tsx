/**
 * StartPage — the intro/start page of the site.
 * Based on legacy t_start.php snippet.
 */

import type { Page, StartContent, SiteContent } from "@/lib/types";
import { Markdown } from "./Markdown";
import { getImageUrl } from "@/lib/utils";
import { ButtonLink } from "./ButtonLink";

interface StartPageProps {
  page: Page<StartContent>;
  site: { de: SiteContent; en?: Partial<SiteContent> };
}

export function StartPage({ page, site }: StartPageProps) {
  const de = page.de;

  return (
    <article id="start" className="span2 add-nav">
      <div className="wrapper start">
        <section>
          <header className="balance-text">
            <h1>{de.title}</h1>
            {de.subtitle && <h3 className="regular">{de.subtitle}</h3>}
          </header>

          {/* German text (single column, matching legacy) */}
          {de.text && (
            <div className="large">
              <Markdown content={de.text} />
            </div>
          )}

          {/* "Impressionen" button */}
          <ButtonLink
            href="#32-2016-exhibition"
            wrapperClassName="center"
            linkClassName="button"
          >
            Impressionen der Ausstellung
          </ButtonLink>
        </section>
      </div>

      {/* Credits section */}
      <div id="credits" className="wrapper credits">
        <section className="grid-2col">
          <div>
            {de.credits_title && (
              <header>
                <h3>{de.credits_title}</h3>
              </header>
            )}
            {de.credits && (
              <section className="credits small mono">
                <Markdown content={de.credits} />
              </section>
            )}

            {/* Logos */}
            {de.logos && de.logos.length > 0 && (
              <section className="logos">
                {de.logos.map((logo, i) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={i}
                    alt=""
                    height="32"
                    src={getImageUrl(page.dirPath, logo.image)}
                  />
                ))}
              </section>
            )}
          </div>

          <div>
            {de.literature_title && (
              <header>
                <h3>{de.literature_title}</h3>
              </header>
            )}
            {de.literature && (
              <section className="literature small mono">
                <Markdown content={de.literature} />
              </section>
            )}
          </div>
        </section>
      </div>

      <footer>
        &copy; Weimar 2018/2019
        {site.de.imprint_url && (
          <a target="_blank" href={site.de.imprint_url} rel="noreferrer">
            Impressum
          </a>
        )}
      </footer>
    </article>
  );
}
