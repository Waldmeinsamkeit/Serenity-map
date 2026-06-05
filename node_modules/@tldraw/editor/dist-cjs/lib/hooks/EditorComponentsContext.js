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
var EditorComponentsContext_exports = {};
__export(EditorComponentsContext_exports, {
  EditorComponentsContext: () => EditorComponentsContext,
  useEditorComponents: () => useEditorComponents
});
module.exports = __toCommonJS(EditorComponentsContext_exports);
var import_react = require("react");
const EditorComponentsContext = (0, import_react.createContext)(null);
function useEditorComponents() {
  const components = (0, import_react.useContext)(EditorComponentsContext);
  if (!components) {
    throw new Error("useEditorComponents must be used inside of <EditorComponentsProvider />");
  }
  return components;
}
//# sourceMappingURL=EditorComponentsContext.js.map
