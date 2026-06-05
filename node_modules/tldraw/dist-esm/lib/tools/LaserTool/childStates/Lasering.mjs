import { StateNode } from "@tldraw/editor";
class Lasering extends StateNode {
  static id = "lasering";
  scribbleId = "";
  sessionId = "";
  onEnter(info) {
    this.sessionId = info.sessionId;
    this.scribbleId = info.scribbleId;
    this.pushPointToScribble();
  }
  onPointerMove() {
    this.pushPointToScribble();
  }
  pushPointToScribble() {
    const { x, y } = this.editor.inputs.getCurrentPagePoint();
    this.editor.scribbles.addPointToSession(this.sessionId, this.scribbleId, x, y);
  }
  onTick() {
    this.editor.scribbles.extendSession(this.sessionId);
  }
  onPointerUp() {
    this.complete();
  }
  onCancel() {
    this.onComplete();
  }
  onComplete() {
    this.complete();
  }
  complete() {
    this.editor.scribbles.complete(this.scribbleId);
    this.parent.transition("idle");
  }
}
export {
  Lasering
};
//# sourceMappingURL=Lasering.mjs.map
