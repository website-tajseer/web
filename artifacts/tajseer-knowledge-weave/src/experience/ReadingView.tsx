/**
 * ReadingView — Tajseer Learning World
 *
 * Accessible no-WebGL fallback. Presents real Tajseer service content
 * as a clean reading experience. Same bilingual content as the spatial world.
 */

import { copy } from "./copy";
import { useLesson, lessonStore } from "./state";

export function ReadingView() {
  const s = useLesson();
  const t = copy[s.lang];

  return (
    <div className="reading-diagram" aria-label={t.fallback} lang={s.lang} dir={s.lang === "ar" ? "rtl" : "ltr"}>
      <header className="reading-header">
        <img
          src={`${import.meta.env.BASE_URL}assets/tajseer/${s.lang === "ar" ? "arabic-logo.png" : "TajsserLogo.bc8c31e3b431f4abdefcf79540d093dc.svg"}`}
          alt={s.lang === "ar" ? "تجسير" : "Tajseer"}
          className="reading-logo"
        />
        <div className="reading-lang-toggle">
          <button onClick={() => lessonStore.set({ lang: s.lang === "ar" ? "en" : "ar" })}>
            {s.lang === "ar" ? "EN" : "العربية"}
          </button>
        </div>
      </header>

      <main className="reading-content">
        <div className="reading-intro">
          <p className="eyebrow">{t.hero?.tagline}</p>
          <h1>{t.hero?.heading[0]} {t.hero?.heading[1]}</h1>
          <p>{t.hero?.body}</p>
        </div>

        <hr />

        <section className="reading-services">
          <h2>{s.lang === "ar" ? "خدماتنا" : "Our Services"}</h2>

          {[
            { key: "multimedia", num: "01" },
            { key: "courses", num: "02" },
            { key: "stem", num: "03" },
            { key: "arvr", num: "04" },
            { key: "guidance", num: "05" },
          ].map(({ key, num }) => {
            const svc = (t as any)[key];
            if (!svc) return null;
            return (
              <article key={key} className="reading-service">
                <h3>
                  <span className="reading-num">{num}</span>
                  {svc.eyebrow?.replace(/^[0-9٠-٩]+ \/ /, "")}
                </h3>
                <p>{svc.body}</p>
                {svc.note && <p className="concept-note">{svc.note}</p>}
              </article>
            );
          })}
        </section>

        <hr />

        <section className="reading-mission">
          <h2>{t.mission?.missionLabel}</h2>
          <p>{t.mission?.missionText}</p>
          <h2>{t.mission?.visionLabel}</h2>
          <p>{t.mission?.visionText}</p>
        </section>

        <hr />

        <section className="reading-contact">
          <h2>{t.company?.contactHeading}</h2>
          <address>
            <p>{t.company?.address}</p>
            <p><a href={`mailto:${t.company?.email}`}>{t.company?.email}</a></p>
            {t.company?.phones?.map((ph) => (
              <p key={ph}><a href={`tel:${ph}`} dir="ltr">{ph}</a></p>
            ))}
          </address>
        </section>

        <p className="reading-footer-note">{t.fallbackNote}</p>
      </main>
    </div>
  );
}
