import { isAccelKey, StateNode } from "@tldraw/editor";
class Pointing extends StateNode {
  static id = "pointing";
  _isHoldingAccelKey = false;
  onEnter() {
    this._isHoldingAccelKey = isAccelKey(this.editor.inputs);
    const zoomLevel = this.editor.getZoomLevel();
    const currentPageShapesSorted = this.editor.getCurrentPageRenderingShapesSorted();
    const currentPagePoint = this.editor.inputs.getCurrentPagePoint();
    const erasing = /* @__PURE__ */ new Set();
    const initialSize = erasing.size;
    for (let n = currentPageShapesSorted.length, i = n - 1; i >= 0; i--) {
      const shape = currentPageShapesSorted[i];
      if (this.editor.isShapeOrAncestorLocked(shape) || this.editor.isShapeOfType(shape, "group")) {
        continue;
      }
      if (this.editor.isPointInShape(shape, currentPagePoint, {
        hitInside: false,
        margin: this.editor.options.hitTestMargin / zoomLevel
      })) {
        const hitShape = this.editor.getOutermostSelectableShape(shape);
        if (this.editor.isShapeOfType(hitShape, "frame") && erasing.size > initialSize) {
          break;
        }
        erasing.add(hitShape.id);
        if (this._isHoldingAccelKey) {
          break;
        }
      }
    }
    this.editor.setErasingShapes([...erasing]);
  }
  onKeyUp() {
    this._isHoldingAccelKey = isAccelKey(this.editor.inputs);
  }
  onKeyDown() {
    this._isHoldingAccelKey = isAccelKey(this.editor.inputs);
  }
  onLongPress(info) {
    this.startErasing(info);
  }
  onExit(_info, to) {
    if (to !== "erasing") {
      this.editor.setErasingShapes([]);
    }
  }
  onPointerMove(info) {
    if (this._isHoldingAccelKey) return;
    if (this.editor.inputs.getIsDragging()) {
      this.startErasing(info);
    }
  }
  onPointerUp() {
    this.complete();
  }
  onCancel() {
    this.cancel();
  }
  onComplete() {
    this.complete();
  }
  onInterrupt() {
    this.cancel();
  }
  startErasing(info) {
    this.parent.transition("erasing", info);
  }
  complete() {
    const erasingShapeIds = this.editor.getErasingShapeIds();
    if (erasingShapeIds.length) {
      this.editor.markHistoryStoppingPoint("erase end");
      this.editor.deleteShapes(erasingShapeIds);
    }
    this.parent.transition("idle");
  }
  cancel() {
    this.parent.transition("idle");
  }
}
export {
  Pointing
};
//# sourceMappingURL=Pointing.mjs.map
