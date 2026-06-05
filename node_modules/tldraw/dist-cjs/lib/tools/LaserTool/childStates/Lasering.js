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
var Lasering_exports = {};
__export(Lasering_exports, {
  Lasering: () => Lasering
});
module.exports = __toCommonJS(Lasering_exports);
var import_editor = require("@tldraw/editor");
class Lasering extends import_editor.StateNode {
  static id = "lasering";
  scribbleId = "";
  sessionId = "";
  onEnter(info) {
    this.sessionId = info.sessionId;
    this.scribbleId = info.scribbleId;
    this.pushPointToScribble();
  }
  onPointerMove() {
    this.pushPointToScribble();
  }
  pushPointToScribble() {
    const { x, y } = this.editor.inputs.getCurrentPagePoint();
    this.editor.scribbles.addPointToSession(this.sessionId, this.scribbleId, x, y);
  }
  onTick() {
    this.editor.scribbles.extendSession(this.sessionId);
  }
  onPointerUp() {
    this.complete();
  }
  onCancel() {
    this.onComplete();
  }
  onComplete() {
    this.complete();
  }
  complete() {
    this.editor.scribbles.complete(this.scribbleId);
    this.parent.transition("idle");
  }
}
//# sourceMappingURL=Lasering.js.map
