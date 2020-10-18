"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.DRACOLoader = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var DRACOLoader = function DRACOLoader(manager) {
  Loader.call(this, manager);
  this.decoderPath = '';
  this.decoderConfig = {};
  this.decoderBinary = null;
  this.decoderPending = null;
  this.workerLimit = 4;
  this.workerPool = [];
  this.workerNextTaskID = 1;
  this.workerSourceURL = '';
  this.defaultAttributeIDs = {
    position: 'POSITION',
    normal: 'NORMAL',
    color: 'COLOR',
    uv: 'TEX_COORD'
  };
  this.defaultAttributeTypes = {
    position: 'Float32Array',
    normal: 'Float32Array',
    color: 'Float32Array',
    uv: 'Float32Array'
  };
};

THREE.DRACOLoader = DRACOLoader;
DRACOLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {
  constructor: DRACOLoader,
  setDecoderPath: function setDecoderPath(path) {
    this.decoderPath = path;
    return this;
  },
  setDecoderConfig: function setDecoderConfig(config) {
    this.decoderConfig = config;
    return this;
  },
  setWorkerLimit: function setWorkerLimit(workerLimit) {
    this.workerLimit = workerLimit;
    return this;
  },
  setVerbosity: function setVerbosity() {
    console.warn('THREE.DRACOLoader: The .setVerbosity() method has been removed.');
  },
  setDrawMode: function setDrawMode() {
    console.warn('THREE.DRACOLoader: The .setDrawMode() method has been removed.');
  },
  setSkipDequantization: function setSkipDequantization() {
    console.warn('THREE.DRACOLoader: The .setSkipDequantization() method has been removed.');
  },
  load: function load(url, onLoad, onProgress, onError) {
    var _this = this;

    var loader = new THREE.FileLoader(this.manager);
    loader.setPath(this.path);
    loader.setResponseType('arraybuffer');
    loader.setRequestHeader(this.requestHeader);
    loader.setWithCredentials(this.withCredentials);
    loader.load(url, function (buffer) {
      var taskConfig = {
        attributeIDs: _this.defaultAttributeIDs,
        attributeTypes: _this.defaultAttributeTypes,
        useUniqueIDs: false
      };

      _this.decodeGeometry(buffer, taskConfig).then(onLoad)["catch"](onError);
    }, onProgress, onError);
  },
  decodeDracoFile: function decodeDracoFile(buffer, callback, attributeIDs, attributeTypes) {
    var taskConfig = {
      attributeIDs: attributeIDs || this.defaultAttributeIDs,
      attributeTypes: attributeTypes || this.defaultAttributeTypes,
      useUniqueIDs: !!attributeIDs
    };
    this.decodeGeometry(buffer, taskConfig).then(callback);
  },
  decodeGeometry: function decodeGeometry(buffer, taskConfig) {
    var _this2 = this;

    for (var attribute in taskConfig.attributeTypes) {
      var type = taskConfig.attributeTypes[attribute];

      if (type.BYTES_PER_ELEMENT !== undefined) {
        taskConfig.attributeTypes[attribute] = type.name;
      }
    }

    var taskKey = JSON.stringify(taskConfig);

    if (DRACOLoader.taskCache.has(buffer)) {
      var cachedTask = DRACOLoader.taskCache.get(buffer);

      if (cachedTask.key === taskKey) {
        return cachedTask.promise;
      } else if (buffer.byteLength === 0) {
        throw new Error('THREE.DRACOLoader: Unable to re-decode a buffer with different ' + 'settings. Buffer has already been transferred.');
      }
    }

    var worker;
    var taskID = this.workerNextTaskID++;
    var taskCost = buffer.byteLength;

    var geometryPending = this._getWorker(taskID, taskCost).then(function (_worker) {
      worker = _worker;
      return new Promise(function (resolve, reject) {
        worker._callbacks[taskID] = {
          resolve: resolve,
          reject: reject
        };
        worker.postMessage({
          type: 'decode',
          id: taskID,
          taskConfig: taskConfig,
          buffer: buffer
        }, [buffer]);
      });
    }).then(function (message) {
      return _this2._createGeometry(message.geometry);
    });

    geometryPending["catch"](function () {
      return true;
    }).then(function () {
      if (worker && taskID) {
        _this2._releaseTask(worker, taskID);
      }
    });
    DRACOLoader.taskCache.set(buffer, {
      key: taskKey,
      promise: geometryPending
    });
    return geometryPending;
  },
  _createGeometry: function _createGeometry(geometryData) {
    var geometry = new THREE.BufferGeometry();

    if (geometryData.index) {
      geometry.setIndex(new THREE.BufferAttribute(geometryData.index.array, 1));
    }

    for (var i = 0; i < geometryData.attributes.length; i++) {
      var attribute = geometryData.attributes[i];
      var name = attribute.name;
      var array = attribute.array;
      var itemSize = attribute.itemSize;
      geometry.setAttribute(name, new BufferAttribute(array, itemSize));
    }

    return geometry;
  },
  _loadLibrary: function _loadLibrary(url, responseType) {
    var loader = new FileLoader(this.manager);
    loader.setPath(this.decoderPath);
    loader.setResponseType(responseType);
    loader.setWithCredentials(this.withCredentials);
    return new Promise(function (resolve, reject) {
      loader.load(url, resolve, undefined, reject);
    });
  },
  preload: function preload() {
    this._initDecoder();

    return this;
  },
  _initDecoder: function _initDecoder() {
    var _this3 = this;

    if (this.decoderPending) return this.decoderPending;
    var useJS = (typeof WebAssembly === "undefined" ? "undefined" : _typeof(WebAssembly)) !== 'object' || this.decoderConfig.type === 'js';
    var librariesPending = [];

    if (useJS) {
      librariesPending.push(this._loadLibrary('draco_decoder.js', 'text'));
    } else {
      librariesPending.push(this._loadLibrary('draco_wasm_wrapper.js', 'text'));
      librariesPending.push(this._loadLibrary('draco_decoder.wasm', 'arraybuffer'));
    }

    this.decoderPending = Promise.all(librariesPending).then(function (libraries) {
      var jsContent = libraries[0];

      if (!useJS) {
        _this3.decoderConfig.wasmBinary = libraries[1];
      }

      var fn = DRACOLoader.DRACOWorker.toString();
      var body = ['', jsContent, '', '', fn.substring(fn.indexOf('{') + 1, fn.lastIndexOf('}'))].join('\n');
      _this3.workerSourceURL = URL.createObjectURL(new Blob([body]));
    });
    return this.decoderPending;
  },
  _getWorker: function _getWorker(taskID, taskCost) {
    var _this4 = this;

    return this._initDecoder().then(function () {
      if (_this4.workerPool.length < _this4.workerLimit) {
        var worker = new Worker(_this4.workerSourceURL);
        worker._callbacks = {};
        worker._taskCosts = {};
        worker._taskLoad = 0;
        worker.postMessage({
          type: 'init',
          decoderConfig: _this4.decoderConfig
        });

        worker.onmessage = function (e) {
          var message = e.data;

          switch (message.type) {
            case 'decode':
              worker._callbacks[message.id].resolve(message);

              break;

            case 'error':
              worker._callbacks[message.id].reject(message);

              break;

            default:
              console.error('THREE.DRACOLoader: Unexpected message, "' + message.type + '"');
          }
        };

        _this4.workerPool.push(worker);
      } else {
        _this4.workerPool.sort(function (a, b) {
          return a._taskLoad > b._taskLoad ? -1 : 1;
        });
      }

      var worker = _this4.workerPool[_this4.workerPool.length - 1];
      worker._taskCosts[taskID] = taskCost;
      worker._taskLoad += taskCost;
      return worker;
    });
  },
  _releaseTask: function _releaseTask(worker, taskID) {
    worker._taskLoad -= worker._taskCosts[taskID];
    delete worker._callbacks[taskID];
    delete worker._taskCosts[taskID];
  },
  debug: function debug() {
    console.log('Task load: ', this.workerPool.map(function (worker) {
      return worker._taskLoad;
    }));
  },
  dispose: function dispose() {
    for (var i = 0; i < this.workerPool.length; ++i) {
      this.workerPool[i].terminate();
    }

    this.workerPool.length = 0;
    return this;
  }
});

