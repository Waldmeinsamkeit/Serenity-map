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
var TldrawUiSlider_exports = {};
__export(TldrawUiSlider_exports, {
  TldrawUiSlider: () => TldrawUiSlider
});
module.exports = __toCommonJS(TldrawUiSlider_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_editor = require("@tldraw/editor");
var import_radix_ui = require("radix-ui");
var import_react = __toESM(require("react"), 1);
var import_useTranslation = require("../../hooks/useTranslation/useTranslation");
var import_TldrawUiTooltip = require("./TldrawUiTooltip");
const TldrawUiSlider = import_react.default.forwardRef(function Slider({
  onHistoryMark,
  title,
  min,
  steps,
  value,
  label,
  onValueChange,
  ["data-testid"]: testId,
  ariaValueModifier = 1
}, ref) {
  const msg = (0, import_useTranslation.useTranslation)();
  const [titleAndLabel, setTitleAndLabel] = (0, import_react.useState)("");
  const [tabIndex, setTabIndex] = (0, import_react.useState)(-1);
  (0, import_react.useEffect)(() => {
    setTabIndex(0);
  }, []);
  const handleValueChange = (0, import_react.useCallback)(
    (value2) => {
      onValueChange(value2[0]);
    },
    [onValueChange]
  );
  const handlePointerDown = (0, import_react.useCallback)(() => {
    (0, import_TldrawUiTooltip.hideAllTooltips)();
    onHistoryMark?.("click slider");
  }, [onHistoryMark]);
  (0, import_react.useEffect)(() => {
    const timeout = import_editor.tltime.setTimeout(
      "set title and label",
      () => {
        setTitleAndLabel(title + " \u2014 " + msg(label));
      },
      0
    );
    return () => clearTimeout(timeout);
  }, [label, msg, title]);
  const handleKeyEvent = (0, import_react.useCallback)((event) => {
    if (event.key === "Tab") {
      event.stopPropagation();
    }
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "tlui-slider__container", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_TldrawUiTooltip.TldrawUiTooltip, { content: titleAndLabel, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    import_radix_ui.Slider.Root,
    {
      "data-testid": testId,
      className: "tlui-slider",
      dir: "ltr",
      min: min ?? 0,
      max: steps,
      step: 1,
      value: value !== null ? [value] : void 0,
      onPointerDown: handlePointerDown,
      onValueChange: handleValueChange,
      onKeyDownCapture: handleKeyEvent,
      onKeyUpCapture: handleKeyEvent,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_radix_ui.Slider.Track, { className: "tlui-slider__track", dir: "ltr", children: value !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_radix_ui.Slider.Range, { className: "tlui-slider__range", dir: "ltr" }) }),
        value !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_radix_ui.Slider.Thumb,
          {
            "aria-valuemin": (min ?? 0) * ariaValueModifier,
            "aria-valuenow": value * ariaValueModifier,
            "aria-valuemax": steps * ariaValueModifier,
            "aria-label": titleAndLabel,
            className: "tlui-slider__thumb",
            dir: "ltr",
            ref,
            tabIndex
          }
        )
      ]
    }
  ) }) });
});
//# sourceMappingURL=TldrawUiSlider.js.map
