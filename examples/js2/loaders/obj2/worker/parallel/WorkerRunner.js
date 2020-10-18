"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.ObjectManipulator = THREE.DefaultWorkerPayloadHandler = THREE.WorkerRunner = void 0;

var ObjectManipulator = function ObjectManipulator() {};

THREE.ObjectManipulator = ObjectManipulator;
ObjectManipulator.prototype = {
  constructor: ObjectManipulator,
  applyProperties: function applyProperties(objToAlter, params, forceCreation) {
    if (objToAlter === undefined || objToAlter === null || params === undefined || params === null) return;
    var property, funcName, values;

    for (property in params) {
      funcName = 'set' + property.substring(0, 1).toLocaleUpperCase() + property.substring(1);
      values = params[property];

      if (typeof objToAlter[funcName] === 'function') {
        objToAlter[funcName](values);
      } else if (objToAlter.hasOwnProperty(property) || forceCreation) {
        objToAlter[property] = values;
      }
    }
  }
};

var DefaultWorkerPayloadHandler = function DefaultWorkerPayloadHandler(parser) {
  this.parser = parser;
  this.logging = {
    enabled: false,
    debug: false
  };
};

THREE.DefaultWorkerPayloadHandler = DefaultWorkerPayloadHandler;
DefaultWorkerPayloadHandler.prototype = {
  constructor: DefaultWorkerPayloadHandler,
  handlePayload: function handlePayload(payload) {
    if (payload.logging) {
      this.logging.enabled = payload.logging.enabled === true;
      this.logging.debug = payload.logging.debug === true;
    }

    if (payload.cmd === 'parse') {
      var scope = this;
      var callbacks = {
        callbackOnAssetAvailable: function callbackOnAssetAvailable(payload) {
          self.postMessage(payload);
        },
        callbackOnProgress: function callbackOnProgress(text) {
          if (scope.logging.enabled && scope.logging.debug) console.debug('WorkerRunner: progress: ' + text);
        }
      };
      var parser = this.parser;

      if (typeof parser['setLogging'] === 'function') {
        parser.setLogging(this.logging.enabled, this.logging.debug);
      }

      var objectManipulator = new ObjectManipulator();
      objectManipulator.applyProperties(parser, payload.params, false);
      objectManipulator.applyProperties(parser, callbacks, false);
      var arraybuffer = payload.data.input;
      var executeFunctionName = 'execute';
      if (typeof parser.getParseFunctionName === 'function') executeFunctionName = parser.getParseFunctionName();

      if (payload.usesMeshDisassembler) {} else {
        parser[executeFunctionName](arraybuffer, payload.data.options);
      }

      if (this.logging.enabled) console.log('WorkerRunner: Run complete!');
      self.postMessage({
        cmd: 'completeOverall',
        msg: 'WorkerRunner completed run.'
      });
    } else {
      console.error('WorkerRunner: Received unknown command: ' + payload.cmd);
    }
  }
};

var WorkerRunner = function WorkerRunner(payloadHandler) {
  this.payloadHandler = payloadHandler;
  var scope = this;

  var scopedRunner = function scopedRunner(event) {
    scope.processMessage(event.data);
  };

  self.addEventListener('message', scopedRunner, false);
};

THREE.WorkerRunner = WorkerRunner;
WorkerRunner.prototype = {
  constructor: WorkerRunner,
  processMessage: function processMessage(payload) {
    this.payloadHandler.handlePayload(payload);
  }
};