DRACOLoader.DRACOWorker = function () {
  var decoderConfig;
  var decoderPending;

  onmessage = function onmessage(e) {
    var message = e.data;

    switch (message.type) {
      case 'init':
        decoderConfig = message.decoderConfig;
        decoderPending = new Promise(function (resolve) {
          decoderConfig.onModuleLoaded = function (draco) {
            resolve({
              draco: draco
            });
          };

          DracoDecoderModule(decoderConfig);
        });
        break;

      case 'decode':
        var buffer = message.buffer;
        var taskConfig = message.taskConfig;
        decoderPending.then(function (module) {
          var draco = module.draco;
          var decoder = new draco.Decoder();
          var decoderBuffer = new draco.DecoderBuffer();
          decoderBuffer.Init(new Int8Array(buffer), buffer.byteLength);

          try {
            var geometry = decodeGeometry(draco, decoder, decoderBuffer, taskConfig);
            var buffers = geometry.attributes.map(function (attr) {
              return attr.array.buffer;
            });
            if (geometry.index) buffers.push(geometry.index.array.buffer);
            self.postMessage({
              type: 'decode',
              id: message.id,
              geometry: geometry
            }, buffers);
          } catch (error) {
            console.error(error);
            self.postMessage({
              type: 'error',
              id: message.id,
              error: error.message
            });
          } finally {
            draco.destroy(decoderBuffer);
            draco.destroy(decoder);
          }
        });
        break;
    }
  };

  function decodeGeometry(draco, decoder, decoderBuffer, taskConfig) {
    var attributeIDs = taskConfig.attributeIDs;
    var attributeTypes = taskConfig.attributeTypes;
    var dracoGeometry;
    var decodingStatus;
    var geometryType = decoder.GetEncodedGeometryType(decoderBuffer);

    if (geometryType === draco.TRIANGULAR_MESH) {
      dracoGeometry = new draco.Mesh();
      decodingStatus = decoder.DecodeBufferToMesh(decoderBuffer, dracoGeometry);
    } else if (geometryType === draco.POINT_CLOUD) {
      dracoGeometry = new draco.PointCloud();
      decodingStatus = decoder.DecodeBufferToPointCloud(decoderBuffer, dracoGeometry);
    } else {
      throw new Error('THREE.DRACOLoader: Unexpected geometry type.');
    }

    if (!decodingStatus.ok() || dracoGeometry.ptr === 0) {
      throw new Error('THREE.DRACOLoader: Decoding failed: ' + decodingStatus.error_msg());
    }

    var geometry = {
      index: null,
      attributes: []
    };

    for (var attributeName in attributeIDs) {
      var attributeType = self[attributeTypes[attributeName]];
      var attribute;
      var attributeID;

      if (taskConfig.useUniqueIDs) {
        attributeID = attributeIDs[attributeName];
        attribute = decoder.GetAttributeByUniqueId(dracoGeometry, attributeID);
      } else {
        attributeID = decoder.GetAttributeId(dracoGeometry, draco[attributeIDs[attributeName]]);
        if (attributeID === -1) continue;
        attribute = decoder.GetAttribute(dracoGeometry, attributeID);
      }

      geometry.attributes.push(decodeAttribute(draco, decoder, dracoGeometry, attributeName, attributeType, attribute));
    }

    if (geometryType === draco.TRIANGULAR_MESH) {
      geometry.index = decodeIndex(draco, decoder, dracoGeometry);
    }

    draco.destroy(dracoGeometry);
    return geometry;
  }

  function decodeIndex(draco, decoder, dracoGeometry) {
    var numFaces = dracoGeometry.num_faces();
    var numIndices = numFaces * 3;
    var byteLength = numIndices * 4;

    var ptr = draco._malloc(byteLength);

    decoder.GetTrianglesUInt32Array(dracoGeometry, byteLength, ptr);
    var index = new Uint32Array(draco.HEAPF32.buffer, ptr, numIndices).slice();

    draco._free(ptr);

    return {
      array: index,
      itemSize: 1
    };
  }

  function decodeAttribute(draco, decoder, dracoGeometry, attributeName, attributeType, attribute) {
    var numComponents = attribute.num_components();
    var numPoints = dracoGeometry.num_points();
    var numValues = numPoints * numComponents;
    var byteLength = numValues * attributeType.BYTES_PER_ELEMENT;
    var dataType = getDracoDataType(draco, attributeType);

    var ptr = draco._malloc(byteLength);

    decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attribute, dataType, byteLength, ptr);
    var array = new attributeType(draco.HEAPF32.buffer, ptr, numValues).slice();

    draco._free(ptr);

    return {
      name: attributeName,
      array: array,
      itemSize: numComponents
    };
  }

  function getDracoDataType(draco, attributeType) {
    switch (attributeType) {
      case Float32Array:
        return draco.DT_FLOAT32;

      case Int8Array:
        return draco.DT_INT8;

      case Int16Array:
        return draco.DT_INT16;

      case Int32Array:
        return draco.DT_INT32;

      case Uint8Array:
        return draco.DT_UINT8;

      case Uint16Array:
        return draco.DT_UINT16;

      case Uint32Array:
        return draco.DT_UINT32;
    }
  }
};

DRACOLoader.taskCache = new WeakMap();

DRACOLoader.setDecoderPath = function () {
  console.warn('THREE.DRACOLoader: The .setDecoderPath() method has been removed. Use instance methods.');
};

DRACOLoader.setDecoderConfig = function () {
  console.warn('THREE.DRACOLoader: The .setDecoderConfig() method has been removed. Use instance methods.');
};

DRACOLoader.releaseDecoderModule = function () {
  console.warn('THREE.DRACOLoader: The .releaseDecoderModule() method has been removed. Use instance methods.');
};

DRACOLoader.getDecoderModule = function () {
  console.warn('THREE.DRACOLoader: The .getDecoderModule() method has been removed. Use instance methods.');
};