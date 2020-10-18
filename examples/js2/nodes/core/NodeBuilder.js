"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.NodeBuilder = NodeBuilder;
var elements = THREE.NodeUtils.elements,
    constructors = ['float', 'vec2', 'vec3', 'vec4'],
    convertFormatToType = {
  "float": 'f',
  vec2: 'v2',
  vec3: 'v3',
  vec4: 'v4',
  mat4: 'v4',
  "int": 'i',
  bool: 'b'
},
    convertTypeToFormat = {
  t: 'sampler2D',
  tc: 'samplerCube',
  b: 'bool',
  i: 'int',
  f: 'float',
  c: 'vec3',
  v2: 'vec2',
  v3: 'vec3',
  v4: 'vec4',
  m3: 'mat3',
  m4: 'mat4'
};

function NodeBuilder() {
  this.slots = [];
  this.caches = [];
  this.contexts = [];
  this.keywords = {};
  this.nodeData = {};
  this.requires = {
    uv: [],
    color: [],
    lights: false,
    fog: false,
    transparent: false,
    irradiance: false
  };
  this.includes = {
    consts: [],
    functions: [],
    structs: []
  };
  this.attributes = {};
  this.prefixCode = ["#ifdef TEXTURE_LOD_EXT", "	#define texCube(a, b) textureCube(a, b)", "	#define texCubeBias(a, b, c) textureCubeLodEXT(a, b, c)", "	#define tex2D(a, b) texture2D(a, b)", "	#define tex2DBias(a, b, c) texture2DLodEXT(a, b, c)", "#else", "	#define texCube(a, b) textureCube(a, b)", "	#define texCubeBias(a, b, c) textureCube(a, b, c)", "	#define tex2D(a, b) texture2D(a, b)", "	#define tex2DBias(a, b, c) texture2D(a, b, c)", "#endif", "#include <packing>", "#include <common>"].join("\n");
  this.parsCode = {
    vertex: '',
    fragment: ''
  };
  this.code = {
    vertex: '',
    fragment: ''
  };
  this.nodeCode = {
    vertex: '',
    fragment: ''
  };
  this.resultCode = {
    vertex: '',
    fragment: ''
  };
  this.finalCode = {
    vertex: '',
    fragment: ''
  };
  this.inputs = {
    uniforms: {
      list: [],
      vertex: [],
      fragment: []
    },
    vars: {
      varying: [],
      vertex: [],
      fragment: []
    }
  };
  this.defines = {};
  this.uniforms = {};
  this.extensions = {};
  this.updaters = [];
  this.nodes = [];
  this.analyzing = false;
}

