import { Suspense, useEffect, useRef } from "react";
import { OrbitControls, useGLTF, useProgress } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { Group, Mesh } from "three";

import "./Gate1Environment.css";

const ASSET_URL = `${import.meta.env.BASE_URL}assets/3d/source/scifi-tron-studio/scifi_tron_studio__baked.glb`;

function AuthoredEnvironment() {
  const { scene } = useGLTF(ASSET_URL);
  const { gl } = useThree();

  useEffect(() => {
    let meshes = 0;
    let materials = 0;

    scene.traverse((object) => {
      const mesh = object as Mesh;
      if (!mesh.isMesh) return;
      meshes += 1;
      materials += Array.isArray(mesh.material) ? mesh.material.length : 1;
    });

    gl.domElement.dataset.assetState = "loaded";
    gl.domElement.dataset.assetFilename = "scifi_tron_studio__baked.glb";
    gl.domElement.dataset.meshes = String(meshes);
    gl.domElement.dataset.materialSlots = String(materials);

    const absoluteAssetUrl = new URL(ASSET_URL, window.location.href).href;
    const timing = performance.getEntriesByName(absoluteAssetUrl).at(-1) as
      | PerformanceResourceTiming
      | undefined;
    if (timing) {
      gl.domElement.dataset.assetLoadMs = timing.duration.toFixed(1);
      gl.domElement.dataset.assetTransferBytes = String(timing.transferSize);
      gl.domElement.dataset.assetDecodedBytes = String(timing.decodedBodySize);
    }
  }, [gl, scene]);

  return <primitive object={scene as Group} dispose={null} />;
}

function RuntimeProbe() {
  const { gl } = useThree();
  const sample = useRef({ elapsed: 0, frames: 0 });

  useFrame((_state, delta) => {
    if (gl.domElement.dataset.assetState !== "loaded" || sample.current.frames >= 120) {
      return;
    }

    sample.current.elapsed += delta;
    sample.current.frames += 1;
    if (sample.current.frames === 120) {
      const averageFps = sample.current.frames / sample.current.elapsed;
      gl.domElement.dataset.sampleFrames = "120";
      gl.domElement.dataset.averageFps = averageFps.toFixed(1);
      gl.domElement.dataset.drawCalls = String(gl.info.render.calls);
      gl.domElement.dataset.triangles = String(gl.info.render.triangles);
      gl.domElement.dataset.drawingBuffer = `${gl.domElement.width}x${gl.domElement.height}`;
    }
  });

  return null;
}

function LoadingState() {
  const { active, progress } = useProgress();
  return (
    <p className="gate1-loading" hidden={!active} aria-live="polite">
      Loading authored environment {Math.round(progress)}%
    </p>
  );
}

export default function Gate1Environment() {
  useEffect(() => {
    document.title = "Gate 1 — Scifi Tron Studio integration";
  }, []);

  return (
    <main className="gate1-environment" aria-label="Gate 1 authored environment inspection">
      <Canvas
        camera={{ position: [0, 6, 38], fov: 50, near: 0.1, far: 300 }}
        dpr={[1, 2]}
        frameloop="always"
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.domElement.dataset.assetState = "loading";
          gl.domElement.setAttribute("aria-label", "Scifi Tron Studio authored GLB environment");
        }}
      >
        <color attach="background" args={["#090b0f"]} />
        <Suspense fallback={null}>
          <AuthoredEnvironment />
        </Suspense>
        <OrbitControls
          makeDefault
          target={[0, 5, -3]}
          enableDamping
          dampingFactor={0.08}
          enablePan
          enableZoom
          minDistance={1}
          maxDistance={120}
        />
        <RuntimeProbe />
      </Canvas>
      <LoadingState />
    </main>
  );
}

useGLTF.preload(ASSET_URL);
