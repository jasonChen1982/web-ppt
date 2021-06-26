import { PathToPoints, getLength, addArc } from './utils.js';
/**
 * del dash with path line
 * @private
 * @param {*} points path line pints
 * @param {*} closed is closed or not
 * @param {*} lineDash dash array
 * @param {*} lineDashOffset dash offset
 * @return {object}
 */
function prepareLineDash(points, closed, lineDash, lineDashOffset) {
  if (closed) {
    points.push(points[0], points[1]);
  }

  let currentOffset = lineDashOffset;
  let dashIndex = 0;
  let draw = 1;
  while (currentOffset > lineDash[dashIndex]) {
    currentOffset -= lineDash[dashIndex];
    dashIndex++;
    if (draw) draw = 0;
    else draw = 1;
    if (dashIndex == lineDash.length) {
      dashIndex = 0;
    }
  }

  let newPoints = [points[0], points[1]];
  let toDrawOrNotToDraw = [draw];
  // var skipped_dash_switch = false;
  for (let i = 2; i < points.length; i += 2) {
    let line = [points[i] - points[i - 2], points[i + 1] - points[i - 1]];
    let lineLength = getLength(line[0], line[1]);
    line[0] /= lineLength;
    line[1] /= lineLength;
    let progress = 0;
    while (lineLength - progress + currentOffset >= lineDash[dashIndex]) {
      progress += lineDash[dashIndex] - currentOffset;

      currentOffset = 0;
      if (draw) draw = 0;
      else draw = 1;
      dashIndex++;
      if (dashIndex == lineDash.length) {
        dashIndex = 0;
      }

      toDrawOrNotToDraw.push(draw);
      newPoints.push(points[i - 2] + progress * line[0], points[i - 1] + progress * line[1]);
    }
    if (lineLength - progress != 0) {
      newPoints.push(points[i], points[i + 1]);
      toDrawOrNotToDraw.push(draw);
    }
    currentOffset += lineLength - progress;
  }

  if (closed) {
    points.pop();
    points.pop();
    newPoints.pop();
    newPoints.pop();
    toDrawOrNotToDraw.pop();
  }

  return { newPoints, toDrawOrNotToDraw };
}

/**
 * a
 * @private
 * @param {*} path a
 * @param {*} style a
 * @param {*} vertices a
 * @return {array}
 */
