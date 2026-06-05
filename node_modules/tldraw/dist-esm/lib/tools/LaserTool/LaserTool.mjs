import { StateNode } from "@tldraw/editor";
import { Idle } from "./childStates/Idle.mjs";
import { Lasering } from "./childStates/Lasering.mjs";
class LaserTool extends StateNode {
  static id = "laser";
  static initial = "idle";
  static children() {
    return [Idle, Lasering];
  }
  static isLockable = false;
  sessionId = null;
  onEnter() {
    this.editor.setCursor({ type: "cross", rotation: 0 });
  }
  onExit() {
    this.sessionId = null;
  }
  onCancel() {
    if (this.sessionId && this.editor.scribbles.isSessionActive(this.sessionId)) {
      this.editor.scribbles.clearSession(this.sessionId);
      this.sessionId = null;
      this.transition("idle");
    } else {
      this.editor.setCurrentTool("select");
    }
  }
  /**
   * Get the current laser session ID, or create a new one if none exists or the current one is fading.
   */
  getSessionId() {
    if (this.sessionId && this.editor.scribbles.isSessionActive(this.sessionId)) {
      return this.sessionId;
    }
    this.sessionId = this.editor.scribbles.startSession({
      selfConsume: false,
      idleTimeoutMs: this.editor.options.laserDelayMs,
      fadeMode: "grouped",
      fadeEasing: "ease-in"
    });
    return this.sessionId;
  }
}
export {
  LaserTool
};
//# sourceMappingURL=LaserTool.mjs.map
