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
var DefaultStylePanelContent_exports = {};
__export(DefaultStylePanelContent_exports, {
  DefaultStylePanelContent: () => DefaultStylePanelContent,
  StylePanelArrowKindPicker: () => StylePanelArrowKindPicker,
  StylePanelArrowheadPicker: () => StylePanelArrowheadPicker,
  StylePanelColorPicker: () => StylePanelColorPicker,
  StylePanelDashPicker: () => StylePanelDashPicker,
  StylePanelFillPicker: () => StylePanelFillPicker,
  StylePanelFontPicker: () => StylePanelFontPicker,
  StylePanelGeoShapePicker: () => StylePanelGeoShapePicker,
  StylePanelLabelAlignPicker: () => StylePanelLabelAlignPicker,
  StylePanelOpacityPicker: () => StylePanelOpacityPicker,
  StylePanelSection: () => StylePanelSection,
  StylePanelSizePicker: () => StylePanelSizePicker,
  StylePanelSplinePicker: () => StylePanelSplinePicker,
  StylePanelTextAlignPicker: () => StylePanelTextAlignPicker
});
module.exports = __toCommonJS(DefaultStylePanelContent_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_editor = require("@tldraw/editor");
var import_react = __toESM(require("react"), 1);
var import_styles = require("../../../styles");
var import_events = require("../../context/events");
var import_useTranslation = require("../../hooks/useTranslation/useTranslation");
var import_TldrawUiButtonIcon = require("../primitives/Button/TldrawUiButtonIcon");
var import_TldrawUiSlider = require("../primitives/TldrawUiSlider");
var import_TldrawUiToolbar = require("../primitives/TldrawUiToolbar");
var import_StylePanelButtonPicker = require("./StylePanelButtonPicker");
var import_StylePanelContext = require("./StylePanelContext");
var import_StylePanelDoubleDropdownPicker = require("./StylePanelDoubleDropdownPicker");
var import_StylePanelDropdownPicker = require("./StylePanelDropdownPicker");
var import_StylePanelSubheading = require("./StylePanelSubheading");
function DefaultStylePanelContent() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StylePanelSection, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StylePanelColorPicker, {}),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StylePanelOpacityPicker, {})
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StylePanelSection, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StylePanelFillPicker, {}),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StylePanelDashPicker, {}),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StylePanelSizePicker, {})
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StylePanelSection, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StylePanelFontPicker, {}),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StylePanelTextAlignPicker, {}),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StylePanelLabelAlignPicker, {})
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StylePanelSection, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StylePanelGeoShapePicker, {}),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StylePanelArrowKindPicker, {}),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StylePanelArrowheadPicker, {}),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StylePanelSplinePicker, {})
    ] })
  ] });
}
function StylePanelSection({ children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "tlui-style-panel__section", children });
}
function StylePanelColorPicker() {
  const { styles } = (0, import_StylePanelContext.useStylePanelContext)();
  const msg = (0, import_useTranslation.useTranslation)();
  const color = styles.get(import_editor.DefaultColorStyle);
  if (color === void 0) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_StylePanelButtonPicker.StylePanelButtonPicker,
    {
      title: msg("style-panel.color"),
      uiType: "color",
      style: import_editor.DefaultColorStyle,
      items: import_styles.STYLES.color,
      value: color
    }
  );
}
const tldrawSupportedOpacities = [0.1, 0.25, 0.5, 0.75, 1];
function StylePanelOpacityPicker() {
  const editor = (0, import_editor.useEditor)();
  const { onHistoryMark, enhancedA11yMode } = (0, import_StylePanelContext.useStylePanelContext)();
  const opacity = (0, import_editor.useValue)("opacity", () => editor.getSharedOpacity(), [editor]);
  const trackEvent = (0, import_events.useUiEvents)();
  const msg = (0, import_useTranslation.useTranslation)();
  const handleOpacityValueChange = import_react.default.useCallback(
    (value) => {
      const item = tldrawSupportedOpacities[value];
      editor.run(() => {
        if (editor.isIn("select")) {
          editor.setOpacityForSelectedShapes(item);
        }
        editor.setOpacityForNextShapes(item);
        editor.updateInstanceState({ isChangingStyle: true });
      });
      trackEvent("set-style", { source: "style-panel", id: "opacity", value });
    },
    [editor, trackEvent]
  );
  if (opacity === void 0) return null;
  const opacityIndex = opacity.type === "mixed" ? -1 : tldrawSupportedOpacities.indexOf(
    (0, import_editor.minBy)(
      tldrawSupportedOpacities,
      (supportedOpacity) => Math.abs(supportedOpacity - opacity.value)
    )
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    enhancedA11yMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_StylePanelSubheading.StylePanelSubheading, { children: msg("style-panel.opacity") }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_TldrawUiSlider.TldrawUiSlider,
      {
        "data-testid": "style.opacity",
        value: opacityIndex >= 0 ? opacityIndex : tldrawSupportedOpacities.length - 1,
        label: opacity.type === "mixed" ? "style-panel.mixed" : `opacity-style.${opacity.value}`,
        onValueChange: handleOpacityValueChange,
        steps: tldrawSupportedOpacities.length - 1,
        title: msg("style-panel.opacity"),
        onHistoryMark,
        ariaValueModifier: 25
      }
    )
  ] });
}
function StylePanelFillPicker() {
  const { styles, enhancedA11yMode } = (0, import_StylePanelContext.useStylePanelContext)();
  const msg = (0, import_useTranslation.useTranslation)();
  const fill = styles.get(import_editor.DefaultFillStyle);
  if (fill === void 0) return null;
  const title = msg("style-panel.fill");
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    enhancedA11yMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_StylePanelSubheading.StylePanelSubheading, { children: title }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_TldrawUiToolbar.TldrawUiToolbar, { orientation: "horizontal", label: title, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_StylePanelButtonPicker.StylePanelButtonPickerInline,
        {
          title,
          uiType: "fill",
          style: import_editor.DefaultFillStyle,
          items: import_styles.STYLES.fill,
          value: fill
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_StylePanelDropdownPicker.StylePanelDropdownPickerInline,
        {
          type: "icon",
          id: "fill-extra",
          uiType: "fill",
          testIdType: "fill-extra",
          stylePanelType: "fill",
          style: import_editor.DefaultFillStyle,
          items: import_styles.STYLES.fillExtra,
          value: fill
        }
      )
    ] })
  ] });
}
function StylePanelDashPicker() {
  const { styles } = (0, import_StylePanelContext.useStylePanelContext)();
  const msg = (0, import_useTranslation.useTranslation)();
  const dash = styles.get(import_editor.DefaultDashStyle);
  if (dash === void 0) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_StylePanelButtonPicker.StylePanelButtonPicker,
    {
      title: msg("style-panel.dash"),
      uiType: "dash",
      style: import_editor.DefaultDashStyle,
      items: import_styles.STYLES.dash,
      value: dash
    }
  );
}
function StylePanelSizePicker() {
  const editor = (0, import_editor.useEditor)();
  const { styles, onValueChange } = (0, import_StylePanelContext.useStylePanelContext)();
  const msg = (0, import_useTranslation.useTranslation)();
  const size = styles.get(import_editor.DefaultSizeStyle);
  if (size === void 0) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_StylePanelButtonPicker.StylePanelButtonPicker,
    {
      title: msg("style-panel.size"),
      uiType: "size",
      style: import_editor.DefaultSizeStyle,
      items: import_styles.STYLES.size,
      value: size,
      onValueChange: (style, value) => {
        onValueChange(style, value);
        const selectedShapeIds = editor.getSelectedShapeIds();
        if (selectedShapeIds.length > 0) {
          (0, import_editor.kickoutOccludedShapes)(editor, selectedShapeIds);
        }
      }
    }
  );
}
function StylePanelFontPicker() {
  const { styles } = (0, import_StylePanelContext.useStylePanelContext)();
  const msg = (0, import_useTranslation.useTranslation)();
  const font = styles.get(import_editor.DefaultFontStyle);
  if (font === void 0) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_StylePanelButtonPicker.StylePanelButtonPicker,
    {
      title: msg("style-panel.font"),
      uiType: "font",
      style: import_editor.DefaultFontStyle,
      items: import_styles.STYLES.font,
      value: font
    }
  );
}
function StylePanelTextAlignPicker() {
  const { styles, enhancedA11yMode } = (0, import_StylePanelContext.useStylePanelContext)();
  const msg = (0, import_useTranslation.useTranslation)();
  const textAlign = styles.get(import_editor.DefaultTextAlignStyle);
  if (textAlign === void 0) return null;
  const title = msg("style-panel.align");
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    enhancedA11yMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_StylePanelSubheading.StylePanelSubheading, { children: title }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_TldrawUiToolbar.TldrawUiToolbar, { orientation: "horizontal", label: title, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_StylePanelButtonPicker.StylePanelButtonPickerInline,
        {
          title,
          uiType: "align",
          style: import_editor.DefaultTextAlignStyle,
          items: import_styles.STYLES.textAlign,
          value: textAlign
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_TldrawUiToolbar.TldrawUiToolbarButton,
        {
          type: "icon",
          title: msg("style-panel.vertical-align"),
          "data-testid": "vertical-align",
          disabled: true,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_TldrawUiButtonIcon.TldrawUiButtonIcon, { icon: "vertical-align-middle" })
        }
      )
    ] })
  ] });
}
function StylePanelLabelAlignPicker() {
  const { styles, enhancedA11yMode } = (0, import_StylePanelContext.useStylePanelContext)();
  const msg = (0, import_useTranslation.useTranslation)();
  const labelAlign = styles.get(import_editor.DefaultHorizontalAlignStyle);
  const verticalLabelAlign = styles.get(import_editor.DefaultVerticalAlignStyle);
  if (labelAlign === void 0) return null;
  const title = msg("style-panel.label-align");
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    enhancedA11yMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_StylePanelSubheading.StylePanelSubheading, { children: title }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_TldrawUiToolbar.TldrawUiToolbar, { orientation: "horizontal", label: title, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_StylePanelButtonPicker.StylePanelButtonPickerInline,
        {
          title,
          uiType: "align",
          style: import_editor.DefaultHorizontalAlignStyle,
          items: import_styles.STYLES.horizontalAlign,
          value: labelAlign
        }
      ),
      verticalLabelAlign === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_TldrawUiToolbar.TldrawUiToolbarButton,
        {
          type: "icon",
          title: msg("style-panel.vertical-align"),
          "data-testid": "vertical-align",
          disabled: true,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_TldrawUiButtonIcon.TldrawUiButtonIcon, { icon: "vertical-align-middle" })
        }
      ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_StylePanelDropdownPicker.StylePanelDropdownPickerInline,
        {
          type: "icon",
          id: "geo-vertical-alignment",
          uiType: "verticalAlign",
          stylePanelType: "vertical-align",
          style: import_editor.DefaultVerticalAlignStyle,
          items: import_styles.STYLES.verticalAlign,
          value: verticalLabelAlign
        }
      )
    ] })
  ] });
}
function StylePanelGeoShapePicker() {
  const { styles } = (0, import_StylePanelContext.useStylePanelContext)();
  const geo = styles.get(import_editor.GeoShapeGeoStyle);
  if (geo === void 0) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_StylePanelDropdownPicker.StylePanelDropdownPicker,
    {
      label: "style-panel.geo",
      type: "menu",
      id: "geo",
      uiType: "geo",
      stylePanelType: "geo",
      style: import_editor.GeoShapeGeoStyle,
      items: import_styles.STYLES.geo,
      value: geo
    }
  );
}
function StylePanelArrowKindPicker() {
  const { styles } = (0, import_StylePanelContext.useStylePanelContext)();
  const arrowKind = styles.get(import_editor.ArrowShapeKindStyle);
  if (arrowKind === void 0) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_StylePanelDropdownPicker.StylePanelDropdownPicker,
    {
      id: "arrow-kind",
      type: "menu",
      label: "style-panel.arrow-kind",
      uiType: "arrow-kind",
      stylePanelType: "arrow-kind",
      style: import_editor.ArrowShapeKindStyle,
      items: import_styles.STYLES.arrowKind,
      value: arrowKind
    }
  );
}
function StylePanelArrowheadPicker() {
  const { styles } = (0, import_StylePanelContext.useStylePanelContext)();
  const arrowheadEnd = styles.get(import_editor.ArrowShapeArrowheadEndStyle);
  const arrowheadStart = styles.get(import_editor.ArrowShapeArrowheadStartStyle);
  if (arrowheadEnd === void 0 || arrowheadStart === void 0) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_StylePanelDoubleDropdownPicker.StylePanelDoubleDropdownPicker,
    {
      label: "style-panel.arrowheads",
      uiTypeA: "arrowheadStart",
      styleA: import_editor.ArrowShapeArrowheadStartStyle,
      itemsA: import_styles.STYLES.arrowheadStart,
      valueA: arrowheadStart,
      uiTypeB: "arrowheadEnd",
      styleB: import_editor.ArrowShapeArrowheadEndStyle,
      itemsB: import_styles.STYLES.arrowheadEnd,
      valueB: arrowheadEnd,
      labelA: "style-panel.arrowhead-start",
      labelB: "style-panel.arrowhead-end"
    }
  );
}
function StylePanelSplinePicker() {
  const { styles } = (0, import_StylePanelContext.useStylePanelContext)();
  const spline = styles.get(import_editor.LineShapeSplineStyle);
  if (spline === void 0) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_StylePanelDropdownPicker.StylePanelDropdownPicker,
    {
      type: "menu",
      id: "spline",
      uiType: "spline",
      stylePanelType: "spline",
      label: "style-panel.spline",
      style: import_editor.LineShapeSplineStyle,
      items: import_styles.STYLES.spline,
      value: spline
    }
  );
}
//# sourceMappingURL=DefaultStylePanelContent.js.map