export default function PathToStroke(path, style, vertices) {
  const points = PathToPoints(path.cmds, []);
  const closed = path.isClosed;
  const useLinedash = style.lineDash.length >= 2;
  const lineWidthDiv2 = style.lineWidth / 2;
  // console.log(useLinedash, lineWidthDiv2);

  let array = [points[0], points[1]];
  for (let i = 2; i < points.length; i += 2) {
    if (points[i] != array[array.length - 2] || points[i + 1] != array[array.length - 1]) {
      array.push(points[i], points[i + 1]);
    }
  }

  if (closed && (array[array.length - 2] != array[0] || array[array.length - 1] != array[1])) {
    array.push(array[0], array[1]);
  }

  let toDrawOrNotToDraw;
  if (useLinedash) {
    const result = prepareLineDash(array, closed, style.lineDash, style.lineDashOffset);
    toDrawOrNotToDraw = result.toDrawOrNotToDraw;
    array = result.newPoints;
  }

  const vertexOffset = vertices.length;
  let vertexProgress = vertices.length;
  const toDrawBuffer = [];

  if (!closed) {
    const line = [array[2] - array[0], array[3] - array[1]];

    const l = getLength(line[0], line[1]);
    line[0] /= l;
    line[1] /= l;
    const normal = [-line[1], line[0]];

    const a = [array[0] + lineWidthDiv2 * normal[0], array[1] + lineWidthDiv2 * normal[1]];
    const b = [array[0] - lineWidthDiv2 * normal[0], array[1] - lineWidthDiv2 * normal[1]];

    if (style.lineCap == 'butt') {
      vertices.push(a[0], a[1], b[0], b[1]);
    } else if (style.lineCap == 'square') {
      vertices.push(a[0] - lineWidthDiv2 * line[0], a[1] - lineWidthDiv2 * line[1], b[0] - lineWidthDiv2 * line[0], b[1] - lineWidthDiv2 * line[1]);
    } else {
      // round
      vertices.push(array[0], array[1], a[0], a[1]);
      const startAngle = Math.atan2(a[1] - array[1], a[0] - array[0]);
      const endAngle = Math.atan2(b[1] - array[1], b[0] - array[0]);
      addArc(vertices, array[0], array[1], lineWidthDiv2, startAngle, endAngle);
      vertices.push(array[0], array[1], b[0], b[1]);
      vertices.push(a[0], a[1], b[0], b[1]);
    }

    if (useLinedash) {
      const toDraw = toDrawOrNotToDraw[0];
      for (let j = vertexProgress; j < vertices.length; j += 2) {
        toDrawBuffer.push(toDraw);
      }
      vertexProgress = vertices.length;
    }
  } else {
    array.push(array[2], array[3]);
  }

  // process lineJoin
  for (let i = 2; i < array.length - 2; i += 2) {
    const line = [array[i] - array[i - 2], array[i + 1] - array[i - 1]];

    const normal = [-line[1], line[0]];
    let l = getLength(normal[0], normal[1]);
    normal[0] /= l;
    normal[1] /= l;

    let p2minp1 = [array[i + 2] - array[i], array[i + 3] - array[i + 1]];
    l = getLength(p2minp1[0], p2minp1[1]);
    p2minp1[0] /= l;
    p2minp1[1] /= l;

    let p1minp0 = [array[i] - array[i - 2], array[i + 1] - array[i - 1]];
    l = getLength(p1minp0[0], p1minp0[1]);
    p1minp0[0] /= l;
    p1minp0[1] /= l;

    let tangent = [p1minp0[0] + p2minp1[0], p1minp0[1] + p2minp1[1]];
    l = getLength(tangent[0], tangent[1]);

    let length = 0;
    let dot;
    let miter;
    if (l > 0) {
      tangent[0] /= l;
      tangent[1] /= l;
      miter = [-tangent[1], tangent[0]];
      dot = miter[0] * normal[0] + miter[1] * normal[1];
      length = lineWidthDiv2 / dot;
    } else {
      length = 0;
      miter = [-tangent[1], tangent[0]];
    }

    const a = [array[i] + length * miter[0], array[i + 1] + length * miter[1]];
    const b = [array[i] - length * miter[0], array[i + 1] - length * miter[1]];

    if (style.lineJoin == 'miter' && 1 / dot <= style.miterLimit) {
      // miter
      vertices.push(a[0], a[1], b[0], b[1]);
    } else {
      const sinAngle = p1minp0[1] * p2minp1[0] - p1minp0[0] * p2minp1[1];

      if (style.lineJoin == 'round') {
        // round
        if (sinAngle < 0) {
          const n1 = [array[i] + p1minp0[1] * lineWidthDiv2, array[i + 1] - p1minp0[0] * lineWidthDiv2];
          const n2 = [array[i] + p2minp1[1] * lineWidthDiv2, array[i + 1] - p2minp1[0] * lineWidthDiv2];
          vertices.push(a[0], a[1], n1[0], n1[1]);
          const startAngle = Math.atan2(n1[1] - array[i + 1], n1[0] - array[i]);
          const endAngle = Math.atan2(n2[1] - array[i + 1], n2[0] - array[i]);
          addArc(vertices, array[i], array[i + 1], lineWidthDiv2, startAngle, endAngle);
          vertices.push(a[0], a[1], n2[0], n2[1]);
        } else {
          const n1 = [array[i] - p1minp0[1] * lineWidthDiv2, array[i + 1] + p1minp0[0] * lineWidthDiv2];
          const n2 = [array[i] - p2minp1[1] * lineWidthDiv2, array[i + 1] + p2minp1[0] * lineWidthDiv2];
          vertices.push(n1[0], n1[1], b[0], b[1]);
          const startAngle = Math.atan2(n2[1] - array[i + 1], n2[0] - array[i]);
          const endAngle = Math.atan2(n1[1] - array[i + 1], n1[0] - array[i]);
          addArc(vertices, array[i], array[i + 1], lineWidthDiv2, startAngle, endAngle);
          vertices.push(n2[0], n2[1], b[0], b[1]);
        }
      } else {
        // bevel
        if (sinAngle < 0) {
          const n1 = [array[i] + p1minp0[1] * lineWidthDiv2, array[i + 1] - p1minp0[0] * lineWidthDiv2];
          const n2 = [array[i] + p2minp1[1] * lineWidthDiv2, array[i + 1] - p2minp1[0] * lineWidthDiv2];
          vertices.push(a[0], a[1], n1[0], n1[1], a[0], a[1], n2[0], n2[1]);
        } else {
          const n1 = [array[i] - p1minp0[1] * lineWidthDiv2, array[i + 1] + p1minp0[0] * lineWidthDiv2];
          const n2 = [array[i] - p2minp1[1] * lineWidthDiv2, array[i + 1] + p2minp1[0] * lineWidthDiv2];
          vertices.push(n1[0], n1[1], b[0], b[1], n2[0], n2[1], b[0], b[1]);
        }
      }
    }

    if (useLinedash) {
      const toDraw = toDrawOrNotToDraw[i / 2];
      for (let j = vertexProgress; j < vertices.length; j += 2) {
        toDrawBuffer.push(toDraw);
      }
      vertexProgress = vertices.length;
    }
  }

  if (!closed) {
    const line = [array[array.length - 2] - array[array.length - 4], array[array.length - 1] - array[array.length - 3]];

    const l = Math.sqrt(Math.pow(line[0], 2) + Math.pow(line[1], 2));
    line[0] /= l;
    line[1] /= l;
    const normal = [-line[1], line[0]];

    const a = [array[array.length - 2] + lineWidthDiv2 * normal[0], array[array.length - 1] + lineWidthDiv2 * normal[1]];
    const b = [array[array.length - 2] - lineWidthDiv2 * normal[0], array[array.length - 1] - lineWidthDiv2 * normal[1]];

    if (style.lineCap == 'butt') {
      vertices.push(a[0], a[1], b[0], b[1]);
    } else if (style.lineCap == 'square') {
      vertices.push(a[0] + lineWidthDiv2 * line[0], a[1] + lineWidthDiv2 * line[1], b[0] + lineWidthDiv2 * line[0], b[1] + lineWidthDiv2 * line[1]);
    } else {
      // round
      vertices.push(a[0], a[1], b[0], b[1]);
      vertices.push(array[array.length - 2], array[array.length - 1], b[0], b[1]);
      const startAngle = Math.atan2(b[1] - array[array.length - 1], b[0] - array[array.length - 2]);
      const endAngle = Math.atan2(a[1] - array[array.length - 1], a[0] - array[array.length - 2]);
      addArc(vertices, array[array.length - 2], array[array.length - 1], lineWidthDiv2, startAngle, endAngle);
      vertices.push(array[array.length - 2], array[array.length - 1], a[0], a[1]);
    }
  } else {
    vertices.push(vertices.buffer[vertexOffset], vertices.buffer[vertexOffset + 1], vertices.buffer[vertexOffset + 2], vertices.buffer[vertexOffset + 3]);
  }

  if (useLinedash) {
    const toDraw = toDrawOrNotToDraw[toDrawOrNotToDraw.length - 1];
    for (let j = vertexProgress; j < vertices.length; j += 2) {
      toDrawBuffer.push(toDraw);
    }
    vertexProgress = vertices.length;
  }

  return toDrawBuffer;
}
