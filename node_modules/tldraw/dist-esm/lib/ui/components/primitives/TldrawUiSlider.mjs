import { jsx, jsxs } from "react/jsx-runtime";
import { tltime } from "@tldraw/editor";
import { Slider as _Slider } from "radix-ui";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "../../hooks/useTranslation/useTranslation.mjs";
import { hideAllTooltips, TldrawUiTooltip } from "./TldrawUiTooltip.mjs";
const TldrawUiSlider = React.forwardRef(function Slider({
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
  const msg = useTranslation();
  const [titleAndLabel, setTitleAndLabel] = useState("");
  const [tabIndex, setTabIndex] = useState(-1);
  useEffect(() => {
    setTabIndex(0);
  }, []);
  const handleValueChange = useCallback(
    (value2) => {
      onValueChange(value2[0]);
    },
    [onValueChange]
  );
  const handlePointerDown = useCallback(() => {
    hideAllTooltips();
    onHistoryMark?.("click slider");
  }, [onHistoryMark]);
  useEffect(() => {
    const timeout = tltime.setTimeout(
      "set title and label",
      () => {
        setTitleAndLabel(title + " \u2014 " + msg(label));
      },
      0
    );
    return () => clearTimeout(timeout);
  }, [label, msg, title]);
  const handleKeyEvent = useCallback((event) => {
    if (event.key === "Tab") {
      event.stopPropagation();
    }
  }, []);
  return /* @__PURE__ */ jsx("div", { className: "tlui-slider__container", children: /* @__PURE__ */ jsx(TldrawUiTooltip, { content: titleAndLabel, children: /* @__PURE__ */ jsxs(
    _Slider.Root,
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
        /* @__PURE__ */ jsx(_Slider.Track, { className: "tlui-slider__track", dir: "ltr", children: value !== null && /* @__PURE__ */ jsx(_Slider.Range, { className: "tlui-slider__range", dir: "ltr" }) }),
        value !== null && /* @__PURE__ */ jsx(
          _Slider.Thumb,
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
export {
  TldrawUiSlider
};
//# sourceMappingURL=TldrawUiSlider.mjs.map
