"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.OBJLoader2Parallel = void 0;

var OBJLoader2Parallel = function OBJLoader2Parallel(manager) {
  OBJLoader2.call(this, manager);
  this.preferJsmWorker = false;
  this.jsmWorkerUrl = null;
  this.executeParallel = true;
  this.workerExecutionSupport = new THREE.WorkerExecutionSupport();
};

THREE.OBJLoader2Parallel = OBJLoader2Parallel;
OBJLoader2Parallel.OBJLOADER2_PARALLEL_VERSION = '3.2.0';
console.info('Using OBJLoader2Parallel version: ' + OBJLoader2Parallel.OBJLOADER2_PARALLEL_VERSION);
OBJLoader2Parallel.DEFAULT_JSM_WORKER_PATH = './jsm/loaders/obj2/worker/parallel/OBJLoader2JsmWorker.js';
OBJLoader2Parallel.prototype = Object.assign(Object.create(OBJLoader2.prototype), {
  constructor: OBJLoader2Parallel,
  setExecuteParallel: function setExecuteParallel(executeParallel) {
    this.executeParallel = executeParallel === true;
    return this;
  },
  setJsmWorker: function setJsmWorker(preferJsmWorker, jsmWorkerUrl) {
    this.preferJsmWorker = preferJsmWorker === true;

    if (jsmWorkerUrl === undefined || jsmWorkerUrl === null) {
      throw "The url to the jsm worker is not valid. Aborting...";
    }

    this.jsmWorkerUrl = jsmWorkerUrl;
    return this;
  },
  getWorkerExecutionSupport: function getWorkerExecutionSupport() {
    return this.workerExecutionSupport;
  },
  buildWorkerCode: function buildWorkerCode() {
    var codeBuilderInstructions = new THREE.CodeBuilderInstructions(true, true, this.preferJsmWorker);

    if (codeBuilderInstructions.isSupportsJsmWorker()) {
      codeBuilderInstructions.setJsmWorkerUrl(this.jsmWorkerUrl);
    }

    if (codeBuilderInstructions.isSupportsStandardWorker()) {
      var objectManipulator = new THREE.ObjectManipulator();
      var defaultWorkerPayloadHandler = new THREE.DefaultWorkerPayloadHandler(this.parser);
      var workerRunner = new THREE.WorkerRunner({});
      codeBuilderInstructions.addCodeFragment(THREE.CodeSerializer.serializeClass(THREE.OBJLoader2Parser, this.parser));
      codeBuilderInstructions.addCodeFragment(CodeSerializer.serializeClass(ObjectManipulator, objectManipulator));
      codeBuilderInstructions.addCodeFragment(CodeSerializer.serializeClass(DefaultWorkerPayloadHandler, defaultWorkerPayloadHandler));
      codeBuilderInstructions.addCodeFragment(CodeSerializer.serializeClass(WorkerRunner, workerRunner));
      var startCode = 'new ' + workerRunner.constructor.name + '( new ' + defaultWorkerPayloadHandler.constructor.name + '( new ' + this.parser.constructor.name + '() ) );';
      codeBuilderInstructions.addStartCode(startCode);
    }

    return codeBuilderInstructions;
  },
  load: function load(content, onLoad, onFileLoadProgress, onError, onMeshAlter) {
    var scope = this;

    function interceptOnLoad(object3d, message) {
      if (object3d.name === 'OBJLoader2ParallelDummy') {
        if (scope.parser.logging.enabled && scope.parser.logging.debug) {
          console.debug('Received dummy answer from OBJLoader2Parallel#parse');
        }
      } else {
        onLoad(object3d, message);
      }
    }

    OBJLoader2.prototype.load.call(this, content, interceptOnLoad, onFileLoadProgress, onError, onMeshAlter);
  },
  parse: function parse(content) {
    if (this.executeParallel) {
      if (this.parser.callbacks.onLoad === this.parser._onLoad) {
        throw "No callback other than the default callback was provided! Aborting!";
      }

      if (!this.workerExecutionSupport.isWorkerLoaded(this.preferJsmWorker)) {
        var scopedOnLoad = function scopedOnLoad(message) {
          scope.parser.callbacks.onLoad(scope.baseObject3d, message);
        };

        this.workerExecutionSupport.buildWorker(this.buildWorkerCode());
        var scope = this;

        var scopedOnAssetAvailable = function scopedOnAssetAvailable(payload) {
          scope._onAssetAvailable(payload);
        };

        this.workerExecutionSupport.updateCallbacks(scopedOnAssetAvailable, scopedOnLoad);
      }

      this.materialHandler.createDefaultMaterials(false);
      this.workerExecutionSupport.executeParallel({
        params: {
          modelName: this.modelName,
          instanceNo: this.instanceNo,
          useIndices: this.parser.useIndices,
          disregardNormals: this.parser.disregardNormals,
          materialPerSmoothingGroup: this.parser.materialPerSmoothingGroup,
          useOAsMesh: this.parser.useOAsMesh,
          materials: this.materialHandler.getMaterialsJSON()
        },
        data: {
          input: content,
          options: null
        },
        logging: {
          enabled: this.parser.logging.enabled,
          debug: this.parser.logging.debug
        }
      });
      var dummy = new THREE.Object3D();
      dummy.name = 'OBJLoader2ParallelDummy';
      return dummy;
    } else {
      return OBJLoader2.prototype.parse.call(this, content);
    }
  }
});