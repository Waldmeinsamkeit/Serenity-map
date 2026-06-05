import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import {
  getColorValue,
  useEditor,
  useSvgExportContext,
  useValue
} from "@tldraw/editor";
import React from "react";
import { useGetHashPatternZoomName } from "./defaultStyleDefs.mjs";
const ShapeFill = React.memo(function ShapeFill2({
  theme,
  d,
  color,
  fill,
  scale
}) {
  switch (fill) {
    case "none": {
      return null;
    }
    case "solid": {
      return /* @__PURE__ */ jsx("path", { fill: getColorValue(theme, color, "semi"), d });
    }
    case "semi": {
      return /* @__PURE__ */ jsx("path", { fill: theme.solid, d });
    }
    case "fill": {
      return /* @__PURE__ */ jsx("path", { fill: getColorValue(theme, color, "fill"), d });
    }
    case "pattern": {
      return /* @__PURE__ */ jsx(PatternFill, { theme, color, fill, d, scale });
    }
    case "lined-fill": {
      return /* @__PURE__ */ jsx("path", { fill: getColorValue(theme, color, "linedFill"), d });
    }
  }
});
function PatternFill({ d, color, theme }) {
  const editor = useEditor();
  const svgExport = useSvgExportContext();
  const zoomLevel = useValue("zoomLevel", () => editor.getEfficientZoomLevel(), [editor]);
  const getHashPatternZoomName = useGetHashPatternZoomName();
  const teenyTiny = zoomLevel <= 0.18;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { fill: getColorValue(theme, color, "pattern"), d }),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: svgExport ? `url(#${getHashPatternZoomName(1, theme.id)})` : teenyTiny ? getColorValue(theme, color, "semi") : `url(#${getHashPatternZoomName(zoomLevel, theme.id)})`,
        d
      }
    )
  ] });
}
export {
  PatternFill,
  ShapeFill
};
//# sourceMappingURL=ShapeFill.mjs.map
