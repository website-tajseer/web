/**
 * World — Tajseer Learning World
 *
 * Single persistent Canvas / renderer for the entire experience.
 * Uses demand-rendering for performance.
 *
 * Checkpoint 1: Hero only.
 * - FolioPublication: the dimensional educational publication
 * - LearningOrbit: architectural rail system (three CatmullRom curves)
 * - StemExperiment: retained for CP3, hidden until stem chapter
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import {
  Group,
  Mesh,
  MeshStandardMaterial,
  Color,
} from "three";
import { CameraRig } from "./CameraRig";
import { FolioPublication } from "./FolioPublication";
import { LearningOrbit } from "./LearningOrbit";
import { StemExperiment } from "./StemExperiment";
import { lessonStore, useLesson } from "./state";
import { blend, poseAt } from "./timeline";
import { quality } from "./quality";

import { useGLTF } from "@react-three/drei";
import { Knowledge, Environment } from "../checkpoints/Scene";

// Hero scene background — warm ivory (not dark)
const HERO_BG = new Color("#eeeae0");

function ImportedEnvironmentAsset() {
  const gltf = useGLTF(`${import.meta.env.BASE_URL}assets/3d/environment.glb`);
  return (
    <group position={[0, -0.8, -2]} rotation={[0, 0, 0]} scale={0.025}>
      <primitive object={gltf.scene} />
    </group>
  );
}

function WorldObjects() {
  const s = useLesson();
  const root = useRef<Group>(null);
  const floor = useRef<Mesh>(null);
  const { gl, invalidate } = useThree();

  useFrame((_, delta) => {
    const state = lessonStore.get();
    const p = Number(gl.domElement.dataset.progress || state.progress);
    const pose = poseAt(p, state.mobile);

    // Root group: pointer yaw/pitch for tactile inspection (STEM chapter)
    if (root.current) {
      const canonical =
        blend(p, 0.3, 0.44) * (1 - blend(p, 0.56, 0.65));
      const y = state.yaw * canonical;
      const x = state.pitch * canonical;
      const factor = state.reduced ? 1 : 1 - Math.exp(-delta * 12);
      root.current.rotation.y += (y - root.current.rotation.y) * factor;
      root.current.rotation.x += (x - root.current.rotation.x) * factor;
      if (
        (Math.abs(y - root.current.rotation.y) +
          Math.abs(x - root.current.rotation.x) >
          0.001) &&
        state.visible
      )
        invalidate();
    }

    // Floor tints deeper as we enter immersive environment
    if (floor.current) {
      (floor.current.material as MeshStandardMaterial).color.copy(
        new Color("#ede7d8").lerp(new Color("#1a3a42"), pose.enter),
      );
      floor.current.position.y = -2.05 - pose.enter * 2.5;
    }
  });

  const p = s.progress;
  const ar = s.lang === "ar";
  const selNum = Number(s.selected) || 0;
  const selectFn = (n: number) => lessonStore.set({ selected: String(n) });

  return (
    <>
      {/* Warm ivory fog — atmospheric fade (not hard cutoff) */}
      <fog attach="fog" args={["#eeeae0", 35, 140]} />

      {/* Hemisphere: warm sky, cool teal ground — establishes Tajseer tone */}
      <hemisphereLight args={["#fff9e9", "#b4d4d0", 1.2]} />

      {/* Primary key light: upper-right, casts page shadows */}
      <directionalLight
        position={[5, 12, 7]}
        intensity={3.5}
        castShadow
        shadow-mapSize={[s.mobile ? 512 : 1024, s.mobile ? 512 : 1024]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-normalBias={0.04}
        shadow-bias={-0.0002}
      />

      {/* Fill light: Tajseer teal, softens left side */}
      <directionalLight position={[-8, 3, -5]} intensity={1.4} color="#7ac5cc" />

      {/* Warm accent: separates foreground from background */}
      <directionalLight position={[2, -2, 6]} intensity={0.8} color="#f5e6cc" />

      {/* Main group — folio, orbit, multimedia knowledge cards & immersive environment */}
      <group ref={root}>
        <Suspense fallback={null}>
          <FolioPublication />
          <ImportedEnvironmentAsset />
        </Suspense>
        <LearningOrbit />
        <Knowledge
          ar={ar}
          angle={0}
          p={p}
          selected={selNum}
          select={selectFn}
          scrub={p}
        />
        {p > 0.5 && (
          <Environment
            angle={0}
            p={p}
            selected={selNum}
            select={selectFn}
            scrub={p}
          />
        )}
        {/* StemExperiment for STEM chapter (0.44–0.60) */}
        <StemExperiment />
      </group>

      {/* Floor plane — receives shadow, transitions with progress */}
      <mesh
        ref={floor}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2.05, -20]}
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#ede7d8" roughness={0.92} metalness={0} />
      </mesh>
    </>
  );
}

export default function World({ onFailure }: { onFailure: () => void }) {
  const s = useLesson();
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, s.mobile ? quality.mobile.dpr : quality.desktop.dpr]}
      frameloop={s.visible ? "demand" : "never"}
      camera={{ position: [7.8, 10.5, 12.5], fov: 40, near: 0.12, far: 200 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl, scene }) => {
        scene.background = HERO_BG;
        gl.domElement.addEventListener("webglcontextlost", onFailure, {
          once: true,
        });
      }}
    >
      <CameraRig />
      <WorldObjects />
    </Canvas>
  );
}
