/**
 * Narrative — Tajseer Learning World
 *
 * The HTML overlay that presents chapter content alongside the 3D scene.
 * Each chapter displays the correct Tajseer service content.
 * All content is source-supported from TAJSEER-MASTER-CONTEXT.md.
 */

import { ArrowDown } from "lucide-react";
import { copy } from "./copy";
import { actAt, acts } from "./timeline";
import { useLesson, lessonStore, jumpTo } from "./state";
import { ExperimentControls } from "./ExperimentControls";

export function Narrative() {
  const s = useLesson();
  const t = copy[s.lang];
  const act = actAt(s.progress);
  const index = acts.findIndex((a) => a.id === act);
  const isLast = index === acts.length - 1;

  const nextAct = () =>
    jumpTo(acts[Math.min(index + 1, acts.length - 1)].id);

  return (
    <div className={`narrative act-${act}`}>
      {/* ---- Hero chapter (0) ---- */}
      {act === "hero" && (
        <div className="chapter-heading hero-heading" key="hero">
          <p className="eyebrow" dir={s.lang === "ar" ? "rtl" : "ltr"}>
            {t.hero?.tagline}
          </p>
          <h1 dir={s.lang === "ar" ? "rtl" : "ltr"}>
            {t.hero?.heading[0]}
            <br />
            <em>{t.hero?.heading[1]}</em>
          </h1>
          <p className="chapter-description">{t.hero?.body}</p>
          <button className="primary-action" onClick={() => jumpTo("multimedia")}>
            {t.hero?.cta}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <div className="service-index" dir={s.lang === "ar" ? "rtl" : "ltr"}>
            {t.services?.map((svc, i) => (
              <button
                key={svc.id}
                className={`service-item ${s.station === i ? "active" : ""}`}
                onClick={() => lessonStore.set({ station: i })}
              >
                <span className="service-num" dir="ltr">0{i + 1}</span>
                <span>{svc.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---- Multimedia chapter (1) ---- */}
      {act === "multimedia" && (
        <div className="chapter-heading" key="multimedia">
          <p className="eyebrow">{t.multimedia?.eyebrow}</p>
          <h1>
            {t.multimedia?.heading[0]}<br />
            <em>{t.multimedia?.heading[1]}</em>
          </h1>
          <p className="chapter-description">{t.multimedia?.body}</p>
          <p className="concept-note">{t.multimedia?.note}</p>
        </div>
      )}

      {/* ---- Courses chapter (2) ---- */}
      {act === "courses" && (
        <div className="chapter-heading" key="courses">
          <p className="eyebrow">{t.courses?.eyebrow}</p>
          <h1>
            {t.courses?.heading[0]}<br />
            <em>{t.courses?.heading[1]}</em>
          </h1>
          <p className="chapter-description">{t.courses?.body}</p>
          <p className="concept-note">{t.courses?.note}</p>
        </div>
      )}

      {/* ---- STEM chapter (3) — uses ExperimentControls ---- */}
      {act === "stem" && (
        <div className="chapter-heading" key="stem">
          <p className="eyebrow">{t.stem?.eyebrow}</p>
          <h1>
            {t.stem?.heading[0]}<br />
            <em>{t.stem?.heading[1]}</em>
          </h1>
          <p className="chapter-description">{t.stem?.body}</p>
          <ExperimentControls />
          {s.inspect && (
            <div className="drag-instruction">{t.stem?.drag}</div>
          )}
        </div>
      )}

      {/* ---- AR/VR chapter (4) ---- */}
      {act === "arvr" && (
        <div className="chapter-heading" key="arvr">
          <p className="eyebrow">{t.arvr?.eyebrow}</p>
          <h1>
            {t.arvr?.heading[0]}<br />
            <em>{t.arvr?.heading[1]}</em>
          </h1>
          <p className="chapter-description">{t.arvr?.body}</p>
          {s.progress > 0.72 && s.progress < 0.88 && (
            <p className="chapter-description arvr-peak">{t.arvr?.peak}</p>
          )}
          <p className="concept-note">{t.arvr?.note}</p>
        </div>
      )}

      {/* ---- Guidance chapter (5) ---- */}
      {act === "guidance" && (
        <div className="chapter-heading" key="guidance">
          <p className="eyebrow">{t.guidance?.eyebrow}</p>
          <h1>
            {t.guidance?.heading[0]}<br />
            <em>{t.guidance?.heading[1]}</em>
          </h1>
          <p className="chapter-description">{t.guidance?.body}</p>
          <p className="concept-note">{t.guidance?.note}</p>
        </div>
      )}

      {/* ---- Mission/Vision chapter (6) ---- */}
      {act === "mission" && (
        <div className="chapter-heading" key="mission">
          <p className="eyebrow">{t.mission?.eyebrow}</p>
          <div className="mission-block">
            <h2 className="mission-label">{t.mission?.missionLabel}</h2>
            <p>{t.mission?.missionText}</p>
          </div>
          <div className="mission-block">
            <h2 className="mission-label">{t.mission?.visionLabel}</h2>
            <p>{t.mission?.visionText}</p>
          </div>
        </div>
      )}

      {/* ---- Company chapter (7) ---- */}
      {act === "company" && (
        <div className="chapter-heading" key="company">
          <p className="eyebrow">{t.company?.eyebrow}</p>
          <h1 lang="ar" dir="rtl">{t.company?.profileHeading}</h1>
          <p className="chapter-description">{t.company?.profile}</p>
          <address className="contact-block">
            <span>{t.company?.address}</span>
            <a href={`mailto:${t.company?.email}`}>{t.company?.email}</a>
            {t.company?.phones?.map((ph) => (
              <a key={ph} href={`tel:${ph}`} dir="ltr">{ph}</a>
            ))}
          </address>
          <p className="closing-line">
            <span lang="ar" dir="rtl">{t.company?.closingAr}</span>
          </p>
        </div>
      )}

      {/* ---- Bottom scroll cue (all chapters except last) ---- */}
      <div className="narrative-bottom">
        {!isLast && (
          <button className="scroll-cue" onClick={nextAct}>
            {t.hero?.scroll || "SCROLL"}
            <ArrowDown size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
