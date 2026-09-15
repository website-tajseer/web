import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from "react";
import { copy } from "../experience/copy";
import { supportsWebGL } from "../experience/quality";
import "./HomePrototype.css";

const KnowledgeBridgeWorld = lazy(() => import("./KnowledgeBridgeWorld"));

type Language = "en" | "ar";
type ProgressState = { hero: number; multimedia: number; elearning: number; stem: number; arvr: number; consulting: number; arvrActive: boolean };
type PrototypeStyle = CSSProperties & {
  "--hero-progress": string; "--hero-exit": string; "--media-progress": string;
  "--learning-progress": string; "--stem-progress": string; "--arvr-progress": string;
  "--arvr-depth": string; "--consulting-progress": string;
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const sectionProgress = (element: HTMLElement | null) => {
  if (!element) return 0;
  const rect = element.getBoundingClientRect();
  return clamp(-rect.top / Math.max(1, rect.height - window.innerHeight));
};
const sectionActive = (element: HTMLElement | null) => {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
};

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && element.classList.add("is-visible"), { threshold: 0.14 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`hp-reveal ${className}`}>{children}</div>;
}

function KnowledgeSystem({ rtl, progress }: { rtl: boolean; progress: number }) {
  const phases = rtl ? ["المعرفة", "التعلّم", "التطوير", "التطبيق", "الأثر"] : ["KNOWLEDGE", "LEARNING", "DEVELOPMENT", "APPLICATION", "IMPACT"];
  const active = Math.min(phases.length - 1, Math.floor(progress * phases.length));
  return (
    <div className="hp-knowledge-system" aria-label={phases.join("، ")}>
      <svg className="hp-knowledge-system__path" viewBox="0 0 980 720" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5, 6].map((line) => <path key={line} style={{ "--trajectory": line } as CSSProperties} d={`M${18 + line * 2} ${640 - line * 64} C${190 + line * 9} ${610 - line * 37} ${250 + line * 6} ${445 - line * 7} ${410 + line * 4} ${405 - line * 8} S${675 + line * 3} ${230 - line * 3} 956 126`} />)}
        {[[48, 588], [260, 450], [472, 354], [692, 236], [956, 126]].map(([cx, cy], index) => <g key={index} className={index <= active ? "is-resolved" : ""}><circle cx={cx} cy={cy} r={index === active ? 10 : 5} /><circle cx={cx} cy={cy} r={index === active ? 24 : 12} /></g>)}
      </svg>
      <div className="hp-knowledge-system__focus" aria-hidden="true"><span/><span/><span/></div>
      {phases.map((phase, index) => (
        <div key={phase} className={`hp-knowledge-layer hp-knowledge-layer--${index + 1} ${index === active ? "is-active" : ""}`} style={{ "--layer-index": index } as CSSProperties}>
          <span>0{index + 1}</span><strong>{phase}</strong><i aria-hidden="true">{index < 4 ? "↗" : "●"}</i>
        </div>
      ))}
      <p className="hp-knowledge-system__caption">{rtl ? "المعرفة تتحول إلى أثر قابل للتطبيق." : "Knowledge moves into applied impact."}</p>
    </div>
  );
}

