import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { ErrorBoundary } from "../components/error-boundary";
import "./checkpoints.css";
const Scene = lazy(() => import("./Scene"));
const names = {
  en: ["Living knowledge", "Interactive multimedia", "Immersive learning"],
  ar: ["المعرفة الحيّة", "الوسائط المتعددة التفاعلية", "التعلّم الغامر"],
};
const source = {
  en: [
    "Tajseer is a company specialized in the development of Elearning courses, distance learning and training, virtual reality, STEM methodology, and training/educational consultancy based on the needs of real and virtual e-learning solutions.",
    "At Tajseer, designers have a wide imagination to develop professional graphic interfaces, keeping eye on the details and the selection of colors, contrast and connotations, in order to produce the best designs, graphics, user interfaces and interactive activities. We produces professional clips that include video and audio recordings, in addition to developing animations and motion graphics.",
    "Tajseer keeps pace with the rapid developments in real and virtual education and training technologies, as it provides services for designing and developing virtual laboratories for technical and vocational education and training using (360 image, augmented reality-AR, virtual reality-VR) technologies. We also developing 2D/3D educational games and employing VR technologies and holograms in composing lessons based on the STEM methodology",
  ],
  ar: [
    "تجسير الفكر شركة متخصصة في مجال تطوير المقررات الإلكترونية والتعلم والتدريب عن بعد والواقع الافتراضي ومنهجية ستيم والاستشارات التعليمية والتربوية، وتعمل على تلبية احتياجات حلول التعليم الإلكتروني الواقعي والافتراضي.",
    "يتمتع المصممون في تجسير بخيال واسع لتطوير واجهات رسوم احترافية مع الاهتمام بالتفاصيل وانتقاء الألوان وتباينها ودلالاتها، وذلك لإنتاج أفضل التصاميم والرسوم وواجهات المستخدم والأنشطة التفاعلية، كما يتم انتاج مقاطع احترافية تشمل تسجيلات الفيديو والمقاطع الصوتية، بالإضافة إلى تطوير الرسوم المتحركة (أنيميشن) والصور المتحركة (Motion Graphics)",
    "تواكب تجسير التطورات المتسارعة في تقنيات التعليم و التدريب الواقعي والافتراضي، حيث تقدم خدمات تصميم وتطوير مختبرات افتراضية للتعلم المهني من خلال استخدام تقنيات (360 image ، الواقع المعزز-AR ، الواقع الافتراضي-VR) كما تعمل على تطوير الألعاب التعليمية 2D/3D وتوظيف تقنيات VR والهولوغرام في تأليف دروس مبينة على منهجية STEM",
  ],
};
export default function Checkpoints() {
  const [ar, setAr] = useState(
    new URLSearchParams(location.search).get("lang") === "ar",
  );
  const [inspect, setInspect] = useState(false),
    [angle, setAngle] = useState(0);
  const drag = useRef<number | null>(null);
  const [p, setP] = useState(0),
    [selected, select] = useState(0),
    [scrub, setScrub] = useState(0.5),
    [reduced, reduce] = useState(
      matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    [reading, read] = useState(
      new URLSearchParams(location.search).has("reading"),
    );
  const stage = p < 0.28 ? 0 : p < 0.7 ? 1 : 2,
    lang = ar ? "ar" : "en";
  const jump = (i: number) => {
    history.replaceState(
      null,
      "",
      `?lang=${lang}#${["hero", "multimedia", "immersive"][i]}`,
    );
    window.scrollTo({
      top:
        [0, 0.48, 1][i] * (document.documentElement.scrollHeight - innerHeight),
      behavior: "instant",
    });
  };
  useEffect(() => {
    const fn = () =>
      setP(
        scrollY /
          Math.max(1, document.documentElement.scrollHeight - innerHeight),
      );
    addEventListener("scroll", fn, { passive: true });
    const i = ["hero", "multimedia", "immersive"].indexOf(
      location.hash.slice(1),
    );
    if (i >= 0) jump(i);
    fn();
    return () => removeEventListener("scroll", fn);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = ar ? "rtl" : "ltr";
    document.title = ar
      ? "تجسير — المعرفة الحيّة"
      : "Tajseer — Living knowledge";
  }, [ar]);
  const labels =
    stage === 2
      ? ar
        ? ["أنظمة حيّة", "مقطع طبقي", "وسائط مكانية"]
        : ["Living systems", "Cross-section", "Spatial media"]
      : stage === 1
        ? ar
          ? ["الرسم", "الطبقات", "الحركة"]
          : ["Illustration", "Layers", "Motion"]
        : ar
          ? ["لاحظ", "اربط", "اكتشف"]
          : ["Observe", "Connect", "Discover"];
  return (
    <main className={`checkpoint cp-${stage}`} dir={ar ? "rtl" : "ltr"}>
      <div
        className="cp-world"
        style={{
          touchAction: inspect ? "none" : "pan-y",
          cursor: inspect ? "grab" : undefined,
        }}
        onPointerDown={(e) => {
          if (inspect) {
            drag.current = e.clientX;
            e.currentTarget.setPointerCapture(e.pointerId);
          }
        }}
        onPointerMove={(e) => {
          if (drag.current !== null) {
            setAngle((a) => a + (e.clientX - drag.current!) * 0.008);
            drag.current = e.clientX;
          }
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        {!reading && (
          <ErrorBoundary onError={() => read(true)}>
            <Suspense fallback={null}>
              <Scene
                ar={ar}
                angle={angle}
                progress={p}
                selected={selected}
                select={select}
                scrub={scrub}
                reduced={reduced}
                onFailure={() => read(true)}
              />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>
      <header className="cp-header">
        <button onClick={() => jump(0)} aria-label="Tajseer">
          <img
            src={`${import.meta.env.BASE_URL}assets/tajseer/${ar ? "arabic-logo.png" : "TajsserLogo.bc8c31e3b431f4abdefcf79540d093dc.svg"}`}
            alt={ar ? "تجسير" : "Tajseer"}
          />
        </button>
        <span>
          {ar
            ? "التعليم · التقنية · التفكير"
            : "EDUCATION · TECHNOLOGY · THINKING"}
        </span>
        <div>
          <button onClick={() => reduce(!reduced)} aria-pressed={reduced}>
            {ar ? "تقليل الحركة" : "Reduce motion"}
          </button>
          <button onClick={() => read(!reading)} aria-pressed={reading}>
            {ar ? "القراءة" : "Reading"}
          </button>
          <button
            onClick={() => {
              setAr(!ar);
              history.replaceState(
                null,
                "",
                `?lang=${ar ? "en" : "ar"}${location.hash}`,
              );
            }}
          >
            {ar ? "EN" : "عربي"}
          </button>
        </div>
      </header>
      <section className="cp-copy" key={stage}>
        <p className="cp-eyebrow">TAJSEER / 0{stage + 1}</p>
        <h1>
          {ar
            ? ["المعرفة،", "محتوى يتجاوز", "داخل"][stage]
            : ["Knowledge,", "Beyond", "Inside"][stage]}
          <em>
            {ar
              ? ["بأبعاد جديدة.", "حدود الصفحة.", "المعرفة."][stage]
              : ["in new dimensions.", "the printed page.", "the learning."][
                  stage
                ]}
          </em>
        </h1>
        <p className="cp-intro">
          {ar
            ? [
                "تطوير المقررات الإلكترونية والتعلّم والتدريب عن بعد.",
                "التصاميم والرسوم والأنشطة التفاعلية، والرسوم المتحركة.",
                "بيئات الواقع المعزز AR والافتراضي VR.",
              ][stage]
            : [
                "E-learning course development, distance learning and training.",
                "Graphics, interactive activities, animation and motion graphics.",
                "AR and VR environments for education and training.",
              ][stage]}
        </p>
        <details>
          <summary>
            {ar ? "عن تجسير وخدماتها" : "About Tajseer’s services"}
          </summary>
          <p>{source[lang][stage]}</p>
        </details>
        {stage === 0 && (
          <button className="cp-primary" onClick={() => jump(1)}>
            {ar ? "استكشف المحتوى" : "Explore the content"} ↗
          </button>
        )}
      </section>
      <aside className="cp-tools">
        <span className="cp-eyebrow">
          {ar ? "استكشف العلاقة" : "EXPLORE THE RELATIONSHIP"}
        </span>
        <div>
          {labels.map((l, i) => (
            <button
              key={i}
              aria-pressed={i === selected}
              onClick={() => select(i)}
            >
              {`0${i + 1}`} {l}
            </button>
          ))}
        </div>
        <button
          className="cp-inspect"
          aria-pressed={inspect}
          onClick={() => setInspect(!inspect)}
        >
          {ar ? "اسحب للاستكشاف" : "Drag to inspect"}
        </button>
        <button className="cp-inspect" onClick={() => setAngle(0)}>
          {ar ? "إعادة المنظر" : "Reset view"}
        </button>
        <label>
          {ar
            ? "حرّك لتكشف طبقات المعرفة"
            : "Scrub to reveal the learning layers"}
          <input
            aria-label={ar ? "طبقات المعرفة" : "Learning layers"}
            type="range"
            min="0"
            max="1"
            step=".01"
            value={scrub}
            onChange={(e) => setScrub(+e.target.value)}
          />
        </label>
        <p aria-live="polite">
          {stage === 2
            ? (ar
                ? [
                    "الأوراق والساق والجذور: أجزاء مترابطة في نظام حيّ.",
                    "افصل حلقات المقطع لتكشف الطبقات الداخلية.",
                    "حرّك المؤشر لتتتبّع تغيّر التمثيل البصري.",
                  ]
                : [
                    "Leaves, stem and roots: connected parts of a living system.",
                    "Separate the cross-section rings to reveal its inner layers.",
                    "Scrub the sequence to follow changes in the visual representation.",
                  ])[selected]
            : (ar
                ? [
                    "الرسم يربط الشكل بالشرح.",
                    "فصل الطبقات يكشف ما وراء السطح.",
                    "الحركة تشرح التغيّر عبر الزمن.",
                  ]
                : [
                    "Illustration connects the form to its explanation.",
                    "Separating layers reveals what lies beneath the surface.",
                    "Motion explains change over time.",
                  ])[selected]}
        </p>
      </aside>
      {reading && (
        <div className="cp-reading">
          <h2>{names[lang][stage]}</h2>
          <svg
            viewBox="0 0 500 220"
            role="img"
            aria-label={
              ar ? "طبقات شرح تعليمية" : "Educational explanation layers"
            }
          >
            {[0, 1, 2].map((i) => (
              <g
                key={i}
                transform={`translate(${30 + i * 135},${40 + (2 - i) * scrub * 20})`}
              >
                <rect
                  width="115"
                  height="110"
                  rx="8"
                  fill={selected === i ? "#147faf" : "#d8e6df"}
                />
                <text x="40" y="60" fill={selected === i ? "white" : "#174052"}>
                  0{i + 1}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}
      <footer className="cp-nav">
        <nav aria-label={ar ? "مشاهد المراجعة" : "Review checkpoints"}>
          {names[lang].map((n, i) => (
            <button
              key={i}
              aria-current={stage === i ? "step" : undefined}
              onClick={() => jump(i)}
            >
              <small>0{i + 1}</small>
              {n}
            </button>
          ))}
        </nav>
        <span>
          {ar
            ? "تصوّر تعليمي توضيحي · مراجعة بصرية"
            : "ILLUSTRATIVE LEARNING CONTENT · VISUAL REVIEW"}
        </span>
      </footer>
      <div className="cp-scroll" />
    </main>
  );
}
