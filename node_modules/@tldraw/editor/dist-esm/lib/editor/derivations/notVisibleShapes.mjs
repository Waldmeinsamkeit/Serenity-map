import { computed, isUninitialized } from "@tldraw/state";
function notVisibleShapes(editor) {
  const emptySet = /* @__PURE__ */ new Set();
  return computed("notVisibleShapes", function(prevValue) {
    const allShapes = editor.getCurrentPageShapes();
    const viewportPageBounds = editor.getViewportPageBounds();
    const visibleIds = editor.getShapeIdsInsideBounds(viewportPageBounds);
    let shape;
    if (visibleIds.size === allShapes.length) {
      if (isUninitialized(prevValue) || prevValue.size > 0) {
        return emptySet;
      }
      return prevValue;
    }
    if (isUninitialized(prevValue)) {
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
export {
  notVisibleShapes
};
//# sourceMappingURL=notVisibleShapes.mjs.map
