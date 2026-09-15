import {
  ArrowLeft,
  ArrowRight,
  Expand,
  RotateCcw,
  Rotate3D,
  Ruler,
  X,
} from "lucide-react";
import { joints, members, memberById, memberLength } from "./lesson";
import { copy } from "./copy";
import { useLesson, lessonStore, resetExperiment } from "./state";
export function ExperimentControls() {
  const s = useLesson(),
    t = (copy[s.lang] as any).stem ?? copy[s.lang],
    m = memberById(s.selected);

  return (
    <div className="experiment-ui" id="lesson-controls" tabIndex={-1}>
      <div className="experiment-tools">
        <div className="compare-tools">
          <span className="eyebrow">{t.compare}</span>
          <div className="segmented" role="group" aria-label={t.compare}>
            <button
              aria-pressed={!s.braced}
              onClick={() =>
                lessonStore.set({ braced: false, selected: "", shear: 0.65 })
              }
            >
              {t.unbraced}
            </button>
            <button
              aria-pressed={s.braced}
              onClick={() => lessonStore.set({ braced: true, shear: 0 })}
            >
              {t.braced}
            </button>
          </div>
          <p className="comparison-note">
            {s.braced ? t.bracedNote : t.unbracedNote}
          </p>
          <label className="range-label">
            {t.shear}
            <input
              aria-label={t.shear}
              type="range"
              min="0"
              max="1"
              step=".01"
              value={s.shear}
              disabled={s.braced}
              onChange={(e) =>
                lessonStore.set({ shear: Number(e.target.value) })
              }
            />
          </label>
        </div>
        <div className="manipulation-tools">
          <span className="eyebrow">{t.manipulate}</span>
          <button
            className={`tool-button rotation-tool ${s.inspect ? "active" : ""}`}
            aria-pressed={s.inspect}
            onClick={() => lessonStore.set({ inspect: !s.inspect })}
          >
            {s.inspect ? <X size={17} /> : <Rotate3D size={17} />}{" "}
            {s.inspect ? t.stopInspect : t.inspect}
          </button>
          <label className="range-label">
            <span>
              <Expand size={15} /> {t.explode}
            </span>
            <input
              aria-label={t.explode}
              type="range"
              min="0"
              max="1"
              step=".01"
              value={s.explode}
              onChange={(e) =>
                lessonStore.set({ explode: Number(e.target.value) })
              }
            />
          </label>
          <div className="tool-row">
            <button
              className="tool-button"
              aria-pressed={s.dimensions}
              onClick={() => lessonStore.set({ dimensions: !s.dimensions })}
            >
              <Ruler size={16} />
              {t.dimensions}
            </button>
            <button
              className="icon-tool"
              aria-label={t.reassemble}
              title={t.reassemble}
              onClick={() => lessonStore.set({ explode: 0 })}
            >
              <Expand size={17} />
            </button>
          </div>
          <div className="tool-row">
            <button
              className="icon-tool"
              aria-label={t.rotateLeft}
              onClick={() => lessonStore.set({ yaw: s.yaw - 0.25 })}
            >
              <ArrowLeft size={17} />
            </button>
            <button
              className="tool-button"
              onClick={() => lessonStore.set({ yaw: 0, pitch: 0 })}
            >
              {t.view}
            </button>
            <button
              className="icon-tool"
              aria-label={t.rotateRight}
              onClick={() => lessonStore.set({ yaw: s.yaw + 0.25 })}
            >
              <ArrowRight size={17} />
            </button>
          </div>
          <button className="text-button" onClick={resetExperiment}>
            <RotateCcw size={14} />
            {t.reset}
          </button>
        </div>
      </div>
      <div className="component-study">
        <label className="eyebrow" htmlFor="component-select">
          {t.select}
        </label>
        <select
          id="component-select"
          value={s.selected}
          onChange={(e) => lessonStore.set({ selected: e.target.value })}
        >
          <option value="">{t.none}</option>
          {joints
            .filter((j) => !s.reading || j.id < "E")
            .map((j) => (
              <option key={j.id} value={j.id}>
                {s.lang === "ar" ? "مفصل" : "Joint"} {j.id}
              </option>
            ))}
          {members
            .filter(
              (m) =>
                !s.reading ||
                ["M01", "M02", "M03", "M04", "M13"].includes(m.id),
            )
            .filter((m) => !m.brace || s.braced)
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.id} · {m.a}—{m.b}
              </option>
            ))}
        </select>
        <div className="selection-copy" aria-live="polite">
          <strong dir="ltr">{s.selected || "A → B → C"}</strong>
          <p>
            {s.selected
              ? m
                ? m.brace
                  ? t.brace
                  : t.member
                : t.joint
              : t.ready}
          </p>
          {s.dimensions && m && (
            <span className="measure" dir="ltr">
              {m.a}—{m.b} / {memberLength(m).toFixed(2)} u
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
