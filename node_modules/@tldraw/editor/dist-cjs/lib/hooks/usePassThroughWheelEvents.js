"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var usePassThroughWheelEvents_exports = {};
__export(usePassThroughWheelEvents_exports, {
  usePassThroughWheelEvents: () => usePassThroughWheelEvents
});
module.exports = __toCommonJS(usePassThroughWheelEvents_exports);
var import_react = require("react");
var import_dom = require("../utils/dom");
var import_useContainer = require("./useContainer");
var import_useEditor = require("./useEditor");
function usePassThroughWheelEvents(ref) {
  if (!ref) throw Error("usePassThroughWheelEvents must be passed a ref");
  const container = (0, import_useContainer.useContainer)();
  const editor = (0, import_useEditor.useMaybeEditor)();
  (0, import_react.useEffect)(() => {
    function onWheel(e) {
      if (!editor?.getInstanceState().isFocused) return;
      if (e.isSpecialRedispatchedEvent) return;
      const elm2 = ref.current;
      if (elm2 && elm2.scrollHeight > elm2.clientHeight) {
        return;
      }
      (0, import_dom.preventDefault)(e);
      const cvs = container.querySelector(".tl-canvas");
      if (!cvs) return;
      const newEvent = new WheelEvent("wheel", e);
      newEvent.isSpecialRedispatchedEvent = true;
      cvs.dispatchEvent(newEvent);
    }
    const elm = ref.current;
    if (!elm) return;
    elm.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      elm.removeEventListener("wheel", onWheel);
    };
  }, [container, editor, ref]);
}
//# sourceMappingURL=usePassThroughWheelEvents.js.map
