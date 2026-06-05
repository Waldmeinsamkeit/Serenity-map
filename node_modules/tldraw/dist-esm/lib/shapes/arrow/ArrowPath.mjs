import { exhaustiveSwitchError } from "@tldraw/editor";
import { PathBuilder } from "../shared/PathBuilder.mjs";
import { getRouteHandlePath } from "./elbow/getElbowArrowInfo.mjs";
function getArrowBodyPathBuilder(info) {
  switch (info.type) {
    case "straight":
      return new PathBuilder().moveTo(info.start.point.x, info.start.point.y, { offset: 0, roundness: 0 }).lineTo(info.end.point.x, info.end.point.y, { offset: 0, roundness: 0 });
    case "arc":
      return new PathBuilder().moveTo(info.start.point.x, info.start.point.y, { offset: 0, roundness: 0 }).circularArcTo(
        info.bodyArc.radius,
        !!info.bodyArc.largeArcFlag,
        !!info.bodyArc.sweepFlag,
        info.end.point.x,
        info.end.point.y,
        { offset: 0, roundness: 0 }
      );
    case "elbow": {
      const path = new PathBuilder();
      path.moveTo(info.start.point.x, info.start.point.y, {
        offset: 0
      });
      for (let i = 1; i < info.route.points.length; i++) {
        const point = info.route.points[i];
        if (info.route.skipPointsWhenDrawing.has(point)) {
          continue;
        }
        path.lineTo(point.x, point.y, {
          offset: i === info.route.points.length - 1 ? 0 : void 0
        });
      }
      return path;
    }
    default:
      exhaustiveSwitchError(info, "type");
  }
}
function getArrowBodyPath(shape, info, opts) {
  return getArrowBodyPathBuilder(info).toSvg(opts);
}
function getArrowHandlePath(info, opts) {
  switch (info.type) {
    case "straight":
      return new PathBuilder().moveTo(info.start.handle.x, info.start.handle.y).lineTo(info.end.handle.x, info.end.handle.y).toSvg(opts);
    case "arc":
      return new PathBuilder().moveTo(info.start.handle.x, info.start.handle.y).circularArcTo(
        info.handleArc.radius,
        !!info.handleArc.largeArcFlag,
        !!info.handleArc.sweepFlag,
        info.end.handle.x,
        info.end.handle.y
      ).toSvg(opts);
    case "elbow": {
      const handleRoute = getRouteHandlePath(info.elbow, info.route);
      return PathBuilder.lineThroughPoints(handleRoute.points).toSvg(opts);
    }
    default:
      exhaustiveSwitchError(info, "type");
  }
}
export {
  getArrowBodyPath,
  getArrowBodyPathBuilder,
  getArrowHandlePath
};
//# sourceMappingURL=ArrowPath.mjs.map
