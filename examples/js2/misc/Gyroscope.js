"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.Gyroscope = void 0;

var Gyroscope = function Gyroscope() {
  Object3D.call(this);
};

THREE.Gyroscope = Gyroscope;
Gyroscope.prototype = Object.create(THREE.Object3D.prototype);
Gyroscope.prototype.constructor = Gyroscope;

Gyroscope.prototype.updateMatrixWorld = function () {
  var translationObject = new THREE.Vector3();
  var quaternionObject = new THREE.Quaternion();
  var scaleObject = new Vector3();
  var translationWorld = new Vector3();
  var quaternionWorld = new Quaternion();
  var scaleWorld = new Vector3();
  return function updateMatrixWorld(force) {
    this.matrixAutoUpdate && this.updateMatrix();

    if (this.matrixWorldNeedsUpdate || force) {
      if (this.parent !== null) {
        this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
        this.matrixWorld.decompose(translationWorld, quaternionWorld, scaleWorld);
        this.matrix.decompose(translationObject, quaternionObject, scaleObject);
        this.matrixWorld.compose(translationWorld, quaternionObject, scaleWorld);
      } else {
        this.matrixWorld.copy(this.matrix);
      }

      this.matrixWorldNeedsUpdate = false;
      force = true;
    }

    for (var i = 0, l = this.children.length; i < l; i++) {
      this.children[i].updateMatrixWorld(force);
    }
  };
}();