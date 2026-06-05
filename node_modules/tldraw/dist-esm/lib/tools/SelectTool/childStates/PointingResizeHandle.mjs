import { StateNode } from "@tldraw/editor";
const CursorTypeMap = {
  bottom: "ns-resize",
  top: "ns-resize",
  left: "ew-resize",
  right: "ew-resize",
  bottom_left: "nesw-resize",
  bottom_right: "nwse-resize",
  top_left: "nwse-resize",
  top_right: "nesw-resize",
  bottom_left_rotate: "swne-rotate",
  bottom_right_rotate: "senw-rotate",
  top_left_rotate: "nwse-rotate",
  top_right_rotate: "nesw-rotate",
  mobile_rotate: "grabbing"
};
class PointingResizeHandle extends StateNode {
  static id = "pointing_resize_handle";
  info = {};
  updateCursor() {
    const selected = this.editor.getSelectedShapes();
    const cursorType = CursorTypeMap[this.info.handle];
    this.editor.setCursor({
      type: cursorType,
      rotation: selected.length === 1 ? this.editor.getSelectionRotation() : 0
    });
  }
  onEnter(info) {
    this.info = info;
    if (typeof info.onInteractionEnd === "string") {
      this.parent.setCurrentToolIdMask(info.onInteractionEnd);
    }
    this.updateCursor();
  }
  onExit() {
    this.parent.setCurrentToolIdMask(void 0);
  }
  onPointerMove() {
    if (this.editor.inputs.getIsDragging()) {
      this.startResizing();
    }
  }
  onLongPress() {
    this.startResizing();
  }
  startResizing() {
    if (this.editor.getIsReadonly()) return;
    this.parent.transition("resizing", this.info);
  }
  onPointerUp() {
    this.complete();
  }
  onCancel() {
    this.cancel();
  }
  onComplete() {
    this.cancel();
  }
  onInterrupt() {
    this.cancel();
  }
  complete() {
    const { onInteractionEnd } = this.info;
    if (onInteractionEnd) {
      if (typeof onInteractionEnd === "string") {
        this.editor.setCurrentTool(onInteractionEnd, {});
      } else {
        onInteractionEnd();
      }
      return;
    }
    this.parent.transition("idle");
  }
  cancel() {
    const { onInteractionEnd } = this.info;
    if (onInteractionEnd) {
      if (typeof onInteractionEnd === "string") {
        this.editor.setCurrentTool(onInteractionEnd, {});
      } else {
        onInteractionEnd();
      }
      return;
    }
    this.parent.transition("idle");
  }
}
export {
  CursorTypeMap,
  PointingResizeHandle
};
//# sourceMappingURL=PointingResizeHandle.mjs.map
