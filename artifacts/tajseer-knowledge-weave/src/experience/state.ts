import { useSyncExternalStore } from "react";
import { clamp, type Act, acts, actAt } from "./timeline";
export type Language = "en" | "ar";
export type LessonState = {
  progress: number;
  lang: Language;
  selected: string;
  braced: boolean;
  explode: number;
  dimensions: boolean;
  shear: number;
  inspect: boolean;
  yaw: number;
  pitch: number;
  layer: number;
  station: number;
  reduced: boolean;
  reading: boolean;
  mobile: boolean;
  visible: boolean;
};
let state: LessonState = {
  progress: 0,
  lang: new URLSearchParams(location.search).get("lang") === "ar" ? "ar" : "en",
  selected: "",
  braced: true,
  explode: 0,
  dimensions: false,
  shear: 0,
  inspect: false,
  yaw: 0,
  pitch: 0,
  layer: 0,
  station: 0,
  reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
  reading: new URLSearchParams(location.search).has("reading"),
  mobile: matchMedia("(max-width: 760px)").matches,
  visible: true,
};
const listeners = new Set<() => void>();
let reactSnapshot = state;
const renderPhase = (p: number) =>
  `${actAt(p)}:${[0.14, 0.29, 0.44, 0.60, 0.72, 0.78, 0.90, 0.95].map((at) => (p > at ? 1 : 0)).join("")}`;
export const lessonStore = {
  get: () => state,
  getReact: () => reactSnapshot,
  set(patch: Partial<LessonState>) {
    const changed = Object.keys(patch).some(
      (key) =>
        key !== "progress" &&
        state[key as keyof LessonState] !== patch[key as keyof LessonState],
    );
    const phase = renderPhase(state.progress);
    state = { ...state, ...patch };
    // Continuous progress drives refs, not React reconciliation of the whole world.
    if (changed || phase !== renderPhase(state.progress)) reactSnapshot = state;
    listeners.forEach((fn) => fn());
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};
export const useLesson = () =>
  useSyncExternalStore(lessonStore.subscribe, lessonStore.getReact);
export function resetExperiment() {
  lessonStore.set({
    inspect: false,
    selected: "",
    braced: true,
    explode: 0,
    dimensions: false,
    shear: 0,
    yaw: 0,
    pitch: 0,
  });
}
export function jumpTo(id: Act) {
  const at = acts.find((a) => a.id === id)!.at;
  history.replaceState(
    null,
    "",
    `${location.pathname}${location.search}#${id}`,
  );
  lessonStore.set({ inspect: false });
  window.scrollTo({
    top: at * Math.max(1, document.documentElement.scrollHeight - innerHeight),
    behavior: "instant",
  });
}
export function setProgress() {
  const progress = clamp(
    scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight),
  );
  lessonStore.set({
    progress,
    // Auto-dismiss inspect mode outside the STEM chapter (0.44–0.60)
    ...(progress < 0.44 || progress >= 0.60 ? { inspect: false } : {}),
  });
}
