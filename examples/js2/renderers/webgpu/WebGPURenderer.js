"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

console.info('THREE.WebGPURenderer: Modified THREE.Matrix4.makePerspective() and Matrix4.makeOrtographic() to work with WebGPU, see https://github.com/mrdoob/three.js/issues/20276.');

Matrix4.prototype.makePerspective = function (left, right, top, bottom, near, far) {
  var te = this.elements;
  var x = 2 * near / (right - left);
  var y = 2 * near / (top - bottom);
  var a = (right + left) / (right - left);
  var b = (top + bottom) / (top - bottom);
  var c = -far / (far - near);
  var d = -far * near / (far - near);
  te[0] = x;
  te[4] = 0;
  te[8] = a;
  te[12] = 0;
  te[1] = 0;
  te[5] = y;
  te[9] = b;
  te[13] = 0;
  te[2] = 0;
  te[6] = 0;
  te[10] = c;
  te[14] = d;
  te[3] = 0;
  te[7] = 0;
  te[11] = -1;
  te[15] = 0;
  return this;
};

Matrix4.prototype.makeOrthographic = function (left, right, top, bottom, near, far) {
  var te = this.elements;
  var w = 1.0 / (right - left);
  var h = 1.0 / (top - bottom);
  var p = 1.0 / (far - near);
  var x = (right + left) * w;
  var y = (top + bottom) * h;
  var z = near * p;
  te[0] = 2 * w;
  te[4] = 0;
  te[8] = 0;
  te[12] = -x;
  te[1] = 0;
  te[5] = 2 * h;
  te[9] = 0;
  te[13] = -y;
  te[2] = 0;
  te[6] = 0;
  te[10] = -1 * p;
  te[14] = -z;
  te[3] = 0;
  te[7] = 0;
  te[11] = 0;
  te[15] = 1;
  return this;
};

var _frustum = new THREE.Frustum();

var _projScreenMatrix = new Matrix4();

var _vector3 = new THREE.Vector3();

