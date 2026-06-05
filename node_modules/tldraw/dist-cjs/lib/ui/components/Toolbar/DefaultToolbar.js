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
var DefaultToolbar_exports = {};
__export(DefaultToolbar_exports, {
  DefaultToolbar: () => DefaultToolbar
});
module.exports = __toCommonJS(DefaultToolbar_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_editor = require("@tldraw/editor");
var import_classnames = __toESM(require("classnames"), 1);
var import_react = require("react");
var import_constants = require("../../constants");
var import_breakpoints = require("../../context/breakpoints");
var import_components = require("../../context/components");
var import_useReadonly = require("../../hooks/useReadonly");
var import_useTranslation = require("../../hooks/useTranslation/useTranslation");
var import_MobileStylePanel = require("../MobileStylePanel");
var import_layout = require("../primitives/layout");
var import_TldrawUiToolbar = require("../primitives/TldrawUiToolbar");
var import_DefaultToolbarContent = require("./DefaultToolbarContent");
var import_OverflowingToolbar = require("./OverflowingToolbar");
var import_ToggleToolLockedButton = require("./ToggleToolLockedButton");
const DefaultToolbar = (0, import_react.memo)(function DefaultToolbar2({
  children,
  orientation = "horizontal",
  minItems = 4,
  minSizePx = 310,
  maxItems = 8,
  maxSizePx = 470
}) {
  const editor = (0, import_editor.useEditor)();
  const msg = (0, import_useTranslation.useTranslation)();
  const breakpoint = (0, import_breakpoints.useBreakpoint)();
  const isReadonlyMode = (0, import_useReadonly.useReadonly)();
  const activeToolId = (0, import_editor.useValue)("current tool id", () => editor.getCurrentToolId(), [editor]);
  const ref = (0, import_react.useRef)(null);
  (0, import_editor.usePassThroughWheelEvents)(ref);
  const { ActionsMenu, QuickActions } = (0, import_components.useTldrawUiComponents)();
  const showQuickActions = editor.options.actionShortcutsLocation === "menu" ? false : editor.options.actionShortcutsLocation === "toolbar" ? true : breakpoint < import_constants.PORTRAIT_BREAKPOINT.TABLET;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_layout.TldrawUiOrientationProvider,
    {
      orientation,
      tooltipSide: orientation === "horizontal" ? "top" : "right",
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          ref,
          className: (0, import_classnames.default)("tlui-main-toolbar", `tlui-main-toolbar--${orientation}`),
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tlui-main-toolbar__inner", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tlui-main-toolbar__left", children: [
              !isReadonlyMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tlui-main-toolbar__extras", children: [
                showQuickActions && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                  import_TldrawUiToolbar.TldrawUiToolbar,
                  {
                    orientation,
                    className: "tlui-main-toolbar__extras__controls",
                    label: msg("actions-menu.title"),
                    children: [
                      QuickActions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickActions, {}),
                      ActionsMenu && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionsMenu, {})
                    ]
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ToggleToolLockedButton.ToggleToolLockedButton, { activeToolId })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_OverflowingToolbar.OverflowingToolbar,
                {
                  orientation,
                  sizingParentClassName: "tlui-main-toolbar",
                  minItems,
                  maxItems,
                  minSizePx,
                  maxSizePx,
                  children: children ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_DefaultToolbarContent.DefaultToolbarContent, {})
                }
              )
            ] }),
            breakpoint < import_constants.PORTRAIT_BREAKPOINT.TABLET_SM && !isReadonlyMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "tlui-main-toolbar__tools tlui-main-toolbar__mobile-style-panel", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_MobileStylePanel.MobileStylePanel, {}) })
          ] })
        }
      )
    }
  );
});
//# sourceMappingURL=DefaultToolbar.js.map
