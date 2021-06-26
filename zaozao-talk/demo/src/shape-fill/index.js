import PathToShape from '../lib/PathToShape.js';
import PathCMD from '../lib/PathCMD.js';
import earcut from '../lib/earcut.js';

const path = new PathCMD();
path.moveTo(0, 0);
path.lineTo(300, 0);
path.lineTo(300, 300);
path.lineTo(0, 300);
path.lineTo(0, 0);

const fillVertices = [];
PathToShape(path, fillVertices);

const holeIndices = [];
const hole = new PathCMD();
hole.moveTo(60, 60);
hole.lineTo(240, 60);
hole.lineTo(240, 240);
hole.lineTo(60, 240);
hole.lineTo(60, 60);
const cacheLength = fillVertices.length;
holeIndices.push(cacheLength / 2);
PathToShape(hole, fillVertices);

const triangles = earcut(fillVertices, holeIndices, 2);
window.fillVertices = fillVertices;
window.triangles = triangles;
window.holeIndices = holeIndices;

const canvas = document.querySelector('#demo');
canvas.width = window.innerWidth * window.devicePixelRatio;
canvas.height = window.innerHeight * window.devicePixelRatio;
const ctx = canvas.getContext('2d');
ctx.translate(canvas.width / 2 - 150, canvas.height / 2 - 150);
for (let i = 0; i < triangles.length / 3; i++) {
  const a = triangles[i * 3];
  const b = triangles[i * 3 + 1];
  const c = triangles[i * 3 + 2];
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
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#fff';
  ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fill();
}
