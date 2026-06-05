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
var notVisibleShapes_exports = {};
__export(notVisibleShapes_exports, {
  notVisibleShapes: () => notVisibleShapes
});
module.exports = __toCommonJS(notVisibleShapes_exports);
var import_state = require("@tldraw/state");
function notVisibleShapes(editor) {
  const emptySet = /* @__PURE__ */ new Set();
  return (0, import_state.computed)("notVisibleShapes", function(prevValue) {
    const allShapes = editor.getCurrentPageShapes();
    const viewportPageBounds = editor.getViewportPageBounds();
    const visibleIds = editor.getShapeIdsInsideBounds(viewportPageBounds);
    let shape;
    if (visibleIds.size === allShapes.length) {
      if ((0, import_state.isUninitialized)(prevValue) || prevValue.size > 0) {
        return emptySet;
      }
      return prevValue;
    }
    if ((0, import_state.isUninitialized)(prevValue)) {
      const nextValue = /* @__PURE__ */ new Set();
      for (let i = 0; i < allShapes.length; i++) {
        shape = allShapes[i];
        if (visibleIds.has(shape.id)) continue;
        if (!editor.getShapeUtil(shape.type).canCull(shape)) continue;
        nextValue.add(shape.id);
      }
      return nextValue;
    }
    const notVisibleIds = [];
    for (let i = 0; i < allShapes.length; i++) {
      shape = allShapes[i];
      if (visibleIds.has(shape.id)) continue;
      if (!editor.getShapeUtil(shape.type).canCull(shape)) continue;
      notVisibleIds.push(shape.id);
    }
    if (notVisibleIds.length === prevValue.size) {
      let same = true;
      for (let i = 0; i < notVisibleIds.length; i++) {
        if (!prevValue.has(notVisibleIds[i])) {
          same = false;
          break;
        }
      }
      if (same) return prevValue;
    }
    return new Set(notVisibleIds);
  });
}
//# sourceMappingURL=notVisibleShapes.js.map
