/**
 * LearningOrbit — Tajseer Learning World
 *
 * Three architectural CatmullRom rail curves that establish spatial depth,
 * scale and direction. These are NOT torus rings, orbital circles, or atoms.
 * They are spatial paths that the camera will eventually travel through.
 *
 * Visual strategy:
 *   - Rail A: passes behind the folio in background Z-space, arcs upper-right
 *   - Rail B: enters lower-left foreground, curves right, exits frame
 *   - Rail C: rises vertically on right side, exits top
 *
 * Each rail creates one of: DEPTH, FOREGROUND CONTINUITY, VERTICAL SCALE.
 * Together they communicate the spatial extent of the Tajseer Learning World.
 *
 * Five annotation markers at rail intersections will become interactive
 * service selectors in later checkpoints. In Checkpoint 1 they are visible
 * and hoverable but do not scroll.
 */

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CatmullRomCurve3,
  TubeGeometry,
  MeshStandardMaterial,
  SphereGeometry,
  Vector3,
  Group,
  Mesh,
} from "three";
import { lessonStore, useLesson } from "./state";
import { acts } from "./timeline";

// ---------------------------------------------------------------------------
// Rail control points — authored in world space for architectural depth
// NOT mathematical regularity or predictable orbital paths
// ---------------------------------------------------------------------------

const RAIL_A_POINTS = [
  // Rail A: sweeps from behind-left, arcs over the background, exits upper-right
  new Vector3(-8, -3, -8),
  new Vector3(-5, 1, -5),
  new Vector3(-2, 4, -3),
  new Vector3(2, 7, -1),
  new Vector3(6, 10, 2),
  new Vector3(9, 12, 4),
  new Vector3(12, 11, 7),
];

const RAIL_B_POINTS = [
  // Rail B: enters lower-left foreground, curves across, exits right
  new Vector3(-12, -4, 9),
  new Vector3(-7, -3, 7),
  new Vector3(-3, -2.5, 5.5),
  new Vector3(1, -2, 4),
  new Vector3(5, -2.5, 3),
  new Vector3(9, -3, 2),
  new Vector3(14, -4, 1),
];

const RAIL_C_POINTS = [
  // Rail C: begins right of folio, rises vertically, curves and exits top
  new Vector3(6, -5, 0),
  new Vector3(6.5, -1, 0.5),
  new Vector3(7, 3, 1),
  new Vector3(7.2, 7, 0.5),
  new Vector3(7.5, 11, 0),
  new Vector3(7.2, 15, -1),
  new Vector3(6.8, 18, -2),
];

// ---------------------------------------------------------------------------
// Service annotation marker positions — at/near rail intersections
// These will become chapter navigation anchors in later checkpoints
// ---------------------------------------------------------------------------

const MARKER_POSITIONS: [number, number, number][] = [
  [-1, 3.5, -2],   // Multimedia — Rail A midpoint region
  [3.5, -2, 4.5],  // E-learning — Rail B midpoint region
  [0.5, 7, 0],     // Rail A upper region
  [7, 5, 0.5],     // Rail C midpoint
  [-4, 0, -4],     // Background depth marker
];

const SERVICE_IDS = ["multimedia", "courses", "stem", "arvr", "guidance"];

// ---------------------------------------------------------------------------
// Rail geometry (application-lifetime)
// ---------------------------------------------------------------------------

function makeTube(points: Vector3[], radius: number, segments = 128) {
  const curve = new CatmullRomCurve3(points);
  return new TubeGeometry(curve, segments, radius, 8, false);
}

const railAGeom = makeTube(RAIL_A_POINTS, 0.035);
const railBGeom = makeTube(RAIL_B_POINTS, 0.025);
const railCGeom = makeTube(RAIL_C_POINTS, 0.030);
const markerGeom = new SphereGeometry(0.058, 10, 8);

