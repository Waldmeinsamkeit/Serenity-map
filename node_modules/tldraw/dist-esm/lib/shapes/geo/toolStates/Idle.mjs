import { StateNode } from "@tldraw/editor";
import { startEditingShapeWithRichText } from "../../../tools/SelectTool/selectHelpers.mjs";
class Idle extends StateNode {
  static id = "idle";
  onPointerDown(info) {
    this.parent.transition("pointing", info);
  }
  onEnter() {
    this.editor.setCursor({ type: "cross", rotation: 0 });
  }
  onKeyUp(info) {
    const { editor } = this;
    if (info.key === "Enter") {
      const onlySelectedShape = editor.getOnlySelectedShape();
      if (editor.canEditShape(onlySelectedShape)) {
        startEditingShapeWithRichText(editor, onlySelectedShape, { selectAll: true });
      }
    }
  }
  onCancel() {
    this.editor.setCurrentTool("select");
  }
}
export {
  Idle
};
//# sourceMappingURL=Idle.mjs.map
