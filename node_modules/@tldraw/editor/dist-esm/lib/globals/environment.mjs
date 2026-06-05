import { atom } from "@tldraw/state";
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
const tlenvReactive = atom("tlenvReactive", {
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
export {
  tlenv,
  tlenvReactive
};
//# sourceMappingURL=environment.mjs.map
