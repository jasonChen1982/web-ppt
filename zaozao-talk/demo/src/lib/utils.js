const ARC_RESOLUTION = 1;
const BEZIER_CURVE_RESOLUTION = 10;

/**
 * a
 * @private
 * @param {*} points a
 * @param {*} x a
 * @param {*} y a
 * @return {points}
 */
function lineTo(points, x, y) {
  points.push(x, y);
  return points;
}

/**
 * a
 * @private
 * @param {*} a a
 * @param {*} b a
 * @return {length}
 */
export function getLength(a, b) {
  return Math.sqrt(a * a + b * b);
}

/**
 * a
 * @private
 * @param {*} t a
 * @param {*} p a
 * @return {number}
 */
function CubicBezierP0(t, p) {
  const k = 1 - t;
  return k * k * k * p;
}

/**
 * a
 * @private
 * @param {*} t a
 * @param {*} p a
 * @return {number}
 */
function CubicBezierP1(t, p) {
  const k = 1 - t;
  return 3 * k * k * t * p;
}

/**
 * a
 * @private
 * @param {*} t a
 * @param {*} p a
 * @return {number}
 */
function CubicBezierP2(t, p) {
  return 3 * (1 - t) * t * t * p;
}

/**
 * a
 * @private
 * @param {*} t a
 * @param {*} p a
 * @return {number}
 */
function CubicBezierP3(t, p) {
  return t * t * t * p;
}

/**
 * a
 * @private
 * @param {*} t a
 * @param {*} p0 a
 * @param {*} p1 a
 * @param {*} p2 a
 * @param {*} p3 a
 * @return {number}
 */
function CubicBezier(t, p0, p1, p2, p3) {
  return CubicBezierP0(t, p0) + CubicBezierP1(t, p1) + CubicBezierP2(t, p2) + CubicBezierP3(t, p3);
}

/**
 * a
 * @private
 * @param {*} x0 a
 * @param {*} y0 a
 * @param {*} x1 a
 * @param {*} y1 a
 * @param {*} x2 a
 * @param {*} y2 a
 * @param {*} x3 a
 * @param {*} y3 a
 * @return {number}
 */
function estimateBezierCurveLength(x0, y0, x1, y1, x2, y2, x3, y3) {
  const a = x3 - x2;
  const b = y3 - y2;
  const c = x2 - x1;
  const d = y2 - y1;
  const e = x1 - x0;
  const f = y1 - y0;
  return getLength(a, b) + getLength(c, d) + getLength(e, f);
}

/**
 * a
 * @private
 * @param {*} points a
 * @param {*} x1 a
 * @param {*} y1 a
 * @param {*} x2 a
 * @param {*} y2 a
 * @param {*} x3 a
 * @param {*} y3 a
 * @return {points}
 */
function bezierCurveTo(points, x1, y1, x2, y2, x3, y3) {
  if (!isFinite(x1) || !isFinite(y1) || !isFinite(x2) || !isFinite(y2) || !isFinite(x3) || !isFinite(y3)) return points;

  const x0 = points[points.length - 2];
  const y0 = points[points.length - 1];

  const lengthEstimate = estimateBezierCurveLength(x0, y0, x1, y1, x2, y2, x3, y3);
  const step = Math.min(BEZIER_CURVE_RESOLUTION / lengthEstimate, 0.5);

  for (let t = step; t < 1; t += step) {
    const x = CubicBezier(t, x0, x1, x2, x3);
    const y = CubicBezier(t, y0, y1, y2, y3);
    points.push(x, y);
  }
  points.push(x3, y3);
  return points;
}

/**
 * a
 * @private
 * @param {*} cmds a
 * @param {*} points a
 * @return {points}
 */
export function PathToPoints(cmds, points) {
  for (let i = 0; i < cmds.length; i++) {
    const { cmd, args } = cmds[i];
    switch (cmd) {
      case 'M':
      case 'L':
        lineTo(points, args[0], args[1]);
        break;
      case 'C':
        bezierCurveTo(points, args[0], args[1], args[2], args[3], args[4], args[5]);
        break;
      default:
        break;
    }
  }
  return points;
}

/**
 * a
 * @private
 * @param {*} vertices a
 * @param {*} x a
 * @param {*} y a
 * @param {*} radius a
 * @param {*} startAngle a
 * @param {*} endAngle a
 * @param {*} anticlockwise a
 */
export function addArc(vertices, x, y, radius, startAngle, endAngle, anticlockwise) {
  // bring angles all in [0, 2*PI] range
  startAngle = startAngle % (2 * Math.PI);
  endAngle = endAngle % (2 * Math.PI);
  if (startAngle < 0) startAngle += 2 * Math.PI;
  if (endAngle < 0) endAngle += 2 * Math.PI;

  if (startAngle >= endAngle) {
    endAngle += 2 * Math.PI;
  }

  let diff = endAngle - startAngle;
  let direction = 1;
  if (anticlockwise) {
    direction = -1;
    diff = 2 * Math.PI - diff;
    if (diff == 0) diff = 2 * Math.PI;
  }

  const length = diff * radius;
  let nrOfInterpolationPoints = Math.sqrt(length / ARC_RESOLUTION) >> 0;
  nrOfInterpolationPoints = nrOfInterpolationPoints % 2 === 0 ? nrOfInterpolationPoints + 1 : nrOfInterpolationPoints;
  const dangle = diff / nrOfInterpolationPoints;

  // console.log('ARC_RESOLUTION', ARC_RESOLUTION, length);
  // console.log('nrOfInterpolationPoints', nrOfInterpolationPoints);
  let angle = startAngle;
  for (let j = 0; j < nrOfInterpolationPoints + 1; j++) {
    vertices.push(x, y, x + radius * Math.cos(angle), y + radius * Math.sin(angle));
    angle += direction * dangle;
  }
  // console.log([].concat(vertices));
}

/**
 * a
 * @private
 * @param {*} contour a
 * @return {Number}
 */
export function area(contour) {
  const n = contour.length;
  let a = 0.0;

  for (let p = n - 1, q = 0; q < n; p = q++) {
    a += contour[p][0] * contour[q][1] - contour[q][0] * contour[p][1];
  }

  return a * 0.5;
}

/**
 * a
 * @private
 * @param {*} pts a
 * @return {Boolean}
 */
export function isClockWise(pts) {
  return area(pts) > 0;
}
