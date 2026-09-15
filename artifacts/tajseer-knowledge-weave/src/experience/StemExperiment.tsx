import { useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import {
  Group,
  Mesh,
  Vector3,
  Quaternion,
  CylinderGeometry,
  SphereGeometry,
  BoxGeometry,
} from "three";
import {
  joints,
  members,
  pointAt,
  jointById,
  neighbors,
  type Member,
  type Joint,
} from "./lesson";
import { lessonStore, useLesson } from "./state";
import { blend } from "./timeline";

// Shared, application-lifetime primitives. No geometry churn while dragging/scrolling.
export const beamGeometry = new CylinderGeometry(1, 1, 1, 8);
const collarGeometry = new CylinderGeometry(1, 1, 1, 16);
const boltGeometry = new CylinderGeometry(1, 1, 1, 6);
const hitGeometry = new SphereGeometry(0.24, 8, 6);
const rulerGeometry = new BoxGeometry(1, 1, 1);
const up = new Vector3(0, 1, 0);
function select(e: ThreeEvent<MouseEvent>, id: string) {
  e.stopPropagation();
  if (e.delta < 6) lessonStore.set({ selected: id });
}
function MemberObject({ member }: { member: Member }) {
  const ref = useRef<Mesh>(null),
    hit = useRef<Mesh>(null);
  const { gl } = useThree();
  const s = useLesson();
  const selected = s.selected === member.id,
    related = neighbors(s.selected).includes(member.id);
  const a = useRef(new Vector3()),
    b = useRef(new Vector3()),
    q = useRef(new Quaternion());
  useFrame(() => {
    const state = lessonStore.get(),
      p = Number(gl.domElement.dataset.progress || state.progress),
      d = blend(p, 0.18, 0.44);
    const canonical = 1 - blend(p, 0.65, 0.77);
    a.current.set(
      ...pointAt(
        jointById(member.a),
        p,
        state.explode * canonical,
        state.shear * canonical,
        state.braced,
      ),
    );
    b.current.set(
      ...pointAt(
        jointById(member.b),
        p,
        state.explode * canonical,
        state.shear * canonical,
        state.braced,
      ),
    );
    // The two diagram diagonals rise into a roof/canopy, leaving a safe entry.
    const fold = blend(p, 0.68, 0.8);
    if (member.id === "M13") {
      a.current.lerp(new Vector3(...jointById("D").position), fold);
      b.current.lerp(new Vector3(...jointById("G").position), fold);
    }
    if (member.id === "M14")
      a.current.lerp(new Vector3(...jointById("H").position), fold);
    const length = a.current.distanceTo(b.current);
    q.current.setFromUnitVectors(
      up,
      b.current.clone().sub(a.current).normalize(),
    );
    for (const mesh of [ref.current, hit.current])
      if (mesh) {
        mesh.visible =
          (!member.brace || state.braced || p > 0.7) &&
          (p > 0.22 || member.a < "E");
        mesh.position.copy(a.current).add(b.current).multiplyScalar(0.5);
        mesh.quaternion.copy(q.current);
        const radius =
          mesh === hit.current
            ? 0.15
            : 0.014 + d * (member.brace ? 0.048 : 0.067);
        mesh.scale.set(
          radius,
          length * (1 - state.explode * canonical * 0.14),
          radius,
        );
      }
  });
  const color = selected
    ? "#d9a15b"
    : related
      ? "#62ada9"
      : member.brace
        ? "#348e91"
        : "#cedbd5";
  return (
    <>
      <mesh
        ref={ref}
        geometry={beamGeometry}
        castShadow
        receiveShadow
        userData={{ semanticId: member.id }}
        onClick={(e) => select(e, member.id)}
      >
        <meshStandardMaterial
          color={color}
          roughness={member.brace ? 0.47 : 0.64}
          metalness={0.12}
        />
        {s.progress > 0.35 &&
          [-0.43, 0.43].map((y) => (
            <mesh
              key={y}
              geometry={collarGeometry}
              position={[0, y, 0]}
              scale={[1.12, 0.018, 1.12]}
            >
              <meshStandardMaterial
                color="#7f9990"
                metalness={0.6}
                roughness={0.4}
              />
            </mesh>
          ))}
      </mesh>
      <mesh
        ref={hit}
        geometry={beamGeometry}
        onClick={(e) => select(e, member.id)}
      >
        <meshBasicMaterial visible={false} />
      </mesh>
    </>
  );
}
function JointObject({ joint }: { joint: Joint }) {
  const ref = useRef<Group>(null);
  const { gl } = useThree();
  const s = useLesson();
  const selected = s.selected === joint.id;
  useFrame(() => {
    const state = lessonStore.get(),
      p = Number(gl.domElement.dataset.progress || state.progress),
      d = blend(p, 0.18, 0.44),
      canonical = 1 - blend(p, 0.65, 0.77);
    if (ref.current) {
      ref.current.position.set(
        ...pointAt(
          joint,
          p,
          state.explode * canonical,
          state.shear * canonical,
          state.braced,
        ),
      );
      ref.current.rotation.x = (d * Math.PI) / 2;
      ref.current.visible = p > 0.22 || joint.id < "E";
      ref.current.scale.setScalar(0.6 + d * 0.4);
    }
  });
  return (
    <group ref={ref} userData={{ semanticId: joint.id }}>
      <mesh
        geometry={collarGeometry}
        scale={[0.2, 0.09, 0.2]}
        castShadow
        onClick={(e) => select(e, joint.id)}
      >
        <meshStandardMaterial
          color={selected ? "#dbab66" : "#577c7c"}
          roughness={0.35}
          metalness={0.65}
        />
      </mesh>
      <mesh geometry={collarGeometry} scale={[0.135, 0.095, 0.135]} castShadow>
        <meshStandardMaterial
          color="#b3c6bf"
          roughness={0.4}
          metalness={0.65}
        />
      </mesh>
      {[-1, 1].map((v) => (
        <mesh
          key={v}
          geometry={boltGeometry}
          position={[v * 0.12, 0.06, 0]}
          scale={[0.027, 0.05, 0.027]}
        >
          <meshStandardMaterial
            color="#e0ded0"
            roughness={0.3}
            metalness={0.55}
          />
        </mesh>
      ))}
      <mesh
        geometry={boltGeometry}
        scale={[0.068, 0.12, 0.068]}
        castShadow
        onClick={(e) => select(e, joint.id)}
      >
        <meshStandardMaterial color="#dde5dd" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh geometry={hitGeometry} onClick={(e) => select(e, joint.id)}>
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  );
}
function Annotation({ id }: { id: string }) {
  const ref = useRef<Group>(null);
  const { gl } = useThree();
  const s = useLesson();
  useFrame(() => {
    const p = Number(gl.domElement.dataset.progress || s.progress);
    if (ref.current) {
      ref.current.visible = p < 0.73;
      const point = pointAt(jointById(id), p, s.explode, s.shear, s.braced);
      ref.current.position.set(point[0], point[1] + 0.24, point[2]);
    }
  });
  return (
    <group ref={ref}>
      <Html center zIndexRange={[4, 0]} distanceFactor={16}>
        <button
          className={`joint-label ${s.selected === id ? "selected" : ""}`}
          dir="ltr"
          onClick={() => lessonStore.set({ selected: id })}
          aria-label={`${s.lang === "ar" ? "المفصل" : "Joint"} ${id}`}
        >
          {id}
        </button>
      </Html>
    </group>
  );
}
export function StemExperiment() {
  const s = useLesson();
  const dimension = useRef<Group>(null);
  const { gl } = useThree();
  useFrame(() => {
    if (dimension.current)
      dimension.current.visible =
        s.dimensions && Number(gl.domElement.dataset.progress || 0) < 0.7;
  });
  return (
    <>
      {members.map((m) => (
        <MemberObject key={m.id} member={m} />
      ))}
      {joints.map((j) => (
        <JointObject key={j.id} joint={j} />
      ))}
      {s.progress < 0.7 &&
        ["A", "B", "C", "D"].map((id) => <Annotation key={id} id={id} />)}
      {s.dimensions && s.progress < 0.7 && (
        <group ref={dimension} position={[0, -1.98, 2.35]}>
          <mesh geometry={rulerGeometry} scale={[6, 0.012, 0.012]}>
            <meshBasicMaterial color="#347f88" />
          </mesh>
          {[-3, 3].map((x) => (
            <mesh
              key={x}
              position={[x, 0, 0]}
              geometry={rulerGeometry}
              scale={[0.012, 0.22, 0.012]}
            >
              <meshBasicMaterial color="#347f88" />
            </mesh>
          ))}
          <Html center position={[0, -0.2, 0]} zIndexRange={[4, 0]}>
            <span className="dimension-label" dir="ltr">
              6 u · {s.lang === "ar" ? "وحدات تخطيطية" : "diagram units"}
            </span>
          </Html>
        </group>
      )}
    </>
  );
}
