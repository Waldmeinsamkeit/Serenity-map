import { StateNode } from "@tldraw/editor";
import { startEditingShapeWithRichText } from "../../../tools/SelectTool/selectHelpers.mjs";
import { clearArrowTargetState, updateArrowTargetState } from "../arrowTargetState.mjs";
class Idle extends StateNode {
  static id = "idle";
  isPrecise = false;
  isPreciseTimerId = null;
  preciseTargetId = null;
  onPointerMove() {
    this.update();
  }
  onPointerDown(info) {
    this.parent.transition("pointing", { ...info, isPrecise: this.isPrecise });
  }
  onEnter() {
    this.editor.setCursor({ type: "cross", rotation: 0 });
    this.update();
  }
  onCancel() {
    this.editor.setCurrentTool("select");
  }
  onExit() {
    clearArrowTargetState(this.editor);
    if (this.isPreciseTimerId !== null) {
      clearTimeout(this.isPreciseTimerId);
    }
  }
  onKeyDown() {
    this.update();
  }
  onKeyUp(info) {
    this.update();
    if (info.key === "Enter") {
      const onlySelectedShape = this.editor.getOnlySelectedShape();
      if (this.editor.canEditShape(onlySelectedShape)) {
        startEditingShapeWithRichText(this.editor, onlySelectedShape, { selectAll: true });
      }
    }
  }
  update() {
    const arrowUtil = this.editor.getShapeUtil("arrow");
    const targetState = updateArrowTargetState({
      editor: this.editor,
      pointInPageSpace: this.editor.inputs.getCurrentPagePoint(),
      arrow: void 0,
      isPrecise: this.isPrecise,
      currentBinding: void 0,
      oppositeBinding: void 0
    });
    if (targetState && targetState.target.id !== this.preciseTargetId) {
      if (this.isPreciseTimerId !== null) {
        clearTimeout(this.isPreciseTimerId);
      }
      this.preciseTargetId = targetState.target.id;
      this.isPreciseTimerId = this.editor.timers.setTimeout(() => {
        this.isPrecise = true;
        this.update();
      }, arrowUtil.options.hoverPreciseTimeout);
    } else if (!targetState && this.preciseTargetId) {
      this.isPrecise = false;
      this.preciseTargetId = null;
      if (this.isPreciseTimerId !== null) {
        clearTimeout(this.isPreciseTimerId);
      }
    }
  }
}
export {
  Idle
};
//# sourceMappingURL=Idle.mjs.map
