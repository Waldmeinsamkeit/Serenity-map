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
var TldrawUiMenuGroup_exports = {};
__export(TldrawUiMenuGroup_exports, {
  TldrawUiMenuGroup: () => TldrawUiMenuGroup
});
module.exports = __toCommonJS(TldrawUiMenuGroup_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_classnames = __toESM(require("classnames"), 1);
var import_actions = require("../../../context/actions");
var import_useTranslation = require("../../../hooks/useTranslation/useTranslation");
var import_layout = require("../layout");
var import_TldrawUiDropdownMenu = require("../TldrawUiDropdownMenu");
var import_TldrawUiMenuContext = require("./TldrawUiMenuContext");
function TldrawUiMenuGroup({ id, label, className, children }) {
  const menu = (0, import_TldrawUiMenuContext.useTldrawUiMenuContext)();
  const { orientation } = (0, import_layout.useTldrawUiOrientation)();
  const msg = (0, import_useTranslation.useTranslation)();
  const labelToUse = (0, import_actions.unwrapLabel)(label, menu.type);
  const labelStr = labelToUse ? msg(labelToUse) : void 0;
  switch (menu.type) {
    case "menu": {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_TldrawUiDropdownMenu.TldrawUiDropdownMenuGroup,
        {
          className,
          "data-testid": `${menu.sourceId}-group.${id}`,
          children
        }
      );
    }
    case "context-menu": {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          dir: "ltr",
          className: (0, import_classnames.default)("tlui-menu__group", className),
          "data-testid": `${menu.sourceId}-group.${id}`,
          children
        }
      );
    }
    case "keyboard-shortcuts": {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tlui-shortcuts-dialog__group", "data-testid": `${menu.sourceId}-group.${id}`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "tlui-shortcuts-dialog__group__title", children: labelStr }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "tlui-shortcuts-dialog__group__content", children })
      ] });
    }
    case "toolbar": {
      const Layout = orientation === "horizontal" ? import_layout.TldrawUiRow : import_layout.TldrawUiColumn;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layout, { className: "tlui-main-toolbar__group", "data-testid": `${menu.sourceId}-group.${id}`, children });
    }
    case "toolbar-overflow": {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_layout.TldrawUiGrid,
        {
          className: "tlui-main-toolbar__group",
          "data-testid": `${menu.sourceId}-group.${id}`,
          children
        }
      );
    }
    default: {
      return children;
    }
  }
}
//# sourceMappingURL=TldrawUiMenuGroup.js.map
