import { jsx } from "react/jsx-runtime";
import classNames from "classnames";
import { Slot } from "radix-ui";
import { createContext, forwardRef, useContext } from "react";
const TldrawUiOrientationContext = createContext({
  orientation: "horizontal",
  tooltipSide: "bottom"
});
function TldrawUiOrientationProvider({
  children,
  orientation,
  tooltipSide
}) {
  const prevContext = useTldrawUiOrientation();
  const tooltipSideToUse = tooltipSide ?? (orientation === prevContext.orientation ? prevContext.tooltipSide : orientation === "horizontal" ? "bottom" : "right");
  return /* @__PURE__ */ jsx(TldrawUiOrientationContext.Provider, { value: { orientation, tooltipSide: tooltipSideToUse }, children });
}
function useTldrawUiOrientation() {
  return useContext(TldrawUiOrientationContext);
}
const TldrawUiRow = forwardRef(
  ({ asChild, className, tooltipSide, ...props }, ref) => {
    const Component = asChild ? Slot.Root : "div";
    return /* @__PURE__ */ jsx(TldrawUiOrientationProvider, { orientation: "horizontal", tooltipSide, children: /* @__PURE__ */ jsx(Component, { ref, className: classNames("tlui-row", className), ...props }) });
  }
);
const TldrawUiColumn = forwardRef(
  ({ asChild, className, tooltipSide, ...props }, ref) => {
    const Component = asChild ? Slot.Root : "div";
    return /* @__PURE__ */ jsx(TldrawUiOrientationProvider, { orientation: "vertical", tooltipSide, children: /* @__PURE__ */ jsx(Component, { ref, className: classNames("tlui-column", className), ...props }) });
  }
);
const TldrawUiGrid = forwardRef(
  ({ asChild, className, tooltipSide, ...props }, ref) => {
    const Component = asChild ? Slot.Root : "div";
    return /* @__PURE__ */ jsx(TldrawUiOrientationProvider, { orientation: "horizontal", tooltipSide, children: /* @__PURE__ */ jsx(Component, { ref, className: classNames("tlui-grid", className), ...props }) });
  }
);
export {
  TldrawUiColumn,
  TldrawUiGrid,
  TldrawUiOrientationProvider,
  TldrawUiRow,
  useTldrawUiOrientation
};
//# sourceMappingURL=layout.mjs.map
