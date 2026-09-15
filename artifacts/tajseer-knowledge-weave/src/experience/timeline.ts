// Tajseer Learning World — 8-chapter service narrative timeline
// Progress ranges: hero 0–14%, multimedia 14–29%, courses 29–44%,
// stem 44–60%, arvr 60–78%, guidance 78–90%, mission 90–95%, company 95–100%

export type Act =
  | "hero"
  | "multimedia"
  | "courses"
  | "stem"
  | "arvr"
  | "guidance"
  | "mission"
  | "company";

export const acts: { id: Act; at: number; en: string; ar: string }[] = [
  { id: "hero", at: 0, en: "Tajseer", ar: "تجسير" },
  { id: "multimedia", at: 0.14, en: "Interactive Multimedia", ar: "وسائط متعددة تفاعلية" },
  { id: "courses", at: 0.29, en: "E-learning Courses", ar: "المقررات الإلكترونية" },
  { id: "stem", at: 0.44, en: "STEM Methodology", ar: "منهجية STEM" },
  { id: "arvr", at: 0.60, en: "AR and VR Environments", ar: "بيئات AR و VR" },
  { id: "guidance", at: 0.78, en: "Training and Consulting", ar: "التدريب والاستشارات" },
  { id: "mission", at: 0.90, en: "Mission and Vision", ar: "الرسالة والرؤية" },
  { id: "company", at: 0.95, en: "Tajseer", ar: "تجسير" },
];

export const clamp = (v: number) => Math.max(0, Math.min(1, v));

export const blend = (p: number, a: number, b: number) => {
  const t = clamp((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export const actAt = (p: number): Act =>
  p < 0.14
    ? "hero"
    : p < 0.29
      ? "multimedia"
      : p < 0.44
        ? "courses"
        : p < 0.60
          ? "stem"
          : p < 0.78
            ? "arvr"
            : p < 0.90
              ? "guidance"
              : p < 0.95
                ? "mission"
                : "company";

// Pose describes how the folio and world transform through the journey
export function poseAt(p: number, mobile: boolean) {
  // Folio fades away as we enter the immersive environment
  const folioPresence = 1 - blend(p, 0.56, 0.72);
  // Immersive depth for AR/VR chapter
  const enter = blend(p, 0.60, 0.85);
  // STEM chapter closeness
  const stemFocus = blend(p, 0.44, 0.52) * (1 - blend(p, 0.56, 0.63));
  // Layer separation for multimedia chapter
  const layerOpen = blend(p, 0.14, 0.22) * (1 - blend(p, 0.26, 0.35));

  return {
    folioPresence,
    enter,
    stemFocus,
    layerOpen,
    scale: 1 + enter * (mobile ? 1.6 : 2.2),
    // Legacy compat names for existing components
    depth: stemFocus,
    paper: folioPresence,
    layer: layerOpen,
  };
}

type Shot = {
  at: number;
  eye: [number, number, number];
  target: [number, number, number];
  fov: number;
};

// Cinematic camera spline — purposeful, slow, educational storytelling
// Hero: elevated three-quarter view of open folio
// Multimedia: shallow lateral movement reveals media depth
// Courses: oblique overview, sequencing becomes readable
// STEM: lower, closer, tactile inspection
// AR/VR: approach expanding planes, cross into space, settle at human height
// Guidance: slow upward pull, stations settle into pathway
// Company: return to composed folio view with generous reading space
const shots: Shot[] = [
  // 0.00 — Hero: close three-quarter elevated view
  { at: 0.00, eye: [7.8, 10.5, 12.5], target: [-1.5, -0.5, 0], fov: 40 },
  // 0.14 — Multimedia approach: slight dolly in and lateral
  { at: 0.14, eye: [6.5, 8.0, 12.0], target: [-0.8, -0.2, 0], fov: 40 },
  // 0.29 — Courses: rise to oblique overview
  { at: 0.29, eye: [5.5, 9.5, 11.0], target: [0, 0.5, 0], fov: 42 },
  // 0.44 — STEM: lower to tactile inspection
  { at: 0.44, eye: [4.5, 4.2, 11.5], target: [0.5, -0.5, 0], fov: 38 },
  // 0.60 — AR/VR begins: approach expanding plane
  { at: 0.60, eye: [2.0, 2.8, 12.0], target: [0, 0, -2], fov: 46 },
  // 0.72 — AR/VR: crossing into the educational space
  { at: 0.72, eye: [0.4, 1.2, 8.0], target: [0, 0.5, -6], fov: 54 },
  // 0.85 — Guidance: slow upward pull
  { at: 0.85, eye: [1.5, 3.5, 8.0], target: [0, 1.0, -12], fov: 50 },
  // 0.95 — Company: return to composed folio, generous reading space
  { at: 0.95, eye: [6.0, 7.5, 13.0], target: [-0.5, 0, 0], fov: 42 },
  // 1.00 — Final: settled company view
  { at: 1.00, eye: [5.5, 7.0, 13.5], target: [-0.5, 0.5, 0], fov: 40 },
];

export function cameraAt(p: number, mobile: boolean) {
  let i = 0;
  while (i < shots.length - 2 && p > shots[i + 1].at) i++;
  const a = shots[i],
    b = shots[i + 1],
    t = blend(p, a.at, b.at);
  const eye = a.eye.map((v, j) => v + (b.eye[j] - v) * t) as Shot["eye"];
  const target = a.target.map(
    (v, j) => v + (b.target[j] - v) * t,
  ) as Shot["target"];

  if (mobile) {
    // Mobile: pull back slightly to keep folio readable
    const framing = 1 - blend(p, 0.58, 0.72);
    eye[0] *= 1 + 0.7 * framing;
    eye[1] *= 1 + 0.5 * framing;
    eye[2] *= 1 + 0.8 * framing;
    target[1] -= 0.8 * blend(p, 0.29, 0.44) * framing;
  }
  return { eye, target, fov: a.fov + (b.fov - a.fov) * t };
}
