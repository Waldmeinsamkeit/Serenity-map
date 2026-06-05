import { StateNode } from "@tldraw/editor";
class Idle extends StateNode {
  static id = "idle";
  onPointerDown() {
    const sessionId = this.parent.getSessionId();
    const scribble = this.editor.scribbles.addScribbleToSession(sessionId, {
      color: "laser",
      opacity: 0.7,
      size: 4,
      taper: false
    });
    this.parent.transition("lasering", { sessionId, scribbleId: scribble.id });
  }
}
export {
  Idle
};
//# sourceMappingURL=Idle.mjs.map
