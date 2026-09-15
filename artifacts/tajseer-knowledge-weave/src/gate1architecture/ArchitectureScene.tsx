import { ContactShadows, useTexture } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
  ACESFilmicToneMapping,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Mesh,
  MeshPhysicalMaterial,
  Path,
  SRGBColorSpace,
  Shape,
  Vector2,
  Vector3,
} from "three";

type Language = "en" | "ar";

const TAJSEER_LOGO = `${import.meta.env.BASE_URL}assets/tajseer/TajsserLogo.bc8c31e3b431f4abdefcf79540d093dc.svg`;
const TAJSEER_ARABIC_LOGO = `${import.meta.env.BASE_URL}assets/tajseer/arabic-logo.png`;

function createRibbonGeometry(
  points: [number, number, number][],
  width: number,
  thickness: number,
  segments = 80,
) {
  const curve = new CatmullRomCurve3(points.map((point) => new Vector3(...point)));
  const positions: number[] = [];
  const indices: number[] = [];

  for (let index = 0; index <= segments; index += 1) {
    const progress = index / segments;
    const point = curve.getPointAt(progress);
    const tangent = curve.getTangentAt(progress).normalize();
    const lateral = new Vector3(-tangent.z, 0, tangent.x).normalize().multiplyScalar(width / 2);
    const left = point.clone().add(lateral);
    const right = point.clone().sub(lateral);
    positions.push(
      left.x,
      left.y,
      left.z,
      right.x,
      right.y,
      right.z,
      left.x,
      left.y - thickness,
      left.z,
      right.x,
      right.y - thickness,
      right.z,
    );
  }

  for (let index = 0; index < segments; index += 1) {
    const start = index * 4;
    const next = start + 4;
    indices.push(
      start, next, start + 1,
      start + 1, next, next + 1,
      start + 2, start + 3, next + 2,
      start + 3, next + 3, next + 2,
      start, start + 2, next,
      start + 2, next + 2, next,
      start + 1, next + 1, start + 3,
      start + 3, next + 1, next + 3,
    );
  }

  indices.push(0, 1, 2, 1, 3, 2);
  const end = segments * 4;
  indices.push(end, end + 2, end + 1, end + 1, end + 2, end + 3);

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createCurvedPanelGeometry(width: number, height: number, bow: number) {
  const columns = 48;
  const rows = 10;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let row = 0; row <= rows; row += 1) {
    for (let column = 0; column <= columns; column += 1) {
      const u = column / columns;
      const v = row / rows;
      const x = (u - 0.5) * width;
      const z = bow * (1 - Math.pow((u - 0.5) * 2, 2));
      positions.push(x, v * height, z);
      uvs.push(u, v);
    }
  }

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const a = row * (columns + 1) + column;
      const b = a + 1;
      const c = a + columns + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createFacadeGeometry() {
  const shape = new Shape();
  shape.moveTo(-16, 0);
  shape.lineTo(-16, 9.7);
  shape.quadraticCurveTo(-16, 10.2, -15.4, 10.2);
  shape.lineTo(15.8, 10.2);
  shape.quadraticCurveTo(16.4, 10.2, 16.4, 9.6);
  shape.lineTo(16.4, 0);
  shape.closePath();

  const opening = new Path();
  opening.moveTo(4.6, 1.05);
  opening.lineTo(4.6, 7.1);
  opening.quadraticCurveTo(4.6, 8.25, 5.8, 8.25);
  opening.lineTo(14.7, 8.25);
  opening.lineTo(14.7, 1.05);
  opening.closePath();
  shape.holes.push(opening);

  return new ExtrudeGeometry(shape, {
    depth: 0.52,
    bevelEnabled: true,
    bevelSize: 0.08,
    bevelThickness: 0.08,
    bevelSegments: 3,
    curveSegments: 16,
  });
}

function createFeatureWallGeometry() {
  const shape = new Shape();
  shape.moveTo(-5.4, -3.4);
  shape.bezierCurveTo(-5.4, -4.2, -4.7, -4.7, -3.9, -4.7);
  shape.lineTo(4.2, -4.7);
  shape.bezierCurveTo(5, -4.7, 5.5, -4.1, 5.5, -3.3);
  shape.lineTo(5.5, 3.1);
  shape.bezierCurveTo(5.5, 3.9, 4.9, 4.45, 4.15, 4.45);
  shape.lineTo(-3.85, 4.45);
  shape.bezierCurveTo(-4.9, 4.45, -5.4, 3.8, -5.4, 2.9);
  shape.closePath();
  return new ExtrudeGeometry(shape, {
    depth: 0.34,
    bevelEnabled: true,
    bevelSize: 0.14,
    bevelThickness: 0.1,
    bevelSegments: 5,
    curveSegments: 18,
  });
}

function createPlatformGeometry() {
  const shape = new Shape();
  shape.moveTo(-6.7, -1.7);
  shape.bezierCurveTo(-5.6, -2.65, -2.6, -2.9, 0.7, -2.45);
  shape.bezierCurveTo(4.2, -2.05, 6.6, -1.35, 6.95, -0.35);
  shape.bezierCurveTo(7.2, 0.45, 6.15, 1.65, 4.65, 1.95);
  shape.bezierCurveTo(1.2, 2.65, -3.6, 2.45, -6.2, 1.25);
  shape.bezierCurveTo(-7.25, 0.75, -7.6, -0.8, -6.7, -1.7);
  shape.closePath();
  return new ExtrudeGeometry(shape, {
    depth: 0.92,
    bevelEnabled: true,
    bevelSize: 0.18,
    bevelThickness: 0.14,
    bevelSegments: 6,
    curveSegments: 24,
  });
}

function createEllipticalBand(rx: number, ry: number, band: number, depth: number) {
  const shape = new Shape();
  shape.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0);
  const hole = new Path();
  hole.absellipse(0, 0, rx - band, ry - band, 0, Math.PI * 2, true, 0);
  shape.holes.push(hole);
  return new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSize: 0.06,
    bevelThickness: 0.04,
    bevelSegments: 3,
    curveSegments: 72,
  });
}

