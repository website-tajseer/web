import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Color, PerspectiveCamera, Vector3 } from "three";
import { lessonStore } from "./state";
import { actAt, acts, cameraAt, poseAt, blend } from "./timeline";

export function CameraRig() {
  const { camera, scene, invalidate, gl, setDpr } = useThree();
  const current = useRef(lessonStore.get().progress);
  const target = useRef(new Vector3());
  const light = useRef(new Color("#eeeae0")),
    dark = useRef(new Color("#092e3c"));
  const frames = useRef({ count: 0, slow: 0 });
  useEffect(() => lessonStore.subscribe(invalidate), [invalidate]);
  useFrame((_, delta) => {
    const s = lessonStore.get();
    const destination = s.reduced
      ? acts.find((a) => a.id === actAt(s.progress))!.at
      : s.progress;
    current.current = s.reduced
      ? destination
      : current.current +
        (destination - current.current) * (1 - Math.exp(-delta * 8));
    if (Math.abs(destination - current.current) < 0.0001)
      current.current = destination;
    const p = current.current,
      shot = cameraAt(p, s.mobile),
      pose = poseAt(p, s.mobile);
    camera.position.set(...shot.eye);
    if (s.mobile)
      camera.position.multiplyScalar(
        1 + s.explode * 0.15 * blend(p, 0.3, 0.44) * (1 - blend(p, 0.65, 0.78)),
      );
    const parallax = !s.reduced && p > 0.9 ? 0.24 : 0;
    const pointer = (
      gl.domElement.closest(".world-canvas") as HTMLElement | null
    )?.dataset;
    target.current.set(...shot.target);
    if (s.lang === "ar" && !s.mobile && p < 0.4)
      target.current.x += 3.2 * (1 - p / 0.4);
    target.current.x += Number(pointer?.pointerX || 0) * parallax;
    target.current.y += Number(pointer?.pointerY || 0) * parallax * 0.4;
    camera.lookAt(target.current);
    (camera as PerspectiveCamera).fov = shot.fov;
    camera.updateProjectionMatrix();
    scene.background = light.current.clone().lerp(dark.current, pose.enter);
    if (scene.fog) {
      scene.fog.color.copy(scene.background);
    }
    gl.domElement.dataset.progress = p.toFixed(3);
    if (import.meta.env.DEV) {
      gl.domElement.dataset.frames = String(
        Number(gl.domElement.dataset.frames || 0) + 1,
      );
      gl.domElement.dataset.drawCalls = String(gl.info.render.calls);
      gl.domElement.dataset.triangles = String(gl.info.render.triangles);
    }
    if (s.visible && Math.abs(destination - p) > 0.0001) invalidate();
    if (delta < 0.15 && !s.mobile) {
      frames.current.count++;
      if (delta > 0.035) frames.current.slow++;
      if (frames.current.count === 120) {
        if (frames.current.slow > 45) setDpr(1);
      }
    }
  }, -2);
  return null;
}
