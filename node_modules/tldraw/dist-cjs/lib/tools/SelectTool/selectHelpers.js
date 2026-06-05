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
var selectHelpers_exports = {};
__export(selectHelpers_exports, {
  hasRichText: () => hasRichText,
  startEditingShapeWithRichText: () => startEditingShapeWithRichText
});
module.exports = __toCommonJS(selectHelpers_exports);
var import_editor = require("@tldraw/editor");
function hasRichText(shape) {
  return "richText" in shape.props && import_editor.richTextValidator.isValid(shape.props.richText);
}
function startEditingShapeWithRichText(editor, shapeOrId, options = {}) {
  const shape = typeof shapeOrId === "string" ? editor.getShape(shapeOrId) : shapeOrId;
  if (!shape) return;
  if (!editor.canEditShape(shape)) return;
  if (!hasRichText(shape)) {
    throw new Error("Shape does not have rich text");
  }
  editor.setEditingShape(shape);
  editor.setCurrentTool("select.editing_shape", {
    ...options.info,
    target: "shape",
    shape
  });
  if (options.selectAll) {
    editor.emit("select-all-text", { shapeId: shape.id });
  }
}
//# sourceMappingURL=selectHelpers.js.map
