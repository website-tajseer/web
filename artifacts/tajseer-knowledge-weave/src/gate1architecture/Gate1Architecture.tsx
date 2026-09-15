import { lazy, Suspense, useEffect, useState } from "react";

import { supportsWebGL } from "../experience/quality";
import "./Gate1Architecture.css";

const ArchitectureScene = lazy(() => import("./ArchitectureScene"));
type Language = "en" | "ar";

export default function Gate1Architecture() {
  const [language, setLanguage] = useState<Language>(() =>
    new URLSearchParams(window.location.search).get("lang") === "ar" ? "ar" : "en",
  );
  const [webgl] = useState(() => supportsWebGL());
  const rtl = language === "ar";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = rtl ? "rtl" : "ltr";
    document.title = rtl
      ? "تجسير — اختبار العمارة"
      : "Tajseer — Architecture Proof";
    const url = new URL(window.location.href);
    url.searchParams.set("lang", language);
    window.history.replaceState(null, "", url);
  }, [language, rtl]);

  return (
    <main className="architecture-gate" dir={rtl ? "rtl" : "ltr"}>
      <header className="architecture-gate__header">
        <p>
          <span>GATE 01</span>
          {rtl ? "اختبار العمارة الثابت" : "STATIC ARCHITECTURE PROOF"}
        </p>
        <button
          type="button"
          onClick={() => setLanguage((current) => (current === "en" ? "ar" : "en"))}
          lang={rtl ? "en" : "ar"}
        >
          {rtl ? "EN" : "العربية"}
        </button>
      </header>

      <section className="architecture-gate__viewport">
        {webgl ? (
          <Suspense fallback={<div className="architecture-gate__loading" aria-label="Loading architecture proof" />}>
            <ArchitectureScene language={language} />
          </Suspense>
        ) : (
          <div className="architecture-gate__fallback" role="status">
            {rtl ? "يتطلب اختبار العمارة متصفحاً يدعم WebGL." : "This architecture proof requires WebGL."}
          </div>
        )}

        <div className="architecture-gate__title">
          <p>{rtl ? "مركز تجسير للابتكار والمعرفة" : "TAJSEER INNOVATION & KNOWLEDGE"}</p>
          <h1>{rtl ? "اختبار مركز التجربة" : "Experience Center Study"}</h1>
          <span>{rtl ? "عمارة • معرفة • أثر" : "ARCHITECTURE · KNOWLEDGE · IMPACT"}</span>
        </div>

        <div className="architecture-gate__status" aria-hidden="true">
          <span>{rtl ? "لقطة ثابتة" : "STATIC FRAME"}</span>
          <i />
          <span>2560 × 1440</span>
        </div>
      </section>
    </main>
  );
}
