import { tlenv } from "../globals/environment.mjs";
const MAX_ZOOM_STEP = 10;
function normalizeWheel(event) {
  let { deltaY, deltaX } = event;
  let deltaZ = 0;
  if (event.ctrlKey || event.altKey || event.metaKey) {
    deltaZ = (Math.abs(deltaY) > MAX_ZOOM_STEP ? MAX_ZOOM_STEP * Math.sign(deltaY) : deltaY) / 100;
  } else {
    if (event.shiftKey && !tlenv.isDarwin && !tlenv.isIos) {
      deltaX = deltaY;
      deltaY = 0;
    }
  }
  return { x: -deltaX, y: -deltaY, z: -deltaZ };
}
export {
  normalizeWheel
};
//# sourceMappingURL=normalizeWheel.mjs.map
