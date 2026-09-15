import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from "react";

import { copy } from "../experience/copy";
import { supportsWebGL } from "../experience/quality";
import "./Gate2A.css";

const Gate2AWorld = lazy(() => import("./Gate2AWorld"));
type Language = "en" | "ar";
type Gate2AStyle = CSSProperties & {
  "--hero-p": string;
  "--hero-exit": string;
  "--hero-copy-fade": string;
  "--header-light": string;
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export default function Gate2A() {
  const [language, setLanguage] = useState<Language>(() =>
    new URLSearchParams(window.location.search).get("lang") === "ar" ? "ar" : "en",
  );
  const [progress, setProgress] = useState(0);
  const [heroActive, setHeroActive] = useState(true);
  const [webglFailed, setWebglFailed] = useState(() => !supportsWebGL());
  const [reducedMotion, setReducedMotion] = useState(() =>
    matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const heroSequence = useRef<HTMLElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const frame = useRef(0);
  const rtl = language === "ar";
  const t = copy[language];

  useEffect(() => {
    const update = () => {
      frame.current = 0;
      const element = heroSequence.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const travel = Math.max(1, element.offsetHeight - window.innerHeight);
      const next = clamp(-rect.top / travel);
      setProgress((current) => (Math.abs(current - next) > 0.001 ? next : current));
      setHeroActive(rect.bottom > 0 && rect.top < window.innerHeight);
    };
    const requestUpdate = () => {
      if (!frame.current) frame.current = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = rtl ? "rtl" : "ltr";
    document.title = rtl
      ? "تجسير — محتوى تعليمي. تجارب تفاعلية."
      : "Tajseer — Educational content. Interactive experiences.";
    const url = new URL(window.location.href);
    url.searchParams.set("lang", language);
    history.replaceState(null, "", url);
  }, [language, rtl]);

  const exit = clamp((progress - 0.62) / 0.38);
  const copyFade = clamp((progress - 0.46) / 0.34);
  const style: Gate2AStyle = {
    "--hero-p": progress.toFixed(4),
    "--hero-exit": exit.toFixed(4),
    "--hero-copy-fade": copyFade.toFixed(4),
    "--header-light": progress > 0.94 ? "1" : "0",
  };

  const changeLanguage = () => setLanguage(rtl ? "en" : "ar");
  const goToContent = () =>
    document.getElementById("multimedia-preview")?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });

  return (
    <main
      className={`gate2a ${reducedMotion ? "is-reduced" : ""}`}
      dir={rtl ? "rtl" : "ltr"}
      style={style}
      data-gate2-progress={progress.toFixed(3)}
    >
      <a className="gate2a-skip" href="#multimedia-preview">
        {t.skip}
      </a>

      <header className={`gate2a-header ${progress > 0.94 ? "is-light" : ""}`}>
        <a className="gate2a-brand" href="#top" aria-label={rtl ? "تجسير" : "Tajseer"}>
          <img
            src={`${import.meta.env.BASE_URL}assets/tajseer/${rtl ? "arabic-logo.png" : "TajsserLogo.bc8c31e3b431f4abdefcf79540d093dc.svg"}`}
            alt={rtl ? "تجسير" : "Tajseer"}
          />
        </a>
        <span className="gate2a-header-line">
          {rtl ? "التفكير · التقنية · التعليم" : "Thinking · Technology · Education"}
        </span>
        <div className="gate2a-header-actions">
          <button
            type="button"
            aria-pressed={reducedMotion}
            onClick={() => setReducedMotion((value) => !value)}
          >
            {rtl ? "تقليل الحركة" : "Reduce motion"}
          </button>
          <button type="button" onClick={changeLanguage} lang={rtl ? "en" : "ar"}>
            {rtl ? "EN" : "العربية"}
          </button>
        </div>
      </header>

      <section id="top" className="gate2a-hero-sequence" ref={heroSequence}>
        <div
          className="gate2a-hero-sticky"
          onPointerMove={(event) => {
            pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.current.y = 1 - (event.clientY / window.innerHeight) * 2;
            window.dispatchEvent(new Event("gate2a:pointer"));
          }}
          onPointerLeave={() => {
            pointer.current.x = 0;
            pointer.current.y = 0;
            window.dispatchEvent(new Event("gate2a:pointer"));
          }}
        >
          <div className="gate2a-world">
            {webglFailed ? (
              <div className="gate2a-world-fallback" aria-hidden="true" />
            ) : (
              <Suspense fallback={<div className="gate2a-world-fallback" aria-hidden="true" />}>
                <Gate2AWorld
                  progress={progress}
                  pointer={pointer}
                  active={heroActive}
                  rtl={rtl}
                  reducedMotion={reducedMotion}
                  onFailure={() => setWebglFailed(true)}
                />
              </Suspense>
            )}
          </div>

          <div className="gate2a-hero-content">
            <p className="gate2a-kicker">{t.hero.tagline}</p>
            <h1>
              {t.hero.heading.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </h1>
            <p className="gate2a-hero-summary">{t.hero.body}</p>
            <div className="gate2a-hero-actions">
              <button className="gate2a-primary-action" type="button" onClick={goToContent}>
                {t.hero.cta} <span aria-hidden="true">↓</span>
              </button>
              <span className="gate2a-scroll-note">{t.hero.scroll}</span>
            </div>
          </div>

          <ol className="gate2a-service-rail" aria-label={t.hero.serviceIndex}>
            {t.services.map((service, index) => (
              <li key={service.id}>
                <span>0{index + 1}</span>
                {service.name}
              </li>
            ))}
          </ol>

          <div className="gate2a-transition-preview" aria-hidden={exit < 0.5}>
            <p>{t.multimedia.eyebrow}</p>
            <h2>{t.multimedia.heading.join(" ")}</h2>
            <p className="transition-index">01</p>
          </div>
        </div>
      </section>

      <section id="multimedia-preview" className="gate2a-multimedia" tabIndex={-1}>
        <svg className="gate2a-orbit-continuation" viewBox="0 0 1600 360" preserveAspectRatio="none" aria-hidden="true">
          <path d="M-40 280 C 240 48, 430 326, 714 164 S 1190 30, 1660 210" />
        </svg>
        <div className="gate2a-section-grid">
          <div>
            <p className="gate2a-section-kicker">{t.multimedia.eyebrow}</p>
            <h2>{t.multimedia.heading.join(" ")}</h2>
            <p className="gate2a-multimedia-copy">{t.multimedia.body}</p>
            <div className="gate2a-preview-labels" aria-label={rtl ? "تحوّلات المحتوى" : "Content transformations"}>
              <span>{rtl ? "رسوم" : "Illustration"}</span>
              <span>{rtl ? "حركة" : "Motion"}</span>
              <span>{rtl ? "وسائط" : "Media"}</span>
              <span>{rtl ? "تفاعل" : "Interaction"}</span>
            </div>
          </div>

          <div className="gate2a-media-preview" aria-hidden="true">
            <div className="gate2a-media-plane is-back" />
            <div className="gate2a-media-plane is-main">
              <span className="media-number">01</span>
              <span className="media-line" />
              <span className="media-orbit" />
            </div>
            <div className="gate2a-media-plane is-front">
              <strong>{t.multimedia.caption}</strong>
              <small>{t.multimedia.note}</small>
            </div>
          </div>
        </div>
        <p className="gate2a-gate-note">
          {rtl ? "بداية قسم الوسائط المتعددة — يستمر المحتوى بعد اعتماد المشهد" : "Interactive Multimedia begins here — further content follows after visual approval"}
        </p>
      </section>
    </main>
  );
}
