import assert from "node:assert/strict";
import { test } from "node:test";
import {
  joints,
  members,
  pointAt,
  jointById,
  memberLength,
  neighbors,
} from "./lesson";
import { cameraAt, poseAt, acts, actAt } from "./timeline";
const distance = (a: number[], b: number[]) =>
  Math.hypot(...a.map((v, i) => v - b[i]));
test("all member endpoints resolve to unique semantic joints", () => {
  assert.equal(new Set(joints.map((j) => j.id)).size, joints.length);
  assert.equal(new Set(members.map((m) => m.id)).size, members.length);
  for (const m of members) {
    assert.ok(jointById(m.a));
    assert.ok(jointById(m.b));
    assert.ok(memberLength(m) > 0);
  }
});
test("the written diagram stays flat and independent of previous experiment actions", () => {
  for (const j of joints) {
    const a = pointAt(j, 0),
      b = pointAt(j, 0, 1, 1, false);
    assert.deepEqual(a, b);
    assert.equal(a[1], -1.64);
  }
});
test("the same semantic points reach the physical model coordinates", () => {
  for (const j of joints)
    assert.ok(distance(pointAt(j, 0.53), j.position) < 1e-10);
});
test("unbraced qualitative shear changes angles while preserving member lengths", () => {
  for (const m of members.filter((m) => !m.brace))
    for (const shear of [0, 0.25, 0.5, 0.75, 1]) {
      const a = pointAt(jointById(m.a), 0.53, 0, shear, false),
        b = pointAt(jointById(m.b), 0.53, 0, shear, false);
      assert.ok(Math.abs(distance(a, b) - memberLength(m)) < 1e-10, m.id);
    }
  assert.notDeepEqual(
    pointAt(jointById("C"), 0.53, 0, 1, false),
    pointAt(jointById("C"), 0.53),
  );
});
test("bracing constrains shear and selected members expose connected neighbors", () => {
  assert.deepEqual(
    pointAt(jointById("C"), 0.53, 0, 1, true),
    pointAt(jointById("C"), 0.53),
  );
  assert.ok(neighbors("A").includes("M13"));
  assert.ok(neighbors("M13").includes("M02"));
});
test("all direct-jump positions map to the intended act", () => {
  for (const a of acts) assert.equal(actAt(a.at), a.id);
});
test("desktop and mobile camera tracks are finite, continuous and reversible", () => {
  for (const mobile of [false, true])
    for (let i = 0; i <= 1000; i++) {
      const p = i / 1000,
        a = cameraAt(p, mobile),
        b = cameraAt(Math.max(0, p - 0.00001), mobile);
      assert.ok([...a.eye, ...a.target, a.fov].every(Number.isFinite));
      assert.ok(distance(a.eye, b.eye) < 0.03);
      assert.ok(distance(a.target, b.target) < 0.01);
      assert.deepEqual(cameraAt(p, mobile), a);
      assert.ok(poseAt(p, mobile).scale >= 1);
    }
});
