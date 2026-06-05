import { useEffect } from "react";
import { preventDefault } from "../utils/dom.mjs";
import { useContainer } from "./useContainer.mjs";
import { useMaybeEditor } from "./useEditor.mjs";
function usePassThroughWheelEvents(ref) {
  if (!ref) throw Error("usePassThroughWheelEvents must be passed a ref");
  const container = useContainer();
  const editor = useMaybeEditor();
  useEffect(() => {
    function onWheel(e) {
      if (!editor?.getInstanceState().isFocused) return;
      if (e.isSpecialRedispatchedEvent) return;
      const elm2 = ref.current;
      if (elm2 && elm2.scrollHeight > elm2.clientHeight) {
        return;
      }
      preventDefault(e);
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
export {
  usePassThroughWheelEvents
};
//# sourceMappingURL=usePassThroughWheelEvents.mjs.map
