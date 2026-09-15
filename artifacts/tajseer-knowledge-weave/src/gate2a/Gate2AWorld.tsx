import { Line, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
  CanvasTexture,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  SRGBColorSpace,
  Vector3,
} from "three";

const ASSET_URL = `${import.meta.env.BASE_URL}assets/3d/source/scifi-tron-studio/scifi_tron_studio__baked.glb`;

type MotionRef = React.MutableRefObject<{ x: number; y: number }>;

function createLearningTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext("2d")!;
  const gradient = context.createLinearGradient(0, 0, 1024, 512);
  gradient.addColorStop(0, "#04152c");
  gradient.addColorStop(0.52, "#083e67");
  gradient.addColorStop(1, "#087a87");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "rgba(151, 237, 234, 0.68)";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(80, 370);
  context.bezierCurveTo(250, 340, 260, 155, 460, 190);
  context.bezierCurveTo(640, 220, 680, 85, 930, 112);
  context.stroke();

  const points = [
    [80, 370],
    [286, 236],
    [460, 190],
    [702, 142],
    [930, 112],
  ];
  points.forEach(([x, y], index) => {
    context.beginPath();
    context.fillStyle = index === 2 ? "#f3c986" : "#b4fbf3";
    context.arc(x, y, index === 2 ? 11 : 7, 0, Math.PI * 2);
    context.fill();
  });

  context.strokeStyle = "rgba(180, 248, 239, 0.2)";
  context.lineWidth = 2;
  [112, 170, 228].forEach((radius) => {
    context.beginPath();
    context.ellipse(512, 256, radius * 1.55, radius * 0.52, -0.18, 0, Math.PI * 2);
    context.stroke();
  });

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.flipY = false;
  texture.needsUpdate = true;
  return texture;
}

function AuthoredTajseerEnvironment() {
  const { scene } = useGLTF(ASSET_URL);
  const authored = useMemo(() => {
    const clone = scene.clone(true);
    const texture = createLearningTexture();
    const screenMaterial = new MeshBasicMaterial({
      map: texture,
      color: new Color("#ffffff"),
      side: DoubleSide,
      toneMapped: false,
    });

    clone.traverse((object) => {
      const mesh = object as Mesh;
      const materials = mesh.isMesh
        ? Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material]
        : [];
      if (
        mesh.isMesh &&
        (mesh.name.toLowerCase().includes("screen") ||
          materials.some((material) => material.name === "screen.001"))
      ) {
        mesh.material = screenMaterial;
      }
    });

    return { clone, screenMaterial, texture };
  }, [scene]);

  useEffect(
    () => () => {
      authored.screenMaterial.dispose();
      authored.texture.dispose();
    },
    [authored],
  );

  return <primitive object={authored.clone as Group} dispose={null} />;
}

function CameraChoreography({
  progress,
  pointer,
  rtl,
  reducedMotion,
}: {
  progress: number;
  pointer: MotionRef;
  rtl: boolean;
  reducedMotion: boolean;
}) {
  const { camera, gl, invalidate } = useThree();
  const target = useMemo(() => new Vector3(), []);
  const destination = useMemo(() => new Vector3(), []);
  const focus = useMemo(() => new Vector3(), []);

  useEffect(() => {
    const updatePointer = () => invalidate();
    window.addEventListener("gate2a:pointer", updatePointer);
    return () => window.removeEventListener("gate2a:pointer", updatePointer);
  }, [invalidate]);

  useFrame(() => {
    const p = reducedMotion ? (progress > 0.72 ? 1 : 0) : progress;
    const approach = p * p * (3 - 2 * p);
    const startTargetX = rtl ? 5.2 : -5.2;

    destination.set(
      0.8 + approach * 2.8,
      6 + approach * 0.8,
      38 - approach * 10.5,
    );
    focus.set(startTargetX * (1 - approach), 5.1 + approach * 0.4, -3.2 - approach * 1.8);

    const parallax = reducedMotion ? 0 : 1 - approach * 0.75;
    destination.x += pointer.current.x * 0.65 * parallax;
    destination.y += pointer.current.y * 0.28 * parallax;
    focus.x += pointer.current.x * 0.2 * parallax;

    camera.position.copy(destination);
    target.copy(focus);
    camera.lookAt(focus);
    camera.updateProjectionMatrix();

    gl.domElement.dataset.heroProgress = progress.toFixed(3);
    gl.domElement.dataset.drawCalls = String(gl.info.render.calls);
    gl.domElement.dataset.triangles = String(gl.info.render.triangles);
  });

  return null;
}

function LearningOrbit({ progress }: { progress: number }) {
  const reveal = Math.max(0, Math.min(1, (progress - 0.14) / 0.5));
  return (
    <Line
      points={[
        [-30, -2, 14],
        [-22, 3, 10],
        [-11, 10, 6],
        [2, 12.5, 2],
        [15, 8, -1],
        [29, 2, -5],
      ]}
      color="#8ce8e2"
      lineWidth={1.15}
      transparent
      opacity={0.08 + reveal * 0.72}
      depthTest
      depthWrite={false}
    />
  );
}

export default function Gate2AWorld({
  progress,
  pointer,
  active,
  rtl,
  reducedMotion,
  onFailure,
}: {
  progress: number;
  pointer: MotionRef;
  active: boolean;
  rtl: boolean;
  reducedMotion: boolean;
  onFailure: () => void;
}) {
  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [0.8, 6, 38], fov: 50, near: 0.1, far: 300 }}
      dpr={[1, 1.5]}
      frameloop={active ? "demand" : "never"}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.domElement.dataset.assetFilename = "scifi_tron_studio__baked.glb";
        gl.domElement.dataset.assetState = "loaded";
        gl.domElement.dataset.engine = `three.js r${gl.capabilities.isWebGL2 ? "WebGL2" : "WebGL1"}`;
        gl.domElement.addEventListener("webglcontextlost", onFailure, { once: true });
      }}
    >
      <color attach="background" args={["#020a18"]} />
      <AuthoredTajseerEnvironment />
      <LearningOrbit progress={progress} />
      <CameraChoreography
        progress={progress}
        pointer={pointer}
        rtl={rtl}
        reducedMotion={reducedMotion}
      />
    </Canvas>
  );
}

useGLTF.preload(ASSET_URL);
