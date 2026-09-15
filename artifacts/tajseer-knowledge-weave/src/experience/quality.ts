export const quality = {
  desktop: { dpr: 1.5, shadow: 1024, bays: 7 },
  mobile: { dpr: 1, shadow: 512, bays: 4 },
};
// No fingerprinting. Fall back locally when the browser cannot create a context.
export function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}
