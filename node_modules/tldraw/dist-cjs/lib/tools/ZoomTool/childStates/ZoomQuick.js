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
var ZoomQuick_exports = {};
__export(ZoomQuick_exports, {
  ZoomQuick: () => ZoomQuick
});
module.exports = __toCommonJS(ZoomQuick_exports);
var import_editor = require("@tldraw/editor");
class ZoomQuick extends import_editor.StateNode {
  static id = "zoom_quick";
  info = {};
  qzState = "idle";
  initialVpb = new import_editor.Box();
  initialPp = new import_editor.Vec();
  /** The camera zoom right after the overview zoom-out in onEnter. */
  overviewZoom = 1;
  cleanupZoomReactor() {
  }
  nextVpb = new import_editor.Box();
  onEnter(info) {
    const { editor } = this;
    this.info = info;
    this.qzState = "idle";
    this.initialVpb = editor.getViewportPageBounds();
    this.initialPp = import_editor.Vec.From(editor.inputs.getCurrentPagePoint());
    editor.setCursor({ type: "zoom-in", rotation: 0 });
    const vpb = this.initialVpb;
    const pageBounds = editor.getCurrentPageBounds();
    const commonBounds = pageBounds ? import_editor.Box.Expand(vpb, pageBounds) : vpb.clone();
    const vsb = editor.getViewportScreenBounds();
    const sp = editor.inputs.getCurrentScreenPoint();
    const sx = sp.x - vsb.x;
    const sy = sp.y - vsb.y;
    const { x: px, y: py } = this.initialPp;
    const dLeft = px - commonBounds.minX;
    const dRight = commonBounds.maxX - px;
    const dTop = py - commonBounds.minY;
    const dBottom = commonBounds.maxY - py;
    let targetZoom = editor.getCamera().z;
    if (dLeft > 0) targetZoom = Math.min(targetZoom, sx / dLeft);
    if (dRight > 0) targetZoom = Math.min(targetZoom, (vsb.w - sx) / dRight);
    if (dTop > 0) targetZoom = Math.min(targetZoom, sy / dTop);
    if (dBottom > 0) targetZoom = Math.min(targetZoom, (vsb.h - sy) / dBottom);
    targetZoom *= 0.85;
    targetZoom = Math.max(editor.getCameraOptions().zoomSteps[0], targetZoom);
    this.overviewZoom = targetZoom;
    if (editor.options.quickZoomPreservesScreenBounds) {
      this.cleanupZoomReactor = (0, import_editor.react)("zoom change in quick zoom", () => {
        editor.getZoomLevel();
        this.updateBrush();
      });
    }
    const { x: cx, y: cy, z: cz } = editor.getCamera();
    const ratio = cz / targetZoom;
    editor.setCamera(new import_editor.Vec((cx + px) * ratio - px, (cy + py) * ratio - py, targetZoom));
    if (!editor.options.quickZoomPreservesScreenBounds) {
      this.updateBrush();
    }
  }
  onExit() {
    this.cleanupZoomReactor();
    this.zoomToNewViewport();
    this.editor.updateInstanceState({ zoomBrush: null });
  }
  onPointerUp() {
    const toolId = this.info.onInteractionEnd?.split(".")[0] ?? "select";
    this.editor.setCurrentTool(toolId);
  }
  onCancel() {
    this.qzState = "idle";
    const toolId = this.info.onInteractionEnd?.split(".")[0] ?? "select";
    this.editor.setCurrentTool(toolId);
  }
  onKeyUp(info) {
    if (info.key === "Shift") {
      this.parent.transition("idle", this.info);
    }
  }
  updateBrush() {
    const { editor } = this;
    const nextVpb = this.getNextVpb();
    this.nextVpb.setTo(nextVpb);
    editor.updateInstanceState({ zoomBrush: nextVpb.toJson() });
  }
  zoomToNewViewport() {
    const { editor } = this;
    switch (this.qzState) {
      case "idle":
        editor.zoomToBounds(this.initialVpb, { inset: 0 });
        break;
      case "moving":
        editor.zoomToBounds(this.nextVpb, { inset: 0 });
        break;
    }
  }
  onPointerMove() {
    if (this.qzState !== "moving") return;
    this.updateBrush();
  }
  onTick() {
    const { editor } = this;
    switch (this.qzState) {
      case "idle": {
        const zoomLevel = editor.getZoomLevel();
        if (import_editor.Vec.Dist2(editor.inputs.getCurrentPagePoint(), this.initialPp) * zoomLevel > editor.options.dragDistanceSquared / zoomLevel) {
          this.qzState = "moving";
          this.updateBrush();
        }
        break;
      }
      case "moving":
        break;
    }
  }
  getNextVpb() {
    const { editor } = this;
    let w;
    let h;
    if (editor.options.quickZoomPreservesScreenBounds) {
      const zoomRatio = this.overviewZoom / editor.getCamera().z;
      w = this.initialVpb.w * zoomRatio;
      h = this.initialVpb.h * zoomRatio;
    } else {
      w = this.initialVpb.w;
      h = this.initialVpb.h;
    }
    const { x, y } = editor.inputs.getCurrentPagePoint();
    const vsb = editor.getViewportScreenBounds();
    const vsp = editor.inputs.getCurrentScreenPoint();
    const { x: nx, y: ny } = new import_editor.Vec((vsp.x - vsb.x) / vsb.w, (vsp.y - vsb.y) / vsb.h);
    return new import_editor.Box(x - nx * w, y - ny * h, w, h);
  }
}
//# sourceMappingURL=ZoomQuick.js.map
