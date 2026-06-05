import {
  Box,
  StateNode,
  pointInPolygon,
  polygonsIntersect,
  react
} from "@tldraw/editor";
class Brushing extends StateNode {
  static id = "brushing";
  info = {};
  initialSelectedShapeIds = [];
  excludedShapeIds = /* @__PURE__ */ new Set();
  isWrapMode = false;
  viewportDidChange = false;
  cleanupViewportChangeReactor() {
  }
  // cleanup function for the viewport reactor
  onEnter(info) {
    const { editor } = this;
    const altKey = editor.inputs.getAltKey();
    this.isWrapMode = editor.user.getIsWrapMode();
    this.viewportDidChange = false;
    let isInitialCheck = true;
    this.cleanupViewportChangeReactor = react("viewport change while brushing", () => {
      editor.getViewportPageBounds();
      if (!isInitialCheck && !this.viewportDidChange) {
        this.viewportDidChange = true;
      }
    });
    if (altKey) {
      this.parent.transition("scribble_brushing", info);
      return;
    }
    this.excludedShapeIds = new Set(
      editor.getCurrentPageShapes().filter(
        (shape) => editor.isShapeOfType(shape, "group") || editor.isShapeOrAncestorLocked(shape)
      ).map((shape) => shape.id)
    );
    this.info = info;
    this.initialSelectedShapeIds = editor.getSelectedShapeIds().slice();
    this.hitTestShapes();
    isInitialCheck = false;
  }
  onExit() {
    this.initialSelectedShapeIds = [];
    this.editor.updateInstanceState({ brush: null });
    this.cleanupViewportChangeReactor();
  }
  onTick({ elapsed }) {
    const { editor } = this;
    if (!editor.inputs.getIsDragging() || editor.inputs.getIsPanning()) return;
    editor.edgeScrollManager.updateEdgeScrolling(elapsed);
  }
  onPointerMove() {
    this.hitTestShapes();
  }
  onPointerUp() {
    this.complete();
  }
  onComplete() {
    this.complete();
  }
  onCancel(info) {
    this.editor.setSelectedShapes(this.initialSelectedShapeIds);
    this.parent.transition("idle", info);
  }
  onKeyDown(info) {
    if (this.editor.inputs.getAltKey()) {
      this.parent.transition("scribble_brushing", info);
    } else {
      this.hitTestShapes();
    }
  }
  onKeyUp() {
    this.hitTestShapes();
  }
  complete() {
    this.hitTestShapes();
    this.parent.transition("idle");
  }
  hitTestShapes() {
    const { editor, excludedShapeIds, isWrapMode } = this;
    const originPagePoint = editor.inputs.getOriginPagePoint();
    const currentPagePoint = editor.inputs.getCurrentPagePoint();
    const shiftKey = editor.inputs.getShiftKey();
    const ctrlKey = editor.inputs.getCtrlKey();
    const results = new Set(shiftKey ? this.initialSelectedShapeIds : []);
    const isWrapping = isWrapMode ? !ctrlKey : ctrlKey;
    const brush = Box.FromPoints([originPagePoint, currentPagePoint]);
    const { corners } = brush;
    let A, B, shape, pageBounds, pageTransform, localCorners;
    const brushBoxIsInsideViewport = editor.getViewportPageBounds().contains(brush);
    const currentPageId = editor.getCurrentPageId();
    const candidateIds = editor.getShapeIdsInsideBounds(brush);
    if (candidateIds.size === 0) {
      const currentBrush2 = editor.getInstanceState().brush;
      if (!currentBrush2 || !brush.equals(currentBrush2)) {
        editor.updateInstanceState({ brush: { ...brush.toJson() } });
      }
      const current2 = editor.getSelectedShapeIds();
      if (current2.length !== results.size || current2.some((id) => !results.has(id))) {
        editor.setSelectedShapes(Array.from(results));
      }
      return;
    }
    const allShapes = brushBoxIsInsideViewport && !this.viewportDidChange ? editor.getCurrentPageRenderingShapesSorted() : editor.getCurrentPageShapesSorted();
    const shapesToHitTest = allShapes.filter((shape2) => candidateIds.has(shape2.id));
    testAllShapes: for (let i = 0, n = shapesToHitTest.length; i < n; i++) {
      shape = shapesToHitTest[i];
      if (excludedShapeIds.has(shape.id) || results.has(shape.id)) continue testAllShapes;
      pageBounds = editor.getShapePageBounds(shape);
      if (!pageBounds) continue testAllShapes;
      if (brush.contains(pageBounds)) {
        this.handleHit(shape, currentPagePoint, currentPageId, results, corners);
        continue testAllShapes;
      }
      if (isWrapping || editor.isShapeOfType(shape, "frame")) {
        continue testAllShapes;
      }
      if (brush.collides(pageBounds)) {
        pageTransform = editor.getShapePageTransform(shape);
        if (!pageTransform) continue testAllShapes;
        localCorners = pageTransform.clone().invert().applyToPoints(corners);
        const geometry = editor.getShapeGeometry(shape);
        hitTestBrushEdges: for (let i2 = 0; i2 < 4; i2++) {
          A = localCorners[i2];
          B = localCorners[(i2 + 1) % 4];
          if (geometry.hitTestLineSegment(A, B, 0)) {
            this.handleHit(shape, currentPagePoint, currentPageId, results, corners);
            break hitTestBrushEdges;
          }
        }
      }
    }
    const currentBrush = editor.getInstanceState().brush;
    if (!currentBrush || !brush.equals(currentBrush)) {
      editor.updateInstanceState({ brush: { ...brush.toJson() } });
    }
    const current = editor.getSelectedShapeIds();
    if (current.length !== results.size || current.some((id) => !results.has(id))) {
      editor.setSelectedShapes(Array.from(results));
    }
  }
  onInterrupt() {
    this.editor.updateInstanceState({ brush: null });
  }
  handleHit(shape, currentPagePoint, currentPageId, results, corners) {
    if (shape.parentId === currentPageId) {
      results.add(shape.id);
      return;
    }
    const selectedShape = this.editor.getOutermostSelectableShape(shape);
    const pageMask = this.editor.getShapeMask(selectedShape.id);
    if (pageMask && !polygonsIntersect(pageMask, corners) && !pointInPolygon(currentPagePoint, pageMask)) {
      return;
    }
    results.add(selectedShape.id);
  }
}
export {
  Brushing
};
//# sourceMappingURL=Brushing.mjs.map
