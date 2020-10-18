"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.XRControllerModelFactory = void 0;
var DEFAULT_PROFILES_PATH = 'https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles';
var DEFAULT_PROFILE = 'generic-trigger';

function XRControllerModel() {
  Object3D.call(this);
  this.motionController = null;
  this.envMap = null;
}

XRControllerModel.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {
  constructor: XRControllerModel,
  setEnvironmentMap: function setEnvironmentMap(envMap) {
    var _this = this;

    if (this.envMap == envMap) {
      return this;
    }

    this.envMap = envMap;
    this.traverse(function (child) {
      if (child.isMesh) {
        child.material.envMap = _this.envMap;
        child.material.needsUpdate = true;
      }
    });
    return this;
  },
  updateMatrixWorld: function updateMatrixWorld(force) {
    Object3D.prototype.updateMatrixWorld.call(this, force);
    if (!this.motionController) return;
    this.motionController.updateFromGamepad();
    Object.values(this.motionController.components).forEach(function (component) {
      Object.values(component.visualResponses).forEach(function (visualResponse) {
        var valueNode = visualResponse.valueNode,
            minNode = visualResponse.minNode,
            maxNode = visualResponse.maxNode,
            value = visualResponse.value,
            valueNodeProperty = visualResponse.valueNodeProperty;
        if (!valueNode) return;

        if (valueNodeProperty === MotionControllerConstants.VisualResponseProperty.VISIBILITY) {
          valueNode.visible = value;
        } else if (valueNodeProperty === MotionControllerConstants.VisualResponseProperty.TRANSFORM) {
          Quaternion.slerp(minNode.quaternion, maxNode.quaternion, valueNode.quaternion, value);
          valueNode.position.lerpVectors(minNode.position, maxNode.position, value);
        }
      });
    });
  }
});

function findNodes(motionController, scene) {
  Object.values(motionController.components).forEach(function (component) {
    var type = component.type,
        touchPointNodeName = component.touchPointNodeName,
        visualResponses = component.visualResponses;

    if (type === MotionControllerConstants.ComponentType.TOUCHPAD) {
      component.touchPointNode = scene.getObjectByName(touchPointNodeName);

      if (component.touchPointNode) {
        var sphereGeometry = new THREE.SphereBufferGeometry(0.001);
        var material = new THREE.MeshBasicMaterial({
          color: 0x0000FF
        });
        var sphere = new Mesh(sphereGeometry, material);
        component.touchPointNode.add(sphere);
      } else {
        console.warn("Could not find touch dot, ".concat(component.touchPointNodeName, ", in touchpad component ").concat(component.id));
      }
    }

    Object.values(visualResponses).forEach(function (visualResponse) {
      var valueNodeName = visualResponse.valueNodeName,
          minNodeName = visualResponse.minNodeName,
          maxNodeName = visualResponse.maxNodeName,
          valueNodeProperty = visualResponse.valueNodeProperty;

      if (valueNodeProperty === MotionControllerConstants.VisualResponseProperty.TRANSFORM) {
        visualResponse.minNode = scene.getObjectByName(minNodeName);
        visualResponse.maxNode = scene.getObjectByName(maxNodeName);

        if (!visualResponse.minNode) {
          console.warn("Could not find ".concat(minNodeName, " in the model"));
          return;
        }

        if (!visualResponse.maxNode) {
          console.warn("Could not find ".concat(maxNodeName, " in the model"));
          return;
        }
      }

      visualResponse.valueNode = scene.getObjectByName(valueNodeName);

      if (!visualResponse.valueNode) {
        console.warn("Could not find ".concat(valueNodeName, " in the model"));
      }
    });
  });
}

function addAssetSceneToControllerModel(controllerModel, scene) {
  findNodes(controllerModel.motionController, scene);

  if (controllerModel.envMap) {
    scene.traverse(function (child) {
      if (child.isMesh) {
        child.material.envMap = controllerModel.envMap;
        child.material.needsUpdate = true;
      }
    });
  }

  controllerModel.add(scene);
}

var XRControllerModelFactory = function () {
  function XRControllerModelFactory() {
    var gltfLoader = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    this.gltfLoader = gltfLoader;
    this.path = DEFAULT_PROFILES_PATH;
    this._assetCache = {};

    if (!this.gltfLoader) {
      this.gltfLoader = new THREE.GLTFLoader();
    }
  }

  XRControllerModelFactory.prototype = {
    constructor: XRControllerModelFactory,
    createControllerModel: function createControllerModel(controller) {
      var _this2 = this;

      var controllerModel = new XRControllerModel();
      var scene = null;
      controller.addEventListener('connected', function (event) {
        var xrInputSource = event.data;
        if (xrInputSource.targetRayMode !== 'tracked-pointer' || !xrInputSource.gamepad) return;
        fetchProfile(xrInputSource, _this2.path, DEFAULT_PROFILE).then(function (_ref) {
          var profile = _ref.profile,
              assetPath = _ref.assetPath;
          controllerModel.motionController = new MotionController(xrInputSource, profile, assetPath);
          var cachedAsset = _this2._assetCache[controllerModel.motionController.assetUrl];

          if (cachedAsset) {
            scene = cachedAsset.scene.clone();
            addAssetSceneToControllerModel(controllerModel, scene);
          } else {
            if (!_this2.gltfLoader) {
              throw new Error("GLTFLoader not set.");
            }

            _this2.gltfLoader.setPath('');

            _this2.gltfLoader.load(controllerModel.motionController.assetUrl, function (asset) {
              _this2._assetCache[controllerModel.motionController.assetUrl] = asset;
              scene = asset.scene.clone();
              addAssetSceneToControllerModel(controllerModel, scene);
            }, null, function () {
              throw new Error("Asset ".concat(controllerModel.motionController.assetUrl, " missing or malformed."));
            });
          }
        })["catch"](function (err) {
          console.warn(err);
        });
      });
      controller.addEventListener('disconnected', function () {
        controllerModel.motionController = null;
        controllerModel.remove(scene);
        scene = null;
      });
      return controllerModel;
    }
  };
  return XRControllerModelFactory;
}();

THREE.XRControllerModelFactory = XRControllerModelFactory;