"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var test_helpers_exports = {};
__export(test_helpers_exports, {
  base64ToPoints: () => base64ToPoints,
  createDrawSegments: () => createDrawSegments,
  pointsToBase64: () => pointsToBase64
});
module.exports = __toCommonJS(test_helpers_exports);
var import_editor = require("@tldraw/editor");
function pointsToBase64(points) {
  return import_editor.b64Vecs.encodePoints(points);
}
function base64ToPoints(base64) {
  return import_editor.b64Vecs.decodePoints(base64);
}
function createDrawSegments(pointArrays, type = "free") {
  return (0, import_editor.compressLegacySegments)(
    pointArrays.map((points) => ({
      type,
      points
    }))
  );
}
//# sourceMappingURL=test-helpers.js.map
