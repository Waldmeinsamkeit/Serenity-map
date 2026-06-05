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
var Idle_exports = {};
__export(Idle_exports, {
  Idle: () => Idle
});
module.exports = __toCommonJS(Idle_exports);
var import_editor = require("@tldraw/editor");
var import_selectHelpers = require("../../../tools/SelectTool/selectHelpers");
var import_arrowTargetState = require("../arrowTargetState");
class Idle extends import_editor.StateNode {
  static id = "idle";
  isPrecise = false;
  isPreciseTimerId = null;
  preciseTargetId = null;
  onPointerMove() {
    this.update();
  }
  onPointerDown(info) {
    this.parent.transition("pointing", { ...info, isPrecise: this.isPrecise });
  }
  onEnter() {
    this.editor.setCursor({ type: "cross", rotation: 0 });
    this.update();
  }
  onCancel() {
    this.editor.setCurrentTool("select");
  }
  onExit() {
    (0, import_arrowTargetState.clearArrowTargetState)(this.editor);
    if (this.isPreciseTimerId !== null) {
      clearTimeout(this.isPreciseTimerId);
    }
  }
  onKeyDown() {
    this.update();
  }
  onKeyUp(info) {
    this.update();
    if (info.key === "Enter") {
      const onlySelectedShape = this.editor.getOnlySelectedShape();
      if (this.editor.canEditShape(onlySelectedShape)) {
        (0, import_selectHelpers.startEditingShapeWithRichText)(this.editor, onlySelectedShape, { selectAll: true });
      }
    }
  }
  update() {
    const arrowUtil = this.editor.getShapeUtil("arrow");
    const targetState = (0, import_arrowTargetState.updateArrowTargetState)({
      editor: this.editor,
      pointInPageSpace: this.editor.inputs.getCurrentPagePoint(),
      arrow: void 0,
      isPrecise: this.isPrecise,
      currentBinding: void 0,
      oppositeBinding: void 0
    });
    if (targetState && targetState.target.id !== this.preciseTargetId) {
      if (this.isPreciseTimerId !== null) {
        clearTimeout(this.isPreciseTimerId);
      }
      this.preciseTargetId = targetState.target.id;
      this.isPreciseTimerId = this.editor.timers.setTimeout(() => {
        this.isPrecise = true;
        this.update();
      }, arrowUtil.options.hoverPreciseTimeout);
    } else if (!targetState && this.preciseTargetId) {
      this.isPrecise = false;
      this.preciseTargetId = null;
      if (this.isPreciseTimerId !== null) {
        clearTimeout(this.isPreciseTimerId);
      }
    }
  }
}
//# sourceMappingURL=Idle.js.map
