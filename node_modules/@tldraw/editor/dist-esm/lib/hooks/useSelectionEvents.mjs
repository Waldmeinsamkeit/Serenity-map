import { useMemo } from "react";
import { RIGHT_MOUSE_BUTTON } from "../constants.mjs";
import { loopToHtmlElement, releasePointerCapture, setPointerCapture } from "../utils/dom.mjs";
import { getPointerInfo } from "../utils/getPointerInfo.mjs";
import { useEditor } from "./useEditor.mjs";
function useSelectionEvents(handle) {
  const editor = useEditor();
  const events = useMemo(
    function selectionEvents() {
      const onPointerDown = (e) => {
        if (editor.wasEventAlreadyHandled(e)) return;
        if (e.button === RIGHT_MOUSE_BUTTON) {
          editor.dispatch({
            type: "pointer",
            target: "selection",
            handle,
            name: "right_click",
            ...getPointerInfo(editor, e)
          });
          return;
        }
        if (e.button !== 0) return;
        const elm = loopToHtmlElement(e.currentTarget);
        function releaseCapture() {
          elm.removeEventListener("pointerup", releaseCapture);
          releasePointerCapture(elm, e);
        }
        setPointerCapture(elm, e);
        elm.addEventListener("pointerup", releaseCapture);
        editor.dispatch({
          name: "pointer_down",
          type: "pointer",
          target: "selection",
          handle,
          ...getPointerInfo(editor, e)
        });
        editor.markEventAsHandled(e);
      };
      let lastX, lastY;
      function onPointerMove(e) {
        if (editor.wasEventAlreadyHandled(e)) return;
        if (e.button !== 0) return;
        if (e.clientX === lastX && e.clientY === lastY) return;
        lastX = e.clientX;
        lastY = e.clientY;
        editor.dispatch({
          name: "pointer_move",
          type: "pointer",
          target: "selection",
          handle,
          ...getPointerInfo(editor, e)
        });
      }
      const onPointerUp = (e) => {
        if (editor.wasEventAlreadyHandled(e)) return;
        if (e.button !== 0) return;
        editor.dispatch({
          name: "pointer_up",
          type: "pointer",
          target: "selection",
          handle,
          ...getPointerInfo(editor, e)
        });
      };
      return {
        onPointerDown,
        onPointerMove,
        onPointerUp
      };
    },
    [editor, handle]
  );
  return events;
}
export {
  useSelectionEvents
};
//# sourceMappingURL=useSelectionEvents.mjs.map
