var $, OrbitControls, THREE,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

THREE = require('threejs');

$ = require('jquery');

OrbitControls = (function(_super) {
  __extends(OrbitControls, _super);

  OrbitControls.prototype.EPS = 0.000001;

  OrbitControls.prototype.rotateStart = new THREE.Vector2();

  OrbitControls.prototype.rotateEnd = new THREE.Vector2();

  OrbitControls.prototype.rotateDelta = new THREE.Vector2();

  OrbitControls.prototype.panStart = new THREE.Vector2();

  OrbitControls.prototype.panEnd = new THREE.Vector2();

  OrbitControls.prototype.panDelta = new THREE.Vector2();

  OrbitControls.prototype.dollyStart = new THREE.Vector2();

  OrbitControls.prototype.dollyEnd = new THREE.Vector2();

  OrbitControls.prototype.dollyDelta = new THREE.Vector2();

  OrbitControls.prototype.phiDelta = 0;

  OrbitControls.prototype.thetaDelta = 0;

  OrbitControls.prototype.scale = 1;

  OrbitControls.prototype.panVec = new THREE.Vector3(0, 0, 0);

  OrbitControls.prototype.lastPosition = new THREE.Vector3(0, 0, 0);

  OrbitControls.prototype.STATE = {
    NONE: -1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_DOLLY: 4,
    TOUCH_PAN: 5
  };

  OrbitControls.prototype.state = -1;

  OrbitControls.prototype.changeEvent = {
    type: 'change'
  };

  function OrbitControls(object, domElement, localElement) {
    this.onKeyDown = __bind(this.onKeyDown, this);
    this.onMouseMove = __bind(this.onMouseMove, this);
    this.onMouseUp = __bind(this.onMouseUp, this);
    this.onMouseDown = __bind(this.onMouseDown, this);
    console.log('con last pos', this.lastPosition);
    this.object = object;
    this.domElement = domElement != null ? domElement : document;
    this.localElement = localElement != null ? localElement : document;
    this.enabled = true;
    this.target = new THREE.Vector3();
    this.center = this.target;
    this.noZoom = false;
    this.zoomSpeed = 1.0;
    this.minDistance = 0;
    this.maxDistance = Infinity;
    this.noRotate = false;
    this.rotateSpeed = 1.0;
    this.noPan = false;
    this.keyPanSpeed = 7.0;
    this.autoRotate = false;
    this.autoRotateSpeed = 2.0;
    this.minPolarAngle = 0;
    this.maxPolarAngle = Math.PI;
    this.noKeys = false;
    this.keys = {
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      BOTTOM: 40
    };
    this.initalizeEvents();
    this;
  }

  OrbitControls.prototype.initalizeEvents = function() {
    this.localElement.addEventListener('mousedown', this.onMouseDown, false);
    this.domElement.addEventListener('mousewheel', this.onMouseWheel, false);
    this.domElement.addEventListener('DOMMouseScroll', this.onMouseWheel, false);
    this.domElement.addEventListener('keydown', this.onKeyDown, false);
    this.localElement.addEventListener('touchstart', this.touchstart, false);
    this.domElement.addEventListener('touchend', this.touchend, false);
    return this.domElement.addEventListener('touchmove', this.touchmove, false);
  };

  OrbitControls.prototype.rotateLeft = function(angle) {
    if (angle === void 0) {
      angle = this.getAutoRotationAngle();
    }
    return this.thetaDelta -= angle;
  };

  OrbitControls.prototype.rotateUp = function(angle) {
    if (angle === void 0) {
      angle = this.getAutoRotationAngle();
    }
    return this.phiDelta -= angle;
  };

  OrbitControls.prototype.panLeft = function(distance) {
    var panOffset, te;
    panOffset = new THREE.Vector3();
    te = this.object.matrix.elements;
    panOffset.set(te[0], te[1], te[2]);
    panOffset.multiplyScalar(-distance);
    return this.panVec.add(panOffset);
  };

  OrbitControls.prototype.panUp = function(distance) {
    var panOffset, te;
    panOffset = new THREE.Vector3();
    te = this.object.matrix.elements;
    panOffset.set(te[4], te[5], te[6]);
    panOffset.multiplyScalar(distance);
    return this.panVec.add(panOffset);
  };

  OrbitControls.prototype.pan = function(delta) {
    var element, offset, position, targetDistance;
    console.log('pan last pos', this.lastPosition);
    element = this.domElement === document ? this.domElement.body : this.domElement;
    console.log('domElement', this.domElement);
    console.log('element', this.element);
    if (this.object.fov != null) {
      position = this.object.position;
      offset = position.clone().sub(this.target);
      targetDistance = offset.length();
      targetDistance *= Math.tan((this.object.fov / 2) * Math.PI / 180.0);
      this.panLeft(2 * delta.x * targetDistance / element.clientHeight);
      return this.panUp(2 * delta.y * targetDistance / element.clientHeight);
    } else if (this.object.top != null) {
      this.panLeft(delta.x * (this.object.right - this.object.left) / element.clientWidth);
      return this.panUp(delta.y * (this.object.top - this.object.bottom) / element.clientHeight);
    } else {
      return console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
    }
  };

  OrbitControls.prototype.dollyIn = function(dollyScale) {
    if (dollyScale === void 0) {
      dollyScale = this.getZoomScale();
    }
    return this.scale /= dollyScale;
  };

  OrbitControls.prototype.dollyOut = function() {
    var dollyScale;
    if (dollyScale === void 0) {
      dollyScale = this.getZoomScale();
    }
    return this.scale *= dollyScale;
  };

  OrbitControls.prototype.update = function() {
    var offset, phi, position, radius, theta;
    console.log('update last pos', this.lastPosition);
    debugger;
    position = this.object.position;
    offset = position.clone().sub(this.target);
    theta = Math.atan2(offset.x, offset.z);
    phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);
    if (this.autoRotate) {
      this.rotateLeft(this.getAutoRotationAngle());
    }
    theta += this.thetaDelta;
    phi += this.phiDelta;
    phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phi));
    phi = Math.max(this.EPS, Math.min(Math.PI - this.EPS, phi));
    radius = offset.length() * this.scale;
    radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius));
    console.log('pan vec', this.panVec);
    this.target.add(this.panVec);
    offset.x = radius * Math.sin(phi) * Math.sin(theta);
    offset.y = radius * Math.cos(phi);
    offset.z = radius * Math.sin(phi) * Math.cos(theta);
    position.copy(this.target).add(offset);
    this.object.lookAt(this.target);
    this.thetaDelta = 0;
    this.phiDelta = 0;
    this.scale = 1;
    this.panVec.set(0, 0, 0);
    console.log('last pos', this.lastPosition);
    if (this.lastPosition.distanceTo(this.object.position) > 0) {
      this.dispatchEvent(this.changeEvent);
      return this.lastPosition.copy(this.object.position);
    }
  };

  OrbitControls.prototype.onMouseDown = function(event) {
    if (this.enabled === false) {
      return;
    }
    event.preventDefault();
    if (event.button === 0) {
      if (this.noRotate === true) {
        return;
      }
      this.state = this.STATE.ROTATE;
      this.rotateStart.set(event.clientX, event.clientY);
    } else if (event.button === 1) {
      if (this.noZoom === true) {
        return;
      }
      this.state = this.STATE.DOLLY;
      this.dollyStart.set(event.clientX, event.clientY);
    } else if (event.button === 2) {
      if (this.noPan === true) {
        return;
      }
      this.state = this.STATE.PAN;
      this.panStart.set(event.clientX, event.clientY);
    }
    this.domElement.addEventListener('mousemove', this.onMouseMove, false);
    return this.domElement.addEventListener('mouseup', this.onMouseUp, false);
  };

  OrbitControls.prototype.onMouseUp = function() {
    if (this.enabled === false) {
      return;
    }
    this.domElement.removeEventListener('mousemove', this.onMouseMove, false);
    this.domElement.removeEventListener('mouseup', this.onMouseUp, false);
    return this.state = this.STATE.NONE;
  };

  OrbitControls.prototype.onMouseMove = function(event) {
    var element;
    if (this.enabled === false) {
      return;
    }
    event.preventDefault();
    element = this.domElement === document ? this.domElement.body : this.domElement;
    if (this.state === this.STATE.ROTATE) {
      if (this.noRotate === true) {
        return;
      }
      this.rotateEnd.set(event.clientX, event.clientY);
      this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
      this.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientWidth * this.rotateSpeed);
      this.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight * this.rotateSpeed);
      this.rotateStart.copy(this.rotateEnd);
    } else if (this.state === this.STATE.DOLLY) {
      if (this.noZoom === true) {
        return;
      }
      this.dollyEnd.set(event.clientX, event.clientY);
      this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);
      if (this.dollyDelta.y > 0) {
        this.dollyIn();
      } else {
        this.dollyOut();
      }
      this.dollyStart.copy(this.dollyEnd);
    } else if (this.state === this.STATE.PAN) {
      if (this.noPan === true) {
        return;
      }
      this.panEnd.set(event.clientX, event.clientY);
      this.panDelta.subVectors(this.panEnd, this.panStart);
      this.pan(this.panDelta);
      this.panStart.copy(this.panEnd);
    }
    return this.update();
  };

  OrbitControls.prototype.onMouseWheel = function(event) {
    var delta;
    if (this.enabled === false || this.noZoom === true) {
      return;
    }
    delta = 0;
    if (event.wheelDelta != null) {
      delta = event.wheelDelta;
    } else if (event.detail != null) {
      delta = -event.detail;
    }
    if (delta > 0) {
      return this.dollyOut();
    } else {
      return this.dollyIn();
    }
  };

  OrbitControls.prototype.onKeyDown = function(event) {
    var needUpdate;
    if (this.enabled === false) {
      return;
    }
    if (this.noKeys === true) {
      return;
    }
    if (this.noPan === true) {
      return;
    }
    needUpdate = false;
    if (event.keyCode === this.keys.UP) {
      this.pan(new THREE.Vector2(0, this.keyPanSpeed));
      needUpdate = true;
    } else if (event.keyCode === this.keys.BOTTOM) {
      this.pan(new THREE.Vector2(0, -this.keyPanSpeed));
      needUpdate = true;
    } else if (event.keyCode === this.keys.LEFT) {
      this.pan(new THREE.Vector2(this.keyPanSpeed, 0));
      needUpdate = true;
    } else if (event.keyCode === this.keys.RIGHT) {
      this.pan(new THREE.Vector2(-this.keyPanSpeed, 0));
      needUpdate = true;
    }
    if (needUpdate === true) {
      return this.update();
    }
  };

  OrbitControls.prototype.touchstart = function(event) {
    var distance, dx, dy;
    if (this.enabled === false) {
      return;
    }
    if (event.touches.length === 1) {
      if (this.noRotate === true) {
        return;
      }
      this.state = this.STATE.TOUCH_ROTATE;
      return this.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
    } else if (event.touches.length === 2) {
      if (this.noZoom === true) {
        return;
      }
      this.state = this.STATE.TOUCH_DOLLY;
      dx = event.touches[0].pageX - event.touches[1].pageX;
      dy = event.touches[0].pageY - event.touches[1].pageY;
      distance = Math.sqrt(dx * dx + dy * dy);
      return this.dollyStart.set(0, distance);
    } else if (event.touches.length === 3) {
      if (this.noPan === true) {
        return;
      }
      this.state = this.STATE.TOUCH_PAN;
      return this.panStart.set(event.touches[0].pageX, event.touches[0].pageY);
    } else {
      return this.state = this.STATE.NONE;
    }
  };

  OrbitControls.prototype.touchmove = function(event) {
    var distance, dx, dy, element;
    if (this.enabled === false) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    element = this.domElement === document ? this.domElement.body : this.domElement;
    if (event.touches.length === 1) {
      if (this.noRotate === true) {
        return;
      }
      if (this.state !== this.STATE.TOUCH_ROTATE) {
        return;
      }
      this.rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
      this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
      this.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientWidth * this.rotateSpeed);
      this.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight * this.rotateSpeed);
      return this.rotateStart.copy(rotateEnd);
    } else if (event.touches.length === 2) {
      if (this.noZoom === true) {
        return;
      }
      if (this.state !== this.STATE.TOUCH_DOLLY) {
        return;
      }
      dx = event.touches[0].pageX - event.touches[1].pageX;
      dy = event.touches[0].pageY - event.touches[1].pageY;
      distance = Math.sqrt(dx * dx + dy * dy);
      this.dollyEnd.set(0, distance);
      this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);
      if (this.dollyDelta.y > 0) {
        this.dollyOut();
      } else {
        this.dollyIn();
      }
      return this.dollyStart.copy(this.dollyEnd);
    } else if (event.touches.length === 3) {
      if (this.noPan === true) {
        return;
      }
      if (this.state !== this.STATE.TOUCH_PAN) {
        return;
      }
      this.panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
      this.panDelta.subVectors(this.panEnd, this.panStart);
      this.pan(this.panDelta);
      return this.panStart.copy(this.panEnd);
    } else {
      return this.state = this.STATE.NONE;
    }
  };

  OrbitControls.prototype.touchend = function() {
    if (this.enabled === false) {
      return;
    }
    return this.state = this.STATE.NONE;
  };

  OrbitControls.prototype.getZoomScale = function() {
    return Math.pow(0.95, this.zoomSpeed);
  };

  OrbitControls.prototype.getAutoRotationAngle = function() {
    return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
  };

  return OrbitControls;

})(THREE.EventDispatcher);

module.exports = OrbitControls;
