"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.PointerLockControls = void 0;

var PointerLockControls = function PointerLockControls(camera, domElement) {
  if (domElement === undefined) {
    console.warn('THREE.PointerLockControls: The second parameter "domElement" is now mandatory.');
    domElement = document.body;
  }

  this.domElement = domElement;
  this.isLocked = false;
  this.minPolarAngle = 0;
  this.maxPolarAngle = Math.PI;
  var scope = this;
  var changeEvent = {
    type: 'change'
  };
  var lockEvent = {
    type: 'lock'
  };
  var unlockEvent = {
    type: 'unlock'
  };
  var euler = new THREE.Euler(0, 0, 0, 'YXZ');
  var PI_2 = Math.PI / 2;
  var vec = new THREE.Vector3();

  function onMouseMove(event) {
    if (scope.isLocked === false) return;
    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
    euler.setFromQuaternion(camera.quaternion);
    euler.y -= movementX * 0.002;
    euler.x -= movementY * 0.002;
    euler.x = Math.max(PI_2 - scope.maxPolarAngle, Math.min(PI_2 - scope.minPolarAngle, euler.x));
    camera.quaternion.setFromEuler(euler);
    scope.dispatchEvent(changeEvent);
  }

  function onPointerlockChange() {
    if (scope.domElement.ownerDocument.pointerLockElement === scope.domElement) {
      scope.dispatchEvent(lockEvent);
      scope.isLocked = true;
    } else {
      scope.dispatchEvent(unlockEvent);
      scope.isLocked = false;
    }
  }

  function onPointerlockError() {
    console.error('THREE.PointerLockControls: Unable to use Pointer Lock API');
  }

  this.connect = function () {
    scope.domElement.ownerDocument.addEventListener('mousemove', onMouseMove, false);
    scope.domElement.ownerDocument.addEventListener('pointerlockchange', onPointerlockChange, false);
    scope.domElement.ownerDocument.addEventListener('pointerlockerror', onPointerlockError, false);
  };

  this.disconnect = function () {
    scope.domElement.ownerDocument.removeEventListener('mousemove', onMouseMove, false);
    scope.domElement.ownerDocument.removeEventListener('pointerlockchange', onPointerlockChange, false);
    scope.domElement.ownerDocument.removeEventListener('pointerlockerror', onPointerlockError, false);
  };

  this.dispose = function () {
    this.disconnect();
  };

  this.getObject = function () {
    return camera;
  };

  this.getDirection = function () {
    var direction = new Vector3(0, 0, -1);
    return function (v) {
      return v.copy(direction).applyQuaternion(camera.quaternion);
    };
  }();

  this.moveForward = function (distance) {
    vec.setFromMatrixColumn(camera.matrix, 0);
    vec.crossVectors(camera.up, vec);
    camera.position.addScaledVector(vec, distance);
  };

  this.moveRight = function (distance) {
    vec.setFromMatrixColumn(camera.matrix, 0);
    camera.position.addScaledVector(vec, distance);
  };

  this.lock = function () {
    this.domElement.requestPointerLock();
  };

  this.unlock = function () {
    scope.domElement.ownerDocument.exitPointerLock();
  };

  this.connect();
};

THREE.PointerLockControls = PointerLockControls;
PointerLockControls.prototype = Object.create(THREE.EventDispatcher.prototype);
PointerLockControls.prototype.constructor = PointerLockControls;