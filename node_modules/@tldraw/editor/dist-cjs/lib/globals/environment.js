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
var environment_exports = {};
__export(environment_exports, {
  tlenv: () => tlenv,
  tlenvReactive: () => tlenvReactive
});
module.exports = __toCommonJS(environment_exports);
var import_state = require("@tldraw/state");
const tlenv = {
  isSafari: false,
  isIos: false,
  isChromeForIos: false,
  isFirefox: false,
  isAndroid: false,
  isWebview: false,
  isDarwin: false,
  hasCanvasSupport: false
};
let isForcedFinePointer = false;
if (typeof window !== "undefined") {
  if ("navigator" in window) {
    tlenv.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    tlenv.isIos = !!navigator.userAgent.match(/iPad/i) || !!navigator.userAgent.match(/iPhone/i);
    tlenv.isChromeForIos = /crios.*safari/i.test(navigator.userAgent);
    tlenv.isFirefox = /firefox/i.test(navigator.userAgent);
    tlenv.isAndroid = /android/i.test(navigator.userAgent);
    tlenv.isDarwin = window.navigator.userAgent.toLowerCase().indexOf("mac") > -1;
  }
  tlenv.hasCanvasSupport = "Promise" in window && "HTMLCanvasElement" in window;
  isForcedFinePointer = tlenv.isFirefox && !tlenv.isAndroid && !tlenv.isIos;
}
const tlenvReactive = (0, import_state.atom)("tlenvReactive", {
  // Whether the user's device has a coarse pointer. This is dynamic on many systems, especially
  // on touch-screen laptops, which will become "coarse" if the user touches the screen.
  // See https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/pointer#coarse
  isCoarsePointer: false
});
if (typeof window !== "undefined" && !isForcedFinePointer) {
  const mql = window.matchMedia && window.matchMedia("(any-pointer: coarse)");
  const isCurrentCoarsePointer = () => tlenvReactive.__unsafe__getWithoutCapture().isCoarsePointer;
  if (mql) {
    const updateIsCoarsePointer = () => {
      const isCoarsePointer = mql.matches;
      if (isCoarsePointer !== isCurrentCoarsePointer()) {
        tlenvReactive.update((prev) => ({ ...prev, isCoarsePointer }));
      }
    };
    updateIsCoarsePointer();
    mql.addEventListener("change", updateIsCoarsePointer);
  }
  window.addEventListener(
    "pointerdown",
    (e) => {
      const isCoarseEvent = e.pointerType !== "mouse";
      if (isCoarseEvent !== isCurrentCoarsePointer()) {
        tlenvReactive.update((prev) => ({ ...prev, isCoarsePointer: isCoarseEvent }));
      }
    },
    { capture: true }
  );
}
//# sourceMappingURL=environment.js.map
