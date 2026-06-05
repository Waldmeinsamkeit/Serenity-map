import { jsx, jsxs } from "react/jsx-runtime";
import { useContainer } from "@tldraw/editor";
import classNames from "classnames";
import { Select as _Select } from "radix-ui";
import * as React from "react";
import { useMenuIsOpen } from "../../hooks/useMenuIsOpen.mjs";
import { TldrawUiIcon } from "./TldrawUiIcon.mjs";
function TldrawUiSelect({
  id,
  value,
  onValueChange,
  onOpenChange,
  disabled,
  className,
  children,
  "data-testid": dataTestId,
  "aria-label": ariaLabel
}) {
  const [open, handleOpenChange] = useMenuIsOpen(id, onOpenChange);
  return /* @__PURE__ */ jsx(
    _Select.Root,
    {
      value,
      onValueChange,
      onOpenChange: handleOpenChange,
      open,
      disabled,
      dir: "ltr",
      children: /* @__PURE__ */ jsx(
        "div",
        {
          id,
          className: classNames("tlui-select", className),
          "data-testid": dataTestId,
          "aria-label": ariaLabel,
          children
        }
      )
    }
  );
}
const TldrawUiSelectTrigger = React.forwardRef(
  function TldrawUiSelectTrigger2({ children, className }, ref) {
    return /* @__PURE__ */ jsxs(
      _Select.Trigger,
      {
        ref,
        className: classNames("tlui-button tlui-select__trigger", className),
        children: [
          children,
          /* @__PURE__ */ jsx(_Select.Icon, { className: "tlui-select__chevron", children: /* @__PURE__ */ jsx(TldrawUiIcon, { icon: "chevron-down", label: "", small: true }) })
        ]
      }
    );
  }
);
function TldrawUiSelectValue({ placeholder, icon, children }) {
  return /* @__PURE__ */ jsx(_Select.Value, { placeholder, children: /* @__PURE__ */ jsxs("span", { className: "tlui-select__value", children: [
    icon && /* @__PURE__ */ jsx(TldrawUiIcon, { icon, label: "", small: true }),
    /* @__PURE__ */ jsx("span", { className: "tlui-button__label", children })
  ] }) });
}
function TldrawUiSelectContent({
  children,
  side = "bottom",
  align = "start",
  className
}) {
  const container = useContainer();
  return /* @__PURE__ */ jsx(_Select.Portal, { container, children: /* @__PURE__ */ jsx(
    _Select.Content,
    {
      className: classNames("tlui-menu tlui-select__content", className),
      position: "popper",
      side,
      align,
      sideOffset: 4,
      collisionPadding: 4,
      children: /* @__PURE__ */ jsx(_Select.Viewport, { className: "tlui-select__viewport", children })
    }
  ) });
}
function TldrawUiSelectItem({
  value,
  label,
  icon,
  disabled,
  className
}) {
  return /* @__PURE__ */ jsxs(
    _Select.Item,
    {
      value,
      disabled,
      className: classNames(
        "tlui-button tlui-button__menu tlui-button__checkbox tlui-select__item",
        className
      ),
      children: [
        /* @__PURE__ */ jsx(TldrawUiIcon, { small: true, icon: "check", label: "", className: "tlui-select__item-indicator" }),
        icon && /* @__PURE__ */ jsx(TldrawUiIcon, { icon, label: "", small: true }),
        /* @__PURE__ */ jsx(_Select.ItemText, { className: "tlui-button__label", children: label })
      ]
    }
  );
}
export {
  TldrawUiSelect,
  TldrawUiSelectContent,
  TldrawUiSelectItem,
  TldrawUiSelectTrigger,
  TldrawUiSelectValue
};
//# sourceMappingURL=TldrawUiSelect.mjs.map
