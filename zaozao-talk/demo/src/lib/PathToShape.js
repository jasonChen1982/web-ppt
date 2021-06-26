import { PathToPoints } from './utils.js';

/**
 * build shape from path
 * @private
 * @param {*} path path line
 * @param {*} vertices vertices
 * @param {*} holes holes
 * @return {Boolean} shape empty or not
 */
export default function PathToShape(path, vertices) {
  const closed = path.isClosed;
  let empty = true;

  const points = PathToPoints(path.cmds, []);

  let array = [points[0], points[1]];
  for (let i = 2; i < points.length; i += 2) {
    if (points[i] != array[array.length - 2] || points[i + 1] != array[array.length - 1]) {
      array.push(points[i], points[i + 1]);
    }
  }

  if (closed && (array[array.length - 2] != array[0] || array[array.length - 1] != array[1])) {
    array.push(array[0], array[1]);
  }

  if (array.length >= 6) {
    for (let i = 0; i < array.length; i++) {
      vertices.push(array[i]);
    }
    empty = false;
  }
  return empty;
}
