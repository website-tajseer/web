import { useLayoutEffect, useRef } from "react";
import { Html } from "@react-three/drei";
import { InstancedMesh, Object3D, Vector3 } from "three";
import { members, jointById } from "./lesson";
import { beamGeometry } from "./StemExperiment";
import { lessonStore, useLesson } from "./state";
import { quality } from "./quality";

export default function Environment() {
  const s = useLesson();
  const ref = useRef<InstancedMesh>(null);
  const bays = s.mobile ? quality.mobile.bays : quality.desktop.bays;
  useLayoutEffect(() => {
    const dummy = new Object3D(),
      up = new Vector3(0, 1, 0);
    let i = 0;
    // Repeat the side/roof construction, leaving the central circulation path open.
    for (let bay = 1; bay <= bays; bay++)
      for (const m of members.filter(
        (m) => m.id !== "M14" && (m.a >= "E" || (m.a < "E" && m.b >= "E")),
      )) {
        const a = new Vector3(...jointById(m.a).position),
          b = new Vector3(...jointById(m.b).position);
        a.z -= bay * 4;
        b.z -= bay * 4;
        dummy.position.copy(a).add(b).multiplyScalar(0.5);
        dummy.quaternion.setFromUnitVectors(up, b.clone().sub(a).normalize());
        dummy.scale.set(0.065, a.distanceTo(b), 0.065);
        dummy.updateMatrix();
        ref.current!.setMatrixAt(i++, dummy.matrix);
      }
    ref.current!.count = i;
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [bays]);
  return (
    <group>
      <instancedMesh
        ref={ref}
        args={[beamGeometry, undefined, bays * members.length]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#6eaaa9"
          roughness={0.54}
          metalness={0.2}
        />
      </instancedMesh>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[i % 2 ? 2.15 : -2.15, -0.92, -5 - i * 5]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.95, 1.1, 0.95]} />
            <meshStandardMaterial
              color={s.station === i ? "#c1c8b5" : "#698d8c"}
              roughness={0.82}
            />
          </mesh>
          <mesh position={[0, 0.57, 0]}>
            <boxGeometry args={[1.05, 0.05, 1.05]} />
            <meshStandardMaterial color="#e3dcc4" roughness={0.58} />
          </mesh>
          <group
            position={[0, 0.65, 0]}
            rotation={[0, i % 2 ? -0.3 : 0.3, 0]}
            onClick={(e) => {
              e.stopPropagation();
              lessonStore.set({ station: i });
            }}
          >
            <mesh position={[-0.28, 0.23, 0]} rotation={[0, 0, -0.52]}>
              <boxGeometry args={[0.045, 0.56, 0.065]} />
              <meshStandardMaterial color="#e4d8b8" roughness={0.45} />
            </mesh>
            <mesh position={[0.01, 0.23, 0]} rotation={[0, 0, 0.52]}>
              <boxGeometry args={[0.045, 0.56, 0.065]} />
              <meshStandardMaterial color="#81c9bf" roughness={0.5} />
            </mesh>
            <mesh position={[-0.13, 0, 0]}>
              <boxGeometry args={[0.58, 0.045, 0.065]} />
              <meshStandardMaterial color="#c7e3ce" roughness={0.5} />
            </mesh>
          </group>
          <Html
            position={[0, 0.05, 0.49]}
            center
            distanceFactor={15}
            zIndexRange={[4, 0]}
          >
            <button
              className="station-label"
              onClick={() => lessonStore.set({ station: i })}
              aria-pressed={s.station === i}
            >
              <span dir="ltr">0{i + 1}</span>
              {s.lang === "ar"
                ? ["الشكل", "العلاقة", "الثبات"][i]
                : ["Shape", "Connection", "Rigidity"][i]}
            </button>
          </Html>
          <pointLight
            position={[0, 1.7, 0.4]}
            intensity={s.station === i ? 5 : 1.5}
            distance={5}
            color="#e3d3a3"
          />
        </group>
      ))}
      {Array.from({ length: bays }, (_, i) => (
        <group key={i} position={[0, 0, -4 - i * 4]}>
          <mesh position={[0, 1.47, 0]}>
            <boxGeometry args={[5.6, 0.025, 0.12]} />
            <meshStandardMaterial
              color="#dce5cd"
              emissive="#b2d7c6"
              emissiveIntensity={0.35}
            />
          </mesh>
          <mesh position={[0, -1.51, 0]} receiveShadow>
            <boxGeometry args={[5.85, 0.07, 3.94]} />
            <meshStandardMaterial
              color={i % 2 ? "#497071" : "#567c7b"}
              roughness={0.8}
            />
          </mesh>
          {[-1, 1].map((side) => (
            <group key={side}>
              <mesh position={[side * 2.83, -1.44, 0]}>
                <boxGeometry args={[0.024, 0.01, 3.8]} />
                <meshStandardMaterial color="#cfbd8e" roughness={0.55} />
              </mesh>
              <mesh position={[side * 3.22, 0.03, 0]} receiveShadow>
                <boxGeometry args={[0.075, 2.9, 3.7]} />
                <meshStandardMaterial color="#214b54" roughness={0.9} />
              </mesh>
              <mesh position={[side * 3, -1.48, 1.94]}>
                <boxGeometry args={[0.34, 0.14, 0.34]} />
                <meshStandardMaterial
                  color="#9fac9e"
                  metalness={0.3}
                  roughness={0.5}
                />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      <mesh position={[0, 0, -bays * 4 - 2.1]} receiveShadow>
        <boxGeometry args={[6, 3, 0.12]} />
        <meshStandardMaterial color="#173f4a" roughness={0.85} />
      </mesh>
      <Html
        position={[0, 0.3, -bays * 4 + 1]}
        center
        distanceFactor={26}
        zIndexRange={[3, 0]}
      >
        <div className="interior-inscription">
          <span dir="ltr">A — B — C</span>
          <strong>
            {s.lang === "ar"
              ? "كل علاقة تفتح فهماً جديداً."
              : "Every connection reveals something."}
          </strong>
        </div>
      </Html>
    </group>
  );
}
