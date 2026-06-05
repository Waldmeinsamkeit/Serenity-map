import { jsx } from "react/jsx-runtime";
import { useValue } from "@tldraw/state-react";
import { useCallback, useRef, useState } from "react";
import { useCanvasEvents } from "../hooks/useCanvasEvents.mjs";
import { useEditor } from "../hooks/useEditor.mjs";
import { Vec } from "../primitives/Vec.mjs";
import { getPointerInfo } from "../utils/getPointerInfo.mjs";
function MenuClickCapture() {
  const editor = useEditor();
  const isMenuOpen = useValue("is menu open", () => editor.menus.hasAnyOpenMenus(), [editor]);
  const [isPointing, setIsPointing] = useState(false);
  const showElement = isMenuOpen || isPointing;
  const canvasEvents = useCanvasEvents();
  const rPointerState = useRef({
    isDown: false,
    isDragging: false,
    start: new Vec()
  });
  const handlePointerDown = useCallback(
    (e) => {
      if (e.button === 0) {
        setIsPointing(true);
        rPointerState.current = {
          isDown: true,
          isDragging: false,
          start: new Vec(e.clientX, e.clientY)
        };
        rDidAPointerDownAndDragWhileMenuWasOpen.current = false;
      }
      editor.menus.clearOpenMenus();
    },
    [editor]
  );
  const rDidAPointerDownAndDragWhileMenuWasOpen = useRef(false);
  const handlePointerMove = useCallback(
    (e) => {
      if (!rPointerState.current.isDown) return;
      const { x, y } = rPointerState.current.start;
      if (!rDidAPointerDownAndDragWhileMenuWasOpen.current) {
        if (
          // We're pointing, but are we dragging?
          Vec.Dist2(rPointerState.current.start, new Vec(e.clientX, e.clientY)) > editor.options.dragDistanceSquared
        ) {
          rDidAPointerDownAndDragWhileMenuWasOpen.current = true;
          rPointerState.current = {
            ...rPointerState.current,
            isDown: true,
            isDragging: true
          };
          canvasEvents.onPointerDown?.({
            ...e,
            clientX: x,
            clientY: y,
            button: 0
          });
        }
      }
      if (rDidAPointerDownAndDragWhileMenuWasOpen.current) {
        editor.dispatch({
          type: "pointer",
          target: "canvas",
          name: "pointer_move",
          ...getPointerInfo(editor, e)
        });
      }
    },
    [canvasEvents, editor]
  );
  const handlePointerUp = useCallback(
    (e) => {
      canvasEvents.onPointerUp?.(e);
      setIsPointing(false);
      rPointerState.current = {
        isDown: false,
        isDragging: false,
        start: new Vec(e.clientX, e.clientY)
      };
      rDidAPointerDownAndDragWhileMenuWasOpen.current = false;
    },
    [canvasEvents]
  );
  return showElement && /* @__PURE__ */ jsx(
    "div",
    {
      className: "tlui-menu-click-capture",
      "data-testid": "menu-click-capture.content",
      ...canvasEvents,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp
    }
  );
}
export {
  MenuClickCapture
};
//# sourceMappingURL=MenuClickCapture.mjs.map