function IntelligentSystem({ rtl, input, setInput }: { rtl: boolean; input: number; setInput: (value: number) => void }) {
  const p = input / 100;
  const coherence = Math.round(28 + p * 67);
  const feedback = Math.round(18 + p * 76);
  const stages = rtl ? ["سؤال", "نموذج", "تجربة", "تغذية راجعة", "فهم"] : ["QUESTION", "MODEL", "EXPERIMENT", "FEEDBACK", "UNDERSTANDING"];
  const nodes = [
    [130 + p * 40, 185 - p * 28], [335 + p * 22, 102 + p * 44], [455, 300], [610 - p * 16, 148 + p * 55], [785 - p * 52, 350 - p * 50], [290 + p * 80, 455 - p * 72],
  ];
  const links = [[0,2],[1,2],[2,3],[2,4],[2,5],[3,4],[4,5],[1,3]];
  return (
    <div className="hp-system-lab">
      <div className="hp-system-lab__status" aria-live="polite"><span>{rtl ? "تماسك النظام" : "SYSTEM COHERENCE"}</span><strong>{coherence}</strong><small>/ 100</small></div>
      <svg viewBox="0 0 900 560" role="img" aria-label={rtl ? "نظام تعليمي تفاعلي يعيد تنظيم العلاقات عند تغيير المدخل" : "Interactive learning system reorganizing relationships when one input changes"}>
        <defs><filter id="nodeGlow"><feGaussianBlur stdDeviation="8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
        <path className="hp-system-orbit" d={`M85 ${390-p*80} C220 ${70+p*80} 660 ${50+p*100} 830 ${360-p*60} C690 ${520-p*70} 230 ${535-p*50} 85 ${390-p*80}Z`} />
        {links.map(([a,b], index) => <line key={index} className="hp-system-link" x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} style={{ opacity: .22 + p * .65, strokeWidth: 1 + ((index + 2) % 4) * p }} />)}
        {nodes.map(([cx,cy], index) => <g key={index} className={`hp-system-node ${index === 2 ? "is-core" : ""}`} transform={`translate(${cx} ${cy})`}><circle r={index === 2 ? 38 : 13 + p * 7}/><circle r={index === 2 ? 58 : 28} className="hp-system-node__ring"/><text y={index === 2 ? 5 : 4}>{String(index+1).padStart(2,"0")}</text></g>)}
        <path className="hp-system-feedback" d={`M195 490 C340 ${490-feedback*1.8} 530 ${500-feedback*2.6} 760 ${465-feedback*2.3}`} />
      </svg>
      <label className="hp-system-control"><span>{rtl ? "مدخل واحد يعيد حساب النظام" : "ONE INPUT RECALCULATES THE SYSTEM"}</span><input type="range" min="10" max="100" value={input} onChange={(event) => setInput(Number(event.target.value))} /></label>
      <div className="hp-system-readouts"><span><i>{rtl ? "المدخل" : "INPUT"}</i><b>{input}%</b></span><span><i>{rtl ? "العلاقات" : "RELATIONSHIPS"}</i><b>{Math.round(3+p*5)}</b></span><span><i>{rtl ? "التغذية الراجعة" : "FEEDBACK"}</i><b>{feedback}</b></span><span><i>{rtl ? "النتيجة" : "RESULT"}</i><b>{coherence}</b></span></div>
      <div className="hp-stem-process" aria-label={stages.join(", ")}>{stages.map((stage, index) => <span key={stage}><i>0{index + 1}</i>{stage}</span>)}</div>
    </div>
  );
}

function SpatialMedia({ rtl }: { rtl: boolean }) {
  const labels = rtl ? ["الخلفية", "السياق", "الموضوع", "الشرح"] : ["BACKGROUND", "CONTEXT", "SUBJECT", "ANNOTATION"];
  return (
    <div className="hp-spatial-media" aria-label={labels.join("، ")}>
      <div className="hp-spatial-layer hp-spatial-layer--background"><span>01 / {labels[0]}</span><svg viewBox="0 0 900 620"><path d="M20 420C170 250 310 510 470 310S760 100 880 260M20 490C220 330 340 560 520 370S760 210 880 330"/><path d="M80 90H820M80 530H820"/></svg></div>
      <div className="hp-spatial-layer hp-spatial-layer--context"><span>02 / {labels[1]}</span><div className="hp-context-field"><i/><i/><i/><i/></div></div>
      <div className="hp-spatial-layer hp-spatial-layer--subject"><span>03 / {labels[2]}</span><svg viewBox="0 0 560 650"><path className="hp-study-stem" d="M280 590C260 470 310 390 280 280S260 120 300 55"/><path className="hp-study-leaf" d="M278 360C190 300 120 315 82 385C165 420 238 410 278 360ZM286 250C360 165 445 185 485 250C410 306 335 295 286 250Z"/><path className="hp-study-vein" d="M278 360L120 370M286 250L448 230"/></svg></div>
      <div className="hp-spatial-layer hp-spatial-layer--annotation"><span>04 / {labels[3]}</span><div className="hp-annotation hp-annotation--1">{rtl ? "الملاحظة" : "OBSERVATION"}<i/></div><div className="hp-annotation hp-annotation--2">{rtl ? "العلاقة" : "RELATION"}<i/></div><div className="hp-annotation hp-annotation--3">{rtl ? "السياق" : "CONTEXT"}<i/></div></div>
      <div className="hp-spatial-media__focus" aria-hidden="true"><span /></div>
    </div>
  );
}

