import {
  EASINGS,
  PI,
  SIN,
  Vec,
  b64Vecs,
  modulate
} from "@tldraw/editor";
const PEN_EASING = (t) => t * 0.65 + SIN(t * PI / 2) * 0.35;
const simulatePressureSettings = (strokeWidth) => {
  return {
    size: strokeWidth,
    thinning: 0.5,
    streamline: modulate(strokeWidth, [9, 16], [0.64, 0.74], true),
    // 0.62 + ((1 + strokeWidth) / 8) * 0.06,
    smoothing: 0.62,
    easing: EASINGS.easeOutSine,
    simulatePressure: true
  };
};
const realPressureSettings = (strokeWidth) => {
  return {
    size: 1 + strokeWidth * 1.2,
    thinning: 0.62,
    streamline: 0.62,
    smoothing: 0.62,
    simulatePressure: false,
    easing: PEN_EASING
  };
};
const solidSettings = (strokeWidth) => {
  return {
    size: strokeWidth,
    thinning: 0,
    streamline: modulate(strokeWidth, [9, 16], [0.64, 0.74], true),
    // 0.62 + ((1 + strokeWidth) / 8) * 0.06,
    smoothing: 0.62,
    simulatePressure: false,
    easing: EASINGS.linear
  };
};
const solidRealPressureSettings = (strokeWidth) => {
  return {
    size: strokeWidth,
    thinning: 0,
    streamline: 0.62,
    smoothing: 0.62,
    simulatePressure: false,
    easing: EASINGS.linear
  };
};
function getHighlightFreehandSettings({
  strokeWidth,
  showAsComplete
}) {
  return {
    size: 1 + strokeWidth,
    thinning: 0,
    streamline: 0.5,
    smoothing: 0.5,
    simulatePressure: false,
    easing: EASINGS.easeOutSine,
    last: showAsComplete
  };
}
function getFreehandOptions(shapeProps, strokeWidth, forceComplete, forceSolid) {
  const last = shapeProps.isComplete || forceComplete;
  if (forceSolid) {
    if (shapeProps.isPen) {
      return { ...solidRealPressureSettings(strokeWidth), last };
    } else {
      return { ...solidSettings(strokeWidth), last };
    }
  }
  if (shapeProps.dash === "draw") {
    if (shapeProps.isPen) {
      return { ...realPressureSettings(strokeWidth), last };
    } else {
      return { ...simulatePressureSettings(strokeWidth), last };
    }
  }
  return { ...solidSettings(strokeWidth), last };
}
function getPointsFromDrawSegment(segment, scaleX, scaleY, points = []) {
  const _points = b64Vecs.decodePoints(segment.path);
  if (scaleX !== 1 || scaleY !== 1) {
    for (const point of _points) {
      point.x *= scaleX;
      point.y *= scaleY;
    }
  }
  if (segment.type === "free" || _points.length < 2) {
    points.push(..._points.map(Vec.From));
  } else {
    const pointsToInterpolate = Math.max(4, Math.floor(Vec.Dist(_points[0], _points[1]) / 16));
    points.push(...Vec.PointsBetween(_points[0], _points[1], pointsToInterpolate));
  }
  return points;
}
function getPointsFromDrawSegments(segments, scaleX = 1, scaleY = 1) {
  const points = [];
  for (const segment of segments) {
    getPointsFromDrawSegment(segment, scaleX, scaleY, points);
  }
  return points;
}
function getDrawShapeStrokeDashArray(shape, strokeWidth, dotAdjustment) {
  return {
    draw: "none",
    solid: `none`,
    dotted: `${dotAdjustment} ${strokeWidth * 2}`,
    dashed: `${strokeWidth * 2} ${strokeWidth * 2}`
  }[shape.props.dash];
}
export {
  getDrawShapeStrokeDashArray,
  getFreehandOptions,
  getHighlightFreehandSettings,
  getPointsFromDrawSegment,
  getPointsFromDrawSegments
};
//# sourceMappingURL=getPath.mjs.map
