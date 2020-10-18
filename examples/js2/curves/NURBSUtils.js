"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.NURBSUtils = void 0;
var NURBSUtils = {
  findSpan: function findSpan(p, u, U) {
    var n = U.length - p - 1;

    if (u >= U[n]) {
      return n - 1;
    }

    if (u <= U[p]) {
      return p;
    }

    var low = p;
    var high = n;
    var mid = Math.floor((low + high) / 2);

    while (u < U[mid] || u >= U[mid + 1]) {
      if (u < U[mid]) {
        high = mid;
      } else {
        low = mid;
      }

      mid = Math.floor((low + high) / 2);
    }

    return mid;
  },
  calcBasisFunctions: function calcBasisFunctions(span, u, p, U) {
    var N = [];
    var left = [];
    var right = [];
    N[0] = 1.0;

    for (var j = 1; j <= p; ++j) {
      left[j] = u - U[span + 1 - j];
      right[j] = U[span + j] - u;
      var saved = 0.0;

      for (var r = 0; r < j; ++r) {
        var rv = right[r + 1];
        var lv = left[j - r];
        var temp = N[r] / (rv + lv);
        N[r] = saved + rv * temp;
        saved = lv * temp;
      }

      N[j] = saved;
    }

    return N;
  },
  calcBSplinePoint: function calcBSplinePoint(p, U, P, u) {
    var span = this.findSpan(p, u, U);
    var N = this.calcBasisFunctions(span, u, p, U);
    var C = new THREE.Vector4(0, 0, 0, 0);

    for (var j = 0; j <= p; ++j) {
      var point = P[span - p + j];
      var Nj = N[j];
      var wNj = point.w * Nj;
      C.x += point.x * wNj;
      C.y += point.y * wNj;
      C.z += point.z * wNj;
      C.w += point.w * Nj;
    }

    return C;
  },
  calcBasisFunctionDerivatives: function calcBasisFunctionDerivatives(span, u, p, n, U) {
    var zeroArr = [];

    for (var i = 0; i <= p; ++i) {
      zeroArr[i] = 0.0;
    }

    var ders = [];

    for (var i = 0; i <= n; ++i) {
      ders[i] = zeroArr.slice(0);
    }

    var ndu = [];

    for (var i = 0; i <= p; ++i) {
      ndu[i] = zeroArr.slice(0);
    }

    ndu[0][0] = 1.0;
    var left = zeroArr.slice(0);
    var right = zeroArr.slice(0);

    for (var j = 1; j <= p; ++j) {
      left[j] = u - U[span + 1 - j];
      right[j] = U[span + j] - u;
      var saved = 0.0;

      for (var r = 0; r < j; ++r) {
        var rv = right[r + 1];
        var lv = left[j - r];
        ndu[j][r] = rv + lv;
        var temp = ndu[r][j - 1] / ndu[j][r];
        ndu[r][j] = saved + rv * temp;
        saved = lv * temp;
      }

      ndu[j][j] = saved;
    }

    for (var j = 0; j <= p; ++j) {
      ders[0][j] = ndu[j][p];
    }

    for (var r = 0; r <= p; ++r) {
      var s1 = 0;
      var s2 = 1;
      var a = [];

      for (var i = 0; i <= p; ++i) {
        a[i] = zeroArr.slice(0);
      }

      a[0][0] = 1.0;

      for (var k = 1; k <= n; ++k) {
        var d = 0.0;
        var rk = r - k;
        var pk = p - k;

        if (r >= k) {
          a[s2][0] = a[s1][0] / ndu[pk + 1][rk];
          d = a[s2][0] * ndu[rk][pk];
        }

        var j1 = rk >= -1 ? 1 : -rk;
        var j2 = r - 1 <= pk ? k - 1 : p - r;

        for (var j = j1; j <= j2; ++j) {
          a[s2][j] = (a[s1][j] - a[s1][j - 1]) / ndu[pk + 1][rk + j];
          d += a[s2][j] * ndu[rk + j][pk];
        }

        if (r <= pk) {
          a[s2][k] = -a[s1][k - 1] / ndu[pk + 1][r];
          d += a[s2][k] * ndu[r][pk];
        }

        ders[k][r] = d;
        var j = s1;
        s1 = s2;
        s2 = j;
      }
    }

    var r = p;

    for (var k = 1; k <= n; ++k) {
      for (var j = 0; j <= p; ++j) {
        ders[k][j] *= r;
      }

      r *= p - k;
    }

    return ders;
  },
  calcBSplineDerivatives: function calcBSplineDerivatives(p, U, P, u, nd) {
    var du = nd < p ? nd : p;
    var CK = [];
    var span = this.findSpan(p, u, U);
    var nders = this.calcBasisFunctionDerivatives(span, u, p, du, U);
    var Pw = [];

    for (var i = 0; i < P.length; ++i) {
      var point = P[i].clone();
      var w = point.w;
      point.x *= w;
      point.y *= w;
      point.z *= w;
      Pw[i] = point;
    }

    for (var k = 0; k <= du; ++k) {
      var point = Pw[span - p].clone().multiplyScalar(nders[k][0]);

      for (var j = 1; j <= p; ++j) {
        point.add(Pw[span - p + j].clone().multiplyScalar(nders[k][j]));
      }

      CK[k] = point;
    }

    for (var k = du + 1; k <= nd + 1; ++k) {
      CK[k] = new Vector4(0, 0, 0);
    }

    return CK;
  },
  calcKoverI: function calcKoverI(k, i) {
    var nom = 1;

    for (var j = 2; j <= k; ++j) {
      nom *= j;
    }

    var denom = 1;

    for (var j = 2; j <= i; ++j) {
      denom *= j;
    }

    for (var j = 2; j <= k - i; ++j) {
      denom *= j;
    }

    return nom / denom;
  },
  calcRationalCurveDerivatives: function calcRationalCurveDerivatives(Pders) {
    var nd = Pders.length;
    var Aders = [];
    var wders = [];

    for (var i = 0; i < nd; ++i) {
      var point = Pders[i];
      Aders[i] = new THREE.Vector3(point.x, point.y, point.z);
      wders[i] = point.w;
    }

    var CK = [];

    for (var k = 0; k < nd; ++k) {
      var v = Aders[k].clone();

      for (var i = 1; i <= k; ++i) {
        v.sub(CK[k - i].clone().multiplyScalar(this.calcKoverI(k, i) * wders[i]));
      }

      CK[k] = v.divideScalar(wders[0]);
    }

    return CK;
  },
  calcNURBSDerivatives: function calcNURBSDerivatives(p, U, P, u, nd) {
    var Pders = this.calcBSplineDerivatives(p, U, P, u, nd);
    return this.calcRationalCurveDerivatives(Pders);
  },
  calcSurfacePoint: function calcSurfacePoint(p, q, U, V, P, u, v, target) {
    var uspan = this.findSpan(p, u, U);
    var vspan = this.findSpan(q, v, V);
    var Nu = this.calcBasisFunctions(uspan, u, p, U);
    var Nv = this.calcBasisFunctions(vspan, v, q, V);
    var temp = [];

    for (var l = 0; l <= q; ++l) {
      temp[l] = new Vector4(0, 0, 0, 0);

      for (var k = 0; k <= p; ++k) {
        var point = P[uspan - p + k][vspan - q + l].clone();
        var w = point.w;
        point.x *= w;
        point.y *= w;
        point.z *= w;
        temp[l].add(point.multiplyScalar(Nu[k]));
      }
    }

    var Sw = new Vector4(0, 0, 0, 0);

    for (var l = 0; l <= q; ++l) {
      Sw.add(temp[l].multiplyScalar(Nv[l]));
    }

    Sw.divideScalar(Sw.w);
    target.set(Sw.x, Sw.y, Sw.z);
  }
};
THREE.NURBSUtils = NURBSUtils;