import { jsx } from "react/jsx-runtime";
import classNames from "classnames";
import { forwardRef } from "react";
const DefaultShapeWrapper = forwardRef(function DefaultShapeWrapper2({ children, shape, isBackground, ...props }, ref) {
  const isFilledShape = "fill" in shape.props && shape.props.fill !== "none";
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      "data-shape-type": shape.type,
      "data-shape-is-filled": isBackground ? void 0 : isFilledShape,
      "data-shape-id": shape.id,
      draggable: false,
      ...props,
      className: classNames("tl-shape", isBackground && "tl-shape-background", props.className),
      children
    }
  );
});
export {
  DefaultShapeWrapper
};
//# sourceMappingURL=DefaultShapeWrapper.mjs.map
