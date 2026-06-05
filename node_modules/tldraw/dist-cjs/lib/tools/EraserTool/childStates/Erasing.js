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
var Erasing_exports = {};
__export(Erasing_exports, {
  Erasing: () => Erasing
});
module.exports = __toCommonJS(Erasing_exports);
var import_editor = require("@tldraw/editor");
class Erasing extends import_editor.StateNode {
  static id = "erasing";
  info = {};
  scribbleId = "id";
  markId = "";
  excludedShapeIds = /* @__PURE__ */ new Set();
  _isHoldingAccelKey = false;
  _firstErasingShapeId = null;
  _erasingShapeIds = [];
  onEnter(info) {
    this._isHoldingAccelKey = (0, import_editor.isAccelKey)(this.editor.inputs);
    this._firstErasingShapeId = this.editor.getErasingShapeIds()[0];
    this._erasingShapeIds = this.editor.getErasingShapeIds();
    this.markId = this.editor.markHistoryStoppingPoint("erase scribble begin");
    this.info = info;
    const originPagePoint = this.editor.inputs.getOriginPagePoint();
    this.excludedShapeIds = new Set(
      this.editor.getCurrentPageShapes().filter((shape) => {
        if (this.editor.isShapeOrAncestorLocked(shape)) return true;
        if (this.editor.isShapeOfType(shape, "group") || this.editor.isShapeOfType(shape, "frame")) {
          const pointInShapeShape = this.editor.getPointInShapeSpace(shape, originPagePoint);
          const geometry = this.editor.getShapeGeometry(shape);
          return geometry.bounds.containsPoint(pointInShapeShape);
        }
        return false;
      }).map((shape) => shape.id)
    );
    const scribble = this.editor.scribbles.addScribble({
      color: "muted-1",
      size: 12
    });
    this.scribbleId = scribble.id;
    this.update();
  }
  pushPointToScribble() {
    const { x, y } = this.editor.inputs.getCurrentPagePoint();
    this.editor.scribbles.addPoint(this.scribbleId, x, y);
  }
  onExit() {
    this.editor.setErasingShapes([]);
    this.editor.scribbles.stop(this.scribbleId);
  }
  onPointerMove() {
    this.update();
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
  onKeyUp() {
    this._isHoldingAccelKey = (0, import_editor.isAccelKey)(this.editor.inputs);
    this.update();
  }
  onKeyDown() {
    this._isHoldingAccelKey = (0, import_editor.isAccelKey)(this.editor.inputs);
    this.update();
  }
  update() {
    const { editor, excludedShapeIds } = this;
    const erasingShapeIds = editor.getErasingShapeIds();
    const zoomLevel = editor.getZoomLevel();
    const currentPagePoint = editor.inputs.getCurrentPagePoint();
    const previousPagePoint = editor.inputs.getPreviousPagePoint();
    this.pushPointToScribble();
    const erasing = new Set(erasingShapeIds);
    const minDist = this.editor.options.hitTestMargin / zoomLevel;
    const lineBounds = import_editor.Box.FromPoints([previousPagePoint, currentPagePoint]).expandBy(minDist);
    const candidateIds = editor.getShapeIdsInsideBounds(lineBounds);
    if (candidateIds.size === 0) {
      editor.setErasingShapes(Array.from(erasing));
      return;
    }
    const allShapes = editor.getCurrentPageRenderingShapesSorted();
    const currentPageShapes = allShapes.filter((shape) => candidateIds.has(shape.id));
    for (const shape of currentPageShapes) {
      if (editor.isShapeOfType(shape, "group")) continue;
      const pageMask = editor.getShapeMask(shape.id);
      if (pageMask && !(0, import_editor.pointInPolygon)(currentPagePoint, pageMask)) {
        continue;
      }
      const geometry = editor.getShapeGeometry(shape);
      const pageTransform = editor.getShapePageTransform(shape);
      if (!geometry || !pageTransform) continue;
      const pt = pageTransform.clone().invert();
      const A = pt.applyToPoint(previousPagePoint);
      const B = pt.applyToPoint(currentPagePoint);
      const { bounds } = geometry;
      if (bounds.minX - minDist > Math.max(A.x, B.x) || bounds.minY - minDist > Math.max(A.y, B.y) || bounds.maxX + minDist < Math.min(A.x, B.x) || bounds.maxY + minDist < Math.min(A.y, B.y)) {
        continue;
      }
      if (geometry.hitTestLineSegment(A, B, minDist)) {
        erasing.add(editor.getOutermostSelectableShape(shape).id);
      }
      this._erasingShapeIds = [...erasing];
    }
    if (this._isHoldingAccelKey && this._firstErasingShapeId) {
      const erasingShapeId = this._firstErasingShapeId;
      if (erasingShapeId && this.editor.getShape(erasingShapeId)) {
        editor.setErasingShapes([erasingShapeId]);
      }
      return;
    }
    this.editor.setErasingShapes(this._erasingShapeIds.filter((id) => !excludedShapeIds.has(id)));
  }
  complete() {
    const { editor } = this;
    editor.deleteShapes(editor.getCurrentPageState().erasingShapeIds);
    this.parent.transition("idle");
    this._erasingShapeIds = [];
    this._firstErasingShapeId = null;
  }
  cancel() {
    const { editor } = this;
    editor.bailToMark(this.markId);
    this.parent.transition("idle", this.info);
  }
}
//# sourceMappingURL=Erasing.js.map
