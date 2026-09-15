import { blend } from "./timeline";
export type Point = [number, number, number];
export type Joint = { id: string; position: Point };
export type Member = { id: string; a: string; b: string; brace: boolean };
export const joints: Joint[] = [-2, 2].flatMap((z, plane) => [
  { id: `${plane ? "A" : "E"}`, position: [-3, -1.5, z] as Point },
  { id: `${plane ? "B" : "F"}`, position: [3, -1.5, z] as Point },
  { id: `${plane ? "C" : "G"}`, position: [3, 1.5, z] as Point },
  { id: `${plane ? "D" : "H"}`, position: [-3, 1.5, z] as Point },
]);
export const members: Member[] = [
  ["A", "B"],
  ["B", "C"],
  ["C", "D"],
  ["D", "A"],
  ["E", "F"],
  ["F", "G"],
  ["G", "H"],
  ["H", "E"],
  ["A", "E"],
  ["B", "F"],
  ["C", "G"],
  ["D", "H"],
  ["A", "C"],
  ["E", "G"],
  ["A", "H"],
  ["B", "G"],
  ["D", "G"],
].map(([a, b], i) => ({
  id: `M${String(i + 1).padStart(2, "0")}`,
  a,
  b,
  brace: i >= 12,
}));
export const jointById = (id: string) => joints.find((j) => j.id === id)!;
export const memberById = (id: string) => members.find((m) => m.id === id);
export function pointAt(
  j: Joint,
  p: number,
  explode = 0,
  shear = 0,
  braced = true,
): Point {
  const d = blend(p, 0.18, 0.44),
    [x, y, z] = j.position;
  const offset = !braced && y > 0 ? shear * 1.05 : 0;
  const height = y > 0 ? -1.5 + Math.sqrt(9 - offset * offset) : y;
  return [
    (x + offset * d) * (1 + explode * 0.2 * d),
    -1.64 + (height + 1.64) * d + Math.sign(y) * explode * 0.35 * d,
    -y * 0.92 * (1 - d) + z * d + Math.sign(z) * explode * 0.55 * d,
  ];
}
export function memberLength(m: Member) {
  const a = jointById(m.a).position,
    b = jointById(m.b).position;
  return Math.hypot(...a.map((v, i) => v - b[i]));
}
export function neighbors(id: string) {
  const selected = memberById(id);
  const ids = selected ? [selected.a, selected.b] : [id];
  return members
    .filter((m) => ids.includes(m.a) || ids.includes(m.b))
    .map((m) => m.id);
}
