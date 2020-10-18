"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.CSM = void 0;

var _Frustum = _interopRequireDefault(require("./Frustum.js"));

var _Shader = _interopRequireDefault(require("./Shader.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _cameraToLightMatrix = new THREE.Matrix4();

var _lightSpaceFrustum = new _Frustum["default"]();

var _center = new THREE.Vector3();

var _bbox = new THREE.Box3();

var _uniformArray = [];
var _logArray = [];

var CSM = /*#__PURE__*/function () {
  function CSM(data) {
    _classCallCheck(this, CSM);

    data = data || {};
    this.camera = data.camera;
    this.parent = data.parent;
    this.cascades = data.cascades || 3;
    this.maxFar = data.maxFar || 100000;
    this.mode = data.mode || 'practical';
    this.shadowMapSize = data.shadowMapSize || 2048;
    this.shadowBias = data.shadowBias || 0.000001;
    this.lightDirection = data.lightDirection || new Vector3(1, -1, 1).normalize();
    this.lightIntensity = data.lightIntensity || 1;
    this.lightNear = data.lightNear || 1;
    this.lightFar = data.lightFar || 2000;
    this.lightMargin = data.lightMargin || 200;
    this.customSplitsCallback = data.customSplitsCallback;
    this.fade = false;
    this.mainFrustum = new _Frustum["default"]();
    this.frustums = [];
    this.breaks = [];
    this.lights = [];
    this.shaders = new Map();
    this.createLights();
    this.updateFrustums();
    this.injectInclude();
  }

  _createClass(CSM, [{
    key: "createLights",
    value: function createLights() {
      for (var i = 0; i < this.cascades; i++) {
        var light = new THREE.DirectionalLight(0xffffff, this.lightIntensity);
        light.castShadow = true;
        light.shadow.mapSize.width = this.shadowMapSize;
        light.shadow.mapSize.height = this.shadowMapSize;
        light.shadow.camera.near = this.lightNear;
        light.shadow.camera.far = this.lightFar;
        light.shadow.bias = this.shadowBias;
        this.parent.add(light);
        this.parent.add(light.target);
        this.lights.push(light);
      }
    }
  }, {
    key: "initCascades",
    value: function initCascades() {
      var camera = this.camera;
      camera.updateProjectionMatrix();
      this.mainFrustum.setFromProjectionMatrix(camera.projectionMatrix, this.maxFar);
      this.mainFrustum.split(this.breaks, this.frustums);
    }
  }, {
    key: "updateShadowBounds",
    value: function updateShadowBounds() {
      var frustums = this.frustums;

      for (var i = 0; i < frustums.length; i++) {
        var light = this.lights[i];
        var shadowCam = light.shadow.camera;
        var frustum = this.frustums[i];
        var nearVerts = frustum.vertices.near;
        var farVerts = frustum.vertices.far;
        var point1 = farVerts[0];
        var point2 = void 0;

        if (point1.distanceTo(farVerts[2]) > point1.distanceTo(nearVerts[2])) {
          point2 = farVerts[2];
        } else {
          point2 = nearVerts[2];
        }

        var squaredBBWidth = point1.distanceTo(point2);

        if (this.fade) {
          var camera = this.camera;
          var far = Math.max(camera.far, this.maxFar);
          var linearDepth = frustum.vertices.far[0].z / (far - camera.near);
          var margin = 0.25 * Math.pow(linearDepth, 2.0) * (far - camera.near);
          squaredBBWidth += margin;
        }

        shadowCam.left = -squaredBBWidth / 2;
        shadowCam.right = squaredBBWidth / 2;
        shadowCam.top = squaredBBWidth / 2;
        shadowCam.bottom = -squaredBBWidth / 2;
        shadowCam.updateProjectionMatrix();
      }
    }
  }, {
    key: "getBreaks",
    value: function getBreaks() {
      var camera = this.camera;
      var far = Math.min(camera.far, this.maxFar);
      this.breaks.length = 0;

      switch (this.mode) {
        case 'uniform':
          uniformSplit(this.cascades, camera.near, far, this.breaks);
          break;

        case 'logarithmic':
          logarithmicSplit(this.cascades, camera.near, far, this.breaks);
          break;

        case 'practical':
          practicalSplit(this.cascades, camera.near, far, 0.5, this.breaks);
          break;

        case 'custom':
          if (this.customSplitsCallback === undefined) console.error('CSM: Custom split scheme callback not defined.');
          this.customSplitsCallback(this.cascades, camera.near, far, this.breaks);
          break;
      }

      function uniformSplit(amount, near, far, target) {
        for (var i = 1; i < amount; i++) {
          target.push((near + (far - near) * i / amount) / far);
        }

        target.push(1);
      }

      function logarithmicSplit(amount, near, far, target) {
        for (var i = 1; i < amount; i++) {
          target.push(near * Math.pow(far / near, i / amount) / far);
        }

        target.push(1);
      }

      function practicalSplit(amount, near, far, lambda, target) {
        _uniformArray.length = 0;
        _logArray.length = 0;
        logarithmicSplit(amount, near, far, _logArray);
        uniformSplit(amount, near, far, _uniformArray);

        for (var i = 1; i < amount; i++) {
          target.push(THREE.MathUtils.lerp(_uniformArray[i - 1], _logArray[i - 1], lambda));
        }

        target.push(1);
      }
    }
  }, {
    key: "update",
    value: function update() {
      var camera = this.camera;
      var frustums = this.frustums;

      for (var i = 0; i < frustums.length; i++) {
        var light = this.lights[i];
        var shadowCam = light.shadow.camera;
        var texelWidth = (shadowCam.right - shadowCam.left) / this.shadowMapSize;
        var texelHeight = (shadowCam.top - shadowCam.bottom) / this.shadowMapSize;
        light.shadow.camera.updateMatrixWorld(true);

        _cameraToLightMatrix.multiplyMatrices(light.shadow.camera.matrixWorldInverse, camera.matrixWorld);

        frustums[i].toSpace(_cameraToLightMatrix, _lightSpaceFrustum);
        var nearVerts = _lightSpaceFrustum.vertices.near;
        var farVerts = _lightSpaceFrustum.vertices.far;

        _bbox.makeEmpty();

        for (var j = 0; j < 4; j++) {
          _bbox.expandByPoint(nearVerts[j]);

          _bbox.expandByPoint(farVerts[j]);
        }

        _bbox.getCenter(_center);

        _center.z = _bbox.max.z + this.lightMargin;
        _center.x = Math.floor(_center.x / texelWidth) * texelWidth;
        _center.y = Math.floor(_center.y / texelHeight) * texelHeight;

        _center.applyMatrix4(light.shadow.camera.matrixWorld);

        light.position.copy(_center);
        light.target.position.copy(_center);
        light.target.position.x += this.lightDirection.x;
        light.target.position.y += this.lightDirection.y;
        light.target.position.z += this.lightDirection.z;
      }
    }
  }, {
    key: "injectInclude",
    value: function injectInclude() {
      ShaderChunk.lights_fragment_begin = _Shader["default"].lights_fragment_begin;
      ShaderChunk.lights_pars_begin = _Shader["default"].lights_pars_begin;
    }
  }, {
    key: "setupMaterial",
    value: function setupMaterial(material) {
      material.defines = material.defines || {};
      material.defines.USE_CSM = 1;
      material.defines.CSM_CASCADES = this.cascades;

      if (this.fade) {
        material.defines.CSM_FADE = '';
      }

      var breaksVec2 = [];
      var scope = this;
      var shaders = this.shaders;

      material.onBeforeCompile = function (shader) {
        var far = Math.min(scope.camera.far, scope.maxFar);
        scope.getExtendedBreaks(breaksVec2);
        shader.uniforms.CSM_cascades = {
          value: breaksVec2
        };
        shader.uniforms.cameraNear = {
          value: scope.camera.near
        };
        shader.uniforms.shadowFar = {
          value: far
        };
        shaders.set(material, shader);
      };

      shaders.set(material, null);
    }
  }, {
    key: "updateUniforms",
    value: function updateUniforms() {
      var far = Math.min(this.camera.far, this.maxFar);
      var shaders = this.shaders;
      shaders.forEach(function (shader, material) {
        if (shader !== null) {
          var uniforms = shader.uniforms;
          this.getExtendedBreaks(uniforms.CSM_cascades.value);
          uniforms.cameraNear.value = this.camera.near;
          uniforms.shadowFar.value = far;
        }

        if (!this.fade && 'CSM_FADE' in material.defines) {
          delete material.defines.CSM_FADE;
          material.needsUpdate = true;
        } else if (this.fade && !('CSM_FADE' in material.defines)) {
          material.defines.CSM_FADE = '';
          material.needsUpdate = true;
        }
      }, this);
    }
  }, {
    key: "getExtendedBreaks",
    value: function getExtendedBreaks(target) {
      while (target.length < this.breaks.length) {
        target.push(new THREE.Vector2());
      }

      target.length = this.breaks.length;

      for (var i = 0; i < this.cascades; i++) {
        var amount = this.breaks[i];
        var prev = this.breaks[i - 1] || 0;
        target[i].x = prev;
        target[i].y = amount;
      }
    }
  }, {
    key: "updateFrustums",
    value: function updateFrustums() {
      this.getBreaks();
      this.initCascades();
      this.updateShadowBounds();
      this.updateUniforms();
    }
  }, {
    key: "remove",
    value: function remove() {
      for (var i = 0; i < this.lights.length; i++) {
        this.parent.remove(this.lights[i]);
      }
    }
  }, {
    key: "dispose",
    value: function dispose() {
      var shaders = this.shaders;
      shaders.forEach(function (shader, material) {
        delete material.onBeforeCompile;
        delete material.defines.USE_CSM;
        delete material.defines.CSM_CASCADES;
        delete material.defines.CSM_FADE;

        if (shader !== null) {
          delete shader.uniforms.CSM_cascades;
          delete shader.uniforms.cameraNear;
          delete shader.uniforms.shadowFar;
        }

        material.needsUpdate = true;
      });
      shaders.clear();
    }
  }]);

  return CSM;
}();

THREE.CSM = CSM;