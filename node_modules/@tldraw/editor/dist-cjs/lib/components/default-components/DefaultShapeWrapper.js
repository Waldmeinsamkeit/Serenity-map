"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var DefaultShapeWrapper_exports = {};
__export(DefaultShapeWrapper_exports, {
  DefaultShapeWrapper: () => DefaultShapeWrapper
});
module.exports = __toCommonJS(DefaultShapeWrapper_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_classnames = __toESM(require("classnames"), 1);
var import_react = require("react");
const DefaultShapeWrapper = (0, import_react.forwardRef)(function DefaultShapeWrapper2({ children, shape, isBackground, ...props }, ref) {
  const isFilledShape = "fill" in shape.props && shape.props.fill !== "none";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      ref,
      "data-shape-type": shape.type,
      "data-shape-is-filled": isBackground ? void 0 : isFilledShape,
      "data-shape-id": shape.id,
      draggable: false,
      ...props,
      className: (0, import_classnames.default)("tl-shape", isBackground && "tl-shape-background", props.className),
      children
    }
  );
});
//# sourceMappingURL=DefaultShapeWrapper.js.map