function LearningTransformation({ rtl, progress, active }: { rtl: boolean; progress: number; active: number }) {
  const items = rtl ? ["محتوى هادف", "احتياجات المتعلم", "SCORM", "LMS / CMS / MOOCs"] : ["PURPOSEFUL CONTENT", "LEARNER NEEDS", "SCORM", "LMS / CMS / MOOCs"];
  const scatter = [[-130,-130,-8],[170,-85,7],[-160,120,5],[150,145,-6]];
  return <div className="hp-learning-lab">
    <div className="hp-learning-canvas" aria-label={items.join(", ")}>
      <div className="hp-learning-grid"/>
      {items.map((item,index)=><div key={item} className={`hp-learning-fragment hp-learning-fragment--${index+1}`} style={{ "--sx": `${scatter[index][0]}px`, "--sy": `${scatter[index][1]}px`, "--sr": `${scatter[index][2]}deg`, "--resolve": progress } as CSSProperties}><span>0{index+1}</span><strong>{item}</strong></div>)}
      <svg viewBox="0 0 760 520" aria-hidden="true"><path d="M160 160C300 160 320 240 380 260M600 160C480 160 440 220 380 260M160 380C280 380 320 300 380 260M600 380C500 380 450 310 380 260"/></svg>
      <div className="hp-learning-resolution"><span>{rtl ? "تجربة تعلم رقمية متماسكة" : "COHERENT DIGITAL LEARNING EXPERIENCE"}</span><i style={{ width: `${Math.round(progress*100)}%` }}/></div>
    </div>
    <div className="hp-learning-stages">{(rtl ? ["محتوى أولي", "تصميم تعليمي", "تفاعل", "تعلم رقمي"] : ["Raw content", "Learning design", "Interaction", "Digital learning"]).map((label,index)=><span key={label} className={index===active?"is-active":""}><i>0{index+1}</i>{label}</span>)}</div>
  </div>;
}

function DecisionSystem({ rtl }: { rtl: boolean }) {
  const stages = rtl ? ["معلومات معقدة", "وضوح", "قرار", "قدرات", "أثر مؤسسي"] : ["COMPLEX INFORMATION", "CLARITY", "DECISION", "CAPABILITY", "ORGANIZATIONAL IMPACT"];
  return <div className="hp-decision-system">
    <svg viewBox="0 0 920 600" aria-hidden="true"><path className="hp-decision-grid" d="M110 80V520M300 80V520M490 80V520M680 80V520M840 80V520M70 160H870M70 300H870M70 440H870"/>{[0,1,2,3,4].map((line)=><path key={line} className="hp-decision-flow" style={{ "--line": line } as CSSProperties} d={`M55 ${120+line*82} C210 ${70+line*95} 260 ${420-line*62} 440 300 S650 ${250+line*20} 860 ${170+line*63}`} />)}<circle cx="440" cy="300" r="52" className="hp-decision-core"/><circle cx="440" cy="300" r="11" className="hp-decision-point"/></svg>
    <div className="hp-decision-stages">{stages.map((stage,index)=><span key={stage}><i>0{index+1}</i>{stage}</span>)}</div>
    <p>{rtl ? "الإنسان والقدرة المؤسسية هما النتيجة." : "People and organizational capability are the outcome."}</p>
  </div>;
}

