"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.SimplexNoise = void 0;

var SimplexNoise = function SimplexNoise(r) {
  if (r == undefined) r = Math;
  this.grad3 = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]];
  this.grad4 = [[0, 1, 1, 1], [0, 1, 1, -1], [0, 1, -1, 1], [0, 1, -1, -1], [0, -1, 1, 1], [0, -1, 1, -1], [0, -1, -1, 1], [0, -1, -1, -1], [1, 0, 1, 1], [1, 0, 1, -1], [1, 0, -1, 1], [1, 0, -1, -1], [-1, 0, 1, 1], [-1, 0, 1, -1], [-1, 0, -1, 1], [-1, 0, -1, -1], [1, 1, 0, 1], [1, 1, 0, -1], [1, -1, 0, 1], [1, -1, 0, -1], [-1, 1, 0, 1], [-1, 1, 0, -1], [-1, -1, 0, 1], [-1, -1, 0, -1], [1, 1, 1, 0], [1, 1, -1, 0], [1, -1, 1, 0], [1, -1, -1, 0], [-1, 1, 1, 0], [-1, 1, -1, 0], [-1, -1, 1, 0], [-1, -1, -1, 0]];
  this.p = [];

  for (var i = 0; i < 256; i++) {
    this.p[i] = Math.floor(r.random() * 256);
  }

  this.perm = [];

  for (var i = 0; i < 512; i++) {
    this.perm[i] = this.p[i & 255];
  }

  this.simplex = [[0, 1, 2, 3], [0, 1, 3, 2], [0, 0, 0, 0], [0, 2, 3, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 2, 3, 0], [0, 2, 1, 3], [0, 0, 0, 0], [0, 3, 1, 2], [0, 3, 2, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 3, 2, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 2, 0, 3], [0, 0, 0, 0], [1, 3, 0, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [2, 3, 0, 1], [2, 3, 1, 0], [1, 0, 2, 3], [1, 0, 3, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [2, 0, 3, 1], [0, 0, 0, 0], [2, 1, 3, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [2, 0, 1, 3], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 1, 2], [3, 0, 2, 1], [0, 0, 0, 0], [3, 1, 2, 0], [2, 1, 0, 3], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 1, 0, 2], [0, 0, 0, 0], [3, 2, 0, 1], [3, 2, 1, 0]];
};

THREE.SimplexNoise = SimplexNoise;

SimplexNoise.prototype.dot = function (g, x, y) {
  return g[0] * x + g[1] * y;
};

SimplexNoise.prototype.dot3 = function (g, x, y, z) {
  return g[0] * x + g[1] * y + g[2] * z;
};

SimplexNoise.prototype.dot4 = function (g, x, y, z, w) {
  return g[0] * x + g[1] * y + g[2] * z + g[3] * w;
};

SimplexNoise.prototype.noise = function (xin, yin) {
  var n0, n1, n2;
  var F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
  var s = (xin + yin) * F2;
  var i = Math.floor(xin + s);
  var j = Math.floor(yin + s);
  var G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
  var t = (i + j) * G2;
  var X0 = i - t;
  var Y0 = j - t;
  var x0 = xin - X0;
  var y0 = yin - Y0;
  var i1, j1;

  if (x0 > y0) {
    i1 = 1;
    j1 = 0;
  } else {
    i1 = 0;
    j1 = 1;
  }

  var x1 = x0 - i1 + G2;
  var y1 = y0 - j1 + G2;
  var x2 = x0 - 1.0 + 2.0 * G2;
  var y2 = y0 - 1.0 + 2.0 * G2;
  var ii = i & 255;
  var jj = j & 255;
  var gi0 = this.perm[ii + this.perm[jj]] % 12;
  var gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
  var gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;
  var t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 < 0) n0 = 0.0;else {
    t0 *= t0;
    n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
  }
  var t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 < 0) n1 = 0.0;else {
    t1 *= t1;
    n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
  }
  var t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 < 0) n2 = 0.0;else {
    t2 *= t2;
    n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
  }
  return 70.0 * (n0 + n1 + n2);
};

