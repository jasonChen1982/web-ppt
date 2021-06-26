/**
 * a
 * @private
 */
export default class PathCMD {
  /**
   * a
   */
  constructor() {
    this.cmds = [];
    this.holes = [];
    this.isClosed = false;
    this.isClockWise = false;
  }

  /**
   * a
   * @return {number}
   */
  getLength() {
    return this.cmds.length;
  }

  /**
   * a
   * @param {*} cmd a
   * @param {*} args a
   */
  add(cmd, args) {
    this.cmds.push({ cmd, args });
  }

  /**
   * Moves the current drawing position to x, y.
   *
   * @param {number} x - the X coordinate to move to
   * @param {number} y - the Y coordinate to move to
   */
  moveTo(x = 0, y = 0) {
    this.add('M', [x, y]);
  }

  /**
   * Moves the current drawing position to x, y.
   *
   * @param {number} x - the X coordinate to move to
   * @param {number} y - the Y coordinate to move to
   */
  lineTo(x, y) {
    this.add('L', [x, y]);
  }

  /**
   * Calculate the points for a bezier curve and then draws it.
   *
   * @param {number} cpX - Control point x
   * @param {number} cpY - Control point y
   * @param {number} cpX2 - Second Control point x
   * @param {number} cpY2 - Second Control point y
   * @param {number} toX - Destination point x
   * @param {number} toY - Destination point y
   */
  bezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY) {
    this.add('C', [cpX, cpY, cpX2, cpY2, toX, toY]);
  }

  /**
   * a
   */
  closePath() {
    this.isClosed = true;
  }
}
