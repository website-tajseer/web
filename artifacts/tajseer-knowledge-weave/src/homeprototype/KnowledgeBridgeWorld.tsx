import { Canvas, useFrame } from "@react-three/fiber";
import { BufferAttribute, BufferGeometry, Color, DoubleSide, Group, MathUtils, MeshPhysicalMaterial, PointsMaterial } from "three";
import { useMemo, useRef } from "react";

function makeBand(index: number) {
  const segments = 110;
  const vertices: number[] = [];
  const indices: number[] = [];
  const offset = (index - 2) * 0.72;
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const x = MathUtils.lerp(-10.5, 11.5, t);
    const convergence = 1 - Math.pow(t, 1.45);
    const y = offset * convergence + Math.sin(t * Math.PI * 1.18 + index * 0.42) * (0.42 + convergence * 0.22);
    const z = (index - 2) * 1.2 * convergence + Math.sin(t * Math.PI * 2 + index) * 0.28;
    const half = 0.26 + Math.sin(t * Math.PI) * 0.26;
    vertices.push(x, y - half, z, x, y + half, z);
    if (i < segments) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(vertices), 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function makeSignals() {
  const points: number[] = [];
  for (let band = 0; band < 5; band += 1) {
    for (let step = 0; step < 26; step += 1) {
      const t = step / 25;
      const convergence = 1 - Math.pow(t, 1.45);
      points.push(
        MathUtils.lerp(-10.2, 11.2, t),
        (band - 2) * .72 * convergence + Math.sin(t * Math.PI * 1.18 + band * .42) * (0.42 + convergence * .22),
        (band - 2) * 1.2 * convergence + Math.sin(t * Math.PI * 2 + band) * .28 + .08,
      );
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(points), 3));
  return geometry;
}

function KnowledgeWeave({ progress, reduced }: { progress: number; reduced: boolean }) {
  const group = useRef<Group>(null);
  const geometries = useMemo(() => [0, 1, 2, 3, 4].map(makeBand), []);
  const signals = useMemo(makeSignals, []);
  const materials = useMemo(() => [
    new MeshPhysicalMaterial({ color: "#eaf6fb", roughness: .24, metalness: .02, iridescence: .12, transparent: true, opacity: .42, side: DoubleSide }),
    new MeshPhysicalMaterial({ color: "#37b5b0", roughness: .22, metalness: .04, iridescence: .18, transparent: true, opacity: .56, side: DoubleSide }),
    new MeshPhysicalMaterial({ color: "#004c84", roughness: .2, metalness: .08, iridescence: .2, transparent: true, opacity: .84, side: DoubleSide }),
    new MeshPhysicalMaterial({ color: "#0aace4", roughness: .24, metalness: .03, iridescence: .15, transparent: true, opacity: .46, side: DoubleSide }),
    new MeshPhysicalMaterial({ color: "#3176ba", roughness: .18, metalness: .09, iridescence: .22, transparent: true, opacity: .72, side: DoubleSide }),
  ], []);
  const signalMaterial = useMemo(() => new PointsMaterial({ color: "#0aace4", size: .055, transparent: true, opacity: .72, sizeAttenuation: true }), []);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const drift = reduced ? 0 : Math.sin(clock.elapsedTime * .32) * .035;
    group.current.rotation.x = MathUtils.lerp(-.08, .06, progress) + drift;
    group.current.rotation.y = MathUtils.lerp(-.24, .13, progress);
    group.current.position.x = MathUtils.lerp(4.7, 2.2, progress);
    group.current.position.z = MathUtils.lerp(-1.2, 1.0, progress);
  });
  return <group ref={group}>{geometries.map((geometry, index) => <mesh key={index} geometry={geometry} material={materials[index]} position={[0, (index - 2) * .12, 0]} />)}<points geometry={signals} material={signalMaterial}/></group>;
}

export default function KnowledgeBridgeWorld({ progress, reduced }: { progress: number; reduced: boolean }) {
  return (
    <Canvas camera={{ position: [0, .3, 15], fov: 37, near: .1, far: 80 }} dpr={[1, 1.5]} frameloop={reduced ? "demand" : "always"} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} onCreated={({ gl, scene }) => { gl.setClearColor(new Color("#f4f1e8"), 0); scene.background = null; gl.domElement.dataset.homepageWebgl = "knowledge-weave"; }}>
      <ambientLight intensity={1.05} color="#eaf6fb" />
      <directionalLight position={[-6, 9, 10]} intensity={2.15} color="#fff8e7" />
      <directionalLight position={[8, -2, 7]} intensity={1.2} color="#0aace4" />
      <KnowledgeWeave progress={progress} reduced={reduced} />
    </Canvas>
  );
}
