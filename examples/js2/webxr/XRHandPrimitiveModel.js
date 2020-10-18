"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.XRHandPrimitiveModel = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var XRHandPrimitiveModel = /*#__PURE__*/function () {
  function XRHandPrimitiveModel(handModel, controller, path, handedness, options) {
    _classCallCheck(this, XRHandPrimitiveModel);

    this.controller = controller;
    this.handModel = handModel;
    this.envMap = null;
    this.handMesh = new THREE.Group();
    this.handModel.add(this.handMesh);

    if (window.XRHand) {
      var geometry;

      if (!options || !options.primitive || options.primitive === 'sphere') {
        geometry = new THREE.SphereBufferGeometry(1, 10, 10);
      } else if (options.primitive === 'box') {
        geometry = new THREE.BoxBufferGeometry(1, 1, 1);
      }

      var jointMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 1,
        metalness: 0
      });
      var tipMaterial = new MeshStandardMaterial({
        color: 0x999999,
        roughness: 1,
        metalness: 0
      });
      var tipIndexes = [window.XRHand.THUMB_PHALANX_TIP, window.XRHand.INDEX_PHALANX_TIP, window.XRHand.MIDDLE_PHALANX_TIP, window.XRHand.RING_PHALANX_TIP, window.XRHand.LITTLE_PHALANX_TIP];

      for (var i = 0; i <= window.XRHand.LITTLE_PHALANX_TIP; i++) {
        var cube = new Mesh(geometry, tipIndexes.indexOf(i) !== -1 ? tipMaterial : jointMaterial);
        cube.castShadow = true;
        cube.receiveShadow = true;
        this.handMesh.add(cube);
      }
    }
  }

  _createClass(XRHandPrimitiveModel, [{
    key: "updateMesh",
    value: function updateMesh() {
      var defaultRadius = 0.008;
      var objects = this.handMesh.children;
      var XRJoints = this.controller.joints;

      for (var i = 0; i < objects.length; i++) {
        var jointMesh = objects[i];
        var XRJoint = XRJoints[i];

        if (XRJoint.visible) {
          jointMesh.position.copy(XRJoint.position);
          jointMesh.quaternion.copy(XRJoint.quaternion);
          jointMesh.scale.setScalar(XRJoint.jointRadius || defaultRadius);
        }

        jointMesh.visible = XRJoint.visible;
      }
    }
  }]);

  return XRHandPrimitiveModel;
}();

THREE.XRHandPrimitiveModel = XRHandPrimitiveModel;