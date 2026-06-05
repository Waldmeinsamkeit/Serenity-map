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
var LaserTool_exports = {};
__export(LaserTool_exports, {
  LaserTool: () => LaserTool
});
module.exports = __toCommonJS(LaserTool_exports);
var import_editor = require("@tldraw/editor");
var import_Idle = require("./childStates/Idle");
var import_Lasering = require("./childStates/Lasering");
class LaserTool extends import_editor.StateNode {
  static id = "laser";
  static initial = "idle";
  static children() {
    return [import_Idle.Idle, import_Lasering.Lasering];
  }
  static isLockable = false;
  sessionId = null;
  onEnter() {
    this.editor.setCursor({ type: "cross", rotation: 0 });
  }
  onExit() {
    this.sessionId = null;
  }
  onCancel() {
    if (this.sessionId && this.editor.scribbles.isSessionActive(this.sessionId)) {
      this.editor.scribbles.clearSession(this.sessionId);
      this.sessionId = null;
      this.transition("idle");
    } else {
      this.editor.setCurrentTool("select");
    }
  }
  /**
   * Get the current laser session ID, or create a new one if none exists or the current one is fading.
   */
  getSessionId() {
    if (this.sessionId && this.editor.scribbles.isSessionActive(this.sessionId)) {
      return this.sessionId;
    }
    this.sessionId = this.editor.scribbles.startSession({
      selfConsume: false,
      idleTimeoutMs: this.editor.options.laserDelayMs,
      fadeMode: "grouped",
      fadeEasing: "ease-in"
    });
    return this.sessionId;
  }
}
//# sourceMappingURL=LaserTool.js.map
