"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _wrapRegExp(re, groups) { _wrapRegExp = function _wrapRegExp(re, groups) { return new BabelRegExp(re, undefined, groups); }; var _RegExp = _wrapNativeSuper(RegExp); var _super = RegExp.prototype; var _groups = new WeakMap(); function BabelRegExp(re, flags, groups) { var _this = _RegExp.call(this, re, flags); _groups.set(_this, groups || _groups.get(re)); return _this; } _inherits(BabelRegExp, _RegExp); BabelRegExp.prototype.exec = function (str) { var result = _super.exec.call(this, str); if (result) result.groups = buildGroups(result, this); return result; }; BabelRegExp.prototype[Symbol.replace] = function (str, substitution) { if (typeof substitution === "string") { var groups = _groups.get(this); return _super[Symbol.replace].call(this, str, substitution.replace(/\$<([^>]+)>/g, function (_, name) { return "$" + groups[name]; })); } else if (typeof substitution === "function") { var _this = this; return _super[Symbol.replace].call(this, str, function () { var args = []; args.push.apply(args, arguments); if (_typeof(args[args.length - 1]) !== "object") { args.push(buildGroups(args, _this)); } return substitution.apply(this, args); }); } else { return _super[Symbol.replace].call(this, str, substitution); } }; function buildGroups(result, re) { var g = _groups.get(re); return Object.keys(g).reduce(function (groups, name) { groups[name] = result[g[name]]; return groups; }, Object.create(null)); } return _wrapRegExp.apply(this, arguments); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var WebGPURenderPipelines = /*#__PURE__*/function () {
  function WebGPURenderPipelines(renderer, properties, device, glslang, sampleCount) {
    _classCallCheck(this, WebGPURenderPipelines);

    this.renderer = renderer;
    this.properties = properties;
    this.device = device;
    this.glslang = glslang;
    this.sampleCount = sampleCount;
    this.pipelines = new WeakMap();
    this.shaderAttributes = new WeakMap();
    this.shaderModules = {
      vertex: new WeakMap(),
      fragment: new WeakMap()
    };
  }

  _createClass(WebGPURenderPipelines, [{
    key: "get",
    value: function get(object) {
      var pipeline = this.pipelines.get(object);

      if (pipeline === undefined) {
        var device = this.device;
        var material = object.material;
        var shader;

        if (material.isMeshBasicMaterial) {
          shader = ShaderLib.mesh_basic;
        } else if (material.isPointsMaterial) {
          shader = ShaderLib.points_basic;
        } else if (material.isLineBasicMaterial) {
          shader = ShaderLib.line_basic;
        } else {
          console.error('THREE.WebGPURenderer: Unknwon shader type.');
        }

        var glslang = this.glslang;
        var moduleVertex = this.shaderModules.vertex.get(shader);

        if (moduleVertex === undefined) {
          var byteCodeVertex = glslang.compileGLSL(shader.vertexShader, 'vertex');
          moduleVertex = {
            module: device.createShaderModule({
              code: byteCodeVertex
            }),
            entryPoint: 'main'
          };
          this.shaderModules.vertex.set(shader, moduleVertex);
        }

        var moduleFragment = this.shaderModules.fragment.get(shader);

        if (moduleFragment === undefined) {
          var byteCodeFragment = glslang.compileGLSL(shader.fragmentShader, 'fragment');
          moduleFragment = {
            module: device.createShaderModule({
              code: byteCodeFragment
            }),
            entryPoint: 'main'
          };
          this.shaderModules.fragment.set(shader, moduleFragment);
        }

        var shaderAttributes = this._parseShaderAttributes(shader.vertexShader);

        var vertexBuffers = [];
        var geometry = object.geometry;

        var _iterator = _createForOfIteratorHelper(shaderAttributes),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var attribute = _step.value;
            var name = attribute.name;
            var geometryAttribute = geometry.getAttribute(name);
            var stepMode = geometryAttribute !== undefined && geometryAttribute.isInstancedBufferAttribute ? THREE.GPUInputStepMode.Instance : GPUInputStepMode.Vertex;
            vertexBuffers.push({
              arrayStride: attribute.arrayStride,
              attributes: [{
                shaderLocation: attribute.slot,
                offset: 0,
                format: attribute.format
              }],
              stepMode: stepMode
            });
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        var indexFormat;

        if (object.isLine) {
          var count = geometry.index ? geometry.index.count : geometry.attributes.position.count;
          indexFormat = count > 65535 ? THREE.GPUIndexFormat.Uint32 : GPUIndexFormat.Uint16;
        }

        var alphaBlend = {};
        var colorBlend = {};

        if (material.transparent === true && material.blending !== NoBlending) {
          alphaBlend = this._getAlphaBlend(material);
          colorBlend = this._getColorBlend(material);
        }

        var stencilFront = {};

        if (material.stencilWrite === true) {
          stencilFront = {
            compare: this._getStencilCompare(material),
            failOp: this._getStencilOperation(material.stencilFail),
            depthFailOp: this._getStencilOperation(material.stencilZFail),
            passOp: this._getStencilOperation(material.stencilZPass)
          };
        }

        var primitiveTopology = this._getPrimitiveTopology(object);

        var rasterizationState = this._getRasterizationStateDescriptor(material);

        var colorWriteMask = this._getColorWriteMask(material);

        var depthCompare = this._getDepthCompare(material);

        var colorFormat = this._getColorFormat(this.renderer);

        var depthStencilFormat = this._getDepthStencilFormat(this.renderer);

        pipeline = device.createRenderPipeline({
          vertexStage: moduleVertex,
          fragmentStage: moduleFragment,
          primitiveTopology: primitiveTopology,
          rasterizationState: rasterizationState,
          colorStates: [{
            format: colorFormat,
            alphaBlend: alphaBlend,
            colorBlend: colorBlend,
            writeMask: colorWriteMask
          }],
          depthStencilState: {
            format: depthStencilFormat,
            depthWriteEnabled: material.depthWrite,
            depthCompare: depthCompare,
            stencilFront: stencilFront,
            stencilBack: {},
            stencilReadMask: material.stencilFuncMask,
            stencilWriteMask: material.stencilWriteMask
          },
          vertexState: {
            indexFormat: indexFormat,
            vertexBuffers: vertexBuffers
          },
          sampleCount: this.sampleCount
        });
        this.pipelines.set(object, pipeline);
        this.shaderAttributes.set(pipeline, shaderAttributes);
      }

      return pipeline;
    }
  }, {
    key: "getShaderAttributes",
    value: function getShaderAttributes(pipeline) {
      return this.shaderAttributes.get(pipeline);
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this.pipelines = new WeakMap();
      this.shaderAttributes = new WeakMap();
      this.shaderModules = {
        vertex: new WeakMap(),
        fragment: new WeakMap()
      };
    }
  }, {
    key: "_getArrayStride",
    value: function _getArrayStride(type) {
      if (type === 'float') return 4;
      if (type === 'vec2') return 8;
      if (type === 'vec3') return 12;
      if (type === 'vec4') return 16;
      if (type === 'int') return 4;
      if (type === 'ivec2') return 8;
      if (type === 'ivec3') return 12;
      if (type === 'ivec4') return 16;
      if (type === 'uint') return 4;
      if (type === 'uvec2') return 8;
      if (type === 'uvec3') return 12;
      if (type === 'uvec4') return 16;
      console.error('THREE.WebGPURenderer: Shader variable type not supported yet.', type);
    }
  }, {
    key: "_getAlphaBlend",
    value: function _getAlphaBlend(material) {
      var blending = material.blending;
      var premultipliedAlpha = material.premultipliedAlpha;
      var alphaBlend = undefined;

      switch (blending) {
        case NormalBlending:
          if (premultipliedAlpha === false) {
            alphaBlend = {
              srcFactor: THREE.GPUBlendFactor.One,
              dstFactor: GPUBlendFactor.OneMinusSrcAlpha,
              operation: THREE.GPUBlendOperation.Add
            };
          }

          break;

        case AdditiveBlending:
          break;

        case SubtractiveBlending:
          if (premultipliedAlpha === true) {
            alphaBlend = {
              srcFactor: GPUBlendFactor.OneMinusSrcColor,
              dstFactor: GPUBlendFactor.OneMinusSrcAlpha,
              operation: GPUBlendOperation.Add
            };
          }

          break;

        case MultiplyBlending:
          if (premultipliedAlpha === true) {
            alphaBlend = {
              srcFactor: GPUBlendFactor.Zero,
              dstFactor: GPUBlendFactor.SrcAlpha,
              operation: GPUBlendOperation.Add
            };
          }

          break;

        case CustomBlending:
          var blendSrcAlpha = material.blendSrcAlpha;
          var blendDstAlpha = material.blendDstAlpha;
          var blendEquationAlpha = material.blendEquationAlpha;

          if (blendSrcAlpha !== null && blendDstAlpha !== null && blendEquationAlpha !== null) {
            alphaBlend = {
              srcFactor: this._getBlendFactor(blendSrcAlpha),
              dstFactor: this._getBlendFactor(blendDstAlpha),
              operation: this._getBlendOperation(blendEquationAlpha)
            };
          }

          break;

        default:
          console.error('THREE.WebGPURenderer: Blending not supported.', blending);
      }

      return alphaBlend;
    }
  }, {
    key: "_getBlendFactor",
    value: function _getBlendFactor(blend) {
      var blendFactor;

      switch (blend) {
        case ZeroFactor:
          blendFactor = GPUBlendFactor.Zero;
          break;

        case OneFactor:
          blendFactor = GPUBlendFactor.One;
          break;

        case SrcColorFactor:
          blendFactor = GPUBlendFactor.SrcColor;
          break;

        case OneMinusSrcColorFactor:
          blendFactor = GPUBlendFactor.OneMinusSrcColor;
          break;

        case SrcAlphaFactor:
          blendFactor = GPUBlendFactor.SrcAlpha;
          break;

        case OneMinusSrcAlphaFactor:
          blendFactor = GPUBlendFactor.OneMinusSrcAlpha;
          break;

        case DstColorFactor:
          blendFactor = GPUBlendFactor.DstColor;
          break;

        case OneMinusDstColorFactor:
          blendFactor = GPUBlendFactor.OneMinusDstColor;
          break;

        case DstAlphaFactor:
          blendFactor = GPUBlendFactor.DstAlpha;
          break;

        case OneMinusDstAlphaFactor:
          blendFactor = GPUBlendFactor.OneMinusDstAlpha;
          break;

        case SrcAlphaSaturateFactor:
          blendFactor = GPUBlendFactor.SrcAlphaSaturated;
          break;

        case BlendColorFactor:
          blendFactor = GPUBlendFactor.BlendColor;
          break;

        case OneMinusBlendColorFactor:
          blendFactor = GPUBlendFactor.OneMinusBlendColor;
          break;

        default:
          console.error('THREE.WebGPURenderer: Blend factor not supported.', blend);
      }

      return blendFactor;
    }
  }, {
    key: "_getBlendOperation",
    value: function _getBlendOperation(blendEquation) {
      var blendOperation;

      switch (blendEquation) {
        case AddEquation:
          blendOperation = GPUBlendOperation.Add;
          break;

        case SubtractEquation:
          blendOperation = GPUBlendOperation.Subtract;
          break;

        case ReverseSubtractEquation:
          blendOperation = GPUBlendOperation.ReverseSubtract;
          break;

        case MinEquation:
          blendOperation = GPUBlendOperation.Min;
          break;

        case MaxEquation:
          blendOperation = GPUBlendOperation.Max;
          break;

        default:
          console.error('THREE.WebGPURenderer: Blend equation not supported.', blendEquation);
      }

      return blendOperation;
    }
  }, {
    key: "_getColorBlend",
    value: function _getColorBlend(material) {
      var blending = material.blending;
      var premultipliedAlpha = material.premultipliedAlpha;
      var colorBlend = {
        srcFactor: null,
        dstFactor: null,
        operation: null
      };

      switch (blending) {
        case NormalBlending:
          colorBlend.srcFactor = premultipliedAlpha === true ? GPUBlendFactor.One : GPUBlendFactor.SrcAlpha;
          colorBlend.dstFactor = GPUBlendFactor.OneMinusSrcAlpha;
          colorBlend.operation = GPUBlendOperation.Add;
          break;

        case AdditiveBlending:
          colorBlend.srcFactor = premultipliedAlpha === true ? GPUBlendFactor.One : GPUBlendFactor.SrcAlpha;
          colorBlend.operation = GPUBlendOperation.Add;
          break;

        case SubtractiveBlending:
          colorBlend.srcFactor = GPUBlendFactor.Zero;
          colorBlend.dstFactor = premultipliedAlpha === true ? GPUBlendFactor.Zero : GPUBlendFactor.OneMinusSrcColor;
          colorBlend.operation = GPUBlendOperation.Add;
          break;

        case MultiplyBlending:
          colorBlend.srcFactor = GPUBlendFactor.Zero;
          colorBlend.dstFactor = GPUBlendFactor.SrcColor;
          colorBlend.operation = GPUBlendOperation.Add;
          break;

        case CustomBlending:
          colorBlend.srcFactor = this._getBlendFactor(material.blendSrc);
          colorBlend.dstFactor = this._getBlendFactor(material.blendDst);
          colorBlend.operation = this._getBlendOperation(material.blendEquation);
          break;

        default:
          console.error('THREE.WebGPURenderer: Blending not supported.', blending);
      }

      return colorBlend;
    }
  }, {
    key: "_getColorFormat",
    value: function _getColorFormat(renderer) {
      var format;
      var renderTarget = renderer.getRenderTarget();

      if (renderTarget !== null) {
        var renderTargetProperties = this.properties.get(renderTarget);
        format = renderTargetProperties.colorTextureFormat;
      } else {
        format = THREE.GPUTextureFormat.BRGA8Unorm;
      }

      return format;
    }
  }, {
    key: "_getColorWriteMask",
    value: function _getColorWriteMask(material) {
      return material.colorWrite === true ? THREE.GPUColorWriteFlags.All : GPUColorWriteFlags.None;
    }
  }, {
    key: "_getDepthCompare",
    value: function _getDepthCompare(material) {
      var depthCompare;

      if (material.depthTest === false) {
        depthCompare = THREE.GPUCompareFunction.Always;
      } else {
        var depthFunc = material.depthFunc;

        switch (depthFunc) {
          case NeverDepth:
            depthCompare = GPUCompareFunction.Never;
            break;

          case AlwaysDepth:
            depthCompare = GPUCompareFunction.Always;
            break;

          case LessDepth:
            depthCompare = GPUCompareFunction.Less;
            break;

          case LessEqualDepth:
            depthCompare = GPUCompareFunction.LessEqual;
            break;

          case EqualDepth:
            depthCompare = GPUCompareFunction.Equal;
            break;

          case GreaterEqualDepth:
            depthCompare = GPUCompareFunction.GreaterEqual;
            break;

          case GreaterDepth:
            depthCompare = GPUCompareFunction.Greater;
            break;

          case NotEqualDepth:
            depthCompare = GPUCompareFunction.NotEqual;
            break;

          default:
            console.error('THREE.WebGPURenderer: Invalid depth function.', depthFunc);
        }
      }

      return depthCompare;
    }
  }, {
    key: "_getDepthStencilFormat",
    value: function _getDepthStencilFormat(renderer) {
      var format;
      var renderTarget = renderer.getRenderTarget();

      if (renderTarget !== null) {
        var renderTargetProperties = this.properties.get(renderTarget);
        format = renderTargetProperties.depthTextureFormat;
      } else {
        format = GPUTextureFormat.Depth24PlusStencil8;
      }

      return format;
    }
  }, {
    key: "_getPrimitiveTopology",
    value: function _getPrimitiveTopology(object) {
      if (object.isMesh) return THREE.GPUPrimitiveTopology.TriangleList;else if (object.isPoints) return GPUPrimitiveTopology.PointList;else if (object.isLine) return GPUPrimitiveTopology.LineStrip;else if (object.isLineSegments) return GPUPrimitiveTopology.LineList;
    }
  }, {
    key: "_getRasterizationStateDescriptor",
    value: function _getRasterizationStateDescriptor(material) {
      var descriptor = {};

      switch (material.side) {
        case FrontSide:
          descriptor.frontFace = THREE.GPUFrontFace.CCW;
          descriptor.cullMode = THREE.GPUCullMode.Back;
          break;

        case BackSide:
          descriptor.frontFace = GPUFrontFace.CW;
          descriptor.cullMode = GPUCullMode.Back;
          break;

        case DoubleSide:
          descriptor.frontFace = GPUFrontFace.CCW;
          descriptor.cullMode = GPUCullMode.None;
          break;

        default:
          console.error('THREE.WebGPURenderer: Unknown Material.side value.', material.side);
          break;
      }

      return descriptor;
    }
  }, {
    key: "_getStencilCompare",
    value: function _getStencilCompare(material) {
      var stencilCompare;
      var stencilFunc = material.stencilFunc;

      switch (stencilFunc) {
        case NeverStencilFunc:
          stencilCompare = GPUCompareFunction.Never;
          break;

        case AlwaysStencilFunc:
          stencilCompare = GPUCompareFunction.Always;
          break;

        case LessStencilFunc:
          stencilCompare = GPUCompareFunction.Less;
          break;

        case LessEqualStencilFunc:
          stencilCompare = GPUCompareFunction.LessEqual;
          break;

        case EqualStencilFunc:
          stencilCompare = GPUCompareFunction.Equal;
          break;

        case GreaterEqualStencilFunc:
          stencilCompare = GPUCompareFunction.GreaterEqual;
          break;

        case GreaterStencilFunc:
          stencilCompare = GPUCompareFunction.Greater;
          break;

        case NotEqualStencilFunc:
          stencilCompare = GPUCompareFunction.NotEqual;
          break;

        default:
          console.error('THREE.WebGPURenderer: Invalid stencil function.', stencilFunc);
      }

      return stencilCompare;
    }
  }, {
    key: "_getStencilOperation",
    value: function _getStencilOperation(op) {
      var stencilOperation;

      switch (op) {
        case KeepStencilOp:
          stencilOperation = THREE.GPUStencilOperation.Keep;
          break;

        case ZeroStencilOp:
          stencilOperation = GPUStencilOperation.Zero;
          break;

        case ReplaceStencilOp:
          stencilOperation = GPUStencilOperation.Replace;
          break;

        case InvertStencilOp:
          stencilOperation = GPUStencilOperation.Invert;
          break;

        case IncrementStencilOp:
          stencilOperation = GPUStencilOperation.IncrementClamp;
          break;

        case DecrementStencilOp:
          stencilOperation = GPUStencilOperation.DecrementClamp;
          break;

        case IncrementWrapStencilOp:
          stencilOperation = GPUStencilOperation.IncrementWrap;
          break;

        case DecrementWrapStencilOp:
          stencilOperation = GPUStencilOperation.DecrementWrap;
          break;

        default:
          console.error('THREE.WebGPURenderer: Invalid stencil operation.', stencilOperation);
      }

      return stencilOperation;
    }
  }, {
    key: "_getVertexFormat",
    value: function _getVertexFormat(type) {
      if (type === 'float') return THREE.GPUVertexFormat.Float;
      if (type === 'vec2') return GPUVertexFormat.Float2;
      if (type === 'vec3') return GPUVertexFormat.Float3;
      if (type === 'vec4') return GPUVertexFormat.Float4;
      if (type === 'int') return GPUVertexFormat.Int;
      if (type === 'ivec2') return GPUVertexFormat.Int2;
      if (type === 'ivec3') return GPUVertexFormat.Int3;
      if (type === 'ivec4') return GPUVertexFormat.Int4;
      if (type === 'uint') return GPUVertexFormat.UInt;
      if (type === 'uvec2') return GPUVertexFormat.UInt2;
      if (type === 'uvec3') return GPUVertexFormat.UInt3;
      if (type === 'uvec4') return GPUVertexFormat.UInt4;
      console.error('THREE.WebGPURenderer: Shader variable type not supported yet.', type);
    }
  }, {
    key: "_parseShaderAttributes",
    value: function _parseShaderAttributes(shader) {
      var regex = /*#__PURE__*/_wrapRegExp(/^[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*layout[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*\([\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*location[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*=[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*([0-9]+)[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*\)[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*in[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+([0-9A-Z_a-z]+)[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+([0-9A-Z_a-z]+)[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*;/gmi, {
        location: 1,
        type: 2,
        name: 3
      });

      var shaderAttribute = null;
      var attributes = [];

      while (shaderAttribute = regex.exec(shader)) {
        var shaderLocation = parseInt(shaderAttribute.groups.location);

        var arrayStride = this._getArrayStride(shaderAttribute.groups.type);

        var vertexFormat = this._getVertexFormat(shaderAttribute.groups.type);

        attributes.push({
          name: shaderAttribute.groups.name,
          arrayStride: arrayStride,
          slot: shaderLocation,
          format: vertexFormat
        });
      }

      return attributes.sort(function (a, b) {
        return a.slot - b.slot;
      });
    }
  }]);

  return WebGPURenderPipelines;
}();

var ShaderLib = {
  mesh_basic: {
    vertexShader: "#version 450\t\tlayout(location = 0) in vec3 position;\t\tlayout(location = 1) in vec2 uv;\t\tlayout(location = 0) out vec2 vUv;\t\tlayout(set = 0, binding = 0) uniform ModelUniforms {\t\t\tmat4 modelMatrix;\t\t\tmat4 modelViewMatrix;\t\t\tmat3 normalMatrix;\t\t} modelUniforms;\t\tlayout(set = 0, binding = 1) uniform CameraUniforms {\t\t\tmat4 projectionMatrix;\t\t\tmat4 viewMatrix;\t\t} cameraUniforms;\t\tvoid main(){\t\t\tvUv = uv;\t\t\tgl_Position = cameraUniforms.projectionMatrix * modelUniforms.modelViewMatrix * vec4( position, 1.0 );\t\t}",
    fragmentShader: "#version 450\t\tlayout(set = 0, binding = 2) uniform OpacityUniforms {\t\t\tfloat opacity;\t\t} opacityUniforms;\t\tlayout(set = 0, binding = 3) uniform sampler mySampler;\t\tlayout(set = 0, binding = 4) uniform texture2D myTexture;\t\tlayout(location = 0) in vec2 vUv;\t\tlayout(location = 0) out vec4 outColor;\t\tvoid main() {\t\t\toutColor = texture( sampler2D( myTexture, mySampler ), vUv );\t\t\toutColor.a *= opacityUniforms.opacity;\t\t}"
  },
  points_basic: {
    vertexShader: "#version 450\t\tlayout(location = 0) in vec3 position;\t\tlayout(set = 0, binding = 0) uniform ModelUniforms {\t\t\tmat4 modelMatrix;\t\t\tmat4 modelViewMatrix;\t\t} modelUniforms;\t\tlayout(set = 0, binding = 1) uniform CameraUniforms {\t\t\tmat4 projectionMatrix;\t\t\tmat4 viewMatrix;\t\t} cameraUniforms;\t\tvoid main(){\t\t\tgl_Position = cameraUniforms.projectionMatrix * modelUniforms.modelViewMatrix * vec4( position, 1.0 );\t\t}",
    fragmentShader: "#version 450\t\tlayout(location = 0) out vec4 outColor;\t\tvoid main() {\t\t\toutColor = vec4( 1.0, 0.0, 0.0, 1.0 );\t\t}"
  },
  line_basic: {
    vertexShader: "#version 450\t\tlayout(location = 0) in vec3 position;\t\tlayout(set = 0, binding = 0) uniform ModelUniforms {\t\t\tmat4 modelMatrix;\t\t\tmat4 modelViewMatrix;\t\t} modelUniforms;\t\tlayout(set = 0, binding = 1) uniform CameraUniforms {\t\t\tmat4 projectionMatrix;\t\t\tmat4 viewMatrix;\t\t} cameraUniforms;\t\tvoid main(){\t\t\tgl_Position = cameraUniforms.projectionMatrix * modelUniforms.modelViewMatrix * vec4( position, 1.0 );\t\t}",
    fragmentShader: "#version 450\t\tlayout(location = 0) out vec4 outColor;\t\tvoid main() {\t\t\toutColor = vec4( 1.0, 0.0, 0.0, 1.0 );\t\t}"
  }
};
var _default = WebGPURenderPipelines;
exports["default"] = _default;