"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.TimerNode = TimerNode;

function TimerNode(scale, scope, timeScale) {
  FloatNode.call(this);
  this.scale = scale !== undefined ? scale : 1;
  this.scope = scope || TimerNode.GLOBAL;
  this.timeScale = timeScale !== undefined ? timeScale : scale !== undefined;
}

TimerNode.GLOBAL = 'global';
TimerNode.LOCAL = 'local';
TimerNode.DELTA = 'delta';
TimerNode.prototype = Object.create(THREE.FloatNode.prototype);
TimerNode.prototype.constructor = TimerNode;
TimerNode.prototype.nodeType = "Timer";

TimerNode.prototype.getReadonly = function () {
  return false;
};

TimerNode.prototype.getUnique = function () {
  return this.timeScale && (this.scope === TimerNode.GLOBAL || this.scope === TimerNode.DELTA);
};

TimerNode.prototype.updateFrame = function (frame) {
  var scale = this.timeScale ? this.scale : 1;

  switch (this.scope) {
    case TimerNode.LOCAL:
      this.value += frame.delta * scale;
      break;

    case TimerNode.DELTA:
      this.value = frame.delta * scale;
      break;

    default:
      this.value = frame.time * scale;
  }
};

TimerNode.prototype.copy = function (source) {
  FloatNode.prototype.copy.call(this, source);
  this.scope = source.scope;
  this.scale = source.scale;
  this.timeScale = source.timeScale;
  return this;
};

TimerNode.prototype.toJSON = function (meta) {
  var data = this.getJSONNode(meta);

  if (!data) {
    data = this.createJSONNode(meta);
    data.scope = this.scope;
    data.scale = this.scale;
    data.timeScale = this.timeScale;
  }

  return data;
};

NodeLib.addKeyword('time', function () {
  return new TimerNode();
});