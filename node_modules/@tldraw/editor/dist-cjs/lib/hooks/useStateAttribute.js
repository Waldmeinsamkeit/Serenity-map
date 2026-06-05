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
var useStateAttribute_exports = {};
__export(useStateAttribute_exports, {
  useStateAttribute: () => useStateAttribute
});
module.exports = __toCommonJS(useStateAttribute_exports);
var import_state = require("@tldraw/state");
var import_react = require("react");
var import_useEditor = require("./useEditor");
function useStateAttribute() {
  const editor = (0, import_useEditor.useEditor)();
  (0, import_react.useLayoutEffect)(() => {
    return (0, import_state.react)("stateAttribute", () => {
      const container = editor.getContainer();
      const instanceState = editor.getInstanceState();
      container.setAttribute("data-state", editor.getPath());
      container.setAttribute("data-coarse", String(instanceState.isCoarsePointer));
    });
  }, [editor]);
}
//# sourceMappingURL=useStateAttribute.js.map
