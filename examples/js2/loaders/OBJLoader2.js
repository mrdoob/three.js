"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.OBJLoader2 = void 0;

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var OBJLoader2 = function OBJLoader2(manager) {
  Loader.call(this, manager);
  this.parser = new THREE.OBJLoader2Parser();
  this.modelName = '';
  this.instanceNo = 0;
  this.baseObject3d = new THREE.Object3D();
  this.materialHandler = new THREE.MaterialHandler();
  this.meshReceiver = new THREE.MeshReceiver(this.materialHandler);
  var scope = this;

  var defaultOnAssetAvailable = function defaultOnAssetAvailable(payload) {
    scope._onAssetAvailable(payload);
  };

  this.parser.setCallbackOnAssetAvailable(defaultOnAssetAvailable);
};

THREE.OBJLoader2 = OBJLoader2;
OBJLoader2.OBJLOADER2_VERSION = '3.2.0';
console.info('Using OBJLoader2 version: ' + OBJLoader2.OBJLOADER2_VERSION);
OBJLoader2.prototype = Object.assign(Object.create(THREE.Loader.prototype), {
  constructor: OBJLoader2,
  setLogging: function setLogging(enabled, debug) {
    this.parser.setLogging(enabled, debug);
    return this;
  },
  setMaterialPerSmoothingGroup: function setMaterialPerSmoothingGroup(materialPerSmoothingGroup) {
    this.parser.setMaterialPerSmoothingGroup(materialPerSmoothingGroup);
    return this;
  },
  setUseOAsMesh: function setUseOAsMesh(useOAsMesh) {
    this.parser.setUseOAsMesh(useOAsMesh);
    return this;
  },
  setUseIndices: function setUseIndices(useIndices) {
    this.parser.setUseIndices(useIndices);
    return this;
  },
  setDisregardNormals: function setDisregardNormals(disregardNormals) {
    this.parser.setDisregardNormals(disregardNormals);
    return this;
  },
  setModelName: function setModelName(modelName) {
    this.modelName = modelName ? modelName : this.modelName;
    return this;
  },
  setBaseObject3d: function setBaseObject3d(baseObject3d) {
    this.baseObject3d = baseObject3d === undefined || baseObject3d === null ? this.baseObject3d : baseObject3d;
    return this;
  },
  addMaterials: function addMaterials(materials, overrideExisting) {
    this.materialHandler.addMaterials(materials, overrideExisting);
    return this;
  },
  setCallbackOnAssetAvailable: function setCallbackOnAssetAvailable(onAssetAvailable) {
    this.parser.setCallbackOnAssetAvailable(onAssetAvailable);
    return this;
  },
  setCallbackOnProgress: function setCallbackOnProgress(onProgress) {
    this.parser.setCallbackOnProgress(onProgress);
    return this;
  },
  setCallbackOnError: function setCallbackOnError(onError) {
    this.parser.setCallbackOnError(onError);
    return this;
  },
  setCallbackOnLoad: function setCallbackOnLoad(onLoad) {
    this.parser.setCallbackOnLoad(onLoad);
    return this;
  },
  setCallbackOnMeshAlter: function setCallbackOnMeshAlter(onMeshAlter) {
    this.meshReceiver._setCallbacks(this.parser.callbacks.onProgress, onMeshAlter);

    return this;
  },
  setCallbackOnLoadMaterials: function setCallbackOnLoadMaterials(onLoadMaterials) {
    this.materialHandler._setCallbacks(onLoadMaterials);

    return this;
  },
  load: function load(url, onLoad, onFileLoadProgress, onError, onMeshAlter) {
    var scope = this;

    if (onLoad === null || onLoad === undefined || !(onLoad instanceof Function)) {
      var errorMessage = 'onLoad is not a function! Aborting...';
      scope.parser.callbacks.onError(errorMessage);
      throw errorMessage;
    } else {
      this.parser.setCallbackOnLoad(onLoad);
    }

    if (onError === null || onError === undefined || !(onError instanceof Function)) {
      onError = function onError(event) {
        var errorMessage = event;

        if (event.currentTarget && event.currentTarget.statusText !== null) {
          errorMessage = 'Error occurred while downloading!\nurl: ' + event.currentTarget.responseURL + '\nstatus: ' + event.currentTarget.statusText;
        }

        scope.parser.callbacks.onError(errorMessage);
      };
    }

    if (!url) {
      onError('An invalid url was provided. Unable to continue!');
    }

    var urlFull = new URL(url, window.location.href).href;
    var filename = urlFull;
    var urlParts = urlFull.split('/');

    if (urlParts.length > 2) {
      filename = urlParts[urlParts.length - 1];
      this.path = urlParts.slice(0, urlParts.length - 1).join('/') + '/';
    }

    if (onFileLoadProgress === null || onFileLoadProgress === undefined || !(onFileLoadProgress instanceof Function)) {
      var numericalValueRef = 0;
      var numericalValue = 0;

      onFileLoadProgress = function onFileLoadProgress(event) {
        if (!event.lengthComputable) return;
        numericalValue = event.loaded / event.total;

        if (numericalValue > numericalValueRef) {
          numericalValueRef = numericalValue;
          var output = 'Download of "' + url + '": ' + (numericalValue * 100).toFixed(2) + '%';
          scope.parser.callbacks.onProgress('progressLoad', output, numericalValue);
        }
      };
    }

    this.setCallbackOnMeshAlter(onMeshAlter);

    var fileLoaderOnLoad = function fileLoaderOnLoad(content) {
      scope.parser.callbacks.onLoad(scope.parse(content), "OBJLoader2#load: Parsing completed");
    };

    var fileLoader = new THREE.FileLoader(this.manager);
    fileLoader.setPath(this.path || this.resourcePath);
    fileLoader.setResponseType('arraybuffer');
    fileLoader.load(filename, fileLoaderOnLoad, onFileLoadProgress, onError);
  },
  parse: function parse(content) {
    if (content === null || content === undefined) {
      throw 'Provided content is not a valid ArrayBuffer or String. Unable to continue parsing';
    }

    if (this.parser.logging.enabled) {
      console.time('OBJLoader parse: ' + this.modelName);
    }

    this.materialHandler.createDefaultMaterials(false);
    this.parser.setMaterials(this.materialHandler.getMaterials());

    if (content instanceof ArrayBuffer || content instanceof Uint8Array) {
      if (this.parser.logging.enabled) console.info('Parsing arrayBuffer...');
      this.parser.execute(content);
    } else if (typeof content === 'string' || content instanceof String) {
      if (this.parser.logging.enabled) console.info('Parsing text...');
      this.parser.executeLegacy(content);
    } else {
      this.parser.callbacks.onError('Provided content was neither of type String nor Uint8Array! Aborting...');
    }

    if (this.parser.logging.enabled) {
      console.timeEnd('OBJLoader parse: ' + this.modelName);
    }

    return this.baseObject3d;
  },
  _onAssetAvailable: function _onAssetAvailable(payload) {
    if (payload.cmd !== 'assetAvailable') return;

    if (payload.type === 'mesh') {
      var meshes = this.meshReceiver.buildMeshes(payload);

      var _iterator = _createForOfIteratorHelper(meshes),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var mesh = _step.value;
          this.baseObject3d.add(mesh);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    } else if (payload.type === 'material') {
      this.materialHandler.addPayloadMaterials(payload);
    }
  }
});