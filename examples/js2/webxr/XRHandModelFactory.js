"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.XRHandModelFactory = void 0;

function XRHandModel(controller) {
  Object3D.call(this);
  this.controller = controller;
  this.motionController = null;
  this.envMap = null;
  this.mesh = null;
}

XRHandModel.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {
  constructor: XRHandModel,
  updateMatrixWorld: function updateMatrixWorld(force) {
    Object3D.prototype.updateMatrixWorld.call(this, force);

    if (this.motionController) {
      this.motionController.updateMesh();
    }
  }
});

var XRHandModelFactory = function () {
  function XRHandModelFactory() {
    this.path = '';
  }

  XRHandModelFactory.prototype = {
    constructor: XRHandModelFactory,
    setPath: function setPath(path) {
      this.path = path;
      return this;
    },
    createHandModel: function createHandModel(controller, profile, options) {
      var _this = this;

      var handModel = new XRHandModel(controller);
      controller.addEventListener('connected', function (event) {
        var xrInputSource = event.data;

        if (xrInputSource.hand && !handModel.motionController) {
          handModel.visible = true;
          handModel.xrInputSource = xrInputSource;

          if (profile === undefined || profile === 'spheres') {
            handModel.motionController = new THREE.XRHandPrimitiveModel(handModel, controller, _this.path, xrInputSource.handedness, {
              primitive: 'sphere'
            });
          } else if (profile === 'boxes') {
            handModel.motionController = new XRHandPrimitiveModel(handModel, controller, _this.path, xrInputSource.handedness, {
              primitive: 'box'
            });
          } else if (profile === 'oculus') {
            handModel.motionController = new THREE.XRHandOculusMeshModel(handModel, controller, _this.path, xrInputSource.handedness, options);
          }
        }
      });
      controller.addEventListener('disconnected', function () {});
      return handModel;
    }
  };
  return XRHandModelFactory;
}();

THREE.XRHandModelFactory = XRHandModelFactory;