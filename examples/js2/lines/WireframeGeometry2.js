"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.WireframeGeometry2 = void 0;

var WireframeGeometry2 = function WireframeGeometry2(geometry) {
  LineSegmentsGeometry.call(this);
  this.type = 'WireframeGeometry2';
  this.fromWireframeGeometry(new WireframeGeometry(geometry));
};

THREE.WireframeGeometry2 = WireframeGeometry2;
WireframeGeometry2.prototype = Object.assign(Object.create(THREE.LineSegmentsGeometry.prototype), {
  constructor: WireframeGeometry2,
  isWireframeGeometry2: true
});