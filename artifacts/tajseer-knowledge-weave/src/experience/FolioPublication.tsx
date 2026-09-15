/**
 * FolioPublication — Tajseer Learning World
 *
 * The dimensional educational publication that anchors the entire experience.
 * Replaces LessonSurface.tsx.
 *
 * Visual structure:
 *   - Primary folio body (stacked leaves with depth)
 *   - Canvas-textured primary spread (real Tajseer service content)
 *   - Raised botanical illustration (Canvas2D — labeled demonstration)
 *   - Translucent acetate explanatory leaf
 *   - Media inset (satin surface, responds to hover)
 *   - Tajseer blue binding edge
 *   - 3–4 receding background lesson leaves
 *
 * All geometry uses appropriate forms for what it represents — book pages
 * are correctly BoxGeometry / PlaneGeometry. Quality comes from canvas-rendered
 * educational content, materials, lighting and composition.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  CanvasTexture,
  Group,
  Mesh,
  MeshStandardMaterial,
  SRGBColorSpace,
} from "three";
import { lessonStore, useLesson } from "./state";
import { poseAt } from "./timeline";

// ---------------------------------------------------------------------------
// Canvas texture generators — deterministic, no external assets
// ---------------------------------------------------------------------------

/** Primary folio spread — Tajseer service content with ultra-high resolution */
function makeFolioTexture(ar: boolean): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = 1365;
  const x = c.getContext("2d")!;

  // Premium warm ivory paper background with subtle radial vignette
  const grad = x.createRadialGradient(1024, 682, 200, 1024, 682, 1200);
  grad.addColorStop(0, "#f9f5ec");
  grad.addColorStop(1, "#eee6d6");
  x.fillStyle = grad;
  x.fillRect(0, 0, 2048, 1365);

  // Micro paper texture grain
  for (let i = 0; i < 9000; i++) {
    x.fillStyle = `rgba(100,80,55,${0.01 + (i % 5) * 0.003})`;
    x.fillRect((i * 157) % 2048, (i * 211) % 1365, 1, 1);
  }

  // Double architectural frame line
  x.strokeStyle = "#c2d4ce";
  x.lineWidth = 2;
  x.strokeRect(48, 48, 1952, 1269);
  x.strokeStyle = "rgba(55,181,176,0.3)";
  x.lineWidth = 1;
  x.strokeRect(56, 56, 1936, 1253);

  // Tajseer deep teal binding stripe (left for EN, right for AR)
  const bindX = ar ? 1996 : 0;
  x.fillStyle = "#14505c";
  x.fillRect(bindX, 0, 52, 1365);
  x.fillStyle = "#37b5b0";
  x.fillRect(bindX + (ar ? 0 : 44), 0, 8, 1365);

  // Running header separator rule
  x.strokeStyle = "#cdd9d4";
  x.lineWidth = 1.5;
  x.beginPath();
  x.moveTo(110, 145);
  x.lineTo(1938, 145);
  x.stroke();

  // Running header typography
  x.font = "600 24px 'DM Sans', system-ui, sans-serif";
  x.fillStyle = "#147b80";
  if (ar) {
    x.textAlign = "right";
    x.fillText("تجسير  /  منظومة التعلّم التفاعلي", 1938, 105);
    x.textAlign = "left";
    x.font = "600 22px monospace";
    x.fillText("EDITION 2026", 110, 105);
  } else {
    x.textAlign = "left";
    x.fillText("TAJSEER  /  THE INTERACTIVE LEARNING SYSTEM", 110, 105);
    x.textAlign = "right";
    x.font = "600 22px monospace";
    x.fillText("EDITION 2026", 1938, 105);
  }
  x.textAlign = "left";

  // Main spatial title & positioning
  if (ar) {
    x.font = "700 76px 'Cairo', 'Amiri', serif";
    x.fillStyle = "#0c2830";
    x.textAlign = "right";
    x.fillText("محتوى تعليمي.", 1938, 250);
    x.fillStyle = "#147b80";
    x.fillText("تجارب تفاعلية مدعومة بالتقنية.", 1938, 340);
    x.textAlign = "left";
  } else {
    x.font = "500 72px 'Instrument Serif', Georgia, serif";
    x.fillStyle = "#0c2830";
    x.fillText("Educational content.", 110, 250);
    x.fillStyle = "#147b80";
    x.fillText("Interactive experiences.", 110, 340);
  }

  // Supporting body copy
  x.font = "400 22px 'DM Sans', system-ui, sans-serif";
  x.fillStyle = "#46656c";
  const desc1 = ar
    ? "منذ عام ٢٠٠٩، تقود تجسير تطوير المشاريع التعليمية والمحتوى التفاعلي بالمملكة العربية السعودية."
    : "Since 2009, Tajseer leads the development of interactive e-learning and educational technology in KSA.";
  const desc2 = ar
    ? "نحوّل المعرفة النظرية إلى بيئات تعلّم مجسّمة، وسائط متطورة، وتجارب استكشافية غنية."
    : "We transform theoretical knowledge into spatial learning environments, multimedia, and exploration.";

  if (ar) {
    x.textAlign = "right";
    x.fillText(desc1, 1938, 415);
    x.fillText(desc2, 1938, 455);
    x.textAlign = "left";
  } else {
    x.fillText(desc1, 110, 415);
    x.fillText(desc2, 110, 455);
  }

  // Thin separator rule
  x.strokeStyle = "#c5d5d0";
  x.lineWidth = 1;
  x.beginPath();
  x.moveTo(ar ? 700 : 110, 495);
  x.lineTo(ar ? 1938 : 1200, 495);
  x.stroke();

  // Service Index
  const services = ar
    ? [
        "٠١  الوسائط المتعددة التفاعلية — Visual Interactive Content",
        "٠٢  تطوير المقررات الإلكترونية — Digital Course Systems",
        "٠٣  منهجية STEM والختبرات — Interactive Laboratory",
        "٠٤  بيئات الواقع المعزز والافتراضي — Immersive Spatial AR/VR",
        "٠٥  التدريب والاستشارات التعليمية — Educational Consulting",
      ]
    : [
        "01  Interactive Multimedia — Visual Spatial Content",
        "02  E-learning Course Development — Digital Systems",
        "03  STEM Methodology — Interactive Experimentation",
        "04  AR & VR Environments — Immersive Spatial Learning",
        "05  Training & Consulting — Guidance & Transformation",
      ];

  x.font = "600 20px 'DM Sans', sans-serif";
  services.forEach((s, i) => {
    const y = 555 + i * 46;
    if (ar) {
      x.textAlign = "right";
      x.fillStyle = "#147b80";
      x.fillText(s, 1938, y);
    } else {
      x.textAlign = "left";
      x.fillStyle = "#147b80";
      x.fillText(s, 110, y);
    }
  });
  x.textAlign = "left";

  // Conceptual tagline at footer
  x.font = "600 20px 'DM Sans', sans-serif";
  x.fillStyle = "#147b80";
  if (ar) {
    x.textAlign = "right";
    x.fillText("التفكير  ×  التقنية  ×  التعليم", 1938, 1285);
    x.textAlign = "left";
    x.font = "600 18px monospace";
    x.fillStyle = "#7a9b95";
    x.fillText("01 / 08", 110, 1285);
  } else {
    x.fillText("THINKING  ×  TECHNOLOGY  ×  EDUCATION", 110, 1285);
    x.textAlign = "right";
    x.font = "600 18px monospace";
    x.fillStyle = "#7a9b95";
    x.fillText("01 / 08", 1938, 1285);
    x.textAlign = "left";
  }

  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 16;
  return t;
}

