import { jsx, jsxs } from "react/jsx-runtime";
import { debugFlags, track, useEditor, usePassThroughWheelEvents, useValue } from "@tldraw/editor";
import { memo, useEffect, useRef } from "react";
import { useTldrawUiComponents } from "../context/components.mjs";
const DefaultDebugPanel = memo(function DefaultDebugPanel2() {
  const { DebugMenu } = useTldrawUiComponents();
  const ref = useRef(null);
  usePassThroughWheelEvents(ref);
  return /* @__PURE__ */ jsxs("footer", { ref, className: "tlui-debug-panel", children: [
    /* @__PURE__ */ jsx(CurrentState, {}),
    /* @__PURE__ */ jsx(FPS, {}),
    DebugMenu && /* @__PURE__ */ jsx(DebugMenu, {})
  ] });
});
const CurrentState = track(function CurrentState2() {
  const editor = useEditor();
  const path = editor.getPath();
  return /* @__PURE__ */ jsx("div", { className: "tlui-debug-panel__current-state", children: `${path}` });
});
function FPS() {
  const editor = useEditor();
  const showFps = useValue("show_fps", () => debugFlags.showFps.get(), [debugFlags]);
  const fpsRef = useRef(null);
  useEffect(() => {
    if (!showFps) return;
    const TICK_LENGTH = 250;
    let maxKnownFps = 0;
    let raf = -1;
    let start = performance.now();
    let currentTickLength = 0;
    let framesInCurrentTick = 0;
    let isSlow = false;
    function loop() {
      framesInCurrentTick++;
      currentTickLength = performance.now() - start;
      if (currentTickLength > TICK_LENGTH) {
        const fps = Math.round(
          framesInCurrentTick * (TICK_LENGTH / currentTickLength) * (1e3 / TICK_LENGTH)
        );
        if (fps > maxKnownFps) {
          maxKnownFps = fps;
        }
        const slowFps = maxKnownFps * 0.75;
        if (fps < slowFps && !isSlow || fps >= slowFps && isSlow) {
          isSlow = !isSlow;
        }
        fpsRef.current.innerHTML = `FPS ${fps.toString()} (max: ${maxKnownFps})`;
        fpsRef.current.className = `tlui-debug-panel__fps` + (isSlow ? ` tlui-debug-panel__fps__slow` : ``);
        currentTickLength -= TICK_LENGTH;
        framesInCurrentTick = 0;
        start = performance.now();
      }
      raf = editor.timers.requestAnimationFrame(loop);
    }
    loop();
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [showFps, editor]);
  if (!showFps) return null;
  return /* @__PURE__ */ jsx("div", { ref: fpsRef });
}
export {
  DefaultDebugPanel
};
//# sourceMappingURL=DefaultDebugPanel.mjs.map
