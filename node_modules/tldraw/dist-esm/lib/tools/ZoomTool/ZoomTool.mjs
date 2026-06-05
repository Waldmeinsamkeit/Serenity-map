import {
  StateNode
} from "@tldraw/editor";
import { Idle } from "./childStates/Idle.mjs";
import { Pointing } from "./childStates/Pointing.mjs";
import { ZoomBrushing } from "./childStates/ZoomBrushing.mjs";
import { ZoomQuick } from "./childStates/ZoomQuick.mjs";
class ZoomTool extends StateNode {
  static id = "zoom";
  static initial = "idle";
  static children() {
    return [Idle, Pointing, ZoomBrushing, ZoomQuick];
  }
  static isLockable = false;
  info = {};
  onEnter(info) {
    this.info = info;
    const toolId = info.onInteractionEnd?.split(".")[0];
    this.parent.setCurrentToolIdMask(toolId);
    this.updateCursor();
  }
  onExit() {
    this.parent.setCurrentToolIdMask(void 0);
    this.editor.updateInstanceState({ zoomBrush: null, cursor: { type: "default", rotation: 0 } });
  }
  onKeyDown() {
    this.updateCursor();
  }
  onKeyUp(info) {
    this.updateCursor();
    if (info.key.toLowerCase() === "z") {
      this.complete();
    }
  }
  onInterrupt() {
    this.complete();
  }
  complete() {
    const toolId = this.info.onInteractionEnd?.split(".")[0] ?? "select";
    this.editor.setCurrentTool(toolId);
  }
  updateCursor() {
    if (this.editor.inputs.getAltKey() && !this.editor.isIn("zoom.zoom_quick")) {
      this.editor.setCursor({ type: "zoom-out", rotation: 0 });
    } else {
      this.editor.setCursor({ type: "zoom-in", rotation: 0 });
    }
  }
}
export {
  ZoomTool
};
//# sourceMappingURL=ZoomTool.mjs.map
