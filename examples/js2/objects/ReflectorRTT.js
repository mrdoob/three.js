"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.ReflectorRTT = void 0;

var ReflectorRTT = function ReflectorRTT(geometry, options) {
  Reflector.call(this, geometry, options);
  this.geometry.setDrawRange(0, 0);
};

THREE.ReflectorRTT = ReflectorRTT;
ReflectorRTT.prototype = Object.create(Reflector.prototype);