/** Background lesson leaf texture — smaller, receding */
function makeLeafTexture(index: number): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 768;
  c.height = 512;
  const x = c.getContext("2d")!;

  // Progressively cooler paper
  const warmth = Math.max(0, 230 - index * 8);
  x.fillStyle = `rgb(${warmth},${warmth - 8},${warmth - 20})`;
  x.fillRect(0, 0, 768, 512);

  // Subtle grain
  for (let i = 0; i < 2000; i++) {
    x.fillStyle = `rgba(60,50,40,${0.018 + (i % 3) * 0.004})`;
    x.fillRect((i * 127) % 768, (i * 193) % 512, 1, 1);
  }

  // Border
  x.strokeStyle = `rgba(180,195,185,0.6)`;
  x.lineWidth = 1;
  x.strokeRect(20, 20, 728, 472);

  // Minimal typographic content (text texture)
  x.font = "400 13px monospace";
  x.fillStyle = `rgba(80,110,105,0.5)`;
  const lines = [
    `0${index + 2} / SECTION`,
    "",
    "Learning transforms when content",
    "becomes interactive experience.",
    "",
    "Tajseer — Educational Technology",
  ];
  lines.forEach((l, i) => x.fillText(l, 35, 60 + i * 22));

  // Small diagram lines (horizontal rules simulating text)
  for (let i = 0; i < 8; i++) {
    const y = 220 + i * 24;
    const w = 100 + (index * 47 + i * 63) % 480;
    x.strokeStyle = `rgba(120,160,150,${0.2 + (i % 3) * 0.05})`;
    x.lineWidth = 1;
    x.beginPath();
    x.moveTo(35, y);
    x.lineTo(35 + w, y);
    x.stroke();
  }

  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Botanical illustration — procedural Canvas2D, labeled demonstration */
