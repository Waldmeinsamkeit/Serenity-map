import { Box, StateNode } from "@tldraw/editor";
class ZoomBrushing extends StateNode {
  static id = "zoom_brushing";
  info = {};
  zoomBrush = new Box();
  onEnter(info) {
    this.info = info;
    this.update();
  }
  onExit() {
    this.editor.updateInstanceState({ zoomBrush: null });
  }
  onPointerMove() {
    this.update();
  }
  onPointerUp() {
    this.complete();
  }
  onCancel() {
    this.cancel();
  }
  update() {
    const originPagePoint = this.editor.inputs.getOriginPagePoint();
    const currentPagePoint = this.editor.inputs.getCurrentPagePoint();
    this.zoomBrush.setTo(Box.FromPoints([originPagePoint, currentPagePoint]));
    this.editor.updateInstanceState({ zoomBrush: this.zoomBrush.toJson() });
  }
  cancel() {
    this.parent.transition("idle", this.info);
  }
  complete() {
    const { zoomBrush } = this;
    const threshold = 8 / this.editor.getZoomLevel();
    if (zoomBrush.width < threshold && zoomBrush.height < threshold) {
      const point = this.editor.inputs.getCurrentScreenPoint();
      if (this.editor.inputs.getAltKey()) {
        this.editor.zoomOut(point, { animation: { duration: 220 } });
      } else {
        this.editor.zoomIn(point, { animation: { duration: 220 } });
      }
    } else {
      const targetZoom = this.editor.inputs.getAltKey() ? this.editor.getZoomLevel() / 2 : void 0;
      this.editor.zoomToBounds(zoomBrush, { targetZoom, animation: { duration: 220 } });
    }
    this.parent.transition("idle", this.info);
  }
}
export {
  ZoomBrushing
};
//# sourceMappingURL=ZoomBrushing.mjs.map
