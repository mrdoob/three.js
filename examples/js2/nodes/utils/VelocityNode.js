"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.VelocityNode = VelocityNode;

function VelocityNode(target, params) {
  Vector3Node.call(this);
  this.params = {};
  this.velocity = new THREE.Vector3();
  this.setTarget(target);
  this.setParams(params);
}

VelocityNode.prototype = Object.create(THREE.Vector3Node.prototype);
VelocityNode.prototype.constructor = VelocityNode;
VelocityNode.prototype.nodeType = "Velocity";

VelocityNode.prototype.getReadonly = function () {
  return false;
};

VelocityNode.prototype.setParams = function (params) {
  switch (this.params.type) {
    case "elastic":
      delete this.moment;
      delete this.speed;
      delete this.springVelocity;
      delete this.lastVelocity;
      break;
  }

  this.params = params || {};

  switch (this.params.type) {
    case "elastic":
      this.moment = new Vector3();
      this.speed = new Vector3();
      this.springVelocity = new Vector3();
      this.lastVelocity = new Vector3();
      break;
  }
};

VelocityNode.prototype.setTarget = function (target) {
  if (this.target) {
    delete this.position;
    delete this.oldPosition;
  }

  this.target = target;

  if (target) {
    this.position = target.getWorldPosition(this.position || new Vector3());
    this.oldPosition = this.position.clone();
  }
};

VelocityNode.prototype.updateFrameVelocity = function () {
  if (this.target) {
    this.position = this.target.getWorldPosition(this.position || new Vector3());
    this.velocity.subVectors(this.position, this.oldPosition);
    this.oldPosition.copy(this.position);
  }
};

VelocityNode.prototype.updateFrame = function (frame) {
  this.updateFrameVelocity(frame);

  switch (this.params.type) {
    case "elastic":
      var deltaFps = frame.delta * (this.params.fps || 60);
      var spring = Math.pow(this.params.spring, deltaFps),
          damping = Math.pow(this.params.damping, deltaFps);
      this.velocity.multiplyScalar(Math.exp(-this.params.damping * deltaFps));
      this.velocity.add(this.springVelocity);
      this.velocity.add(this.speed.multiplyScalar(damping).multiplyScalar(1 - spring));
      this.speed.subVectors(this.velocity, this.lastVelocity);
      this.springVelocity.add(this.speed);
      this.springVelocity.multiplyScalar(spring);
      this.moment.add(this.springVelocity);
      this.moment.multiplyScalar(damping);
      this.lastVelocity.copy(this.velocity);
      this.value.copy(this.moment);
      break;

    default:
      this.value.copy(this.velocity);
  }
};

VelocityNode.prototype.copy = function (source) {
  Vector3Node.prototype.copy.call(this, source);
  if (source.target) this.setTarget(source.target);
  this.setParams(source.params);
  return this;
};

VelocityNode.prototype.toJSON = function (meta) {
  var data = this.getJSONNode(meta);

  if (!data) {
    data = this.createJSONNode(meta);
    if (this.target) data.target = this.target.uuid;
    data.params = JSON.parse(JSON.stringify(this.params));
  }

  return data;
};