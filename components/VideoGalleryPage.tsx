/**
 * VideoGalleryPage — page showing conference video panels.
 * Based on legacy t_video-gallery.php snippet.
 */

import type { Page, VideoGalleryContent, VideoItem } from "@/lib/types";
import { Markdown } from "./Markdown";
import { VideoPlayer } from "./VideoPlayer";

interface VideoGalleryPageProps {
  page: Page<VideoGalleryContent>;
}

export function VideoGalleryPage({ page }: VideoGalleryPageProps) {
  const de = page.de;
  const en = page.en as Partial<VideoGalleryContent> | undefined;

  const cdnBase = "https://bhk-video.fra1.cdn.digitaloceanspaces.com/2019/";

  const panels = [
    { title: de.panel1_title, videos: de.panel1_videos },
    { title: de.panel2_title, videos: de.panel2_videos },
    { title: de.panel3_title, videos: de.panel3_videos },
    { title: de.panel4_title, videos: de.panel4_videos },
  ];

  return (
    <article id={`videos-${page.slug}`} className="span2 video-gallery">
      <div className="wrapper">
        <header>
          <h3>{de.title}</h3>
        </header>

        {panels.map((panel, panelIdx) => {
          if (!panel.title && (!panel.videos || panel.videos.length === 0))
            return null;

          const videos = (panel.videos || []) as VideoItem[];

          return (
            <div key={panelIdx} className="sektion">
              <header>
                <h4>
                  Panel {panelIdx + 1}
                  <br />
                  <span className="regular">{panel.title}</span>
                </h4>
              </header>

              {videos.map((video, videoIdx) => (
                <VideoPlayer
                  key={videoIdx}
                  video={video}
                  dirPath={page.dirPath}
                  images={page.images}
                  cdnBase={cdnBase}
                />
              ))}

              {/* Production info (shown after each panel) */}
              <section className="black grid-2col small mono">
                <div>
                  {de.production && <Markdown content={de.production} />}
                </div>
                <div className="en">
                  {(en?.production_en || de.production_en) && (
                    <Markdown
                      content={(en?.production_en || de.production_en) as string}
                    />
                  )}
                </div>
                <div>
                  <p>{de.copyright || "Centre for Documentary Architecture"}</p>
                </div>
                <div>
                  <p>
                    &copy; {de.copyright_city || "Weimar"},{" "}
                    {de.copyright_year || "2019"}
                  </p>
                </div>
              </section>
            </div>
          );
        })}
      </div>
    </article>
  );
}
