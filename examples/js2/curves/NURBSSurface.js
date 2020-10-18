"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.NURBSSurface = void 0;

var NURBSSurface = function NURBSSurface(degree1, degree2, knots1, knots2, controlPoints) {
  this.degree1 = degree1;
  this.degree2 = degree2;
  this.knots1 = knots1;
  this.knots2 = knots2;
  this.controlPoints = [];
  var len1 = knots1.length - degree1 - 1;
  var len2 = knots2.length - degree2 - 1;

  for (var i = 0; i < len1; ++i) {
    this.controlPoints[i] = [];

    for (var j = 0; j < len2; ++j) {
      var point = controlPoints[i][j];
      this.controlPoints[i][j] = new THREE.Vector4(point.x, point.y, point.z, point.w);
    }
  }
};

THREE.NURBSSurface = NURBSSurface;
NURBSSurface.prototype = {
  constructor: NURBSSurface,
  getPoint: function getPoint(t1, t2, target) {
    var u = this.knots1[0] + t1 * (this.knots1[this.knots1.length - 1] - this.knots1[0]);
    var v = this.knots2[0] + t2 * (this.knots2[this.knots2.length - 1] - this.knots2[0]);
    NURBSUtils.calcSurfacePoint(this.degree1, this.degree2, this.knots1, this.knots2, this.controlPoints, u, v, target);
  }
};