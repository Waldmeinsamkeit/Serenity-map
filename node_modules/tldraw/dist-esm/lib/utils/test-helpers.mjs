import { b64Vecs, compressLegacySegments } from "@tldraw/editor";
function pointsToBase64(points) {
  return b64Vecs.encodePoints(points);
}
function base64ToPoints(base64) {
  return b64Vecs.decodePoints(base64);
}
function createDrawSegments(pointArrays, type = "free") {
  return compressLegacySegments(
    pointArrays.map((points) => ({
      type,
      points
    }))
  );
}
export {
  base64ToPoints,
  createDrawSegments,
  pointsToBase64
};
//# sourceMappingURL=test-helpers.mjs.map
