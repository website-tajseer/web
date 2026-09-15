import { Html } from "@react-three/drei";
import {
  Canvas,
  useFrame,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, Group, Vector3, CanvasTexture, SRGBColorSpace } from "three";
type Props = {
  ar: boolean;
  angle: number;
  progress: number;
  selected: number;
  select: (n: number) => void;
  scrub: number;
  reduced: boolean;
  onFailure: () => void;
};
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (p: number, a: number, b: number) => {
  const t = clamp((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};
function MediaArtwork({ kind, scrub }: { kind: number; scrub: number }) {
  return (
    <group position={[0, 0.12, 0.12]}>
      {kind === 0 ? (
        /* Kind 0: Interactive Multimedia Surface */
        <group scale={0.88}>
          <mesh position={[0, 0, 0.05]} castShadow>
            <planeGeometry args={[1.8, 1.3]} />
            <meshStandardMaterial
              color="#0d3b45"
              roughness={0.25}
              metalness={0.1}
            />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <planeGeometry args={[1.72, 1.22]} />
            <meshStandardMaterial
              color="#1a6370"
              roughness={0.4}
              emissive="#0c363d"
              emissiveIntensity={0.4}
            />
          </mesh>
          {[-0.6, 0, 0.6].map((xPos, idx) => (
            <mesh key={idx} position={[xPos, 0, 0.12 + Math.sin(scrub * 4 + idx) * 0.04]}>
              <boxGeometry args={[0.48, 0.95, 0.04]} />
              <meshStandardMaterial
                color={idx === 1 ? "#d4b56a" : "#3bbab5"}
                roughness={0.3}
                metalness={0.2}
              />
            </mesh>
          ))}
        </group>
      ) : kind === 1 ? (
        /* Kind 1: E-learning Course Structural Flow Diagram */
        <group rotation={[0.1, scrub * 0.4, 0]} scale={0.85}>
          {["LESSON", "CONCEPT", "PRACTICE", "FEEDBACK", "MASTERY"].map((step, i) => (
            <group key={step} position={[(i - 2) * 0.42, (i - 2) * 0.18, i * 0.06]}>
              <mesh castShadow>
                <boxGeometry args={[0.38, 0.55, 0.05]} />
                <meshStandardMaterial
                  color={i === 2 ? "#d5b569" : "#175966"}
                  roughness={0.35}
                />
              </mesh>
              {i < 4 && (
                <mesh position={[0.21, 0.09, 0]} rotation={[0, 0, -Math.PI / 6]}>
                  <cylinderGeometry args={[0.012, 0.012, 0.4, 8]} />
                  <meshStandardMaterial color="#37b5b0" emissive="#147b80" />
                </mesh>
              )}
            </group>
          ))}
        </group>
      ) : (
        /* Kind 2: STEM Structural Laboratory Model */
        <group scale={0.82}>
          {/* Engineering Truss Joints & Force Nodes */}
          {[-0.7, 0, 0.7].map((xVal, i) => (
            <group key={i} position={[xVal, Math.sin(i * 1.5 + scrub * 3) * 0.1, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshStandardMaterial
                  color={i === 1 ? "#d4b56a" : "#207280"}
                  metalness={0.6}
                  roughness={0.25}
                />
              </mesh>
              <mesh position={[0, -0.4, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.8, 12]} />
                <meshStandardMaterial color="#428a94" metalness={0.4} />
              </mesh>
            </group>
          ))}
          {/* Force Vectors */}
          <mesh position={[0, 0.4, 0.05]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.08, 0.25, 12]} />
            <meshStandardMaterial color="#d4b56a" emissive="#b89343" emissiveIntensity={0.6} />
          </mesh>
        </group>
      )}
    </group>
  );
}
function Rule({
  a,
  b,
  color = "#7caeaf",
  r = 0.015,
}: {
  a: number[];
  b: number[];
  color?: string;
  r?: number;
}) {
  const mid = new Vector3(...a).add(new Vector3(...b)).multiplyScalar(0.5),
    d = new Vector3(...b).sub(new Vector3(...a));
  const q = useMemo(() => {
    const g = new Group();
    g.quaternion.setFromUnitVectors(
      new Vector3(0, 1, 0),
      d.clone().normalize(),
    );
    return g.quaternion;
  }, [...a, ...b]);
  return (
    <mesh position={mid} quaternion={q}>
      <cylinderGeometry args={[r, r, d.length(), 8]} />
      <meshStandardMaterial color={color} roughness={0.45} />
    </mesh>
  );
}
function Leaf({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  color = "#399d8e",
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color?: string;
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh scale={[0.52, 1, 0.12]} castShadow>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <Rule
        a={[0, -0.85, 0.13]}
        b={[0, 0.87, 0.13]}
        color="#c8e2b8"
        r={0.018}
      />
      {[-1, 1].map((sign) =>
        [0, 1, 2, 3].map((i) => (
          <Rule
            key={`${sign}-${i}`}
            a={[0, -0.55 + i * 0.32, 0.12]}
            b={[sign * (0.25 + Math.sin(i) * 0.12), -0.36 + i * 0.32, 0.12]}
            color="#95c7a9"
            r={0.009}
          />
        )),
      )}
    </group>
  );
}
/** SpatialAtlasInstallation — High-end architectural 3D educational sculpture (replaces primitive plant) */
function SpatialAtlasInstallation({
  selected,
  select,
  spread = 0,
}: {
  selected: number;
  select: (n: number) => void;
  spread?: number;
}) {
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        select((selected + 1) % 5);
      }}
    >
      {/* Central architectural core column (brass/dark teal finish) */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 3.4, 32]} />
        <meshStandardMaterial
          color="#0f4550"
          metalness={0.7}
          roughness={0.2}
          emissive="#082b33"
        />
      </mesh>

      {/* Gold metallic accent rings */}
      {[-1.2, -0.4, 0.4, 1.2].map((yPos, idx) => (
        <mesh key={idx} position={[0, yPos, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.12, 0.018, 16, 64]} />
          <meshStandardMaterial
            color="#d4b56a"
            metalness={0.85}
            roughness={0.15}
          />
        </mesh>
      ))}

      {/* 5 Spatial Service Plates floating around the core */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i * Math.PI * 2) / 5 + spread * 0.5;
        const radius = 0.8 + spread * 0.35;
        const yPos = -0.9 + i * 0.45;
        const isSel = i === selected;

        return (
          <group
            key={i}
            position={[
              Math.sin(angle) * radius,
              yPos,
              Math.cos(angle) * radius,
            ]}
            rotation={[0, angle + Math.PI / 2, 0]}
          >
            {/* Glass panel frame */}
            <mesh castShadow>
              <boxGeometry args={[0.75, 0.95, 0.035]} />
              <meshStandardMaterial
                color={isSel ? "#d4b56a" : i % 2 ? "#147b80" : "#24606b"}
                transparent
                opacity={isSel ? 0.95 : 0.8}
                roughness={0.2}
                metalness={0.3}
              />
            </mesh>

            {/* Inner illuminated surface */}
            <mesh position={[0, 0, 0.022]}>
              <planeGeometry args={[0.68, 0.88]} />
              <meshStandardMaterial
                color={isSel ? "#fff8e7" : "#0d3b45"}
                emissive={isSel ? "#d4b56a" : "#0c3038"}
                emissiveIntensity={isSel ? 0.5 : 0.2}
              />
            </mesh>

            {/* Connecting architectural strut */}
            <Rule
              a={[0, 0, 0]}
              b={[-Math.sin(angle) * radius, 0, -Math.cos(angle) * radius]}
              color={isSel ? "#d4b56a" : "#37b5b0"}
              r={0.012}
            />
          </group>
        );
      })}

      {/* Base grounding pedestal */}
      <mesh position={[0, -1.75, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.6, 0.75, 0.15, 64]} />
        <meshStandardMaterial
          color="#123d47"
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}
function pageTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 768;
  const x = c.getContext("2d")!;
  x.fillStyle = "#f4f0e5";
  x.fillRect(0, 0, 1024, 768);
  x.fillStyle = "#17618c";
  x.font = "18px sans-serif";
  x.fillText("TAJSEER     /     LEARNING IN MANY FORMS", 48, 58);
  x.font = "60px Georgia";
  x.fillStyle = "#173f51";
  x.fillText("The living world.", 48, 140);
  x.font = "16px sans-serif";
  x.fillText("OBSERVE     /     CONNECT     /     DISCOVER", 48, 183);
  x.strokeStyle = "#b8c7bd";
  x.beginPath();
  x.moveTo(48, 211);
  x.lineTo(975, 211);
  x.stroke();
  for (let i = 0; i < 12; i++) {
    x.fillStyle = i % 4 === 0 ? "#679591" : "#bbc7bc";
    x.fillRect(55, 260 + i * 23, 170 - (i % 3) * 23, 3);
  }
  for (let i = 0; i < 5; i++) {
    x.strokeRect(780, 270 + i * 70, 165, 50);
    x.fillText(`0${i + 1}  /  LEARNING`, 796, 300 + i * 70);
  }
  x.font = "14px monospace";
  x.fillText("EDUCATION  •  TECHNOLOGY  •  THINKING", 48, 710);
  x.fillText("01 — 05", 860, 710);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}