NodeBuilder.prototype = {
  constructor: NodeBuilder,
  build: function build(vertex, fragment) {
    this.buildShader('vertex', vertex);
    this.buildShader('fragment', fragment);

    for (var i = 0; i < this.requires.uv.length; i++) {
      if (this.requires.uv[i]) {
        var uvIndex = i > 0 ? i + 1 : '';
        this.addVaryCode('varying vec2 vUv' + uvIndex + ';');

        if (i > 0) {
          this.addVertexParsCode('attribute vec2 uv' + uvIndex + ';');
        }

        this.addVertexFinalCode('vUv' + uvIndex + ' = uv' + uvIndex + ';');
      }
    }

    if (this.requires.color[0]) {
      this.addVaryCode('varying vec4 vColor;');
      this.addVertexParsCode('attribute vec4 color;');
      this.addVertexFinalCode('vColor = color;');
    }

    if (this.requires.color[1]) {
      this.addVaryCode('varying vec4 vColor2;');
      this.addVertexParsCode('attribute vec4 color2;');
      this.addVertexFinalCode('vColor2 = color2;');
    }

    if (this.requires.position) {
      this.addVaryCode('varying vec3 vPosition;');
      this.addVertexFinalCode('vPosition = transformed;');
    }

    if (this.requires.worldPosition) {
      this.addVaryCode('varying vec3 vWPosition;');
      this.addVertexFinalCode('vWPosition = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;');
    }

    if (this.requires.normal) {
      this.addVaryCode('varying vec3 vObjectNormal;');
      this.addVertexFinalCode('vObjectNormal = normal;');
    }

    if (this.requires.worldNormal) {
      this.addVaryCode('varying vec3 vWNormal;');
      this.addVertexFinalCode('vWNormal = inverseTransformDirection( transformedNormal, viewMatrix ).xyz;');
    }

    return this;
  },
  buildShader: function buildShader(shader, node) {
    this.resultCode[shader] = node.build(this.setShader(shader), 'v4');
  },
  setMaterial: function setMaterial(material, renderer) {
    this.material = material;
    this.renderer = renderer;
    this.requires.lights = material.lights;
    this.requires.fog = material.fog;
    this.mergeDefines(material.defines);
    return this;
  },
  addFlow: function addFlow(slot, cache, context) {
    return this.addSlot(slot).addCache(cache).addContext(context);
  },
  removeFlow: function removeFlow() {
    return this.removeSlot().removeCache().removeContext();
  },
  addCache: function addCache(name) {
    this.cache = name || '';
    this.caches.push(this.cache);
    return this;
  },
  removeCache: function removeCache() {
    this.caches.pop();
    this.cache = this.caches[this.caches.length - 1] || '';
    return this;
  },
  addContext: function addContext(context) {
    this.context = Object.assign({}, this.context, context);
    this.context.extra = this.context.extra || {};
    this.contexts.push(this.context);
    return this;
  },
  removeContext: function removeContext() {
    this.contexts.pop();
    this.context = this.contexts[this.contexts.length - 1] || {};
    return this;
  },
  addSlot: function addSlot(name) {
    this.slot = name || '';
    this.slots.push(this.slot);
    return this;
  },
  removeSlot: function removeSlot() {
    this.slots.pop();
    this.slot = this.slots[this.slots.length - 1] || '';
    return this;
  },
  addVertexCode: function addVertexCode(code) {
    this.addCode(code, 'vertex');
  },
  addFragmentCode: function addFragmentCode(code) {
    this.addCode(code, 'fragment');
  },
  addCode: function addCode(code, shader) {
    this.code[shader || this.shader] += code + '\n';
  },
  addVertexNodeCode: function addVertexNodeCode(code) {
    this.addNodeCode(code, 'vertex');
  },
  addFragmentNodeCode: function addFragmentNodeCode(code) {
    this.addNodeCode(code, 'fragment');
  },
  addNodeCode: function addNodeCode(code, shader) {
    this.nodeCode[shader || this.shader] += code + '\n';
  },
  clearNodeCode: function clearNodeCode(shader) {
    shader = shader || this.shader;
    var code = this.nodeCode[shader];
    this.nodeCode[shader] = '';
    return code;
  },
  clearVertexNodeCode: function clearVertexNodeCode() {
    return this.clearNodeCode('vertex');
  },
  clearFragmentNodeCode: function clearFragmentNodeCode() {
    return this.clearNodeCode('fragment');
  },
  addVertexFinalCode: function addVertexFinalCode(code) {
    this.addFinalCode(code, 'vertex');
  },
  addFragmentFinalCode: function addFragmentFinalCode(code) {
    this.addFinalCode(code, 'fragment');
  },
  addFinalCode: function addFinalCode(code, shader) {
    this.finalCode[shader || this.shader] += code + '\n';
  },
  addVertexParsCode: function addVertexParsCode(code) {
    this.addParsCode(code, 'vertex');
  },
  addFragmentParsCode: function addFragmentParsCode(code) {
    this.addParsCode(code, 'fragment');
  },
  addParsCode: function addParsCode(code, shader) {
    this.parsCode[shader || this.shader] += code + '\n';
  },
  addVaryCode: function addVaryCode(code) {
    this.addVertexParsCode(code);
    this.addFragmentParsCode(code);
  },
  isCache: function isCache(name) {
    return this.caches.indexOf(name) !== -1;
  },
  isSlot: function isSlot(name) {
    return this.slots.indexOf(name) !== -1;
  },
  define: function define(name, value) {
    this.defines[name] = value === undefined ? 1 : value;
  },
  require: function require(name) {
    this.requires[name] = true;
  },
  isDefined: function isDefined(name) {
    return this.defines[name] !== undefined;
  },
  getVar: function getVar(uuid, type, ns) {
    var shader = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'varying';
    var prefix = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'V';
    var label = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : '';
    var vars = this.getVars(shader),
        data = vars[uuid];

    if (!data) {
      var index = vars.length,
          name = ns ? ns : 'node' + prefix + index + (label ? '_' + label : '');
      data = {
        name: name,
        type: type
      };
      vars.push(data);
      vars[uuid] = data;
    }

    return data;
  },
  getTempVar: function getTempVar(uuid, type, ns, label) {
    return this.getVar(uuid, type, ns, this.shader, 'T', label);
  },
  getAttribute: function getAttribute(name, type) {
    if (!this.attributes[name]) {
      var varying = this.getVar(name, type);
      this.addVertexParsCode('attribute ' + type + ' ' + name + ';');
      this.addVertexFinalCode(varying.name + ' = ' + name + ';');
      this.attributes[name] = {
        varying: varying,
        name: name,
        type: type
      };
    }

    return this.attributes[name];
  },
  getCode: function getCode(shader) {
    return [this.prefixCode, this.parsCode[shader], this.getVarListCode(this.getVars('varying'), 'varying'), this.getVarListCode(this.inputs.uniforms[shader], 'uniform'), this.getIncludesCode('consts', shader), this.getIncludesCode('structs', shader), this.getIncludesCode('functions', shader), 'void main() {', this.getVarListCode(this.getVars(shader)), this.code[shader], this.resultCode[shader], this.finalCode[shader], '}'].join("\n");
  },
  getVarListCode: function getVarListCode(vars, prefix) {
    prefix = prefix || '';
    var code = '';

    for (var i = 0, l = vars.length; i < l; ++i) {
      var nVar = vars[i],
          type = nVar.type,
          name = nVar.name;
      var formatType = this.getFormatByType(type);

      if (formatType === undefined) {
        throw new Error("Node pars " + formatType + " not found.");
      }

      code += prefix + ' ' + formatType + ' ' + name + ';\n';
    }

    return code;
  },
  getVars: function getVars(shader) {
    return this.inputs.vars[shader || this.shader];
  },
  getNodeData: function getNodeData(node) {
    var uuid = node.isNode ? node.uuid : node;
    return this.nodeData[uuid] = this.nodeData[uuid] || {};
  },
  createUniform: function createUniform(shader, type, node, ns, needsUpdate, label) {
    var uniforms = this.inputs.uniforms,
        index = uniforms.list.length;
    var uniform = new THREE.NodeUniform({
      type: type,
      name: ns ? ns : 'nodeU' + index + (label ? '_' + label : ''),
      node: node,
      needsUpdate: needsUpdate
    });
    uniforms.list.push(uniform);
    uniforms[shader].push(uniform);
    uniforms[shader][uniform.name] = uniform;
    this.uniforms[uniform.name] = uniform;
    return uniform;
  },
  createVertexUniform: function createVertexUniform(type, node, ns, needsUpdate, label) {
    return this.createUniform('vertex', type, node, ns, needsUpdate, label);
  },
  createFragmentUniform: function createFragmentUniform(type, node, ns, needsUpdate, label) {
    return this.createUniform('fragment', type, node, ns, needsUpdate, label);
  },
  include: function include(node, parent, source) {
    var includesStruct;
    node = typeof node === 'string' ? THREE.NodeLib.get(node) : node;

    if (this.context.include === false) {
      return node.name;
    }

    if (node instanceof FunctionNode) {
      includesStruct = this.includes.functions;
    } else if (node instanceof ConstNode) {
      includesStruct = this.includes.consts;
    } else if (node instanceof StructNode) {
      includesStruct = this.includes.structs;
    }

    var includes = includesStruct[this.shader] = includesStruct[this.shader] || [];

    if (node) {
      var included = includes[node.name];

      if (!included) {
        included = includes[node.name] = {
          node: node,
          deps: []
        };
        includes.push(included);
        included.src = node.build(this, 'source');
      }

      if (node instanceof FunctionNode && parent && includes[parent.name] && includes[parent.name].deps.indexOf(node) == -1) {
        includes[parent.name].deps.push(node);

        if (node.includes && node.includes.length) {
          var i = 0;

          do {
            this.include(node.includes[i++], parent);
          } while (i < node.includes.length);
        }
      }

      if (source) {
        included.src = source;
      }

      return node.name;
    } else {
      throw new Error("Include not found.");
    }
  },
  colorToVectorProperties: function colorToVectorProperties(color) {
    return color.replace('r', 'x').replace('g', 'y').replace('b', 'z').replace('a', 'w');
  },
  colorToVector: function colorToVector(color) {
    return color.replace(/c/g, 'v3');
  },
  getIncludes: function getIncludes(type, shader) {
    return this.includes[type][shader || this.shader];
  },
  getIncludesCode: function () {
    function sortByPosition(a, b) {
      return a.deps.length - b.deps.length;
    }

    return function getIncludesCode(type, shader) {
      var includes = this.getIncludes(type, shader);
      if (!includes) return '';
      var code = '',
          includes = includes.sort(sortByPosition);

      for (var i = 0; i < includes.length; i++) {
        if (includes[i].src) code += includes[i].src + '\n';
      }

      return code;
    };
  }(),
  getConstructorFromLength: function getConstructorFromLength(len) {
    return constructors[len - 1];
  },
  isTypeMatrix: function isTypeMatrix(format) {
    return /^m/.test(format);
  },
  getTypeLength: function getTypeLength(type) {
    if (type === 'f') return 1;
    return parseInt(this.colorToVector(type).substr(1));
  },
  getTypeFromLength: function getTypeFromLength(len) {
    if (len === 1) return 'f';
    return 'v' + len;
  },
  findNode: function findNode() {
    for (var i = 0; i < arguments.length; i++) {
      var nodeCandidate = arguments[i];

      if (nodeCandidate !== undefined && nodeCandidate.isNode) {
        return nodeCandidate;
      }
    }
  },
  resolve: function resolve() {
    for (var i = 0; i < arguments.length; i++) {
      var nodeCandidate = arguments[i];

      if (nodeCandidate !== undefined) {
        if (nodeCandidate.isNode) {
          return nodeCandidate;
        } else if (nodeCandidate.isTexture) {
          switch (nodeCandidate.mapping) {
            case CubeReflectionMapping:
            case CubeRefractionMapping:
              return new THREE.CubeTextureNode(nodeCandidate);
              break;

            case CubeUVReflectionMapping:
            case CubeUVRefractionMapping:
              return new THREE.TextureCubeNode(new THREE.TextureNode(nodeCandidate));
              break;

            default:
              return new TextureNode(nodeCandidate);
          }
        } else if (nodeCandidate.isVector2) {
          return new THREE.Vector2Node(nodeCandidate);
        } else if (nodeCandidate.isVector3) {
          return new THREE.Vector3Node(nodeCandidate);
        } else if (nodeCandidate.isVector4) {
          return new THREE.Vector4Node(nodeCandidate);
        }
      }
    }
  },
  format: function format(code, from, to) {
    var typeToType = this.colorToVector(to + ' <- ' + from);

    switch (typeToType) {
      case 'f <- v2':
        return code + '.x';

      case 'f <- v3':
        return code + '.x';

      case 'f <- v4':
        return code + '.x';

      case 'f <- i':
      case 'f <- b':
        return 'float( ' + code + ' )';

      case 'v2 <- f':
        return 'vec2( ' + code + ' )';

      case 'v2 <- v3':
        return code + '.xy';

      case 'v2 <- v4':
        return code + '.xy';

      case 'v2 <- i':
      case 'v2 <- b':
        return 'vec2( float( ' + code + ' ) )';

      case 'v3 <- f':
        return 'vec3( ' + code + ' )';

      case 'v3 <- v2':
        return 'vec3( ' + code + ', 0.0 )';

      case 'v3 <- v4':
        return code + '.xyz';

      case 'v3 <- i':
      case 'v3 <- b':
        return 'vec2( float( ' + code + ' ) )';

      case 'v4 <- f':
        return 'vec4( ' + code + ' )';

      case 'v4 <- v2':
        return 'vec4( ' + code + ', 0.0, 1.0 )';

      case 'v4 <- v3':
        return 'vec4( ' + code + ', 1.0 )';

      case 'v4 <- i':
      case 'v4 <- b':
        return 'vec4( float( ' + code + ' ) )';

      case 'i <- f':
      case 'i <- b':
        return 'int( ' + code + ' )';

      case 'i <- v2':
        return 'int( ' + code + '.x )';

      case 'i <- v3':
        return 'int( ' + code + '.x )';

      case 'i <- v4':
        return 'int( ' + code + '.x )';

      case 'b <- f':
        return '( ' + code + ' != 0.0 )';

      case 'b <- v2':
        return '( ' + code + ' != vec2( 0.0 ) )';

      case 'b <- v3':
        return '( ' + code + ' != vec3( 0.0 ) )';

      case 'b <- v4':
        return '( ' + code + ' != vec4( 0.0 ) )';

      case 'b <- i':
        return '( ' + code + ' != 0 )';
    }

    return code;
  },
  getTypeByFormat: function getTypeByFormat(format) {
    return convertFormatToType[format] || format;
  },
  getFormatByType: function getFormatByType(type) {
    return convertTypeToFormat[type] || type;
  },
  getUuid: function getUuid(uuid, useCache) {
    useCache = useCache !== undefined ? useCache : true;
    if (useCache && this.cache) uuid = this.cache + '-' + uuid;
    return uuid;
  },
  getElementByIndex: function getElementByIndex(index) {
    return elements[index];
  },
  getIndexByElement: function getIndexByElement(elm) {
    return elements.indexOf(elm);
  },
  isShader: function isShader(shader) {
    return this.shader === shader;
  },
  setShader: function setShader(shader) {
    this.shader = shader;
    return this;
  },
  mergeDefines: function mergeDefines(defines) {
    for (var name in defines) {
      this.defines[name] = defines[name];
    }

    return this.defines;
  },
  mergeUniform: function mergeUniform(uniforms) {
    for (var name in uniforms) {
      this.uniforms[name] = uniforms[name];
    }

    return this.uniforms;
  },
  getTextureEncodingFromMap: function getTextureEncodingFromMap(map) {
    var encoding;

    if (!map) {
      encoding = THREE.LinearEncoding;
    } else if (map.isTexture) {
      encoding = map.encoding;
    } else if (map.isWebGLRenderTarget) {
      console.warn("THREE.WebGLPrograms.getTextureEncodingFromMap: don't use render targets as textures. Use their .texture property instead.");
      encoding = map.texture.encoding;
    }

    if (encoding === LinearEncoding && this.context.gamma) {
      encoding = THREE.GammaEncoding;
    }

    return encoding;
  }
};