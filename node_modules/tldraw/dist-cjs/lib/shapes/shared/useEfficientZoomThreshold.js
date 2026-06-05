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
var useEfficientZoomThreshold_exports = {};
__export(useEfficientZoomThreshold_exports, {
  useEfficientZoomThreshold: () => useEfficientZoomThreshold
});
module.exports = __toCommonJS(useEfficientZoomThreshold_exports);
var import_editor = require("@tldraw/editor");
function useEfficientZoomThreshold(threshold = 0.25) {
  const editor = (0, import_editor.useEditor)();
  return (0, import_editor.useValue)("efficient zoom threshold", () => editor.getEfficientZoomLevel() < threshold, [
    editor,
    threshold
  ]);
}
//# sourceMappingURL=useEfficientZoomThreshold.js.map
