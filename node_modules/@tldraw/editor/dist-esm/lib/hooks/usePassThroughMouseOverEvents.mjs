import { useEffect } from "react";
import { preventDefault } from "../utils/dom.mjs";
import { useContainer } from "./useContainer.mjs";
import { useMaybeEditor } from "./useEditor.mjs";
function usePassThroughMouseOverEvents(ref) {
  if (!ref) throw Error("usePassThroughWheelEvents must be passed a ref");
  const container = useContainer();
  const editor = useMaybeEditor();
  useEffect(() => {
    function onMouseOver(e) {
      if (!editor?.getInstanceState().isFocused) return;
      if (e.isSpecialRedispatchedEvent) return;
      preventDefault(e);
      const cvs = container.querySelector(".tl-canvas");
      if (!cvs) return;
      const newEvent = new PointerEvent(e.type, e);
      newEvent.isSpecialRedispatchedEvent = true;
      cvs.dispatchEvent(newEvent);
    }
    const elm = ref.current;
    if (!elm) return;
    elm.addEventListener("mouseover", onMouseOver, { passive: false });
    return () => {
      elm.removeEventListener("mouseover", onMouseOver);
    };
  }, [container, editor, ref]);
}
export {
  usePassThroughMouseOverEvents
};
//# sourceMappingURL=usePassThroughMouseOverEvents.mjs.map