var WebGPURenderer = /*#__PURE__*/function () {
  function WebGPURenderer() {
    var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, WebGPURenderer);

    this.domElement = parameters.canvas !== undefined ? parameters.canvas : document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    this.autoClear = true;
    this.autoClearColor = true;
    this.autoClearDepth = true;
    this.autoClearStencil = true;
    this.sortObjects = true;
    this._parameters = Object.assign({}, parameters);
    this._pixelRatio = 1;
    this._width = this.domElement.width;
    this._height = this.domElement.height;
    this._viewport = null;
    this._scissor = null;
    this._adapter = null;
    this._device = null;
    this._context = null;
    this._swapChain = null;
    this._colorBuffer = null;
    this._depthBuffer = null;
    this._info = null;
    this._properties = null;
    this._attributes = null;
    this._geometries = null;
    this._bindings = null;
    this._objects = null;
    this._renderPipelines = null;
    this._computePipelines = null;
    this._renderLists = null;
    this._textures = null;
    this._background = null;
    this._renderPassDescriptor = null;
    this._currentRenderList = null;
    this._opaqueSort = null;
    this._transparentSort = null;
    this._clearAlpha = 1;
    this._clearColor = new THREE.Color(0x000000);
    this._clearDepth = 1;
    this._clearStencil = 0;
    this._renderTarget = null;
    this._parameters.antialias = parameters.antialias === true;

    if (this._parameters.antialias === true) {
      this._parameters.sampleCount = parameters.sampleCount === undefined ? 4 : parameters.sampleCount;
    } else {
      this._parameters.sampleCount = 1;
    }

    this._parameters.extensions = parameters.extensions === undefined ? [] : parameters.extensions;
    this._parameters.limits = parameters.limits === undefined ? {} : parameters.limits;
  }

  _createClass(WebGPURenderer, [{
    key: "init",
    value: function () {
      var _init = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var parameters, adapterOptions, adapter, deviceDescriptor, device, glslang, compiler, context, swapChain;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                parameters = this._parameters;
                adapterOptions = {
                  powerPreference: parameters.powerPreference
                };
                _context.next = 4;
                return navigator.gpu.requestAdapter(adapterOptions);

              case 4:
                adapter = _context.sent;
                deviceDescriptor = {
                  extensions: parameters.extensions,
                  limits: parameters.limits
                };
                _context.next = 8;
                return adapter.requestDevice(deviceDescriptor);

              case 8:
                device = _context.sent;
                _context.next = 11;
                return Promise.resolve().then(function () {
                  return _interopRequireWildcard(require('https://cdn.jsdelivr.net/npm/@webgpu/glslang@0.0.15/dist/web-devel/glslang.js'));
                });

              case 11:
                glslang = _context.sent;
                _context.next = 14;
                return glslang["default"]();

              case 14:
                compiler = _context.sent;
                context = parameters.context !== undefined ? parameters.context : this.domElement.getContext('gpupresent');
                swapChain = context.configureSwapChain({
                  device: device,
                  format: THREE.GPUTextureFormat.BRGA8Unorm
                });
                this._adapter = adapter;
                this._device = device;
                this._context = context;
                this._swapChain = swapChain;
                this._info = new THREE.WebGPUInfo();
                this._properties = new THREE.WebGPUProperties();
                this._attributes = new THREE.WebGPUAttributes(device);
                this._geometries = new THREE.WebGPUGeometries(this._attributes, this._info);
                this._textures = new THREE.WebGPUTextures(device, this._properties, this._info, compiler);
                this._objects = new THREE.WebGPUObjects(this._geometries, this._info);
                this._renderPipelines = new THREE.WebGPURenderPipelines(this, this._properties, device, compiler, parameters.sampleCount);
                this._computePipelines = new THREE.WebGPUComputePipelines(device, compiler);
                this._bindings = new THREE.WebGPUBindings(device, this._info, this._properties, this._textures, this._renderPipelines, this._computePipelines, this._attributes);
                this._renderLists = new THREE.WebGPURenderLists();
                this._background = new THREE.WebGPUBackground(this);
                this._renderPassDescriptor = {
                  colorAttachments: [{
                    attachment: null
                  }],
                  depthStencilAttachment: {
                    attachment: null,
                    depthStoreOp: THREE.GPUStoreOp.Store,
                    stencilStoreOp: GPUStoreOp.Store
                  }
                };

                this._setupColorBuffer();

                this._setupDepthBuffer();

              case 35:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function init() {
        return _init.apply(this, arguments);
      }

      return init;
    }()
  }, {
    key: "render",
    value: function render(scene, camera) {
      if (scene.autoUpdate === true) scene.updateMatrixWorld();
      if (camera.parent === null) camera.updateMatrixWorld();
      if (this._info.autoReset === true) this._info.reset();

      _projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);

      _frustum.setFromProjectionMatrix(_projScreenMatrix);

      this._currentRenderList = this._renderLists.get(scene, camera);

      this._currentRenderList.init();

      this._projectObject(scene, camera, 0);

      this._currentRenderList.finish();

      if (this.sortObjects === true) {
        this._currentRenderList.sort(this._opaqueSort, this._transparentSort);
      }

      var colorAttachment = this._renderPassDescriptor.colorAttachments[0];
      var depthStencilAttachment = this._renderPassDescriptor.depthStencilAttachment;
      var renderTarget = this._renderTarget;

      if (renderTarget !== null) {
        var renderTargetProperties = this._properties.get(renderTarget);

        colorAttachment.attachment = renderTargetProperties.colorTextureGPU.createView();
        depthStencilAttachment.attachment = renderTargetProperties.depthTextureGPU.createView();
      } else {
        if (this._parameters.antialias === true) {
          colorAttachment.attachment = this._colorBuffer.createView();
          colorAttachment.resolveTarget = this._swapChain.getCurrentTexture().createView();
        } else {
          colorAttachment.attachment = this._swapChain.getCurrentTexture().createView();
          colorAttachment.resolveTarget = undefined;
        }

        depthStencilAttachment.attachment = this._depthBuffer.createView();
      }

      this._background.update(scene);

      var device = this._device;
      var cmdEncoder = device.createCommandEncoder({});
      var passEncoder = cmdEncoder.beginRenderPass(this._renderPassDescriptor);
      var vp = this._viewport;

      if (vp !== null) {
        var width = Math.floor(vp.width * this._pixelRatio);
        var height = Math.floor(vp.height * this._pixelRatio);
        passEncoder.setViewport(vp.x, vp.y, width, height, vp.minDepth, vp.maxDepth);
      }

      var sc = this._scissor;

      if (sc !== null) {
        var _width = Math.floor(sc.width * this._pixelRatio);

        var _height = Math.floor(sc.height * this._pixelRatio);

        passEncoder.setScissorRect(sc.x, sc.y, _width, _height);
      }

      var opaqueObjects = this._currentRenderList.opaque;
      var transparentObjects = this._currentRenderList.transparent;
      if (opaqueObjects.length > 0) this._renderObjects(opaqueObjects, camera, passEncoder);
      if (transparentObjects.length > 0) this._renderObjects(transparentObjects, camera, passEncoder);
      passEncoder.endPass();
      device.defaultQueue.submit([cmdEncoder.finish()]);
    }
  }, {
    key: "getContext",
    value: function getContext() {
      return this._context;
    }
  }, {
    key: "getPixelRatio",
    value: function getPixelRatio() {
      return this._pixelRatio;
    }
  }, {
    key: "getDrawingBufferSize",
    value: function getDrawingBufferSize(target) {
      return target.set(this._width * this._pixelRatio, this._height * this._pixelRatio).floor();
    }
  }, {
    key: "getSize",
    value: function getSize(target) {
      return target.set(this._width, this._height);
    }
  }, {
    key: "setPixelRatio",
    value: function setPixelRatio() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      this._pixelRatio = value;
      this.setSize(this._width, this._height, false);
    }
  }, {
    key: "setDrawingBufferSize",
    value: function setDrawingBufferSize(width, height, pixelRatio) {
      this._width = width;
      this._height = height;
      this._pixelRatio = pixelRatio;
      this.domElement.width = Math.floor(width * pixelRatio);
      this.domElement.height = Math.floor(height * pixelRatio);

      this._setupColorBuffer();

      this._setupDepthBuffer();
    }
  }, {
    key: "setSize",
    value: function setSize(width, height) {
      var updateStyle = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      this._width = width;
      this._height = height;
      this.domElement.width = Math.floor(width * this._pixelRatio);
      this.domElement.height = Math.floor(height * this._pixelRatio);

      if (updateStyle === true) {
        this.domElement.style.width = width + 'px';
        this.domElement.style.height = height + 'px';
      }

      this._setupColorBuffer();

      this._setupDepthBuffer();
    }
  }, {
    key: "setOpaqueSort",
    value: function setOpaqueSort(method) {
      this._opaqueSort = method;
    }
  }, {
    key: "setTransparentSort",
    value: function setTransparentSort(method) {
      this._transparentSort = method;
    }
  }, {
    key: "getScissor",
    value: function getScissor(target) {
      var scissor = this._scissor;
      target.x = scissor.x;
      target.y = scissor.y;
      target.width = scissor.width;
      target.height = scissor.height;
      return target;
    }
  }, {
    key: "setScissor",
    value: function setScissor(x, y, width, height) {
      if (x === null) {
        this._scissor = null;
      } else {
        this._scissor = {
          x: x,
          y: y,
          width: width,
          height: height
        };
      }
    }
  }, {
    key: "getViewport",
    value: function getViewport(target) {
      var viewport = this._viewport;
      target.x = viewport.x;
      target.y = viewport.y;
      target.width = viewport.width;
      target.height = viewport.height;
      target.minDepth = viewport.minDepth;
      target.maxDepth = viewport.maxDepth;
      return target;
    }
  }, {
    key: "setViewport",
    value: function setViewport(x, y, width, height) {
      var minDepth = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
      var maxDepth = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1;

      if (x === null) {
        this._viewport = null;
      } else {
        this._viewport = {
          x: x,
          y: y,
          width: width,
          height: height,
          minDepth: minDepth,
          maxDepth: maxDepth
        };
      }
    }
  }, {
    key: "getClearColor",
    value: function getClearColor() {
      return this._clearColor;
    }
  }, {
    key: "setClearColor",
    value: function setClearColor(color) {
      var alpha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

      this._clearColor.set(color);

      this._clearAlpha = alpha;
    }
  }, {
    key: "getClearAlpha",
    value: function getClearAlpha() {
      return this._clearAlpha;
    }
  }, {
    key: "setClearAlpha",
    value: function setClearAlpha(alpha) {
      this._clearAlpha = alpha;
    }
  }, {
    key: "getClearDepth",
    value: function getClearDepth() {
      return this._clearDepth;
    }
  }, {
    key: "setClearDepth",
    value: function setClearDepth(depth) {
      this._clearDepth = depth;
    }
  }, {
    key: "getClearStencil",
    value: function getClearStencil() {
      return this._clearStencil;
    }
  }, {
    key: "setClearStencil",
    value: function setClearStencil(stencil) {
      this._clearStencil = stencil;
    }
  }, {
    key: "clear",
    value: function clear() {
      this._background.clear();
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this._objects.dispose();

      this._properties.dispose();

      this._renderPipelines.dispose();

      this._computePipelines.dispose();

      this._bindings.dispose();

      this._info.dispose();

      this._renderLists.dispose();

      this._textures.dispose();
    }
  }, {
    key: "setRenderTarget",
    value: function setRenderTarget(renderTarget) {
      this._renderTarget = renderTarget;

      if (renderTarget !== null) {
        this._textures.initRenderTarget(renderTarget);
      }
    }
  }, {
    key: "compute",
    value: function compute(computeParams) {
      var device = this._device;
      var cmdEncoder = device.createCommandEncoder({});
      var passEncoder = cmdEncoder.beginComputePass();

      var _iterator = _createForOfIteratorHelper(computeParams),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var param = _step.value;

          var pipeline = this._computePipelines.get(param);

          passEncoder.setPipeline(pipeline);

          var bindGroup = this._bindings.getForCompute(param).group;

          this._bindings.update(param);

          passEncoder.setBindGroup(0, bindGroup);
          passEncoder.dispatch(param.num);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      passEncoder.endPass();
      device.defaultQueue.submit([cmdEncoder.finish()]);
    }
  }, {
    key: "getRenderTarget",
    value: function getRenderTarget() {
      return this._renderTarget;
    }
  }, {
    key: "_projectObject",
    value: function _projectObject(object, camera, groupOrder) {
      var info = this._info;
      var currentRenderList = this._currentRenderList;
      if (object.visible === false) return;
      var visible = object.layers.test(camera.layers);

      if (visible) {
        if (object.isGroup) {
          groupOrder = object.renderOrder;
        } else if (object.isLOD) {
          if (object.autoUpdate === true) object.update(camera);
        } else if (object.isLight) {
          if (object.castShadow) {}
        } else if (object.isSprite) {
          if (!object.frustumCulled || _frustum.intersectsSprite(object)) {
            if (this.sortObjects === true) {
              _vector3.setFromMatrixPosition(object.matrixWorld).applyMatrix4(_projScreenMatrix);
            }

            var geometry = object.geometry;
            var material = object.material;

            if (material.visible) {
              currentRenderList.push(object, geometry, material, groupOrder, _vector3.z, null);
            }
          }
        } else if (object.isLineLoop) {
          console.error('THREE.WebGPURenderer: Objects of type THREE.LineLoop are not supported. Please use THREE.Line or THREE.LineSegments.');
        } else if (object.isMesh || object.isLine || object.isPoints) {
          if (object.isSkinnedMesh) {
            if (object.skeleton.frame !== info.render.frame) {
              object.skeleton.update();
              object.skeleton.frame = info.render.frame;
            }
          }

          if (!object.frustumCulled || _frustum.intersectsObject(object)) {
            if (this.sortObjects === true) {
              _vector3.setFromMatrixPosition(object.matrixWorld).applyMatrix4(_projScreenMatrix);
            }

            var _geometry = object.geometry;
            var _material = object.material;

            if (Array.isArray(_material)) {
              var groups = _geometry.groups;

              for (var i = 0, l = groups.length; i < l; i++) {
                var group = groups[i];
                var groupMaterial = _material[group.materialIndex];

                if (groupMaterial && groupMaterial.visible) {
                  currentRenderList.push(object, _geometry, groupMaterial, groupOrder, _vector3.z, group);
                }
              }
            } else if (_material.visible) {
              currentRenderList.push(object, _geometry, _material, groupOrder, _vector3.z, null);
            }
          }
        }
      }

      var children = object.children;

      for (var _i = 0, _l = children.length; _i < _l; _i++) {
        this._projectObject(children[_i], camera, groupOrder);
      }
    }
  }, {
    key: "_renderObjects",
    value: function _renderObjects(renderList, camera, passEncoder) {
      for (var i = 0, il = renderList.length; i < il; i++) {
        var renderItem = renderList[i];
        var object = renderItem.object;
        object.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, object.matrixWorld);
        object.normalMatrix.getNormalMatrix(object.modelViewMatrix);

        this._objects.update(object);

        if (camera.isArrayCamera) {
          var cameras = camera.cameras;

          for (var j = 0, jl = cameras.length; j < jl; j++) {
            var camera2 = cameras[j];

            if (object.layers.test(camera2.layers)) {
              var vp = camera2.viewport;
              var minDepth = vp.minDepth === undefined ? 0 : vp.minDepth;
              var maxDepth = vp.maxDepth === undefined ? 1 : vp.maxDepth;
              passEncoder.setViewport(vp.x, vp.y, vp.width, vp.height, minDepth, maxDepth);

              this._bindings.update(object, camera2);

              this._renderObject(object, passEncoder);
            }
          }
        } else {
          this._bindings.update(object, camera);

          this._renderObject(object, passEncoder);
        }
      }
    }
  }, {
    key: "_renderObject",
    value: function _renderObject(object, passEncoder) {
      var info = this._info;

      var pipeline = this._renderPipelines.get(object);

      passEncoder.setPipeline(pipeline);

      var bindGroup = this._bindings.get(object).group;

      passEncoder.setBindGroup(0, bindGroup);
      var geometry = object.geometry;
      var index = geometry.index;
      var hasIndex = index !== null;

      if (hasIndex === true) {
        this._setupIndexBuffer(index, passEncoder);
      }

      this._setupVertexBuffers(geometry.attributes, passEncoder, pipeline);

      var drawRange = geometry.drawRange;
      var firstVertex = drawRange.start;
      var instanceCount = geometry.isInstancedBufferGeometry ? geometry.instanceCount : 1;

      if (hasIndex === true) {
        var indexCount = drawRange.count !== Infinity ? drawRange.count : index.count;
        passEncoder.drawIndexed(indexCount, instanceCount, firstVertex, 0, 0);
        info.update(object, indexCount, instanceCount);
      } else {
        var positionAttribute = geometry.attributes.position;
        var vertexCount = drawRange.count !== Infinity ? drawRange.count : positionAttribute.count;
        passEncoder.draw(vertexCount, instanceCount, firstVertex, 0);
        info.update(object, vertexCount, instanceCount);
      }
    }
  }, {
    key: "_setupIndexBuffer",
    value: function _setupIndexBuffer(index, encoder) {
      var buffer = this._attributes.get(index).buffer;

      var indexFormat = index.array instanceof Uint16Array ? THREE.GPUIndexFormat.Uint16 : GPUIndexFormat.Uint32;
      encoder.setIndexBuffer(buffer, indexFormat);
    }
  }, {
    key: "_setupVertexBuffers",
    value: function _setupVertexBuffers(geometryAttributes, encoder, pipeline) {
      var shaderAttributes = this._renderPipelines.getShaderAttributes(pipeline);

      var _iterator2 = _createForOfIteratorHelper(shaderAttributes),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var shaderAttribute = _step2.value;
          var name = shaderAttribute.name;
          var slot = shaderAttribute.slot;
          var attribute = geometryAttributes[name];

          if (attribute !== undefined) {
            var buffer = this._attributes.get(attribute).buffer;

            encoder.setVertexBuffer(slot, buffer);
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }, {
    key: "_setupColorBuffer",
    value: function _setupColorBuffer() {
      var device = this._device;

      if (device) {
        if (this._colorBuffer) this._colorBuffer.destroy();
        this._colorBuffer = this._device.createTexture({
          size: {
            width: this._width * this._pixelRatio,
            height: this._height * this._pixelRatio,
            depth: 1
          },
          sampleCount: this._parameters.sampleCount,
          format: GPUTextureFormat.BRGA8Unorm,
          usage: GPUTextureUsage.OUTPUT_ATTACHMENT
        });
      }
    }
  }, {
    key: "_setupDepthBuffer",
    value: function _setupDepthBuffer() {
      var device = this._device;

      if (device) {
        if (this._depthBuffer) this._depthBuffer.destroy();
        this._depthBuffer = this._device.createTexture({
          size: {
            width: this._width * this._pixelRatio,
            height: this._height * this._pixelRatio,
            depth: 1
          },
          sampleCount: this._parameters.sampleCount,
          format: GPUTextureFormat.Depth24PlusStencil8,
          usage: GPUTextureUsage.OUTPUT_ATTACHMENT
        });
      }
    }
  }]);

  return WebGPURenderer;
}();

var _default = WebGPURenderer;
exports["default"] = _default;