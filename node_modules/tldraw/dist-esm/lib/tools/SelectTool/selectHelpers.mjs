import {
  richTextValidator
} from "@tldraw/editor";
function hasRichText(shape) {
  return "richText" in shape.props && richTextValidator.isValid(shape.props.richText);
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
export {
  hasRichText,
  startEditingShapeWithRichText
};
//# sourceMappingURL=selectHelpers.mjs.map
