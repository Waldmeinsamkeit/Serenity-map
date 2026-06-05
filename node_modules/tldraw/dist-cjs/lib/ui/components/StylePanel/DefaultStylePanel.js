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
var DefaultStylePanel_exports = {};
__export(DefaultStylePanel_exports, {
  DefaultStylePanel: () => DefaultStylePanel
});
module.exports = __toCommonJS(DefaultStylePanel_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_editor = require("@tldraw/editor");
var import_classnames = __toESM(require("classnames"), 1);
var import_react = require("react");
var import_useRelevantStyles = require("../../hooks/useRelevantStyles");
var import_DefaultStylePanelContent = require("./DefaultStylePanelContent");
var import_StylePanelContext = require("./StylePanelContext");
const DefaultStylePanel = (0, import_react.memo)(function DefaultStylePanel2({
  isMobile,
  styles,
  children
}) {
  const editor = (0, import_editor.useEditor)();
  const enhancedA11yMode = (0, import_editor.useValue)("enhancedA11yMode", () => editor.user.getEnhancedA11yMode(), [
    editor
  ]);
  const ref = (0, import_react.useRef)(null);
  (0, import_editor.usePassThroughWheelEvents)(ref);
  const handlePointerOut = (0, import_react.useCallback)(() => {
    if (!isMobile) {
      editor.updateInstanceState({ isChangingStyle: false });
    }
  }, [editor, isMobile]);
  const defaultStyles = (0, import_useRelevantStyles.useRelevantStyles)();
  if (styles === void 0) {
    styles = defaultStyles;
  }
  (0, import_react.useEffect)(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && ref.current?.contains(document.activeElement)) {
        event.stopPropagation();
        editor.getContainer().focus();
      }
    }
    const stylePanelContainerEl = ref.current;
    stylePanelContainerEl?.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      stylePanelContainerEl?.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [editor]);
  return styles && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      ref,
      "data-testid": "style.panel",
      className: (0, import_classnames.default)("tlui-style-panel", { "tlui-style-panel__wrapper": !isMobile }),
      "data-ismobile": isMobile,
      "data-enhanced-a11y-mode": enhancedA11yMode,
      onPointerLeave: handlePointerOut,
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_StylePanelContext.StylePanelContextProvider, { styles, children: children ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_DefaultStylePanelContent.DefaultStylePanelContent, {}) })
    }
  );
});
//# sourceMappingURL=DefaultStylePanel.js.map
