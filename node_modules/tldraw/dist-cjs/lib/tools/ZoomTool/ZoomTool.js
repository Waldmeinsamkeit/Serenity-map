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
var ZoomTool_exports = {};
__export(ZoomTool_exports, {
  ZoomTool: () => ZoomTool
});
module.exports = __toCommonJS(ZoomTool_exports);
var import_editor = require("@tldraw/editor");
var import_Idle = require("./childStates/Idle");
var import_Pointing = require("./childStates/Pointing");
var import_ZoomBrushing = require("./childStates/ZoomBrushing");
var import_ZoomQuick = require("./childStates/ZoomQuick");
class ZoomTool extends import_editor.StateNode {
  static id = "zoom";
  static initial = "idle";
  static children() {
    return [import_Idle.Idle, import_Pointing.Pointing, import_ZoomBrushing.ZoomBrushing, import_ZoomQuick.ZoomQuick];
  }
  static isLockable = false;
  info = {};
  onEnter(info) {
    this.info = info;
    const toolId = info.onInteractionEnd?.split(".")[0];
    this.parent.setCurrentToolIdMask(toolId);
    this.updateCursor();
  }
  onExit() {
    this.parent.setCurrentToolIdMask(void 0);
    this.editor.updateInstanceState({ zoomBrush: null, cursor: { type: "default", rotation: 0 } });
  }
  onKeyDown() {
    this.updateCursor();
  }
  onKeyUp(info) {
    this.updateCursor();
    if (info.key.toLowerCase() === "z") {
      this.complete();
    }
  }
  onInterrupt() {
    this.complete();
  }
  complete() {
    const toolId = this.info.onInteractionEnd?.split(".")[0] ?? "select";
    this.editor.setCurrentTool(toolId);
  }
  updateCursor() {
    if (this.editor.inputs.getAltKey() && !this.editor.isIn("zoom.zoom_quick")) {
      this.editor.setCursor({ type: "zoom-out", rotation: 0 });
    } else {
      this.editor.setCursor({ type: "zoom-in", rotation: 0 });
    }
  }
}
//# sourceMappingURL=ZoomTool.js.map