export function Knowledge({
  p,
  selected,
  select,
  scrub,
  ar,
  angle,
}: {
  ar: boolean;
  angle: number;
  p: number;
  selected: number;
  select: (n: number) => void;
  scrub: number;
}) {
  const root = useRef<Group>(null);
  const texture = useMemo(pageTexture, []);
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame(() => {
    if (root.current) {
      const m = ease(p, 0.08, 0.5);
      root.current.rotation.x = 0.12 - m * 0.12;
      root.current.rotation.y = -0.2 + m * 0.3 + angle;
      root.current.position.set(ar ? -2.6 : 2.6, 0, -m * 2);
      root.current.visible = p < 0.87;
    }
  });
  const m = ease(p, 0.08, 0.5);
  return (
    <group ref={root}>
      <group position={[0, -1.95 - m * 3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh
            key={i}
            position={[i * 0.012, 0, -i * 0.035]}
            receiveShadow
            castShadow
          >
            <boxGeometry args={[8.4, 6.1, 0.028]} />
            <meshStandardMaterial
              color={i === 5 ? "#126397" : "#e5e0d3"}
              roughness={0.8}
            />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.025]}>
          <planeGeometry args={[8.4, 6.1]} />
          <meshStandardMaterial map={texture} roughness={0.85} />
        </mesh>
        <mesh position={[-4.2, 0, 0]}>
          <boxGeometry args={[0.13, 6.1, 0.3]} />
          <meshStandardMaterial color="#126397" />
        </mesh>
      </group>
      <group position={[0, 0.25 + m * 0.8, 0]} scale={1 + m * 0.15}>
        <SpatialAtlasInstallation selected={selected} select={select} spread={scrub} />
      </group>
      {[0, 1, 2].map((i) => (
        <group
          key={i}
          position={[
            (i - 1) * (2.4 + m * 2.1),
            0.1 + m * (i === 1 ? 2.3 : 0.2) + scrub * 0.25 * i,
            -1.1 - m * (i === 1 ? 2 : 0),
          ]}
          rotation={[m * 0.12, (i - 1) * m * -0.28, 0]}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => (document.body.style.cursor = "auto")}
          onClick={(e) => {
            e.stopPropagation();
            select(i);
          }}
        >
          <mesh castShadow>
            <boxGeometry args={[2.15, 2.55, 0.065]} />
            <meshStandardMaterial
              color={
                selected === i
                  ? "#d9e9df"
                  : ["#c8dce0", "#e8ddc4", "#a9c8da"][i]
              }
              transparent
              opacity={0.88}
              roughness={0.35}
            />
          </mesh>
          <MediaArtwork kind={i} scrub={scrub} />
          {p < 0.65 && (
            <Html
              position={[0, -1.06, 0.12]}
              center
              transform
              distanceFactor={5}
            >
              <span className="cp-media-label">
                {ar
                  ? ["الرسم التوضيحي", "طبقات المعرفة", "الحركة والشرح"][i]
                  : [
                      "ILLUSTRATION",
                      "LAYERS OF KNOWLEDGE",
                      "MOTION & EXPLANATION",
                    ][i]}
              </span>
            </Html>
          )}
          <Rule a={[-0.88, 1.04, 0.07]} b={[0.88, 1.04, 0.07]} r={0.009} />
        </group>
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <group
          key={i}
          position={[-3.5 + i * 1.7, -0.1 - m * 2.2, 2.3 + m * 1.3]}
          rotation={[-0.5, 0, 0]}
          onClick={(e) => {e.stopPropagation();select(i % 3)}}
        >
          <mesh castShadow>
            <boxGeometry args={[1.4, 0.65, 0.14]} />
            <meshStandardMaterial
              color={i === selected ? "#197ca2" : "#dedbcc"}
            />
          </mesh>
          <group position={[0,0,.16]} scale={.2 + i*.035}>
            <Leaf rotation={[0,0,-.4]} color={i===selected?'#d1b270':'#368d8d'}/>
            {i>1&&<Leaf position={[-.5,-.3,.1]} rotation={[0,0,.6]} scale={.65}/>}
          </group>
          {i<4&&<Rule a={[.7,0,0]} b={[1,0,0]} r={.018} color="#bcab7b"/>}
        </group>
      ))}
    </group>
  );
}
export function Environment({
  p,
  selected,
  select,
  scrub,
  angle,
}: {
  angle: number;
  p: number;
  selected: number;
  select: (n: number) => void;
  scrub: number;
}) {
  const root = useRef<Group>(null);
  useFrame(() => {
    if (root.current) {
      root.current.visible = p > 0.56;
      root.current.position.z = -32 + ease(p, 0.55, 1) * 32;
    }
  });
  return (
    <group ref={root}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -3.1, -8]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          color="#102e43"
          metalness={0.28}
          roughness={0.52}
        />
      </mesh>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <group key={i} position={[0, -3, -i * 5]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[7 + i * 0.7, 0.025, 6, 96, Math.PI]} />
            <meshStandardMaterial
              color="#367b95"
              emissive="#205571"
              emissiveIntensity={0.4}
            />
          </mesh>
          <mesh position={[-9, 5, 0]}>
            <boxGeometry args={[0.12, 16, 0.3]} />
            <meshStandardMaterial color="#1c526e" />
          </mesh>
          <mesh position={[9, 5, 0]}>
            <boxGeometry args={[0.12, 16, 0.3]} />
            <meshStandardMaterial color="#1c526e" />
          </mesh>
        </group>
      ))}
      {[0, 1, 2].map((i) => (
        <group
          key={i}
          position={[[-5, 2.3, 7][i], [-0.1, 0.7, 0.4][i], [-3, -9, -17][i]]}
          onClick={(e) => {
            e.stopPropagation();
            select(i);
          }}
        >
          <mesh position={[0, -2.55, 0]} receiveShadow castShadow>
            <cylinderGeometry args={[2.1, 2.3, 0.4, 64]} />
            <meshStandardMaterial
              color={selected === i ? "#245a74" : "#15394e"}
              metalness={0.4}
              roughness={0.45}
            />
          </mesh>
          <mesh position={[0, -2.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.9, 0.023, 8, 96]} />
            <meshStandardMaterial
              color={selected === i ? "#e8bb75" : "#51b9c1"}
              emissive="#30959d"
              emissiveIntensity={0.6}
            />
          </mesh>
          {i === 0 ? (
            <group scale={1.35} rotation={[0, angle, 0]}>
              <SpatialAtlasInstallation selected={selected} select={select} spread={scrub} />
            </group>
          ) : i === 1 ? (
            <group rotation={[0.4, scrub * 1.5 + angle, 0.15]}>
              {[0, 1, 2, 3, 4].map((j) => (
                <mesh
                  key={j}
                  position={[0, (j - 2) * (0.35 + scrub * 0.25), 0]}
                  rotation={[Math.PI / 2, 0, j * 0.15]}
                  castShadow
                >
                  <torusGeometry
                    args={[1.65 - j * 0.19, 0.12, 12, 64, Math.PI * 1.7]}
                  />
                  <meshStandardMaterial
                    color={
                      ["#68c6c2", "#3198b6", "#e2b575", "#6aafc6", "#e1ddd0"][j]
                    }
                    metalness={0.25}
                    roughness={0.38}
                  />
                </mesh>
              ))}
            </group>
          ) : (
            <group rotation={[0, -0.35, 0]}>
              {[0, 1, 2].map((j) => (
                <group
                  key={j}
                  position={[(j - 1) * 0.65, (j - 1) * 0.45, j * 0.45]}
                >
                  <mesh castShadow>
                    <boxGeometry args={[2.8, 2, 0.08]} />
                    <meshStandardMaterial
                      color={["#2b7699", "#75c8bf", "#d6b078"][j]}
                      roughness={0.4}
                    />
                  </mesh>
                  {[0, 1, 2, 3, 4].map((k) => (
                    <mesh key={k} position={[-0.9 + k * 0.43, 0, 0.08]}>
                      <boxGeometry
                        args={[0.17, 0.4 + Math.sin(k + scrub * 5) * 0.3, 0.04]}
                      />
                      <meshStandardMaterial color="#cfe8df" />
                    </mesh>
                  ))}
                </group>
              ))}
            </group>
          )}
          {p > 0.9 && (
            <Html position={[0, -2.05, 1.6]} center distanceFactor={14}>
              <div className="cp-station-label">
                <small>0{i + 1} / TAJSEER</small>
                <strong>
                  {document.documentElement.lang === "ar"
                    ? ["أنظمة حيّة", "مقطع طبقي", "وسائط مكانية"][i]
                    : [
                        "Living systems",
                        "Layered cross-section",
                        "Spatial media",
                      ][i]}
                </strong>
              </div>
            </Html>
          )}
          <pointLight
            position={[0, 2, 1]}
            color={selected === i ? "#e3be83" : "#70c9e0"}
            intensity={selected === i ? 35 : 12}
            distance={10}
          />
        </group>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <group
          key={i}
          position={[-7 + i * 4.2, 3.8, -18 - i * 0.8]}
          rotation={[0, (i - 1.5) * -0.14, 0]}
        >
          <mesh>
            <boxGeometry args={[3.5, 2.1, 0.08]} />
            <meshStandardMaterial color="#184b68" roughness={0.7} />
          </mesh>
          <group scale={0.75}>
            <MediaArtwork kind={i % 3} scrub={scrub} />
          </group>
        </group>
      ))}
      <Rule a={[-7, -2.8, -3]} b={[2, -2.8, -9]} color="#cfac72" r={0.02} />
      <Rule a={[2, -2.8, -9]} b={[7, -2.8, -17]} color="#cfac72" r={0.02} />
    </group>
  );
}
function Contents(props: Props) {
  const { camera, scene, invalidate, gl } = useThree();
  const p = useRef(props.progress);
  useEffect(() => invalidate(), [props, invalidate]);
  useFrame((state, dt) => {
    p.current = props.reduced
      ? props.progress
      : p.current + (props.progress - p.current) * (1 - Math.exp(-dt * 5));
    const t = p.current,
      m = ease(t, 0.08, 0.5),
      v = ease(t, 0.55, 1);
    const mobile = state.size.width < 760;
    camera.position.set(
      (7 - m * 3) * (1 - v) + v * 1.5,
      (8 - m * 3) * (1 - v) + v * 2,
      (15 + m * 2) * (1 - v) + v * 9,
    );
    if (props.ar) camera.position.x *= -1;
    if (mobile) camera.position.multiplyScalar(1.5);
    camera.lookAt(
      (props.ar ? -1 : 1) * (mobile ? 2.6 : 0.8),
      mobile ? 1.2 : 0.3,
      -v * 8,
    );
    if (!props.reduced) {
      camera.position.x += state.pointer.x * 0.18;
      camera.position.y += state.pointer.y * 0.1;
    }
    scene.background = new Color("#eee9de")
      .lerp(new Color("#21576b"), m)
      .lerp(new Color("#061c30"), v);
    if (scene.fog) scene.fog.color.copy(scene.background as Color);
    gl.domElement.dataset.checkpoint =
      t < 0.28 ? "hero" : t < 0.7 ? "multimedia" : "immersive";
    if (Math.abs(p.current - props.progress) > 0.0001) invalidate();
  });
  return (
    <>
      <fog attach="fog" args={["#eee9de", 28, 80]} />
      <ambientLight intensity={0.8} />
      <hemisphereLight args={["#eaf8ff", "#476967", 1.6]} />
      <directionalLight
        position={[3, 12, 8]}
        intensity={3.8}
        color="#fff1d5"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-normalBias={0.04}
      />
      <directionalLight
        position={[-8, 4, -6]}
        intensity={2.4}
        color="#64bee0"
      />
      <Knowledge
        ar={props.ar}
        angle={props.angle}
        p={props.progress}
        selected={props.selected}
        select={props.select}
        scrub={props.scrub}
      />
      {props.progress > 0.5 && (
        <Environment
          angle={props.angle}
          p={props.progress}
          selected={props.selected}
          select={props.select}
          scrub={props.scrub}
        />
      )}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -4, -5]}
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial
          color={
            props.progress > 0.7
              ? "#102d43"
              : props.progress > 0.28
                ? "#21576b"
                : "#d8d7cc"
          }
          roughness={0.83}
        />
      </mesh>
    </>
  );
}
export default function Scene(props: Props) {
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.5]}
      frameloop="demand"
      camera={{ position: [7, 8, 15], fov: 43, near: 0.1, far: 150 }}
      onCreated={({ gl }) =>
        gl.domElement.addEventListener("webglcontextlost", props.onFailure, {
          once: true,
        })
      }
    >
      <Contents {...props} />
    </Canvas>
  );
}
