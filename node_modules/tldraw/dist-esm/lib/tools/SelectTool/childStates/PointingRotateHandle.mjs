import { StateNode } from "@tldraw/editor";
import { CursorTypeMap } from "./PointingResizeHandle.mjs";
class PointingRotateHandle extends StateNode {
  static id = "pointing_rotate_handle";
  info = {};
  updateCursor() {
    this.editor.setCursor({
      type: CursorTypeMap[this.info.handle],
      rotation: this.editor.getSelectionRotation()
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
    this.editor.setCursor({ type: "default", rotation: 0 });
  }
  onPointerMove() {
    if (this.editor.inputs.getIsDragging()) {
      this.startRotating();
    }
  }
  onLongPress() {
    this.startRotating();
  }
  startRotating() {
    if (this.editor.getIsReadonly()) return;
    this.parent.transition("rotating", this.info);
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
        onInteractionEnd?.();
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
  PointingRotateHandle
};
//# sourceMappingURL=PointingRotateHandle.mjs.map
