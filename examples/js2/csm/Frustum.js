"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var inverseProjectionMatrix = new THREE.Matrix4();

var Frustum = /*#__PURE__*/function () {
  function Frustum(data) {
    _classCallCheck(this, Frustum);

    data = data || {};
    this.vertices = {
      near: [new THREE.Vector3(), new Vector3(), new Vector3(), new Vector3()],
      far: [new Vector3(), new Vector3(), new Vector3(), new Vector3()]
    };

    if (data.projectionMatrix !== undefined) {
      this.setFromProjectionMatrix(data.projectionMatrix, data.maxFar || 10000);
    }
  }

  _createClass(Frustum, [{
    key: "setFromProjectionMatrix",
    value: function setFromProjectionMatrix(projectionMatrix, maxFar) {
      var isOrthographic = projectionMatrix.elements[2 * 4 + 3] === 0;
      inverseProjectionMatrix.getInverse(projectionMatrix);
      this.vertices.near[0].set(1, 1, -1);
      this.vertices.near[1].set(1, -1, -1);
      this.vertices.near[2].set(-1, -1, -1);
      this.vertices.near[3].set(-1, 1, -1);
      this.vertices.near.forEach(function (v) {
        v.applyMatrix4(inverseProjectionMatrix);
      });
      this.vertices.far[0].set(1, 1, 1);
      this.vertices.far[1].set(1, -1, 1);
      this.vertices.far[2].set(-1, -1, 1);
      this.vertices.far[3].set(-1, 1, 1);
      this.vertices.far.forEach(function (v) {
        v.applyMatrix4(inverseProjectionMatrix);
        var absZ = Math.abs(v.z);

        if (isOrthographic) {
          v.z *= Math.min(maxFar / absZ, 1.0);
        } else {
          v.multiplyScalar(Math.min(maxFar / absZ, 1.0));
        }
      });
      return this.vertices;
    }
  }, {
    key: "split",
    value: function split(breaks, target) {
      while (breaks.length > target.length) {
        target.push(new Frustum());
      }

      target.length = breaks.length;

      for (var i = 0; i < breaks.length; i++) {
        var cascade = target[i];

        if (i === 0) {
          for (var j = 0; j < 4; j++) {
            cascade.vertices.near[j].copy(this.vertices.near[j]);
          }
        } else {
          for (var _j = 0; _j < 4; _j++) {
            cascade.vertices.near[_j].lerpVectors(this.vertices.near[_j], this.vertices.far[_j], breaks[i - 1]);
          }
        }

        if (i === breaks - 1) {
          for (var _j2 = 0; _j2 < 4; _j2++) {
            cascade.vertices.far[_j2].copy(this.vertices.far[_j2]);
          }
        } else {
          for (var _j3 = 0; _j3 < 4; _j3++) {
            cascade.vertices.far[_j3].lerpVectors(this.vertices.near[_j3], this.vertices.far[_j3], breaks[i]);
          }
        }
      }
    }
  }, {
    key: "toSpace",
    value: function toSpace(cameraMatrix, target) {
      for (var i = 0; i < 4; i++) {
        target.vertices.near[i].copy(this.vertices.near[i]).applyMatrix4(cameraMatrix);
        target.vertices.far[i].copy(this.vertices.far[i]).applyMatrix4(cameraMatrix);
      }
    }
  }]);

  return Frustum;
}();

exports["default"] = Frustum;