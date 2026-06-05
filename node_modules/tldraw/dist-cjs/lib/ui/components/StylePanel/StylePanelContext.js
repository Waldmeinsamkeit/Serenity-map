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
var StylePanelContext_exports = {};
__export(StylePanelContext_exports, {
  StylePanelContextProvider: () => StylePanelContextProvider,
  useStylePanelContext: () => useStylePanelContext
});
module.exports = __toCommonJS(StylePanelContext_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_editor = require("@tldraw/editor");
var import_react = require("react");
var import_events = require("../../context/events");
const StylePanelContext = (0, import_react.createContext)(null);
function StylePanelContextProvider({ children, styles }) {
  const editor = (0, import_editor.useEditor)();
  const trackEvent = (0, import_events.useUiEvents)();
  const onHistoryMark = (0, import_react.useCallback)((id) => editor.markHistoryStoppingPoint(id), [editor]);
  const enhancedA11yMode = (0, import_editor.useValue)("enhancedA11yMode", () => editor.user.getEnhancedA11yMode(), [
    editor
  ]);
  const onValueChange = (0, import_react.useCallback)(
    function(style, value) {
      editor.run(() => {
        if (editor.isIn("select")) {
          editor.setStyleForSelectedShapes(style, value);
        }
        editor.setStyleForNextShapes(style, value);
        editor.updateInstanceState({ isChangingStyle: true });
      });
      trackEvent("set-style", { source: "style-panel", id: style.id, value });
    },
    [editor, trackEvent]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    StylePanelContext.Provider,
    {
      value: {
        styles,
        enhancedA11yMode,
        onHistoryMark,
        onValueChange
      },
      children
    }
  );
}
function useStylePanelContext() {
  const context = (0, import_react.useContext)(StylePanelContext);
  if (!context) {
    throw new Error("useStylePanelContext must be used within a StylePanelContextProvider");
  }
  return context;
}
//# sourceMappingURL=StylePanelContext.js.map
