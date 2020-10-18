"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.NURBSCurve = void 0;

var NURBSCurve = function NURBSCurve(degree, knots, controlPoints, startKnot, endKnot) {
  Curve.call(this);
  this.degree = degree;
  this.knots = knots;
  this.controlPoints = [];
  this.startKnot = startKnot || 0;
  this.endKnot = endKnot || this.knots.length - 1;

  for (var i = 0; i < controlPoints.length; ++i) {
    var point = controlPoints[i];
    this.controlPoints[i] = new THREE.Vector4(point.x, point.y, point.z, point.w);
  }
};

THREE.NURBSCurve = NURBSCurve;
NURBSCurve.prototype = Object.create(THREE.Curve.prototype);
NURBSCurve.prototype.constructor = NURBSCurve;

NURBSCurve.prototype.getPoint = function (t, optionalTarget) {
  var point = optionalTarget || new THREE.Vector3();
  var u = this.knots[this.startKnot] + t * (this.knots[this.endKnot] - this.knots[this.startKnot]);
  var hpoint = THREE.NURBSUtils.calcBSplinePoint(this.degree, this.knots, this.controlPoints, u);

  if (hpoint.w != 1.0) {
    hpoint.divideScalar(hpoint.w);
  }

  return point.set(hpoint.x, hpoint.y, hpoint.z);
};

NURBSCurve.prototype.getTangent = function (t, optionalTarget) {
  var tangent = optionalTarget || new Vector3();
  var u = this.knots[0] + t * (this.knots[this.knots.length - 1] - this.knots[0]);
  var ders = NURBSUtils.calcNURBSDerivatives(this.degree, this.knots, this.controlPoints, u, 1);
  tangent.copy(ders[1]).normalize();
  return tangent;
};