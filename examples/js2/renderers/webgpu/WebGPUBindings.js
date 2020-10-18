"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var WebGPUBindings = /*#__PURE__*/function () {
  function WebGPUBindings(device, info, properties, textures, pipelines, computePipelines, attributes) {
    _classCallCheck(this, WebGPUBindings);

    this.device = device;
    this.info = info;
    this.properties = properties;
    this.textures = textures;
    this.pipelines = pipelines;
    this.computePipelines = computePipelines;
    this.attributes = attributes;
    this.uniformsData = new WeakMap();
    this.sharedUniformsGroups = new Map();
    this.updateMap = new WeakMap();

    this._setupSharedUniformsGroups();
  }

  _createClass(WebGPUBindings, [{
    key: "get",
    value: function get(object) {
      var data = this.uniformsData.get(object);

      if (data === undefined) {
        var pipeline = this.pipelines.get(object);
        var material = object.material;
        var bindings;

        if (material.isMeshBasicMaterial) {
          bindings = this._getMeshBasicBindings();
        } else if (material.isPointsMaterial) {
          bindings = this._getPointsBasicBindings();
        } else if (material.isLineBasicMaterial) {
          bindings = this._getLinesBasicBindings();
        } else {
          console.error('THREE.WebGPURenderer: Unknwon shader type.');
        }

        var bindLayout = pipeline.getBindGroupLayout(0);

        var bindGroup = this._createBindGroup(bindings, bindLayout);

        data = {
          layout: bindLayout,
          group: bindGroup,
          bindings: bindings
        };
        this.uniformsData.set(object, data);
      }

      return data;
    }
  }, {
    key: "getForCompute",
    value: function getForCompute(param) {
      var data = this.uniformsData.get(param);

      if (data === undefined) {
        var pipeline = this.computePipelines.get(param);
        var bindings = param.bindings !== undefined ? param.bindings.slice() : [];
        var bindLayout = pipeline.getBindGroupLayout(0);

        var bindGroup = this._createBindGroup(bindings, bindLayout);

        data = {
          layout: bindLayout,
          group: bindGroup,
          bindings: bindings
        };
        this.uniformsData.set(param, data);
      }

      return data;
    }
  }, {
    key: "update",
    value: function update(object, camera) {
      var textures = this.textures;
      var data = this.get(object);
      var bindings = data.bindings;
      var updateMap = this.updateMap;
      var frame = this.info.render.frame;
      var sharedUniformsGroups = this.sharedUniformsGroups;
      var needsBindGroupRefresh = false;

      var _iterator = _createForOfIteratorHelper(bindings),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var binding = _step.value;

          if (binding.isUniformsGroup) {
            var isShared = sharedUniformsGroups.has(binding.name);
            var isUpdated = updateMap.get(binding) === frame;
            if (isShared && isUpdated) continue;
            var array = binding.array;
            var bufferGPU = binding.bufferGPU;
            binding.onBeforeUpdate(object, camera);
            var needsBufferWrite = binding.update();

            if (needsBufferWrite === true) {
              this.device.defaultQueue.writeBuffer(bufferGPU, 0, array, 0);
            }

            updateMap.set(binding, frame);
          } else if (binding.isStorageBuffer) {
            var attribute = binding.attribute;
            this.attributes.update(attribute, false, binding.usage);
          } else if (binding.isSampler) {
            var material = object.material;
            var texture = material[binding.name];

            if (texture !== null) {
              textures.updateSampler(texture);
              var samplerGPU = textures.getSampler(texture);

              if (binding.samplerGPU !== samplerGPU) {
                binding.samplerGPU = samplerGPU;
                needsBindGroupRefresh = true;
              }
            }
          } else if (binding.isSampledTexture) {
            var _material = object.material;
            var _texture = _material[binding.name];

            if (_texture !== null) {
              var forceUpdate = textures.updateTexture(_texture);
              var textureGPU = textures.getTextureGPU(_texture);

              if (binding.textureGPU !== textureGPU || forceUpdate === true) {
                binding.textureGPU = textureGPU;
                needsBindGroupRefresh = true;
              }
            }
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      if (needsBindGroupRefresh === true) {
        data.group = this._createBindGroup(bindings, data.layout);
      }
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this.uniformsData = new WeakMap();
      this.updateMap = new WeakMap();
    }
  }, {
    key: "_createBindGroup",
    value: function _createBindGroup(bindings, layout) {
      var bindingPoint = 0;
      var entries = [];

      var _iterator2 = _createForOfIteratorHelper(bindings),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var binding = _step2.value;

          if (binding.isUniformsGroup) {
            if (binding.bufferGPU === null) {
              var byteLength = binding.getByteLength();
              binding.array = new Float32Array(new ArrayBuffer(byteLength));
              binding.bufferGPU = this.device.createBuffer({
                size: byteLength,
                usage: binding.usage
              });
            }

            entries.push({
              binding: bindingPoint,
              resource: {
                buffer: binding.bufferGPU
              }
            });
          } else if (binding.isStorageBuffer) {
            if (binding.bufferGPU === null) {
              var attribute = binding.attribute;
              this.attributes.update(attribute, false, binding.usage);
              binding.bufferGPU = this.attributes.get(attribute).buffer;
            }

            entries.push({
              binding: bindingPoint,
              resource: {
                buffer: binding.bufferGPU
              }
            });
          } else if (binding.isSampler) {
            if (binding.samplerGPU === null) {
              binding.samplerGPU = this.textures.getDefaultSampler();
            }

            entries.push({
              binding: bindingPoint,
              resource: binding.samplerGPU
            });
          } else if (binding.isSampledTexture) {
            if (binding.textureGPU === null) {
              if (binding.isSampledCubeTexture) {
                binding.textureGPU = this.textures.getDefaultCubeTexture();
              } else {
                binding.textureGPU = this.textures.getDefaultTexture();
              }
            }

            entries.push({
              binding: bindingPoint,
              resource: binding.textureGPU.createView({
                dimension: binding.dimension
              })
            });
          }

          bindingPoint++;
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      return this.device.createBindGroup({
        layout: layout,
        entries: entries
      });
    }
  }, {
    key: "_getMeshBasicBindings",
    value: function _getMeshBasicBindings() {
      var bindings = [];
      var modelViewUniform = new THREE.Matrix4Uniform('modelMatrix');
      var modelViewMatrixUniform = new Matrix4Uniform('modelViewMatrix');
      var normalMatrixUniform = new THREE.Matrix3Uniform('normalMatrix');
      var modelGroup = new THREE.WebGPUUniformsGroup('modelUniforms');
      modelGroup.addUniform(modelViewUniform);
      modelGroup.addUniform(modelViewMatrixUniform);
      modelGroup.addUniform(normalMatrixUniform);
      modelGroup.setOnBeforeUpdate(function (object) {
        modelViewUniform.setValue(object.matrixWorld);
        modelViewMatrixUniform.setValue(object.modelViewMatrix);
        normalMatrixUniform.setValue(object.normalMatrix);
      });
      var cameraGroup = this.sharedUniformsGroups.get('cameraUniforms');
      var opacityUniform = new THREE.FloatUniform('opacity', 1);
      var opacityGroup = new WebGPUUniformsGroup('opacityUniforms');
      opacityGroup.addUniform(opacityUniform);
      opacityGroup.setVisibility(GPUShaderStage.FRAGMENT);
      opacityGroup.setOnBeforeUpdate(function (object) {
        var material = object.material;
        var opacity = material.transparent === true ? material.opacity : 1.0;
        opacityUniform.setValue(opacity);
      });
      var diffuseSampler = new THREE.WebGPUSampler('map');
      var diffuseTexture = new THREE.WebGPUSampledTexture('map');
      bindings.push(modelGroup);
      bindings.push(cameraGroup);
      bindings.push(opacityGroup);
      bindings.push(diffuseSampler);
      bindings.push(diffuseTexture);
      return bindings;
    }
  }, {
    key: "_getPointsBasicBindings",
    value: function _getPointsBasicBindings() {
      var bindings = [];
      var modelViewUniform = new Matrix4Uniform('modelMatrix');
      var modelViewMatrixUniform = new Matrix4Uniform('modelViewMatrix');
      var modelGroup = new WebGPUUniformsGroup('modelUniforms');
      modelGroup.addUniform(modelViewUniform);
      modelGroup.addUniform(modelViewMatrixUniform);
      modelGroup.setOnBeforeUpdate(function (object) {
        modelViewUniform.setValue(object.matrixWorld);
        modelViewMatrixUniform.setValue(object.modelViewMatrix);
      });
      var cameraGroup = this.sharedUniformsGroups.get('cameraUniforms');
      bindings.push(modelGroup);
      bindings.push(cameraGroup);
      return bindings;
    }
  }, {
    key: "_getLinesBasicBindings",
    value: function _getLinesBasicBindings() {
      var bindings = [];
      var modelViewUniform = new Matrix4Uniform('modelMatrix');
      var modelViewMatrixUniform = new Matrix4Uniform('modelViewMatrix');
      var modelGroup = new WebGPUUniformsGroup('modelUniforms');
      modelGroup.addUniform(modelViewUniform);
      modelGroup.addUniform(modelViewMatrixUniform);
      modelGroup.setOnBeforeUpdate(function (object) {
        modelViewUniform.setValue(object.matrixWorld);
        modelViewMatrixUniform.setValue(object.modelViewMatrix);
      });
      var cameraGroup = this.sharedUniformsGroups.get('cameraUniforms');
      bindings.push(modelGroup);
      bindings.push(cameraGroup);
      return bindings;
    }
  }, {
    key: "_setupSharedUniformsGroups",
    value: function _setupSharedUniformsGroups() {
      var projectionMatrixUniform = new Matrix4Uniform('projectionMatrix');
      var viewMatrixUniform = new Matrix4Uniform('viewMatrix');
      var cameraGroup = new WebGPUUniformsGroup('cameraUniforms');
      cameraGroup.addUniform(projectionMatrixUniform);
      cameraGroup.addUniform(viewMatrixUniform);
      cameraGroup.setOnBeforeUpdate(function (object, camera) {
        projectionMatrixUniform.setValue(camera.projectionMatrix);
        viewMatrixUniform.setValue(camera.matrixWorldInverse);
      });
      this.sharedUniformsGroups.set(cameraGroup.name, cameraGroup);
    }
  }]);

  return WebGPUBindings;
}();

var _default = WebGPUBindings;
exports["default"] = _default;