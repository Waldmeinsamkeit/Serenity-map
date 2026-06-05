import { StateNode } from "@tldraw/editor";
import { CursorTypeMap } from "../../PointingResizeHandle.mjs";
class PointingCropHandle extends StateNode {
  static id = "pointing_crop_handle";
  info = {};
  onEnter(info) {
    this.info = info;
    if (typeof info.onInteractionEnd === "string") {
      this.parent.setCurrentToolIdMask(info.onInteractionEnd);
    }
    const selectedShape = this.editor.getSelectedShapes()[0];
    if (!selectedShape) return;
    const cursorType = CursorTypeMap[this.info.handle];
    this.editor.setCursor({ type: cursorType, rotation: this.editor.getSelectionRotation() });
    this.editor.setCroppingShape(selectedShape.id);
  }
  onExit() {
    this.editor.setCursor({ type: "default", rotation: 0 });
    this.parent.setCurrentToolIdMask(void 0);
  }
  onPointerMove() {
    if (this.editor.inputs.getIsDragging()) {
      this.startCropping();
    }
  }
  onLongPress() {
    this.startCropping();
  }
  startCropping() {
    if (this.editor.getIsReadonly()) return;
    this.parent.transition("cropping", {
      ...this.info,
      onInteractionEnd: this.info.onInteractionEnd
    });
  }
  onPointerUp() {
    const { onInteractionEnd } = this.info;
    if (onInteractionEnd) {
      if (typeof onInteractionEnd === "string") {
        this.editor.setCurrentTool(onInteractionEnd, this.info);
      } else {
        onInteractionEnd();
      }
      return;
    }
    this.editor.setCroppingShape(null);
    this.editor.setCurrentTool("select.idle");
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
  cancel() {
    const { onInteractionEnd } = this.info;
    if (onInteractionEnd) {
      if (typeof onInteractionEnd === "string") {
        this.editor.setCurrentTool(onInteractionEnd, this.info);
      } else {
        onInteractionEnd();
      }
      return;
    }
    this.editor.setCroppingShape(null);
    this.editor.setCurrentTool("select.idle");
  }
}
export {
  PointingCropHandle
};
//# sourceMappingURL=PointingCropHandle.mjs.map