export default function HomePrototype() {
  const [language, setLanguage] = useState<Language>(() => new URLSearchParams(window.location.search).get("lang") === "ar" ? "ar" : "en");
  const [reduced, setReduced] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [systemInput, setSystemInput] = useState(52);
  const [progress, setProgress] = useState<ProgressState>({ hero: 0, multimedia: 0, elearning: 0, stem: 0, arvr: 0, consulting: 0, arvrActive: false });
  const heroRef = useRef<HTMLElement>(null); const multimediaRef = useRef<HTMLElement>(null); const elearningRef = useRef<HTMLElement>(null);
  const stemRef = useRef<HTMLElement>(null); const arvrRef = useRef<HTMLElement>(null); const consultingRef = useRef<HTMLElement>(null); const raf = useRef(0);
  const rtl = language === "ar"; const t = copy[language];
  const webgl = supportsWebGL();

  useEffect(() => {
    document.documentElement.lang = language; document.documentElement.dir = rtl ? "rtl" : "ltr";
    document.title = rtl ? "تجسير الفكر — التعليم والتطوير والتقنية" : "Tajseer — Education, Development & Technology";
    const url = new URL(window.location.href); url.searchParams.set("lang", language); history.replaceState(null, "", url);
  }, [language, rtl]);
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)"); const updateMotion = () => setReduced(motion.matches);
    motion.addEventListener("change", updateMotion); return () => motion.removeEventListener("change", updateMotion);
  }, []);
  useEffect(() => {
    const update = () => {
      raf.current = 0;
      setProgress({ hero: sectionProgress(heroRef.current), multimedia: sectionProgress(multimediaRef.current), elearning: sectionProgress(elearningRef.current), stem: sectionProgress(stemRef.current), arvr: sectionProgress(arvrRef.current), consulting: sectionProgress(consultingRef.current), arvrActive: sectionActive(arvrRef.current) });
    };
    const requestUpdate = () => { if (!raf.current) raf.current = requestAnimationFrame(update); };
    window.addEventListener("scroll", requestUpdate, { passive: true }); window.addEventListener("resize", requestUpdate); requestUpdate();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("scroll", requestUpdate); window.removeEventListener("resize", requestUpdate); };
  }, []);

  const spatialDepth = progress.arvr < .5 ? progress.arvr * 2 : (1 - progress.arvr) * 2;
  const style: PrototypeStyle = {
    "--hero-progress": progress.hero.toFixed(4), "--hero-exit": clamp((progress.hero - .72) / .28).toFixed(4), "--media-progress": progress.multimedia.toFixed(4),
    "--learning-progress": progress.elearning.toFixed(4), "--stem-progress": progress.stem.toFixed(4), "--arvr-progress": progress.arvr.toFixed(4), "--arvr-depth": clamp(spatialDepth).toFixed(4), "--consulting-progress": progress.consulting.toFixed(4),
  };
  const logo = `${import.meta.env.BASE_URL}assets/tajseer/${rtl ? "arabic-logo.png" : "TajsserLogo.bc8c31e3b431f4abdefcf79540d093dc.svg"}`;
  const activeLearning = Math.min(3, Math.floor(progress.elearning * 4));

  return (
    <main className={`home-prototype ${reduced ? "is-reduced" : ""}`} dir={rtl ? "rtl" : "ltr"} style={style}>
      <a className="hp-skip" href="#about">{t.skip}</a>
      <header className={`hp-header ${progress.arvrActive ? "is-dark" : ""}`}>
        <a className="hp-brand" href="#top" aria-label={rtl ? "تجسير الفكر" : "Tajseer"}><img src={logo} alt={rtl ? "تجسير" : "Tajseer"} /></a>
        <nav aria-label={rtl ? "التنقل الرئيسي" : "Primary navigation"}><a href="#about">{rtl ? "من نحن" : "About"}</a><a href="#multimedia">{rtl ? "الخدمات" : "Services"}</a><a href="#contact">{rtl ? "التواصل" : "Contact"}</a></nav>
        <div className="hp-header__actions"><button type="button" onClick={() => setReduced((value) => !value)} aria-pressed={reduced}>{rtl ? "حركة" : "Motion"}</button><button type="button" onClick={() => setLanguage((value) => value === "en" ? "ar" : "en")} lang={rtl ? "en" : "ar"}>{rtl ? "EN" : "العربية"}</button></div>
      </header>

      <section id="top" ref={heroRef} className="hp-hero" aria-labelledby="hero-title"><div className="hp-hero__sticky">
        {webgl && <div className="hp-hero-webgl" aria-hidden="true"><Suspense fallback={null}><KnowledgeBridgeWorld progress={progress.hero} reduced={reduced} /></Suspense></div>}
        <KnowledgeSystem rtl={rtl} progress={progress.hero} />
        <div className="hp-hero__copy"><p className="hp-eyebrow">{t.hero.tagline}</p><h1 id="hero-title">{rtl ? "المعرفة تبدأ مساراً." : "Knowledge begins a journey."}<em>{rtl ? "والتجربة تصنع الأثر." : "Experience creates impact."}</em></h1><p className="hp-hero__summary">{t.hero.body}</p><a className="hp-text-link" href="#about">{rtl ? "اكتشف تجسير" : "Discover Tajseer"}<span aria-hidden="true">↓</span></a></div>
        <div className="hp-hero__themes" aria-hidden="true">{t.services.slice(0, 4).map((service, index) => <span key={service.id} className={progress.hero >= index * .17 ? "is-active" : ""}><i>0{index + 1}</i>{service.short}</span>)}</div><p className="hp-scroll-cue">{t.hero.scroll}</p>
      </div></section>

      <section id="about" className="hp-section hp-about"><Reveal className="hp-about__year"><p>{rtl ? "منذ" : "SINCE"}</p><strong>2009</strong><span>{rtl ? "المملكة العربية السعودية" : "KINGDOM OF SAUDI ARABIA"}</span></Reveal><Reveal className="hp-about__copy"><p className="hp-eyebrow">{t.company.eyebrow}</p><h2>{t.company.profileHeading}</h2><p>{t.company.profile}</p></Reveal><div className="hp-about__curve" aria-hidden="true" /></section>

      <section id="multimedia" ref={multimediaRef} className="hp-section hp-multimedia"><Reveal className="hp-section__intro"><p className="hp-eyebrow">{t.multimedia.eyebrow}</p><h2>{t.multimedia.heading.join(" ")}</h2><p>{t.multimedia.body}</p></Reveal><Reveal className="hp-media-composition"><div className="hp-media-composition__word is-image">{rtl ? "صورة" : "IMAGE"}</div><div className="hp-media-composition__word is-sound">{rtl ? "صوت" : "SOUND"}</div><div className="hp-media-composition__word is-motion">{rtl ? "حركة" : "MOTION"}</div><svg viewBox="0 0 900 420" role="img" aria-label={t.multimedia.caption}><path d="M20 275 C170 78 275 388 440 198 S710 105 880 248"/><path d="M20 307 C185 145 300 345 455 236 S710 150 880 275"/></svg><div className="hp-media-convergence"><span>{rtl ? "صورة × صوت × حركة" : "IMAGE × SOUND × MOTION"}</span><strong>{rtl ? "وسائط متعددة تفاعلية" : "INTERACTIVE MULTIMEDIA"}</strong></div><small>{t.multimedia.note}</small></Reveal></section>

      <section id="elearning" ref={elearningRef} className="hp-section hp-elearning"><div className="hp-elearning__sticky"><Reveal className="hp-section__intro"><p className="hp-eyebrow">{t.courses.eyebrow}</p><h2>{t.courses.heading.join(" ")}</h2><p>{t.courses.body}</p></Reveal><LearningTransformation rtl={rtl} progress={progress.elearning} active={activeLearning}/></div></section>

      <section id="stem" ref={stemRef} className="hp-section hp-stem"><div className="hp-stem__sticky"><div className="hp-spatial-copy"><p className="hp-eyebrow">{t.stem.eyebrow}</p><h2>{t.stem.heading.join(" ")}</h2><p>{t.stem.body}</p><small>{t.stem.conceptual}</small></div><IntelligentSystem rtl={rtl} input={systemInput} setInput={setSystemInput} /></div></section>

      <section id="arvr" ref={arvrRef} className="hp-section hp-arvr"><div className="hp-arvr__sticky"><SpatialMedia rtl={rtl}/><div className="hp-arvr__copy"><p className="hp-eyebrow">{t.arvr.eyebrow}</p><h2>{t.arvr.heading.join(" ")}</h2><p>{t.arvr.body}</p><small>{t.arvr.note}</small></div><p className="hp-arvr__peak">{t.arvr.peak}</p></div></section>

      <section id="consulting" ref={consultingRef} className="hp-section hp-consulting"><Reveal className="hp-consulting__heading"><p className="hp-eyebrow">{t.guidance.eyebrow}</p><h2>{t.guidance.heading.join(" ")}</h2></Reveal><Reveal className="hp-consulting__body"><p>{t.guidance.body}</p><DecisionSystem rtl={rtl}/><small>{t.guidance.note}</small></Reveal></section>

      <section id="mission" className="hp-section hp-mission"><Reveal className="hp-mission__intro"><p className="hp-eyebrow">{t.mission.eyebrow}</p><h2>{rtl ? "لماذا نعمل." : "Why we work."}</h2></Reveal><Reveal className="hp-mission__statement is-mission"><span>{t.mission.missionLabel}</span><blockquote>{t.mission.missionText}</blockquote></Reveal><Reveal className="hp-mission__statement is-vision"><span>{t.mission.visionLabel}</span><blockquote>{t.mission.visionText}</blockquote></Reveal></section>

      <footer id="contact" className="hp-contact"><div className="hp-contact__mark" aria-hidden="true">T</div><div className="hp-contact__heading"><p>{t.company.closing}</p><h2>{rtl ? "لنصنع تجربة تعلّم ذات أثر." : "Let’s shape learning with impact."}</h2></div><div className="hp-contact__details"><p>{t.company.contactHeading}</p><a href={`mailto:${t.company.email}`}>{t.company.email}</a>{t.company.phones.map((phone)=><a key={phone} href={`tel:${phone}`}>{phone}</a>)}<span>{t.company.address}</span></div><a className="hp-contact__action" href={`mailto:${t.company.email}`}>{rtl ? "تواصل مع تجسير" : "Contact Tajseer"}<span aria-hidden="true">↗</span></a><p className="hp-contact__legal">© TAJSEER AL FIKR</p></footer>
    </main>
  );
}
