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
var EditorAtom_exports = {};
__export(EditorAtom_exports, {
  EditorAtom: () => EditorAtom
});
module.exports = __toCommonJS(EditorAtom_exports);
var import_state = require("@tldraw/state");
var import_utils = require("@tldraw/utils");
class EditorAtom {
  constructor(name, getInitialState) {
    this.name = name;
    this.getInitialState = getInitialState;
  }
  states = new import_utils.WeakCache();
  getAtom(editor) {
    return this.states.get(editor, () => (0, import_state.atom)(this.name, this.getInitialState(editor)));
  }
  get(editor) {
    return this.getAtom(editor).get();
  }
  update(editor, update) {
    return this.getAtom(editor).update(update);
  }
  set(editor, state) {
    return this.getAtom(editor).set(state);
  }
}
//# sourceMappingURL=EditorAtom.js.map