function makeBotanicalTexture(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 720;
  const x = c.getContext("2d")!;

  // Warm paper ground
  x.fillStyle = "#f0ebe0";
  x.fillRect(0, 0, 512, 720);

  // Paper grain
  for (let i = 0; i < 2500; i++) {
    x.fillStyle = `rgba(80,65,45,${0.012 + (i % 3) * 0.003})`;
    x.fillRect((i * 113) % 512, (i * 179) % 720, 1, 1);
  }

  const cx = 256, cy = 640;

  // Root system
  x.strokeStyle = "#8a9e7a";
  x.lineWidth = 2;
  for (let i = -3; i <= 3; i++) {
    x.beginPath();
    x.moveTo(cx, cy);
    x.bezierCurveTo(
      cx + i * 30, cy + 30,
      cx + i * 50, cy + 60,
      cx + i * 40 + (i > 0 ? 20 : -20), cy + 80
    );
    x.stroke();
  }

  // Main stem
  x.strokeStyle = "#6a8a60";
  x.lineWidth = 3;
  x.beginPath();
  x.moveTo(cx, cy);
  x.bezierCurveTo(cx - 8, cy - 200, cx + 10, cy - 400, cx - 4, cy - 580);
  x.stroke();

  // Leaves at intervals
  const leafPositions = [
    { t: 0.15, side: -1, size: 55 },
    { t: 0.28, side: 1, size: 70 },
    { t: 0.42, side: -1, size: 80 },
    { t: 0.55, side: 1, size: 85 },
    { t: 0.68, side: -1, size: 75 },
    { t: 0.78, side: 1, size: 60 },
    { t: 0.88, side: -1, size: 48 },
  ];

  leafPositions.forEach(({ t, side, size }) => {
    const lx = cx - 4 + (side * 15);
    const ly = cy - t * 580;
    const angle = side * (Math.PI / 4 + t * 0.3);

    x.strokeStyle = "#7aaa68";
    x.fillStyle = `rgba(140,185,120,${0.35 + t * 0.2})`;
    x.lineWidth = 1.5;
    x.beginPath();
    x.ellipse(
      lx + Math.cos(angle) * size * 0.5,
      ly + Math.sin(angle) * size * 0.3,
      size,
      size * 0.35,
      angle,
      0, Math.PI * 2
    );
    x.fill();
    x.stroke();

    // Leaf vein
    x.strokeStyle = `rgba(90,130,80,0.5)`;
    x.lineWidth = 1;
    x.beginPath();
    x.moveTo(lx, ly);
    x.lineTo(
      lx + Math.cos(angle) * size * 0.9,
      ly + Math.sin(angle) * size * 0.3
    );
    x.stroke();
  });

  // Annotation lines and labels
  x.font = "11px monospace";
  x.fillStyle = "#5a8070";
  x.strokeStyle = "#a0bfb0";
  x.lineWidth = 0.5;

  const annotations = [
    { y: cy - 80, label: "ROOT" },
    { y: cy - 240, label: "STEM" },
    { y: cy - 420, label: "LEAF" },
    { y: cy - 560, label: "APEX" },
  ];

  annotations.forEach(({ y, label }) => {
    x.beginPath();
    x.moveTo(cx + 20, y);
    x.lineTo(cx + 80, y);
    x.stroke();
    x.fillText(label, cx + 85, y + 4);
  });

  // Demonstration label at bottom
  x.font = "10px sans-serif";
  x.fillStyle = "#8aab98";
  x.textAlign = "center";
  x.fillText("[ILLUSTRATIVE DEMONSTRATION CONTENT]", cx, 710);
  x.textAlign = "left";

  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Media inset texture */
function makeMediaTexture(ar: boolean): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 288;
  const x = c.getContext("2d")!;

  x.fillStyle = "#e8ede8";
  x.fillRect(0, 0, 512, 288);

  // Subtle horizontal bands (media surface quality)
  for (let i = 0; i < 12; i++) {
    x.fillStyle = `rgba(200,220,210,${0.05 + i * 0.01})`;
    x.fillRect(0, i * 24, 512, 12);
  }

  x.font = "500 15px 'DM Sans', sans-serif";
  x.fillStyle = "#247e84";
  x.textAlign = "center";
  x.fillText(ar ? "وسائط تفاعلية" : "Interactive Media", 256, 100);
  x.font = "400 12px 'DM Sans', sans-serif";
  x.fillStyle = "#6a9090";
  x.fillText(ar ? "— شكل توضيحي —" : "— illustrative demonstration —", 256, 128);

  // Play icon suggestion
  x.strokeStyle = "#247e84";
  x.lineWidth = 1.5;
  x.beginPath();
  x.arc(256, 180, 28, 0, Math.PI * 2);
  x.stroke();
  x.fillStyle = "#247e84";
  x.beginPath();
  x.moveTo(248, 168);
  x.lineTo(248, 192);
  x.lineTo(270, 180);
  x.closePath();
  x.fill();

  x.textAlign = "left";

  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FolioPublication() {
  const { lang, station } = useLesson();
  const ar = lang === "ar";
  const { gl } = useThree();

  // Textures
  const folioTex = useMemo(() => makeFolioTexture(ar), [ar]);
  const botanicalTex = useMemo(() => makeBotanicalTexture(), []);
  const mediaTex = useMemo(() => makeMediaTexture(ar), [ar]);
  const leafTextures = useMemo(() => [0, 1, 2, 3].map(makeLeafTexture), []);

  // Refs for animation
  const root = useRef<Group>(null);
  const botanical = useRef<Mesh>(null);
  const mediaInset = useRef<Mesh>(null);
  const mediaInsetMat = useRef<MeshStandardMaterial>(null);

  // Hover states
  const [mediaHovered, setMediaHovered] = useState(false);
  const [mediaFocused, setMediaFocused] = useState(false);
  const mediaTargetY = useRef(0);
  const mediaCurrentY = useRef(0);
  const botanicalTargetY = useRef(0.4);
  const botanicalCurrentY = useRef(0.4);

  useEffect(() => () => folioTex.dispose(), [folioTex]);
  useEffect(() => () => botanicalTex.dispose(), [botanicalTex]);
  useEffect(() => () => mediaTex.dispose(), [mediaTex]);
  useEffect(() => () => leafTextures.forEach((t) => t.dispose()), [leafTextures]);

  useFrame((_, delta) => {
    const s = lessonStore.get();
    const p = Number(gl.domElement.dataset.progress || s.progress);
    const pose = poseAt(p, s.mobile);

    if (!root.current) return;

    // Main folio fades with presence
    root.current.visible = pose.paper > 0.005;
    root.current.scale.setScalar(Math.max(0.01, pose.paper));

    // Botanical illustration rises slightly at rest
    const botanicalTarget = 0.4 + pose.layerOpen * 0.25;
    botanicalTargetY.current = botanicalTarget;
    botanicalCurrentY.current +=
      (botanicalTargetY.current - botanicalCurrentY.current) *
      (s.reduced ? 1 : 1 - Math.exp(-delta * 6));
    if (botanical.current) {
      botanical.current.position.y = botanicalCurrentY.current;
    }

    // Media inset hover / focus response
    const targetY = mediaFocused ? 0.12 : mediaHovered ? 0.06 : 0;
    mediaTargetY.current = targetY;
    mediaCurrentY.current +=
      (mediaTargetY.current - mediaCurrentY.current) *
      (s.reduced ? 1 : 1 - Math.exp(-delta * 8));
    if (mediaInset.current) {
      mediaInset.current.position.y = 0.018 + mediaCurrentY.current;
    }
    if (mediaInsetMat.current) {
      const targetRoughness = mediaFocused ? 0.25 : mediaHovered ? 0.32 : 0.45;
      mediaInsetMat.current.roughness +=
        (targetRoughness - mediaInsetMat.current.roughness) *
        (1 - Math.exp(-delta * 8));
    }
  });

  // Binding edge on the correct reading side
  const bindingX = ar ? 4.2 : -4.2;

  return (
    <group ref={root}>
      {/* ---- Folio body (stacked paper leaves) ---- */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[i * 0.01, -1.84 - i * 0.022, -i * 0.08]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[9.5, 0.018, 6.4]} />
          <meshStandardMaterial
            color={i === 0 ? "#f6f1e6" : `hsl(40, ${22 - i * 3}%, ${90 - i * 2}%)`}
            roughness={0.95}
            metalness={0}
          />
        </mesh>
      ))}

      {/* ---- Primary canvas-rendered spread ---- */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.828, 0]}
        receiveShadow
      >
        <planeGeometry args={[9.5, 6.4]} />
        <meshStandardMaterial
          map={folioTex}
          roughness={0.92}
          metalness={0}
        />
      </mesh>

      {/* ---- Tajseer blue binding edge ---- */}
      <mesh position={[bindingX, -1.82, 0]} castShadow>
        <boxGeometry args={[0.06, 0.055, 6.2]} />
        <meshStandardMaterial color="#1a5c6a" roughness={0.72} metalness={0.05} />
      </mesh>

      {/* ---- Translucent acetate explanatory leaf ---- */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[ar ? 1.8 : -1.8, -1.76, 0]}
      >
        <planeGeometry args={[5.8, 4.2]} />
        <meshStandardMaterial
          color="#c8e4de"
          roughness={0.7}
          metalness={0}
          transparent
          opacity={0.38}
          depthWrite={false}
          side={2}
        />
      </mesh>

      {/* ---- Raised botanical illustration ---- */}
      <mesh
        ref={botanical}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[ar ? -2.2 : 2.2, 0.4, 0.8]}
        castShadow
      >
        <planeGeometry args={[2.8, 3.9]} />
        <meshStandardMaterial
          map={botanicalTex}
          roughness={0.85}
          metalness={0}
          side={2}
        />
      </mesh>

      {/* ---- Media inset ---- */}
      <mesh
        ref={mediaInset}
        position={[ar ? 2.5 : -2.5, 0.018, -0.8]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerEnter={() => setMediaHovered(true)}
        onPointerLeave={() => setMediaHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          setMediaFocused((f) => !f);
        }}
        castShadow
      >
        <planeGeometry args={[3.2, 1.8]} />
        <meshStandardMaterial
          ref={mediaInsetMat}
          map={mediaTex}
          roughness={0.45}
          metalness={0.04}
          color="#f5f0e8"
        />
      </mesh>
      {/* Media inset bevel */}
      <mesh position={[ar ? 2.5 : -2.5, -1.818, -0.8]}>
        <boxGeometry args={[3.25, 0.025, 1.85]} />
        <meshStandardMaterial color="#e8e3d8" roughness={0.6} metalness={0.05} />
      </mesh>

      {/* ---- Background receding lesson leaves ---- */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[
            (i % 2 === 0 ? -0.3 : 0.3) + i * 0.08,
            -1.82,
            -2.2 - i * 0.9,
          ]}
        >
          <planeGeometry args={[8.8 - i * 0.4, 5.8 - i * 0.3]} />
          <meshStandardMaterial
            map={leafTextures[i]}
            roughness={0.95}
            color={`hsl(40, ${18 - i * 2}%, ${88 - i * 3}%)`}
          />
        </mesh>
      ))}

      {/* Background leaf binding edges */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[
            bindingX * (0.8 + i * 0.03),
            -1.82,
            -2.2 - i * 0.9,
          ]}
        >
          <boxGeometry args={[0.05, 0.012, 5.6 - i * 0.3]} />
          <meshStandardMaterial
            color={`hsl(190, ${45 - i * 5}%, ${28 + i * 4}%)`}
            roughness={0.75}
          />
        </mesh>
      ))}

      {/* ---- Foreground page edge (cropped, creates depth) ---- */}
      <mesh
        position={[ar ? -5.5 : 5.5, -1.84, 1.8]}
        castShadow
      >
        <boxGeometry args={[0.08, 0.08, 6.4]} />
        <meshStandardMaterial color="#e8e0cc" roughness={0.9} />
      </mesh>

      {/* ---- Annotation tab ---- */}
      <mesh
        position={[ar ? -3.8 : 3.8, -1.77, 3.4]}
        castShadow
        onPointerEnter={() => {
          // Subtle highlight — service marker will be updated here
          if (botanical.current) botanicalTargetY.current = 0.55;
        }}
        onPointerLeave={() => {
          botanicalTargetY.current = 0.4;
        }}
        onClick={(e) => {
          e.stopPropagation();
          lessonStore.set({ station: 0 });
        }}
      >
        <boxGeometry args={[0.6, 0.04, 0.45]} />
        <meshStandardMaterial
          color="#247e84"
          emissive="#0AACE4"
          emissiveIntensity={station === 0 ? 0.5 : 0.12}
          roughness={0.55}
        />
      </mesh>
    </group>
  );
}
