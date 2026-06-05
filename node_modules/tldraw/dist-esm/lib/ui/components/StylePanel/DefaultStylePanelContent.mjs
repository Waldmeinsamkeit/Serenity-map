import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import {
  ArrowShapeArrowheadEndStyle,
  ArrowShapeArrowheadStartStyle,
  ArrowShapeKindStyle,
  DefaultColorStyle,
  DefaultDashStyle,
  DefaultFillStyle,
  DefaultFontStyle,
  DefaultHorizontalAlignStyle,
  DefaultSizeStyle,
  DefaultTextAlignStyle,
  DefaultVerticalAlignStyle,
  GeoShapeGeoStyle,
  LineShapeSplineStyle,
  kickoutOccludedShapes,
  minBy,
  useEditor,
  useValue
} from "@tldraw/editor";
import React from "react";
import { STYLES } from "../../../styles.mjs";
import { useUiEvents } from "../../context/events.mjs";
import { useTranslation } from "../../hooks/useTranslation/useTranslation.mjs";
import { TldrawUiButtonIcon } from "../primitives/Button/TldrawUiButtonIcon.mjs";
import { TldrawUiSlider } from "../primitives/TldrawUiSlider.mjs";
import { TldrawUiToolbar, TldrawUiToolbarButton } from "../primitives/TldrawUiToolbar.mjs";
import { StylePanelButtonPicker, StylePanelButtonPickerInline } from "./StylePanelButtonPicker.mjs";
import { useStylePanelContext } from "./StylePanelContext.mjs";
import { StylePanelDoubleDropdownPicker } from "./StylePanelDoubleDropdownPicker.mjs";
import {
  StylePanelDropdownPicker,
  StylePanelDropdownPickerInline
} from "./StylePanelDropdownPicker.mjs";
import { StylePanelSubheading } from "./StylePanelSubheading.mjs";
function DefaultStylePanelContent() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(StylePanelSection, { children: [
      /* @__PURE__ */ jsx(StylePanelColorPicker, {}),
      /* @__PURE__ */ jsx(StylePanelOpacityPicker, {})
    ] }),
    /* @__PURE__ */ jsxs(StylePanelSection, { children: [
      /* @__PURE__ */ jsx(StylePanelFillPicker, {}),
      /* @__PURE__ */ jsx(StylePanelDashPicker, {}),
      /* @__PURE__ */ jsx(StylePanelSizePicker, {})
    ] }),
    /* @__PURE__ */ jsxs(StylePanelSection, { children: [
      /* @__PURE__ */ jsx(StylePanelFontPicker, {}),
      /* @__PURE__ */ jsx(StylePanelTextAlignPicker, {}),
      /* @__PURE__ */ jsx(StylePanelLabelAlignPicker, {})
    ] }),
    /* @__PURE__ */ jsxs(StylePanelSection, { children: [
      /* @__PURE__ */ jsx(StylePanelGeoShapePicker, {}),
      /* @__PURE__ */ jsx(StylePanelArrowKindPicker, {}),
      /* @__PURE__ */ jsx(StylePanelArrowheadPicker, {}),
      /* @__PURE__ */ jsx(StylePanelSplinePicker, {})
    ] })
  ] });
}
function StylePanelSection({ children }) {
  return /* @__PURE__ */ jsx("div", { className: "tlui-style-panel__section", children });
}
function StylePanelColorPicker() {
  const { styles } = useStylePanelContext();
  const msg = useTranslation();
  const color = styles.get(DefaultColorStyle);
  if (color === void 0) return null;
  return /* @__PURE__ */ jsx(
    StylePanelButtonPicker,
    {
      title: msg("style-panel.color"),
      uiType: "color",
      style: DefaultColorStyle,
      items: STYLES.color,
      value: color
    }
  );
}
const tldrawSupportedOpacities = [0.1, 0.25, 0.5, 0.75, 1];
function StylePanelOpacityPicker() {
  const editor = useEditor();
  const { onHistoryMark, enhancedA11yMode } = useStylePanelContext();
  const opacity = useValue("opacity", () => editor.getSharedOpacity(), [editor]);
  const trackEvent = useUiEvents();
  const msg = useTranslation();
  const handleOpacityValueChange = React.useCallback(
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
    minBy(
      tldrawSupportedOpacities,
      (supportedOpacity) => Math.abs(supportedOpacity - opacity.value)
    )
  );
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    enhancedA11yMode && /* @__PURE__ */ jsx(StylePanelSubheading, { children: msg("style-panel.opacity") }),
    /* @__PURE__ */ jsx(
      TldrawUiSlider,
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
  const { styles, enhancedA11yMode } = useStylePanelContext();
  const msg = useTranslation();
  const fill = styles.get(DefaultFillStyle);
  if (fill === void 0) return null;
  const title = msg("style-panel.fill");
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    enhancedA11yMode && /* @__PURE__ */ jsx(StylePanelSubheading, { children: title }),
    /* @__PURE__ */ jsxs(TldrawUiToolbar, { orientation: "horizontal", label: title, children: [
      /* @__PURE__ */ jsx(
        StylePanelButtonPickerInline,
        {
          title,
          uiType: "fill",
          style: DefaultFillStyle,
          items: STYLES.fill,
          value: fill
        }
      ),
      /* @__PURE__ */ jsx(
        StylePanelDropdownPickerInline,
        {
          type: "icon",
          id: "fill-extra",
          uiType: "fill",
          testIdType: "fill-extra",
          stylePanelType: "fill",
          style: DefaultFillStyle,
          items: STYLES.fillExtra,
          value: fill
        }
      )
    ] })
  ] });
}
function StylePanelDashPicker() {
  const { styles } = useStylePanelContext();
  const msg = useTranslation();
  const dash = styles.get(DefaultDashStyle);
  if (dash === void 0) return null;
  return /* @__PURE__ */ jsx(
    StylePanelButtonPicker,
    {
      title: msg("style-panel.dash"),
      uiType: "dash",
      style: DefaultDashStyle,
      items: STYLES.dash,
      value: dash
    }
  );
}
function StylePanelSizePicker() {
  const editor = useEditor();
  const { styles, onValueChange } = useStylePanelContext();
  const msg = useTranslation();
  const size = styles.get(DefaultSizeStyle);
  if (size === void 0) return null;
  return /* @__PURE__ */ jsx(
    StylePanelButtonPicker,
    {
      title: msg("style-panel.size"),
      uiType: "size",
      style: DefaultSizeStyle,
      items: STYLES.size,
      value: size,
      onValueChange: (style, value) => {
        onValueChange(style, value);
        const selectedShapeIds = editor.getSelectedShapeIds();
        if (selectedShapeIds.length > 0) {
          kickoutOccludedShapes(editor, selectedShapeIds);
        }
      }
    }
  );
}
function StylePanelFontPicker() {
  const { styles } = useStylePanelContext();
  const msg = useTranslation();
  const font = styles.get(DefaultFontStyle);
  if (font === void 0) return null;
  return /* @__PURE__ */ jsx(
    StylePanelButtonPicker,
    {
      title: msg("style-panel.font"),
      uiType: "font",
      style: DefaultFontStyle,
      items: STYLES.font,
      value: font
    }
  );
}
function StylePanelTextAlignPicker() {
  const { styles, enhancedA11yMode } = useStylePanelContext();
  const msg = useTranslation();
  const textAlign = styles.get(DefaultTextAlignStyle);
  if (textAlign === void 0) return null;
  const title = msg("style-panel.align");
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    enhancedA11yMode && /* @__PURE__ */ jsx(StylePanelSubheading, { children: title }),
    /* @__PURE__ */ jsxs(TldrawUiToolbar, { orientation: "horizontal", label: title, children: [
      /* @__PURE__ */ jsx(
        StylePanelButtonPickerInline,
        {
          title,
          uiType: "align",
          style: DefaultTextAlignStyle,
          items: STYLES.textAlign,
          value: textAlign
        }
      ),
      /* @__PURE__ */ jsx(
        TldrawUiToolbarButton,
        {
          type: "icon",
          title: msg("style-panel.vertical-align"),
          "data-testid": "vertical-align",
          disabled: true,
          children: /* @__PURE__ */ jsx(TldrawUiButtonIcon, { icon: "vertical-align-middle" })
        }
      )
    ] })
  ] });
}
function StylePanelLabelAlignPicker() {
  const { styles, enhancedA11yMode } = useStylePanelContext();
  const msg = useTranslation();
  const labelAlign = styles.get(DefaultHorizontalAlignStyle);
  const verticalLabelAlign = styles.get(DefaultVerticalAlignStyle);
  if (labelAlign === void 0) return null;
  const title = msg("style-panel.label-align");
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    enhancedA11yMode && /* @__PURE__ */ jsx(StylePanelSubheading, { children: title }),
    /* @__PURE__ */ jsxs(TldrawUiToolbar, { orientation: "horizontal", label: title, children: [
      /* @__PURE__ */ jsx(
        StylePanelButtonPickerInline,
        {
          title,
          uiType: "align",
          style: DefaultHorizontalAlignStyle,
          items: STYLES.horizontalAlign,
          value: labelAlign
        }
      ),
      verticalLabelAlign === void 0 ? /* @__PURE__ */ jsx(
        TldrawUiToolbarButton,
        {
          type: "icon",
          title: msg("style-panel.vertical-align"),
          "data-testid": "vertical-align",
          disabled: true,
          children: /* @__PURE__ */ jsx(TldrawUiButtonIcon, { icon: "vertical-align-middle" })
        }
      ) : /* @__PURE__ */ jsx(
        StylePanelDropdownPickerInline,
        {
          type: "icon",
          id: "geo-vertical-alignment",
          uiType: "verticalAlign",
          stylePanelType: "vertical-align",
          style: DefaultVerticalAlignStyle,
          items: STYLES.verticalAlign,
          value: verticalLabelAlign
        }
      )
    ] })
  ] });
}
function StylePanelGeoShapePicker() {
  const { styles } = useStylePanelContext();
  const geo = styles.get(GeoShapeGeoStyle);
  if (geo === void 0) return null;
  return /* @__PURE__ */ jsx(
    StylePanelDropdownPicker,
    {
      label: "style-panel.geo",
      type: "menu",
      id: "geo",
      uiType: "geo",
      stylePanelType: "geo",
      style: GeoShapeGeoStyle,
      items: STYLES.geo,
      value: geo
    }
  );
}
function StylePanelArrowKindPicker() {
  const { styles } = useStylePanelContext();
  const arrowKind = styles.get(ArrowShapeKindStyle);
  if (arrowKind === void 0) return null;
  return /* @__PURE__ */ jsx(
    StylePanelDropdownPicker,
    {
      id: "arrow-kind",
      type: "menu",
      label: "style-panel.arrow-kind",
      uiType: "arrow-kind",
      stylePanelType: "arrow-kind",
      style: ArrowShapeKindStyle,
      items: STYLES.arrowKind,
      value: arrowKind
    }
  );
}
function StylePanelArrowheadPicker() {
  const { styles } = useStylePanelContext();
  const arrowheadEnd = styles.get(ArrowShapeArrowheadEndStyle);
  const arrowheadStart = styles.get(ArrowShapeArrowheadStartStyle);
  if (arrowheadEnd === void 0 || arrowheadStart === void 0) return null;
  return /* @__PURE__ */ jsx(
    StylePanelDoubleDropdownPicker,
    {
      label: "style-panel.arrowheads",
      uiTypeA: "arrowheadStart",
      styleA: ArrowShapeArrowheadStartStyle,
      itemsA: STYLES.arrowheadStart,
      valueA: arrowheadStart,
      uiTypeB: "arrowheadEnd",
      styleB: ArrowShapeArrowheadEndStyle,
      itemsB: STYLES.arrowheadEnd,
      valueB: arrowheadEnd,
      labelA: "style-panel.arrowhead-start",
      labelB: "style-panel.arrowhead-end"
    }
  );
}
function StylePanelSplinePicker() {
  const { styles } = useStylePanelContext();
  const spline = styles.get(LineShapeSplineStyle);
  if (spline === void 0) return null;
  return /* @__PURE__ */ jsx(
    StylePanelDropdownPicker,
    {
      type: "menu",
      id: "spline",
      uiType: "spline",
      stylePanelType: "spline",
      label: "style-panel.spline",
      style: LineShapeSplineStyle,
      items: STYLES.spline,
      value: spline
    }
  );
}
export {
  DefaultStylePanelContent,
  StylePanelArrowKindPicker,
  StylePanelArrowheadPicker,
  StylePanelColorPicker,
  StylePanelDashPicker,
  StylePanelFillPicker,
  StylePanelFontPicker,
  StylePanelGeoShapePicker,
  StylePanelLabelAlignPicker,
  StylePanelOpacityPicker,
  StylePanelSection,
  StylePanelSizePicker,
  StylePanelSplinePicker,
  StylePanelTextAlignPicker
};
//# sourceMappingURL=DefaultStylePanelContent.mjs.map
