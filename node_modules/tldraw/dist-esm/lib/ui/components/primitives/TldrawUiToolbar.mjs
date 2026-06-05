import { jsx } from "react/jsx-runtime";
import classnames from "classnames";
import { Toolbar as _Toolbar } from "radix-ui";
import React from "react";
import { TldrawUiColumn, TldrawUiGrid, TldrawUiRow } from "./layout.mjs";
import { TldrawUiTooltip } from "./TldrawUiTooltip.mjs";
const LayoutByOrientation = {
  horizontal: TldrawUiRow,
  vertical: TldrawUiColumn,
  grid: TldrawUiGrid
};
const TldrawUiToolbar = React.forwardRef(
  ({
    children,
    className,
    label,
    orientation = "horizontal",
    tooltipSide,
    ...props
  }, ref) => {
    const Layout = LayoutByOrientation[orientation];
    return /* @__PURE__ */ jsx(Layout, { asChild: true, tooltipSide, children: /* @__PURE__ */ jsx(
      _Toolbar.Root,
      {
        ref,
        ...props,
        className: classnames("tlui-toolbar", className),
        "aria-label": label,
        orientation: orientation === "grid" ? "horizontal" : orientation,
        children
      }
    ) });
  }
);
const TldrawUiToolbarButton = React.forwardRef(
  ({ asChild, children, type, isActive, tooltip, ...props }, ref) => {
    const button = /* @__PURE__ */ jsx(
      _Toolbar.Button,
      {
        ref,
        asChild,
        draggable: false,
        "data-isactive": isActive,
        ...props,
        "aria-label": props.title,
        title: void 0,
        className: classnames("tlui-button", `tlui-button__${type}`, props.className),
        children
      }
    );
    const tooltipContent = tooltip || props.title;
    return /* @__PURE__ */ jsx(TldrawUiTooltip, { content: tooltipContent, children: button });
  }
);
const TldrawUiToolbarToggleGroup = ({
  children,
  className,
  type,
  asChild,
  ...props
}) => {
  return /* @__PURE__ */ jsx(
    _Toolbar.ToggleGroup,
    {
      asChild,
      type,
      ...props,
      role: "radiogroup",
      className: classnames("tlui-toolbar-toggle-group", className),
      children
    }
  );
};
const TldrawUiToolbarToggleItem = ({
  children,
  className,
  type,
  value,
  tooltip,
  ...props
}) => {
  const toggleItem = /* @__PURE__ */ jsx(
    _Toolbar.ToggleItem,
    {
      ...props,
      title: void 0,
      className: classnames(
        "tlui-button",
        `tlui-button__${type}`,
        "tlui-toolbar-toggle-group-item",
        className
      ),
      value,
      children
    }
  );
  const tooltipContent = tooltip || props.title;
  return /* @__PURE__ */ jsx(TldrawUiTooltip, { content: tooltipContent, children: toggleItem });
};
export {
  TldrawUiToolbar,
  TldrawUiToolbarButton,
  TldrawUiToolbarToggleGroup,
  TldrawUiToolbarToggleItem
};
//# sourceMappingURL=TldrawUiToolbar.mjs.map