function createDisplayTexture(language: Language) {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const context = canvas.getContext("2d")!;
  const rtl = language === "ar";
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#063e54");
  gradient.addColorStop(0.54, "#0b6675");
  gradient.addColorStop(1, "#148890");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const glow = context.createRadialGradient(1500, 250, 20, 1500, 250, 760);
  glow.addColorStop(0, "rgba(181, 239, 227, .28)");
  glow.addColorStop(1, "rgba(181, 239, 227, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "rgba(224, 247, 238, .16)";
  context.lineWidth = 2;
  for (let x = 96; x < canvas.width; x += 140) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }

  const eyebrow = rtl ? "مركز تجسير للابتكار والمعرفة" : "TAJSEER INNOVATION & KNOWLEDGE";
  const title = rtl ? "من المعرفة إلى الأثر" : "KNOWLEDGE\nINTO IMPACT";
  const services = rtl
    ? ["التعليم", "التطوير", "التقنية", "التدريب والاستشارات"]
    : ["EDUCATION", "DEVELOPMENT", "TECHNOLOGY", "TRAINING & CONSULTING"];

  context.textAlign = rtl ? "right" : "left";
  context.direction = rtl ? "rtl" : "ltr";
  const originX = rtl ? 1880 : 150;
  context.fillStyle = "rgba(235, 250, 245, .78)";
  context.font = `600 34px ${rtl ? "Arial" : "Arial"}`;
  context.letterSpacing = rtl ? "0px" : "8px";
  context.fillText(eyebrow, originX, 112);

  context.fillStyle = "#f5fbf7";
  context.font = `300 116px ${rtl ? "Arial" : "Arial"}`;
  context.letterSpacing = rtl ? "0px" : "-3px";
  title.split("\n").forEach((line, index) => context.fillText(line, originX, 285 + index * 122));

  context.strokeStyle = "rgba(210, 245, 235, .75)";
  context.lineWidth = 4;
  context.beginPath();
  const startX = rtl ? 1820 : 165;
  const endX = rtl ? 240 : 1780;
  context.moveTo(startX, 655);
  context.bezierCurveTo(rtl ? 1350 : 610, 560, rtl ? 750 : 1200, 790, endX, 640);
  context.stroke();

  services.forEach((service, index) => {
    const x = rtl ? 1810 - index * 470 : 165 + index * 470;
    context.fillStyle = "#daf3ec";
    context.beginPath();
    context.arc(x, 655 - Math.sin(index * 1.1) * 34, 9, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "rgba(239, 250, 247, .86)";
    context.font = `600 ${rtl ? 26 : 24}px Arial`;
    context.letterSpacing = rtl ? "0px" : "2px";
    context.fillText(service, x, 790);
  });

  context.fillStyle = "rgba(227, 247, 240, .55)";
  context.font = "400 22px Arial";
  context.letterSpacing = rtl ? "0px" : "4px";
  context.fillText(rtl ? "تعليم • تطوير • تقنية • استشارات" : "EDUCATION • DEVELOPMENT • TECHNOLOGY • CONSULTING", originX, 930);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function createWallTitleTexture(language: Language) {
  const canvas = document.createElement("canvas");
  canvas.width = 1400;
  canvas.height = 360;
  const context = canvas.getContext("2d")!;
  const rtl = language === "ar";
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.direction = rtl ? "rtl" : "ltr";
  context.textAlign = rtl ? "right" : "left";
  const x = rtl ? 1320 : 80;
  context.fillStyle = "#164f61";
  context.font = `600 ${rtl ? 61 : 58}px Arial`;
  context.letterSpacing = rtl ? "0px" : "4px";
  context.fillText(rtl ? "مركز الابتكار والمعرفة" : "INNOVATION & KNOWLEDGE", x, 110);
  context.fillStyle = "#2d8589";
  context.font = `400 ${rtl ? 42 : 38}px Arial`;
  context.letterSpacing = rtl ? "0px" : "7px";
  context.fillText(rtl ? "مساحة للتعليم والتطوير والأثر" : "EXPERIENCE CENTER", x, 190);
  context.fillStyle = "rgba(45, 104, 114, .62)";
  context.font = `400 ${rtl ? 27 : 23}px Arial`;
  context.letterSpacing = rtl ? "0px" : "3px";
  context.fillText(rtl ? "التعليم  •  التطوير  •  التقنية  •  التدريب والاستشارات" : "EDUCATION  •  DEVELOPMENT  •  TECHNOLOGY  •  TRAINING & CONSULTING", x, 286);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createZoneTexture(language: Language) {
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 620;
  const context = canvas.getContext("2d")!;
  const rtl = language === "ar";
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#114d5e");
  gradient.addColorStop(1, "#1c7479");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.direction = rtl ? "rtl" : "ltr";
  context.textAlign = rtl ? "right" : "left";
  const x = rtl ? 1160 : 120;
  context.fillStyle = "rgba(234, 249, 244, .64)";
  context.font = "600 22px Arial";
  context.letterSpacing = rtl ? "0px" : "6px";
  context.fillText(rtl ? "مساحة تبادل المعرفة" : "KNOWLEDGE EXCHANGE", x, 92);
  context.fillStyle = "#f3faf6";
  context.font = `400 ${rtl ? 58 : 53}px Arial`;
  context.letterSpacing = rtl ? "0px" : "1px";
  context.fillText(rtl ? "التعليم يصنع الأثر" : "Ideas become learning.", x, 212);
  context.fillText(rtl ? "والمعرفة تصنع المستقبل" : "Learning becomes impact.", x, 288);
  const categories = rtl
    ? ["التعليم", "التطوير", "التقنية", "الاستشارات"]
    : ["EDUCATION", "DEVELOPMENT", "TECHNOLOGY", "CONSULTING"];
  categories.forEach((category, index) => {
    const itemX = rtl ? 1150 - index * 290 : 120 + index * 290;
    context.fillStyle = index === 0 ? "#d6f0e9" : "rgba(224, 244, 239, .68)";
    context.fillRect(itemX, 405, rtl ? -210 : 210, 3);
    context.font = "600 18px Arial";
    context.letterSpacing = rtl ? "0px" : "3px";
    context.fillText(category, itemX, 458);
  });
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function ArchitecturalCeiling() {
  const ribbon = useMemo(
    () =>
      createRibbonGeometry(
        [
          [-18, 9.3, 4],
          [-12, 9.4, 1.1],
          [-6, 9.2, -1.3],
          [0, 9.45, -2.25],
          [6.5, 9.25, -1.2],
          [12.5, 9.35, 1.4],
          [18, 9.15, 4.7],
        ],
        3.2,
        0.38,
      ),
    [],
  );
  const lightRibbon = useMemo(
    () =>
      createRibbonGeometry(
        [
          [-18, 9.03, 3.4],
          [-12, 9.09, 0.65],
          [-6, 8.94, -1.55],
          [0, 9.18, -2.42],
          [6.5, 8.98, -1.46],
          [12.5, 9.09, 1.05],
          [18, 8.91, 4.22],
        ],
        0.13,
        0.025,
      ),
    [],
  );
  const outerBand = useMemo(() => createEllipticalBand(6.7, 3.7, 0.78, 0.36), []);
  const tealBand = useMemo(() => createEllipticalBand(5.5, 2.85, 0.72, 0.31), []);
  const innerBand = useMemo(() => createEllipticalBand(4.35, 2.05, 0.58, 0.27), []);
  const lightBand = useMemo(() => createEllipticalBand(3.32, 1.38, 0.13, 0.06), []);

  return (
    <group>
      <mesh geometry={ribbon} castShadow receiveShadow>
        <meshPhysicalMaterial color="#f4f0e7" roughness={0.3} metalness={0.02} clearcoat={0.3} />
      </mesh>
      <mesh geometry={lightRibbon}>
        <meshBasicMaterial color="#fffdf3" toneMapped={false} />
      </mesh>
      <group position={[7.1, 9.46, -4.6]} rotation={[Math.PI / 2, 0, -0.1]}>
        <mesh geometry={outerBand} castShadow>
          <meshPhysicalMaterial color="#f8f5ef" roughness={0.24} clearcoat={0.4} />
        </mesh>
        <mesh geometry={tealBand} position={[0, 0, 0.22]}>
          <meshPhysicalMaterial color="#0b5667" roughness={0.32} metalness={0.08} />
        </mesh>
        <mesh geometry={innerBand} position={[0, 0, 0.43]} castShadow>
          <meshPhysicalMaterial color="#f6f3ec" roughness={0.25} clearcoat={0.35} />
        </mesh>
        <mesh geometry={lightBand} position={[0, 0, 0.68]}>
          <meshBasicMaterial color="#fffdf1" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function FeatureWall({ language }: { language: Language }) {
  const logo = useTexture(language === "ar" ? TAJSEER_ARABIC_LOGO : TAJSEER_LOGO);
  const wallGeometry = useMemo(() => createFeatureWallGeometry(), []);
  const titleTexture = useMemo(() => createWallTitleTexture(language), [language]);

  useEffect(() => {
    logo.colorSpace = SRGBColorSpace;
    logo.needsUpdate = true;
  }, [logo]);

  useEffect(() => () => titleTexture.dispose(), [titleTexture]);

  return (
    <group position={[-10.1, 4.75, -11.52]}>
      <mesh geometry={wallGeometry} receiveShadow castShadow>
        <meshPhysicalMaterial color="#eef1ec" roughness={0.36} clearcoat={0.22} />
      </mesh>
      <mesh position={[0, 1.25, 0.57]}>
        <planeGeometry args={[3.45, 1.22]} />
        <meshBasicMaterial map={logo} transparent toneMapped={false} />
      </mesh>
      <mesh position={[0, -1.02, 0.575]}>
        <planeGeometry args={[7.4, 1.9]} />
        <meshBasicMaterial map={titleTexture} transparent toneMapped={false} />
      </mesh>
      <mesh position={[-4.9, 0, 0.59]}>
        <planeGeometry args={[0.07, 7.5]} />
        <meshBasicMaterial color="#57b9b2" toneMapped={false} />
      </mesh>
    </group>
  );
}

function DigitalKnowledgeInstallation({ language }: { language: Language }) {
  const platform = useMemo(() => createPlatformGeometry(), []);
  const screen = useMemo(() => createCurvedPanelGeometry(9.35, 4.62, 0.62), []);
  const glass = useMemo(() => createCurvedPanelGeometry(9.75, 5.05, 0.67), []);
  const displayTexture = useMemo(() => createDisplayTexture(language), [language]);

  useEffect(() => () => displayTexture.dispose(), [displayTexture]);

  return (
    <group position={[-0.9, 0, -2.55]}>
      <mesh geometry={platform} position={[0, 1.05, 0.25]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#f2f1eb" roughness={0.24} metalness={0.02} clearcoat={0.55} />
      </mesh>
      <mesh geometry={platform} position={[0, 0.2, 0.31]} rotation={[Math.PI / 2, 0, 0]} scale={[0.92, 0.92, 0.22]}>
        <meshPhysicalMaterial color="#164d5c" roughness={0.3} metalness={0.12} />
      </mesh>
      <mesh geometry={glass} position={[0, 1.03, -0.14]}>
        <meshPhysicalMaterial
          color="#cde5df"
          roughness={0.08}
          metalness={0.02}
          transmission={0.5}
          thickness={0.08}
          transparent
          opacity={0.48}
          side={DoubleSide}
        />
      </mesh>
      <mesh geometry={screen} position={[0, 1.25, 0.02]}>
        <meshBasicMaterial map={displayTexture} toneMapped={false} side={DoubleSide} />
      </mesh>
      <mesh position={[0, 5.95, 0.72]} scale={[1, 1, 1]}>
        <planeGeometry args={[8.4, 0.055]} />
        <meshBasicMaterial color="#b6e7dd" toneMapped={false} />
      </mesh>
    </group>
  );
}

function GlassZone({ language }: { language: Language }) {
  const panes = [-3.7, -1.22, 1.22, 3.7];
  const zoneTexture = useMemo(() => createZoneTexture(language), [language]);

  useEffect(() => () => zoneTexture.dispose(), [zoneTexture]);

  return (
    <group position={[9.65, 1.1, -11.7]}>
      <mesh position={[0, 3.55, -3.7]} receiveShadow>
        <planeGeometry args={[10.4, 7.1]} />
        <meshPhysicalMaterial color="#d9e4df" roughness={0.62} />
      </mesh>
      <mesh position={[0.1, 3.72, -3.6]}>
        <planeGeometry args={[8.7, 4.2]} />
        <meshBasicMaterial map={zoneTexture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 6.65, -3.62]}>
        <planeGeometry args={[9.7, 0.12]} />
        <meshBasicMaterial color="#fffbea" toneMapped={false} />
      </mesh>
      {panes.map((x) => (
        <mesh key={x} position={[x, 3.55, 0.08]}>
          <planeGeometry args={[2.35, 7.05]} />
          <meshPhysicalMaterial
            color="#d9f0ed"
            roughness={0.04}
            transmission={0.82}
            thickness={0.04}
            transparent
            opacity={0.33}
            side={DoubleSide}
          />
        </mesh>
      ))}
      {[-4.92, -2.46, 0, 2.46, 4.92].map((x) => (
        <mesh key={x} position={[x, 3.55, 0.15]} castShadow>
          <boxGeometry args={[0.065, 7.25, 0.11]} />
          <meshPhysicalMaterial color="#6c7f80" roughness={0.23} metalness={0.75} />
        </mesh>
      ))}
      <mesh position={[0, 7.14, 0.15]} castShadow>
        <boxGeometry args={[10, 0.075, 0.11]} />
        <meshPhysicalMaterial color="#6c7f80" roughness={0.23} metalness={0.75} />
      </mesh>
    </group>
  );
}

function CameraAndMetrics() {
  const { camera, gl, invalidate, scene } = useThree();

  useEffect(() => {
    camera.position.set(0.8, 5.25, 22.4);
    camera.lookAt(-0.15, 4.3, -5.4);
    camera.updateProjectionMatrix();
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow ||= false;
        object.receiveShadow ||= false;
      }
    });
    invalidate();
  }, [camera, invalidate, scene]);

  useFrame(() => {
    camera.position.set(0.8, 5.25, 22.4);
    camera.lookAt(-0.15, 4.3, -5.4);
    gl.domElement.dataset.drawCalls = String(gl.info.render.calls);
    gl.domElement.dataset.triangles = String(gl.info.render.triangles);
    gl.domElement.dataset.geometries = String(gl.info.memory.geometries);
    gl.domElement.dataset.textures = String(gl.info.memory.textures);
  });

  return null;
}

function Architecture({ language }: { language: Language }) {
  const facade = useMemo(() => createFacadeGeometry(), []);
  const floorRibbonA = useMemo(
    () => createRibbonGeometry([[-18, 0.025, 11], [-9, 0.03, 7], [-1, 0.03, 6], [8, 0.03, 8], [18, 0.025, 13]], 0.075, 0.018, 72),
    [],
  );
  const floorRibbonB = useMemo(
    () => createRibbonGeometry([[-18, 0.022, 13.5], [-9, 0.025, 9], [0, 0.025, 8], [9, 0.025, 10], [18, 0.022, 15]], 0.028, 0.012, 72),
    [],
  );
  const columnProfile = useMemo(
    () => [
      new Vector2(1.15, 0),
      new Vector2(1.02, 0.25),
      new Vector2(0.9, 1.2),
      new Vector2(0.86, 6.8),
      new Vector2(1.08, 8.0),
      new Vector2(1.25, 8.35),
    ],
    [],
  );

  return (
    <>
      <color attach="background" args={["#dfe6e3"]} />
      <fog attach="fog" args={["#dfe6e3", 28, 63]} />

      <ambientLight intensity={0.82} color="#f5f8f3" />
      <hemisphereLight args={["#f8fbf7", "#9aa9a4", 2.25]} />
      <directionalLight
        position={[-8, 14, 12]}
        intensity={2.05}
        color="#fff9e9"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={18}
        shadow-camera-bottom={-8}
        shadow-bias={-0.00012}
        shadow-radius={4}
      />
      <rectAreaLight position={[10, 8.3, -8]} rotation={[0, Math.PI, 0]} width={11} height={5} intensity={5.5} color="#dff6ee" />
      <rectAreaLight position={[-10, 7.5, 3]} rotation={[-0.45, 0.35, 0]} width={8} height={4} intensity={2.7} color="#fff5df" />

      <mesh position={[0, -0.08, -2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[52, 50]} />
        <meshPhysicalMaterial color="#e2e1da" roughness={0.23} metalness={0.01} clearcoat={0.42} clearcoatRoughness={0.2} />
      </mesh>

      <mesh geometry={facade} position={[0, 0, -12.3]} receiveShadow castShadow>
        <meshPhysicalMaterial color="#f3f1e9" roughness={0.42} clearcoat={0.16} />
      </mesh>

      <mesh position={[-15.55, 4.65, -8.1]} rotation={[0, 0.22, 0]} receiveShadow castShadow>
        <boxGeometry args={[1.25, 9.3, 8.2]} />
        <meshPhysicalMaterial color="#0d4a5b" roughness={0.36} metalness={0.05} />
      </mesh>
      <mesh position={[-14.85, 5.25, -3.95]} rotation={[0, 0.22, 0]}>
        <planeGeometry args={[0.08, 7.4]} />
        <meshBasicMaterial color="#9bded5" toneMapped={false} />
      </mesh>

      <FeatureWall language={language} />
      <GlassZone language={language} />
      <DigitalKnowledgeInstallation language={language} />
      <ArchitecturalCeiling />

      <mesh position={[3.05, 0.05, -10.55]} receiveShadow>
        <latheGeometry args={[columnProfile, 72]} />
        <meshPhysicalMaterial color="#f0eee7" roughness={0.3} clearcoat={0.3} />
      </mesh>

      <mesh geometry={floorRibbonA}>
        <meshPhysicalMaterial color="#225d68" roughness={0.3} metalness={0.38} />
      </mesh>
      <mesh geometry={floorRibbonB}>
        <meshBasicMaterial color="#6cbab4" toneMapped={false} />
      </mesh>

      <ContactShadows
        position={[0, 0.015, -2]}
        opacity={0.24}
        scale={34}
        blur={2.7}
        far={22}
        resolution={1024}
        frames={1}
        color="#36575b"
      />
      <CameraAndMetrics />
    </>
  );
}

export default function ArchitectureScene({ language }: { language: Language }) {
  return (
    <Canvas
      aria-label="Static 3D architectural proof for the Tajseer Innovation and Knowledge Experience Center"
      camera={{ position: [0.8, 5.25, 22.4], fov: 37, near: 0.1, far: 100 }}
      dpr={[1, 1.5]}
      frameloop="demand"
      shadows="percentage"
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.shadowMap.enabled = true;
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.04;
        gl.outputColorSpace = SRGBColorSpace;
        gl.domElement.dataset.gate = "gate-1-tajseer-architecture";
        gl.domElement.dataset.assetPolicy = "procedural-architecture-no-placeholder-props";
      }}
    >
      <Architecture language={language} />
    </Canvas>
  );
}
