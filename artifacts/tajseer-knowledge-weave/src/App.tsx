import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { ErrorBoundary } from "./components/error-boundary";
import {
  useLesson,
  lessonStore,
  setProgress,
  jumpTo,
} from "./experience/state";
import { actAt, acts, type Act } from "./experience/timeline";
import { copy } from "./experience/copy";
import { Narrative } from "./experience/Narrative";
import { ReadingView } from "./experience/ReadingView";
import { supportsWebGL } from "./experience/quality";
const World = lazy(() => import("./experience/World"));
function ProgressLine() {
  const ref = useRef<HTMLElement>(null);
  useEffect(
    () =>
      lessonStore.subscribe(() => {
        if (ref.current)
          ref.current.style.transform = `scaleX(${lessonStore.get().progress})`;
      }),
    [],
  );
  return (
    <div className="overall-progress" aria-hidden="true">
      <i ref={ref} />
    </div>
  );
}
export default function App() {
  const s = useLesson(),
    t = copy[s.lang];
  const [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false);
  const drag = useRef<{ x: number; y: number; id: number } | null>(null);
  useEffect(() => {
    if (failed) lessonStore.set({ reading: true, inspect: false });
  }, [failed]);
  useEffect(() => {
    setFailed(
      new URLSearchParams(location.search).get("webgl") === "off" ||
        !supportsWebGL(),
    );
    const timer = window.setTimeout(() => setReady(true), 100);
    let frame = 0;
    const scroll = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(setProgress);
      },
      resize = () => {
        const progress = lessonStore.get().progress;
        cancelAnimationFrame(frame);
        lessonStore.set({ mobile: matchMedia("(max-width: 760px)").matches });
        frame = requestAnimationFrame(() => {
          window.scrollTo({
            top:
              progress *
              Math.max(1, document.documentElement.scrollHeight - innerHeight),
            behavior: "instant",
          });
          setProgress();
        });
      };
    const motion = matchMedia("(prefers-reduced-motion: reduce)"),
      updateMotion = () => lessonStore.set({ reduced: motion.matches });
    const visibility = () =>
      lessonStore.set({ visible: document.visibilityState === "visible" });
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") lessonStore.set({ inspect: false });
    };
    const hash = () => {
      const id = location.hash.slice(1) as Act;
      if (acts.some((a) => a.id === id)) jumpTo(id);
    };
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", key);
    window.addEventListener("hashchange", hash);
    document.addEventListener("visibilitychange", visibility);
    motion.addEventListener("change", updateMotion);
    requestAnimationFrame(() => {
      hash();
      setProgress();
    });
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", key);
      window.removeEventListener("hashchange", hash);
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", updateMotion);
    };
  }, []);
  useEffect(() => {
    document.documentElement.lang = s.lang;
    document.title =
      s.lang === "ar"
        ? "تجسير — محتوى تعليمي. تجارب تفاعلية."
        : "Tajseer — Educational content. Interactive experiences.";
    document.documentElement.dir = s.lang === "ar" ? "rtl" : "ltr";
    const url = new URL(location.href);
    url.searchParams.set("lang", s.lang);
    history.replaceState(null, "", url);
  }, [s.lang]);
  const pointerMove = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.dataset.pointerX = String((e.clientX / innerWidth) * 2 - 1);
    e.currentTarget.dataset.pointerY = String(
      1 - (e.clientY / innerHeight) * 2,
    );
    if (drag.current && s.inspect) {
      lessonStore.set({
        yaw: s.yaw + (e.clientX - drag.current.x) * 0.006,
        pitch: Math.max(
          -0.45,
          Math.min(0.45, s.pitch + (e.clientY - drag.current.y) * 0.004),
        ),
      });
      drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    } else if (s.progress > 0.9 && !s.reduced) lessonStore.set({});
  };
  const fallback = s.reading || failed;
  return (
    <main
      className={`lesson-app ${s.lang === "ar" ? "arabic" : ""} ${s.progress > 0.60 && s.progress < 0.90 ? "dark-world" : ""} ${s.reduced ? "reduced-motion" : ""} ${fallback ? "reading-mode" : ""}`}
      data-act={actAt(s.progress)}
      data-braced={s.braced}
      data-explode={s.explode}
      data-selected={s.selected}
      data-yaw={s.yaw}
    >
      <a
        className="skip-link"
        href="#lesson-controls"
        onClick={(e) => {
          e.preventDefault();
          jumpTo("stem");
          setTimeout(
            () => document.getElementById("lesson-controls")?.focus(),
            80,
          );
        }}
      >
        {t.skip}
      </a>
      <div className="spatial-stage">
        <div
          className={`world-canvas ${s.inspect ? "inspecting" : ""}`}
          data-pointer-x="0"
          data-pointer-y="0"
          onPointerMove={pointerMove}
          onPointerDown={(e) => {
            if (s.inspect) {
              drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
              e.currentTarget.setPointerCapture(e.pointerId);
            }
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
        >
          {!fallback && ready && (
            <ErrorBoundary
              onError={() => setFailed(true)}
              FallbackComponent={() => <ReadingView />}
            >
              <Suspense
                fallback={
                  <div
                    className="world-loading"
                    aria-label={
                      s.lang === "ar" ? "جارٍ فتح عالم التعلّم" : "Opening the Tajseer Learning World"
                    }
                  />
                }
              >
                <World onFailure={() => setFailed(true)} />
              </Suspense>
            </ErrorBoundary>
          )}
          {fallback && <ReadingView />}
        </div>
        <header className="prototype-header">
          <button
            className="brand"
            onClick={() => jumpTo("hero")}
            aria-label={
              s.lang === "ar"
                ? "تجسير · العودة إلى البداية"
                : "Tajseer · return to the beginning"
            }
          >
            <img
              src={`${import.meta.env.BASE_URL}assets/tajseer/${s.lang === "ar" ? "arabic-logo.png" : "TajsserLogo.bc8c31e3b431f4abdefcf79540d093dc.svg"}`}
              alt={s.lang === "ar" ? "تجسير" : "Tajseer"}
            />
          </button>
          <span className="edition-label">{t.hero?.serviceIndex}</span>
          <div className="view-options">
            <button
              aria-pressed={s.reduced}
              onClick={() => lessonStore.set({ reduced: !s.reduced })}
            >
              {t.motion}
            </button>
            <button
              aria-pressed={fallback}
              disabled={failed}
              onClick={() => lessonStore.set({ reading: !s.reading })}
            >
              {failed ? t.reading : fallback ? t.world : t.reading}
            </button>
            <button
              className="language-button"
              onClick={() =>
                lessonStore.set({ lang: s.lang === "ar" ? "en" : "ar" })
              }
              lang={s.lang === "ar" ? "en" : "ar"}
            >
              {s.lang === "ar" ? "EN" : "العربية"}
            </button>
          </div>
        </header>
        <Narrative />
        {failed && (
          <p className="fallback-status" role="status">
            {s.lang === "ar"
              ? "العرض ثلاثي الأبعاد غير متاح. يمكنك الاطلاع على خدمات تجسير بالنص."
              : "3D is unavailable. Tajseer service information is available in reading view."}
          </p>
        )}
        <nav
          className="chapter-navigation"
          aria-label={s.lang === "ar" ? "فصول تجسير" : "Tajseer service chapters"}
        >
          {acts.map((a, i) => (
            <button
              key={a.id}
              aria-current={actAt(s.progress) === a.id ? "step" : undefined}
              aria-label={s.lang === "ar" ? a.ar : a.en}
              title={s.lang === "ar" ? a.ar : a.en}
              onClick={() => jumpTo(a.id)}
            >
              <span className="chapter-index" dir="ltr">
                0{i + 1}
              </span>
              <span className="chapter-name">
                {s.lang === "ar" ? a.ar : a.en}
              </span>
              <i />
            </button>
          ))}
        </nav>
        <ProgressLine />
      </div>
      <div className="scroll-track" aria-hidden="true" />
    </main>
  );
}
