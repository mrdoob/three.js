"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.XRHandOculusMeshModel = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var XRHandOculusMeshModel = /*#__PURE__*/function () {
  function XRHandOculusMeshModel(handModel, controller, path, handedness, options) {
    var _this = this;

    _classCallCheck(this, XRHandOculusMeshModel);

    this.controller = controller;
    this.handModel = handModel;
    this.bones = [];
    var loader = new THREE.FBXLoader();
    var low = options && options.model === 'lowpoly' ? '_low' : '';
    loader.setPath(path);
    loader.load("OculusHand_".concat(handedness === 'right' ? 'R' : 'L').concat(low, ".fbx"), function (object) {
      _this.handModel.add(object);

      object.scale.setScalar(0.01);
      var mesh = object.getObjectByProperty('type', 'SkinnedMesh');
      mesh.frustumCulled = false;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      var bonesMapping = ['b_%_wrist', 'b_%_thumb1', 'b_%_thumb2', 'b_%_thumb3', 'b_%_thumb_null', null, 'b_%_index1', 'b_%_index2', 'b_%_index3', 'b_%_index_null', null, 'b_%_middle1', 'b_%_middle2', 'b_%_middle3', 'b_%_middlenull', null, 'b_%_ring1', 'b_%_ring2', 'b_%_ring3', 'b_%_ring_inull', 'b_%_pinky0', 'b_%_pinky1', 'b_%_pinky2', 'b_%_pinky3', 'b_%_pinkynull'];
      bonesMapping.forEach(function (boneName) {
        if (boneName) {
          var bone = object.getObjectByName(boneName.replace(/%/g, handedness === 'right' ? 'r' : 'l'));

          _this.bones.push(bone);
        } else {
          _this.bones.push(null);
        }
      });
    });
  }

  _createClass(XRHandOculusMeshModel, [{
    key: "updateMesh",
    value: function updateMesh() {
      var XRJoints = this.controller.joints;

      for (var i = 0; i < this.bones.length; i++) {
        var bone = this.bones[i];
        var XRJoint = XRJoints[i];

        if (XRJoint) {
          if (XRJoint.visible) {
            var position = XRJoint.position;

            if (bone) {
              bone.position.copy(position.clone().multiplyScalar(100));
              bone.quaternion.copy(XRJoint.quaternion);
            }
          }
        }
      }
    }
  }]);

  return XRHandOculusMeshModel;
}();

THREE.XRHandOculusMeshModel = XRHandOculusMeshModel;