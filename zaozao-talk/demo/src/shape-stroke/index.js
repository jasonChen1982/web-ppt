import PathToStroke from '../lib/PathToStroke.js';
import PathCMD from '../lib/PathCMD.js';

const lineStyle = {
  lineWidth: 50,
  lineJoin: 'round',
  miterLimit: 10.0,
  lineCap: 'round',
  lineDash: [], // [5, 5],
  lineDashOffset: 0,
};

const path = new PathCMD();
path.moveTo(0, 0);
path.lineTo(400, -50);
path.lineTo(400, 400);
path.lineTo(200, 250);
path.lineTo(-50, 360);

const fillVertices = [];
PathToStroke(path, lineStyle, fillVertices);

const indices = [];
for (let i = 2; i < fillVertices.length / 2; i += 2) {
  indices.push(i - 2, i, i - 1, i, i + 1, i - 1);
}

const canvas = document.querySelector('#demo');
canvas.width = window.innerWidth * window.devicePixelRatio;
canvas.height = window.innerHeight * window.devicePixelRatio;
const ctx = canvas.getContext('2d');
ctx.translate(canvas.width / 2 - 200, canvas.height / 2 - 200);
for (let i = 0; i < indices.length / 3; i++) {
  const a = indices[i * 3];
  const b = indices[i * 3 + 1];
  const c = indices[i * 3 + 2];
  ctx.beginPath();
  let x = fillVertices[a * 2];
  let y = fillVertices[a * 2 + 1];
  ctx.moveTo(x, y);
  x = fillVertices[b * 2];
  y = fillVertices[b * 2 + 1];
  ctx.lineTo(x, y);
  x = fillVertices[c * 2];
  y = fillVertices[c * 2 + 1];
  ctx.lineTo(x, y);
  ctx.closePath();

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#fff';
  ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fill();
}
