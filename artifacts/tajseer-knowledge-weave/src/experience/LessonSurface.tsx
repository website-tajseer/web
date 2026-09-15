import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { CanvasTexture, Group, SRGBColorSpace } from "three";
import { lessonStore, useLesson } from "./state";
import { poseAt } from "./timeline";

function printedPage(ar: boolean) {
  const c = document.createElement("canvas");
  c.width = 1536;
  c.height = 1024;
  const x = c.getContext("2d")!;
  x.fillStyle = "#f8f5ec";
  x.fillRect(0, 0, 1536, 1024);
  // Deterministic printed-paper grain: no remote assets or large textures.
  for (let i = 0; i < 5000; i++) {
    x.fillStyle = `rgba(94,79,55,${0.015 + (i % 5) * 0.003})`;
    x.fillRect((i * 127) % 1536, (i * 193) % 1024, 2, 1);
  }
  x.strokeStyle = "#c4cdc4";
  x.lineWidth = 1;
  x.strokeRect(40, 40, 1456, 944);
  x.fillStyle = "#247e84";
  x.font = "500 20px sans-serif";
  x.fillText(
    ar ? "تجسير  /  مختبر الأفكار" : "TAJSEER  /  THE LEARNING EDITIONS",
    75,
    92,
  );
  x.textAlign = "right";
  x.fillText("VOL. 01    /    GEOMETRY", 1460, 92);
  x.textAlign = "left";
  x.fillStyle = "#193e48";
  x.font = ar ? "600 62px sans-serif" : "500 70px Georgia";
  x.fillText(ar ? "شكلٌ يمنح الثبات" : "A shape that holds.", 75, 198);
  x.font = "19px sans-serif";
  x.fillStyle = "#658087";
  x.fillText(
    ar
      ? "من فكرة مكتوبة إلى تجربة يمكن استكشافها"
      : "An inquiry into joints, members & the power of a diagonal.",
    78,
    246,
  );
  x.beginPath();
  x.moveTo(75, 278);
  x.lineTo(1460, 278);
  x.stroke();
  x.font = "15px monospace";
  x.fillStyle = "#49747b";
  x.fillText("FIG. 01  /  A—B—C—D", 75, 330);
  x.fillText("a", 740, 468);
  x.fillText("b", 1310, 580);
  x.strokeStyle = "#bed2cb";
  for (let i = 0; i < 29; i++) {
    x.beginPath();
    x.moveTo(105 + i * 46, 873);
    x.lineTo(105 + i * 46, i % 5 === 0 ? 859 : 867);
    x.stroke();
  }
  x.fillStyle = "#247e84";
  x.font = "500 22px sans-serif";
  x.fillText(
    ar ? "السؤال أولاً. ثم التجربة." : "FIRST A QUESTION. THEN AN EXPERIMENT.",
    75,
    936,
  );
  x.textAlign = "right";
  x.font = "18px monospace";
  x.fillText("01 / 06", 1460, 936);
  const texture = new CanvasTexture(c);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
function printedLayer(index: number) {
  const c = document.createElement("canvas");
  c.width = 768;
  c.height = 448;
  const x = c.getContext("2d")!;
  x.fillStyle = "rgba(220,236,224,.32)";
  x.fillRect(0, 0, 768, 448);
  x.strokeStyle = "#458d92";
  x.lineWidth = 2;
  x.strokeRect(18, 18, 732, 412);
  const points = [
    [80, 350],
    [685, 350],
    [685, 100],
    [80, 100],
  ];
  x.fillStyle = "#276970";
  x.font = "18px monospace";
  x.fillText(
    `0${index + 1} / ${["A · B · C · D", "AB · BC · CD · DA", "AC"][index]}`,
    35,
    55,
  );
  if (index === 1) {
    x.beginPath();
    points.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b)));
    x.closePath();
    x.stroke();
  }
  if (index === 2) {
    x.lineWidth = 5;
    x.beginPath();
    x.moveTo(80, 350);
    x.lineTo(685, 100);
    x.stroke();
  }
  points.forEach(([a, b], i) => {
    x.beginPath();
    x.arc(a, b, 5, 0, Math.PI * 2);
    x.fill();
    x.fillText("ABCD"[i], a - 5, b - 17);
  });
  const texture = new CanvasTexture(c);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
export function LessonSurface() {
  const { lang, layer } = useLesson();
  const texture = useMemo(() => printedPage(lang === "ar"), [lang]);
  const layerTextures = useMemo(() => [0, 1, 2].map(printedLayer), []);
  const paper = useRef<Group>(null),
    sheets = useRef<Group>(null);
  const { gl } = useThree();
  useEffect(() => () => texture.dispose(), [texture]);
  useEffect(
    () => () => layerTextures.forEach((t) => t.dispose()),
    [layerTextures],
  );
  useFrame(() => {
    const s = lessonStore.get(),
      p = Number(gl.domElement.dataset.progress || s.progress),
      pose = poseAt(p, s.mobile);
    if (paper.current) {
      paper.current.position.y = -1.84 - (1 - pose.paper) * 2.5;
      paper.current.visible = pose.paper > 0.005;
    }
    if (sheets.current) {
      sheets.current.visible = pose.layer > 0.01;
      sheets.current.children.forEach((sheet, i) => {
        sheet.position.y = -1.5 + pose.layer * (i + 1) * 0.65;
      });
    }
  });
  return (
    <>
      <group ref={paper} position={[0, -1.84, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[i * 0.012, -i * 0.024, 0]} receiveShadow>
            <boxGeometry args={[9.5, 0.023, 6.4]} />
            <meshStandardMaterial
              color={i === 0 ? "#f6f1e6" : "#ded7c7"}
              roughness={0.95}
            />
          </mesh>
        ))}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.015, 0]}
          receiveShadow
        >
          <planeGeometry args={[9.5, 6.4]} />
          <meshStandardMaterial map={texture} roughness={0.95} />
        </mesh>
        <mesh position={[-4.45, 0.035, 0]}>
          <boxGeometry args={[0.025, 0.016, 5.9]} />
          <meshStandardMaterial color="#c1c8bf" />
        </mesh>
      </group>
      <group ref={sheets}>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              lessonStore.set({
                layer: i,
                selected: i === 0 ? "A" : i === 1 ? "M01" : "M13",
              });
            }}
          >
            <planeGeometry args={[6.7 - i * 0.35, 3.7]} />
            <meshStandardMaterial
              color={i === 1 ? "#6bb3b5" : "#d8e9df"}
              map={layerTextures[i]}
              transparent
              opacity={layer === i ? 0.75 : 0.4}
              depthWrite={false}
              roughness={0.7}
              side={2}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}