// ---------------------------------------------------------------------------
// Materials (created per component instance, disposed on unmount)
// ---------------------------------------------------------------------------

const RAIL_COLOR = "#37B5B0";
const RAIL_EMISSIVE = "#0AACE4";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LearningOrbit() {
  const s = useLesson();
  const groupRef = useRef<Group>(null);
  const markerRefs = useRef<(Mesh | null)[]>([]);
  const hoverState = useRef<number | null>(null);

  // Rail materials (shared, application-lifetime)
  const railMatA = useMemo(
    () =>
      new MeshStandardMaterial({
        color: RAIL_COLOR,
        emissive: RAIL_EMISSIVE,
        emissiveIntensity: 0.18,
        roughness: 0.7,
        metalness: 0.1,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
      }),
    [],
  );
  const railMatB = useMemo(
    () =>
      new MeshStandardMaterial({
        color: RAIL_COLOR,
        emissive: RAIL_EMISSIVE,
        emissiveIntensity: 0.14,
        roughness: 0.72,
        metalness: 0.08,
        transparent: true,
        opacity: 0.26,
        depthWrite: false,
      }),
    [],
  );
  const railMatC = useMemo(
    () =>
      new MeshStandardMaterial({
        color: RAIL_COLOR,
        emissive: RAIL_EMISSIVE,
        emissiveIntensity: 0.22,
        roughness: 0.68,
        metalness: 0.12,
        transparent: true,
        opacity: 0.38,
        depthWrite: false,
      }),
    [],
  );

  useFrame((_, delta) => {
    // Animate marker emissive intensity based on hover and station selection
    markerRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const mat = mesh.material as MeshStandardMaterial;
      const isHovered = hoverState.current === i;
      const isSelected = s.station === i;
      const targetIntensity = isSelected ? 0.9 : isHovered ? 0.65 : 0.38;
      const targetScale = isSelected ? 1.45 : isHovered ? 1.25 : 1.0;
      const speed = 1 - Math.exp(-delta * 10);
      mat.emissiveIntensity += (targetIntensity - mat.emissiveIntensity) * speed;
      mesh.scale.x += (targetScale - mesh.scale.x) * speed;
      mesh.scale.y = mesh.scale.z = mesh.scale.x;
    });
  });

  return (
    <group ref={groupRef}>
      {/* ---- Rail A: behind folio, arcs upper-right (DEPTH) ---- */}
      <mesh geometry={railAGeom} material={railMatA} renderOrder={-1} />

      {/* ---- Rail B: lower-left foreground (FOREGROUND CONTINUITY) ---- */}
      <mesh geometry={railBGeom} material={railMatB} renderOrder={-1} />

      {/* ---- Rail C: vertical right rise (SCALE / DIRECTION) ---- */}
      <mesh geometry={railCGeom} material={railMatC} renderOrder={-1} />

      {/* ---- Service annotation markers ---- */}
      {MARKER_POSITIONS.map((pos, i) => {
        const serviceId = SERVICE_IDS[i];
        const actEntry = acts.find((a) => a.id === serviceId);
        const label = s.lang === "ar" ? actEntry?.ar : actEntry?.en;

        return (
          <mesh
            key={i}
            ref={(el) => { markerRefs.current[i] = el; }}
            geometry={markerGeom}
            position={pos}
            onPointerEnter={(e) => {
              e.stopPropagation();
              hoverState.current = i;
              document.body.style.cursor = "crosshair";
            }}
            onPointerLeave={() => {
              hoverState.current = null;
              document.body.style.cursor = "";
            }}
            onClick={(e) => {
              e.stopPropagation();
              lessonStore.set({ station: i });
            }}
          >
            <meshStandardMaterial
              color="#0AACE4"
              emissive="#0AACE4"
              emissiveIntensity={s.station === i ? 0.9 : 0.38}
              roughness={0.3}
              metalness={0.15}
            />
          </mesh>
        );
      })}
    </group>
  );
}