SimplexNoise.prototype.noise3d = function (xin, yin, zin) {
  var n0, n1, n2, n3;
  var F3 = 1.0 / 3.0;
  var s = (xin + yin + zin) * F3;
  var i = Math.floor(xin + s);
  var j = Math.floor(yin + s);
  var k = Math.floor(zin + s);
  var G3 = 1.0 / 6.0;
  var t = (i + j + k) * G3;
  var X0 = i - t;
  var Y0 = j - t;
  var Z0 = k - t;
  var x0 = xin - X0;
  var y0 = yin - Y0;
  var z0 = zin - Z0;
  var i1, j1, k1;
  var i2, j2, k2;

  if (x0 >= y0) {
    if (y0 >= z0) {
      i1 = 1;
      j1 = 0;
      k1 = 0;
      i2 = 1;
      j2 = 1;
      k2 = 0;
    } else if (x0 >= z0) {
      i1 = 1;
      j1 = 0;
      k1 = 0;
      i2 = 1;
      j2 = 0;
      k2 = 1;
    } else {
      i1 = 0;
      j1 = 0;
      k1 = 1;
      i2 = 1;
      j2 = 0;
      k2 = 1;
    }
  } else {
    if (y0 < z0) {
      i1 = 0;
      j1 = 0;
      k1 = 1;
      i2 = 0;
      j2 = 1;
      k2 = 1;
    } else if (x0 < z0) {
      i1 = 0;
      j1 = 1;
      k1 = 0;
      i2 = 0;
      j2 = 1;
      k2 = 1;
    } else {
      i1 = 0;
      j1 = 1;
      k1 = 0;
      i2 = 1;
      j2 = 1;
      k2 = 0;
    }
  }

  var x1 = x0 - i1 + G3;
  var y1 = y0 - j1 + G3;
  var z1 = z0 - k1 + G3;
  var x2 = x0 - i2 + 2.0 * G3;
  var y2 = y0 - j2 + 2.0 * G3;
  var z2 = z0 - k2 + 2.0 * G3;
  var x3 = x0 - 1.0 + 3.0 * G3;
  var y3 = y0 - 1.0 + 3.0 * G3;
  var z3 = z0 - 1.0 + 3.0 * G3;
  var ii = i & 255;
  var jj = j & 255;
  var kk = k & 255;
  var gi0 = this.perm[ii + this.perm[jj + this.perm[kk]]] % 12;
  var gi1 = this.perm[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]] % 12;
  var gi2 = this.perm[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]] % 12;
  var gi3 = this.perm[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]] % 12;
  var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
  if (t0 < 0) n0 = 0.0;else {
    t0 *= t0;
    n0 = t0 * t0 * this.dot3(this.grad3[gi0], x0, y0, z0);
  }
  var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
  if (t1 < 0) n1 = 0.0;else {
    t1 *= t1;
    n1 = t1 * t1 * this.dot3(this.grad3[gi1], x1, y1, z1);
  }
  var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
  if (t2 < 0) n2 = 0.0;else {
    t2 *= t2;
    n2 = t2 * t2 * this.dot3(this.grad3[gi2], x2, y2, z2);
  }
  var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
  if (t3 < 0) n3 = 0.0;else {
    t3 *= t3;
    n3 = t3 * t3 * this.dot3(this.grad3[gi3], x3, y3, z3);
  }
  return 32.0 * (n0 + n1 + n2 + n3);
};

