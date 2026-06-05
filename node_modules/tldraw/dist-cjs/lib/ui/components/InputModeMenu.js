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
var InputModeMenu_exports = {};
__export(InputModeMenu_exports, {
  InputModeMenu: () => InputModeMenu
});
module.exports = __toCommonJS(InputModeMenu_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_editor = require("@tldraw/editor");
var import_events = require("../context/events");
var import_menu_items = require("./menu-items");
var import_TldrawUiMenuCheckboxItem = require("./primitives/menus/TldrawUiMenuCheckboxItem");
var import_TldrawUiMenuGroup = require("./primitives/menus/TldrawUiMenuGroup");
var import_TldrawUiMenuSubmenu = require("./primitives/menus/TldrawUiMenuSubmenu");
const MODES = ["auto", "trackpad", "mouse"];
function InputModeMenu() {
  const editor = (0, import_editor.useEditor)();
  const trackEvent = (0, import_events.useUiEvents)();
  const inputMode = (0, import_editor.useValue)("inputMode", () => editor.user.getUserPreferences().inputMode, [
    editor
  ]);
  const wheelBehavior = (0, import_editor.useValue)("wheelBehavior", () => editor.getCameraOptions().wheelBehavior, [
    editor
  ]);
  const isModeChecked = (mode) => {
    if (mode === "auto") {
      return inputMode === null;
    }
    return inputMode === mode;
  };
  const getLabel = (mode, wheelBehavior2) => {
    if (mode === "auto") {
      return `action.toggle-auto-${wheelBehavior2}`;
    }
    return mode === "trackpad" ? "action.toggle-trackpad" : "action.toggle-mouse";
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_TldrawUiMenuSubmenu.TldrawUiMenuSubmenu, { id: "help menu input-mode", label: "menu.input-device", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_TldrawUiMenuGroup.TldrawUiMenuGroup, { id: "peripheral-mode", children: MODES.map((mode) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_TldrawUiMenuCheckboxItem.TldrawUiMenuCheckboxItem,
      {
        id: `peripheral-mode-${mode}`,
        label: getLabel(mode, wheelBehavior),
        checked: isModeChecked(mode),
        readonlyOk: true,
        onSelect: () => {
          trackEvent("input-mode", { source: "menu", value: mode });
          switch (mode) {
            case "auto":
              editor.user.updateUserPreferences({ inputMode: null });
              break;
            case "trackpad":
              editor.user.updateUserPreferences({ inputMode: "trackpad" });
              break;
            case "mouse":
              editor.user.updateUserPreferences({ inputMode: "mouse" });
              break;
          }
        }
      },
      mode
    )) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_TldrawUiMenuGroup.TldrawUiMenuGroup, { id: "invert-zoom-group", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_menu_items.ToggleInvertZoomItem, {}) })
  ] });
}
//# sourceMappingURL=InputModeMenu.js.map
