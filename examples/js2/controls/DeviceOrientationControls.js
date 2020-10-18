"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.DeviceOrientationControls = void 0;

var DeviceOrientationControls = function DeviceOrientationControls(object) {
  var scope = this;
  var changeEvent = {
    type: "change"
  };
  var EPS = 0.000001;
  this.object = object;
  this.object.rotation.reorder('YXZ');
  this.enabled = true;
  this.deviceOrientation = {};
  this.screenOrientation = 0;
  this.alphaOffset = 0;

  var onDeviceOrientationChangeEvent = function onDeviceOrientationChangeEvent(event) {
    scope.deviceOrientation = event;
  };

  var onScreenOrientationChangeEvent = function onScreenOrientationChangeEvent() {
    scope.screenOrientation = window.orientation || 0;
  };

  var setObjectQuaternion = function () {
    var zee = new THREE.Vector3(0, 0, 1);
    var euler = new THREE.Euler();
    var q0 = new THREE.Quaternion();
    var q1 = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
    return function (quaternion, alpha, beta, gamma, orient) {
      euler.set(beta, alpha, -gamma, 'YXZ');
      quaternion.setFromEuler(euler);
      quaternion.multiply(q1);
      quaternion.multiply(q0.setFromAxisAngle(zee, -orient));
    };
  }();

  this.connect = function () {
    onScreenOrientationChangeEvent();

    if (window.DeviceOrientationEvent !== undefined && typeof window.DeviceOrientationEvent.requestPermission === 'function') {
      window.DeviceOrientationEvent.requestPermission().then(function (response) {
        if (response == 'granted') {
          window.addEventListener('orientationchange', onScreenOrientationChangeEvent, false);
          window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);
        }
      })["catch"](function (error) {
        console.error('THREE.DeviceOrientationControls: Unable to use DeviceOrientation API:', error);
      });
    } else {
      window.addEventListener('orientationchange', onScreenOrientationChangeEvent, false);
      window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);
    }

    scope.enabled = true;
  };

  this.disconnect = function () {
    window.removeEventListener('orientationchange', onScreenOrientationChangeEvent, false);
    window.removeEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);
    scope.enabled = false;
  };

  this.update = function () {
    var lastQuaternion = new Quaternion();
    return function () {
      if (scope.enabled === false) return;
      var device = scope.deviceOrientation;

      if (device) {
        var alpha = device.alpha ? THREE.MathUtils.degToRad(device.alpha) + scope.alphaOffset : 0;
        var beta = device.beta ? MathUtils.degToRad(device.beta) : 0;
        var gamma = device.gamma ? MathUtils.degToRad(device.gamma) : 0;
        var orient = scope.screenOrientation ? MathUtils.degToRad(scope.screenOrientation) : 0;
        setObjectQuaternion(scope.object.quaternion, alpha, beta, gamma, orient);

        if (8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {
          lastQuaternion.copy(scope.object.quaternion);
          scope.dispatchEvent(changeEvent);
        }
      }
    };
  }();

  this.dispose = function () {
    scope.disconnect();
  };

  this.connect();
};

THREE.DeviceOrientationControls = DeviceOrientationControls;
DeviceOrientationControls.prototype = Object.create(THREE.EventDispatcher.prototype);
DeviceOrientationControls.prototype.constructor = DeviceOrientationControls;