SimplexNoise.prototype.noise4d = function (x, y, z, w) {
  var grad4 = this.grad4;
  var simplex = this.simplex;
  var perm = this.perm;
  var F4 = (Math.sqrt(5.0) - 1.0) / 4.0;
  var G4 = (5.0 - Math.sqrt(5.0)) / 20.0;
  var n0, n1, n2, n3, n4;
  var s = (x + y + z + w) * F4;
  var i = Math.floor(x + s);
  var j = Math.floor(y + s);
  var k = Math.floor(z + s);
  var l = Math.floor(w + s);
  var t = (i + j + k + l) * G4;
  var X0 = i - t;
  var Y0 = j - t;
  var Z0 = k - t;
  var W0 = l - t;
  var x0 = x - X0;
  var y0 = y - Y0;
  var z0 = z - Z0;
  var w0 = w - W0;
  var c1 = x0 > y0 ? 32 : 0;
  var c2 = x0 > z0 ? 16 : 0;
  var c3 = y0 > z0 ? 8 : 0;
  var c4 = x0 > w0 ? 4 : 0;
  var c5 = y0 > w0 ? 2 : 0;
  var c6 = z0 > w0 ? 1 : 0;
  var c = c1 + c2 + c3 + c4 + c5 + c6;
  var i1, j1, k1, l1;
  var i2, j2, k2, l2;
  var i3, j3, k3, l3;
  i1 = simplex[c][0] >= 3 ? 1 : 0;
  j1 = simplex[c][1] >= 3 ? 1 : 0;
  k1 = simplex[c][2] >= 3 ? 1 : 0;
  l1 = simplex[c][3] >= 3 ? 1 : 0;
  i2 = simplex[c][0] >= 2 ? 1 : 0;
  j2 = simplex[c][1] >= 2 ? 1 : 0;
  k2 = simplex[c][2] >= 2 ? 1 : 0;
  l2 = simplex[c][3] >= 2 ? 1 : 0;
  i3 = simplex[c][0] >= 1 ? 1 : 0;
  j3 = simplex[c][1] >= 1 ? 1 : 0;
  k3 = simplex[c][2] >= 1 ? 1 : 0;
  l3 = simplex[c][3] >= 1 ? 1 : 0;
  var x1 = x0 - i1 + G4;
  var y1 = y0 - j1 + G4;
  var z1 = z0 - k1 + G4;
  var w1 = w0 - l1 + G4;
  var x2 = x0 - i2 + 2.0 * G4;
  var y2 = y0 - j2 + 2.0 * G4;
  var z2 = z0 - k2 + 2.0 * G4;
  var w2 = w0 - l2 + 2.0 * G4;
  var x3 = x0 - i3 + 3.0 * G4;
  var y3 = y0 - j3 + 3.0 * G4;
  var z3 = z0 - k3 + 3.0 * G4;
  var w3 = w0 - l3 + 3.0 * G4;
  var x4 = x0 - 1.0 + 4.0 * G4;
  var y4 = y0 - 1.0 + 4.0 * G4;
  var z4 = z0 - 1.0 + 4.0 * G4;
  var w4 = w0 - 1.0 + 4.0 * G4;
  var ii = i & 255;
  var jj = j & 255;
  var kk = k & 255;
  var ll = l & 255;
  var gi0 = perm[ii + perm[jj + perm[kk + perm[ll]]]] % 32;
  var gi1 = perm[ii + i1 + perm[jj + j1 + perm[kk + k1 + perm[ll + l1]]]] % 32;
  var gi2 = perm[ii + i2 + perm[jj + j2 + perm[kk + k2 + perm[ll + l2]]]] % 32;
  var gi3 = perm[ii + i3 + perm[jj + j3 + perm[kk + k3 + perm[ll + l3]]]] % 32;
  var gi4 = perm[ii + 1 + perm[jj + 1 + perm[kk + 1 + perm[ll + 1]]]] % 32;
  var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
  if (t0 < 0) n0 = 0.0;else {
    t0 *= t0;
    n0 = t0 * t0 * this.dot4(grad4[gi0], x0, y0, z0, w0);
  }
  var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
  if (t1 < 0) n1 = 0.0;else {
    t1 *= t1;
    n1 = t1 * t1 * this.dot4(grad4[gi1], x1, y1, z1, w1);
  }
  var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
  if (t2 < 0) n2 = 0.0;else {
    t2 *= t2;
    n2 = t2 * t2 * this.dot4(grad4[gi2], x2, y2, z2, w2);
  }
  var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
  if (t3 < 0) n3 = 0.0;else {
    t3 *= t3;
    n3 = t3 * t3 * this.dot4(grad4[gi3], x3, y3, z3, w3);
  }
  var t4 = 0.6 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
  if (t4 < 0) n4 = 0.0;else {
    t4 *= t4;
    n4 = t4 * t4 * this.dot4(grad4[gi4], x4, y4, z4, w4);
  }
  return 27.0 * (n0 + n1 + n2 + n3 + n4);
};