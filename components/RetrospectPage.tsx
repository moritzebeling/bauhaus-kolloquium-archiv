/**
 * RetrospectPage — retrospect interview video page.
 * Based on legacy t_retrospect.php snippet.
 */

import type { Page, RetrospectContent, QuoteItem, VideoItem } from "@/lib/types";
import { Markdown } from "./Markdown";
import { Figure } from "./Figure";
import { Quote } from "./Quote";
import { VideoPlayer } from "./VideoPlayer";

interface RetrospectPageProps {
  page: Page<RetrospectContent>;
}

export function RetrospectPage({ page }: RetrospectPageProps) {
  const de = page.de;
  const en = page.en as Partial<RetrospectContent> | undefined;

  // Quotes grouped by their group field
  const quotes = (de.quotes || []) as QuoteItem[];
  const quotesGroup0 = quotes.filter((q) => q.group === "0");
  const quotesGroup1 = quotes.filter((q) => q.group === "1");
  const quotesGroup2 = quotes.filter((q) => q.group === "2");
  const quotesGroupOther = quotes.filter(
    (q) => q.group !== undefined && parseInt(q.group) > 2
  );

  const videos = (de.videosource || []) as VideoItem[];
  const isRetrospect = de.is_retrospect === "1";

  const cdnBase = "https://bhk-video.fra1.cdn.digitaloceanspaces.com/retrospects/";

  return (
    <article
      id={`inter-${page.slug}`}
      className="retrospect add-nav span1"
    >
      <div className="wrapper">
        {/* Title */}
        <div className="title">
          <h4>{de.title}</h4>
          {de.subtitle && <h5 className="subtitle font-normal">{de.subtitle}</h5>}
        </div>

        {/* Quotes group 0 (top) */}
        {quotesGroup0.map((q, i) => (
          <Quote key={`q0-${i}`} item={q} />
        ))}

        {/* Video players */}
        {videos.map((video, i) => (
          <VideoPlayer
            key={i}
            video={video}
            dirPath={page.dirPath}
            images={page.images}
            cdnBase={cdnBase}
          />
        ))}

        {/* Production info */}
        <section className="section-black grid-2col small mono">
          {isRetrospect && (
            <>
              <div>
                <h6>Rückblicke</h6>
                <p>Die internationalen Bauhaus-Kolloquien in Weimar 1976-2016</p>
              </div>
              <div className="en">
                <h6>In Retrospect</h6>
                <p>
                  The international Bauhaus-Colloquia in Weimar 1976-2016
                </p>
              </div>
            </>
          )}

          <div>
            <h6>{de.title}</h6>
            {de.production && <Markdown content={de.production} />}
          </div>
          <div className="en">
            <h6>{de.title}</h6>
            {(en?.production_en || de.production_en) && (
              <Markdown content={(en?.production_en || de.production_en) as string} />
            )}
          </div>

          {isRetrospect && (
            <>
              <div>
                <p>{de.copyright || "Centre for Documentary Architecture"}</p>
              </div>
              <div>
                <p>
                  &copy; {de.copyright_city || "Weimar"},{" "}
                  {de.copyright_year || "2016"}
                </p>
              </div>
            </>
          )}
        </section>

        {/* Quotes group 1 */}
        {quotesGroup1.map((q, i) => (
          <Quote key={`q1-${i}`} item={q} />
        ))}

        {/* Biography (DE) */}
        {de.biography && (
          <section className="box">
            {de.portrait && (
              <Figure
                filename={de.portrait}
                dirPath={page.dirPath}
                images={page.images}
                className="retrospect-portrait"
              />
            )}
            <div>
              <Markdown content={de.biography} />
            </div>
          </section>
        )}

        {/* Biography (EN) */}
        {(en?.biography_en || de.biography_en) && (
          <section className="box en">
            <div>
              <Markdown content={(en?.biography_en || de.biography_en) as string} />
            </div>
          </section>
        )}

        {/* Quotes group 2 */}
        {quotesGroup2.map((q, i) => (
          <Quote key={`q2-${i}`} item={q} />
        ))}

        {/* Quotes group > 2 */}
        {quotesGroupOther.map((q, i) => (
          <Quote key={`qo-${i}`} item={q} />
        ))}
      </div>
    </article>
  );
}
