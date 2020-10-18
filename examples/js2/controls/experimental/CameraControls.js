"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.TrackballControls = THREE.MapControls = THREE.OrbitControls = THREE.CameraControls = void 0;

var CameraControls = function CameraControls(object, domElement) {
  if (domElement === undefined) console.warn('THREE.CameraControls: The second parameter "domElement" is now mandatory.');
  if (domElement === document) console.error('THREE.CameraControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.');
  this.object = object;
  this.domElement = domElement;
  this.enabled = true;
  this.target = new THREE.Vector3();
  this.trackball = false;
  this.minDistance = 0;
  this.maxDistance = Infinity;
  this.minZoom = 0;
  this.maxZoom = Infinity;
  this.minPolarAngle = 0;
  this.maxPolarAngle = Math.PI;
  this.minAzimuthAngle = -Infinity;
  this.maxAzimuthAngle = Infinity;
  this.enableDamping = false;
  this.dampingFactor = 0.05;
  this.enableZoom = true;
  this.zoomSpeed = 1.0;
  this.enableRotate = true;
  this.rotateSpeed = 1.0;
  this.enablePan = true;
  this.panSpeed = 1.0;
  this.screenSpacePanning = false;
  this.keyPanSpeed = 7.0;
  this.autoRotate = false;
  this.autoRotateSpeed = 2.0;
  this.enableKeys = true;
  this.keys = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    BOTTOM: 40
  };
  this.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: MOUSE.DOLLY,
    RIGHT: MOUSE.PAN
  };
  this.touches = {
    ONE: THREE.TOUCH.ROTATE,
    TWO: TOUCH.DOLLY_PAN
  };
  this.target0 = this.target.clone();
  this.position0 = this.object.position.clone();
  this.quaternion0 = this.object.quaternion.clone();
  this.zoom0 = this.object.zoom;

  this.getPolarAngle = function () {
    return spherical.phi;
  };

  this.getAzimuthalAngle = function () {
    return spherical.theta;
  };

  this.saveState = function () {
    scope.target0.copy(scope.target);
    scope.position0.copy(scope.object.position);
    scope.quaternion0.copy(scope.object.quaternion);
    scope.zoom0 = scope.object.zoom;
  };

  this.reset = function () {
    scope.target.copy(scope.target0);
    scope.object.position.copy(scope.position0);
    scope.object.quaternion.copy(scope.quaternion0);
    scope.object.zoom = scope.zoom0;
    scope.object.updateProjectionMatrix();
    scope.dispatchEvent(changeEvent);
    scope.update();
    state = STATE.NONE;
  };

  this.update = function () {
    var offset = new Vector3();
    var quat = new THREE.Quaternion().setFromUnitVectors(object.up, new Vector3(0, 1, 0));
    var quatInverse = quat.clone().inverse();
    var lastPosition = new Vector3();
    var lastQuaternion = new Quaternion();
    var q = new Quaternion();
    var vec = new Vector3();
    return function update() {
      var position = scope.object.position;
      offset.copy(position).sub(scope.target);

      if (scope.trackball) {
        if (sphericalDelta.theta) {
          vec.set(0, 1, 0).applyQuaternion(scope.object.quaternion);
          var factor = scope.enableDamping ? scope.dampingFactor : 1;
          q.setFromAxisAngle(vec, sphericalDelta.theta * factor);
          scope.object.quaternion.premultiply(q);
          offset.applyQuaternion(q);
        }

        if (sphericalDelta.phi) {
          vec.set(1, 0, 0).applyQuaternion(scope.object.quaternion);
          var factor = scope.enableDamping ? scope.dampingFactor : 1;
          q.setFromAxisAngle(vec, sphericalDelta.phi * factor);
          scope.object.quaternion.premultiply(q);
          offset.applyQuaternion(q);
        }

        offset.multiplyScalar(scale);
        offset.clampLength(scope.minDistance, scope.maxDistance);
      } else {
        offset.applyQuaternion(quat);

        if (scope.autoRotate && state === STATE.NONE) {
          rotateLeft(getAutoRotationAngle());
        }

        spherical.setFromVector3(offset);

        if (scope.enableDamping) {
          spherical.theta += sphericalDelta.theta * scope.dampingFactor;
          spherical.phi += sphericalDelta.phi * scope.dampingFactor;
        } else {
          spherical.theta += sphericalDelta.theta;
          spherical.phi += sphericalDelta.phi;
        }

        spherical.theta = Math.max(scope.minAzimuthAngle, Math.min(scope.maxAzimuthAngle, spherical.theta));
        spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));
        spherical.makeSafe();
        spherical.radius *= scale;
        spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));
        offset.setFromSpherical(spherical);
        offset.applyQuaternion(quatInverse);
      }

      if (scope.enableDamping === true) {
        scope.target.addScaledVector(panOffset, scope.dampingFactor);
      } else {
        scope.target.add(panOffset);
      }

      position.copy(scope.target).add(offset);

      if (scope.trackball === false) {
        scope.object.lookAt(scope.target);
      }

      if (scope.enableDamping === true) {
        sphericalDelta.theta *= 1 - scope.dampingFactor;
        sphericalDelta.phi *= 1 - scope.dampingFactor;
        panOffset.multiplyScalar(1 - scope.dampingFactor);
      } else {
        sphericalDelta.set(0, 0, 0);
        panOffset.set(0, 0, 0);
      }

      scale = 1;

      if (zoomChanged || lastPosition.distanceToSquared(scope.object.position) > EPS || 8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {
        scope.dispatchEvent(changeEvent);
        lastPosition.copy(scope.object.position);
        lastQuaternion.copy(scope.object.quaternion);
        zoomChanged = false;
        return true;
      }

      return false;
    };
  }();

  this.dispose = function () {
    scope.domElement.removeEventListener('contextmenu', onContextMenu, false);
    scope.domElement.removeEventListener('mousedown', onMouseDown, false);
    scope.domElement.removeEventListener('wheel', onMouseWheel, false);
    scope.domElement.removeEventListener('touchstart', onTouchStart, false);
    scope.domElement.removeEventListener('touchend', onTouchEnd, false);
    scope.domElement.removeEventListener('touchmove', onTouchMove, false);
    document.removeEventListener('mousemove', onMouseMove, false);
    document.removeEventListener('mouseup', onMouseUp, false);
    scope.domElement.removeEventListener('keydown', onKeyDown, false);
  };

  var scope = this;
  var changeEvent = {
    type: 'change'
  };
  var startEvent = {
    type: 'start'
  };
  var endEvent = {
    type: 'end'
  };
  var STATE = {
    NONE: -1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_PAN: 4,
    TOUCH_DOLLY_PAN: 5,
    TOUCH_DOLLY_ROTATE: 6
  };
  var state = STATE.NONE;
  var EPS = 0.000001;
  var spherical = new THREE.Spherical();
  var sphericalDelta = new Spherical();
  var scale = 1;
  var panOffset = new Vector3();
  var zoomChanged = false;
  var rotateStart = new THREE.Vector2();
  var rotateEnd = new Vector2();
  var rotateDelta = new Vector2();
  var panStart = new Vector2();
  var panEnd = new Vector2();
  var panDelta = new Vector2();
  var dollyStart = new Vector2();
  var dollyEnd = new Vector2();
  var dollyDelta = new Vector2();

  function getAutoRotationAngle() {
    return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
  }

  function getZoomScale() {
    return Math.pow(0.95, scope.zoomSpeed);
  }

  function rotateLeft(angle) {
    sphericalDelta.theta -= angle;
  }

  function rotateUp(angle) {
    sphericalDelta.phi -= angle;
  }

  var panLeft = function () {
    var v = new Vector3();
    return function panLeft(distance, objectMatrix) {
      v.setFromMatrixColumn(objectMatrix, 0);
      v.multiplyScalar(-distance);
      panOffset.add(v);
    };
  }();

  var panUp = function () {
    var v = new Vector3();
    return function panUp(distance, objectMatrix) {
      if (scope.screenSpacePanning === true) {
        v.setFromMatrixColumn(objectMatrix, 1);
      } else {
        v.setFromMatrixColumn(objectMatrix, 0);
        v.crossVectors(scope.object.up, v);
      }

      v.multiplyScalar(distance);
      panOffset.add(v);
    };
  }();

  var pan = function () {
    var offset = new Vector3();
    return function pan(deltaX, deltaY) {
      var element = scope.domElement;

      if (scope.object.isPerspectiveCamera) {
        var position = scope.object.position;
        offset.copy(position).sub(scope.target);
        var targetDistance = offset.length();
        targetDistance *= Math.tan(scope.object.fov / 2 * Math.PI / 180.0);
        panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix);
        panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix);
      } else if (scope.object.isOrthographicCamera) {
        panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix);
        panUp(deltaY * (scope.object.top - scope.object.bottom) / scope.object.zoom / element.clientHeight, scope.object.matrix);
      } else {
        console.warn('WARNING: CameraControls.js encountered an unknown camera type - pan disabled.');
        scope.enablePan = false;
      }
    };
  }();

  function dollyIn(dollyScale) {
    if (scope.object.isPerspectiveCamera) {
      scale /= dollyScale;
    } else if (scope.object.isOrthographicCamera) {
      scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale));
      scope.object.updateProjectionMatrix();
      zoomChanged = true;
    } else {
      console.warn('WARNING: CameraControls.js encountered an unknown camera type - dolly/zoom disabled.');
      scope.enableZoom = false;
    }
  }

  function dollyOut(dollyScale) {
    if (scope.object.isPerspectiveCamera) {
      scale *= dollyScale;
    } else if (scope.object.isOrthographicCamera) {
      scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale));
      scope.object.updateProjectionMatrix();
      zoomChanged = true;
    } else {
      console.warn('WARNING: CameraControls.js encountered an unknown camera type - dolly/zoom disabled.');
      scope.enableZoom = false;
    }
  }

  function handleMouseDownRotate(event) {
    rotateStart.set(event.clientX, event.clientY);
  }

  function handleMouseDownDolly(event) {
    dollyStart.set(event.clientX, event.clientY);
  }

  function handleMouseDownPan(event) {
    panStart.set(event.clientX, event.clientY);
  }

  function handleMouseMoveRotate(event) {
    rotateEnd.set(event.clientX, event.clientY);
    rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);
    var element = scope.domElement;
    rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight);
    rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);
    rotateStart.copy(rotateEnd);
    scope.update();
  }

  function handleMouseMoveDolly(event) {
    dollyEnd.set(event.clientX, event.clientY);
    dollyDelta.subVectors(dollyEnd, dollyStart);

    if (dollyDelta.y > 0) {
      dollyIn(getZoomScale());
    } else if (dollyDelta.y < 0) {
      dollyOut(getZoomScale());
    }

    dollyStart.copy(dollyEnd);
    scope.update();
  }

  function handleMouseMovePan(event) {
    panEnd.set(event.clientX, event.clientY);
    panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);
    pan(panDelta.x, panDelta.y);
    panStart.copy(panEnd);
    scope.update();
  }

  function handleMouseUp() {}

  function handleMouseWheel(event) {
    if (event.deltaY < 0) {
      dollyOut(getZoomScale());
    } else if (event.deltaY > 0) {
      dollyIn(getZoomScale());
    }

    scope.update();
  }

  function handleKeyDown(event) {
    var needsUpdate = false;

    switch (event.keyCode) {
      case scope.keys.UP:
        pan(0, scope.keyPanSpeed);
        needsUpdate = true;
        break;

      case scope.keys.BOTTOM:
        pan(0, -scope.keyPanSpeed);
        needsUpdate = true;
        break;

      case scope.keys.LEFT:
        pan(scope.keyPanSpeed, 0);
        needsUpdate = true;
        break;

      case scope.keys.RIGHT:
        pan(-scope.keyPanSpeed, 0);
        needsUpdate = true;
        break;
    }

    if (needsUpdate) {
      event.preventDefault();
      scope.update();
    }
  }

  function handleTouchStartRotate(event) {
    if (event.touches.length == 1) {
      rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
    } else {
      var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
      var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
      rotateStart.set(x, y);
    }
  }

  function handleTouchStartPan(event) {
    if (event.touches.length == 1) {
      panStart.set(event.touches[0].pageX, event.touches[0].pageY);
    } else {
      var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
      var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
      panStart.set(x, y);
    }
  }

  function handleTouchStartDolly(event) {
    var dx = event.touches[0].pageX - event.touches[1].pageX;
    var dy = event.touches[0].pageY - event.touches[1].pageY;
    var distance = Math.sqrt(dx * dx + dy * dy);
    dollyStart.set(0, distance);
  }

  function handleTouchStartDollyPan(event) {
    if (scope.enableZoom) handleTouchStartDolly(event);
    if (scope.enablePan) handleTouchStartPan(event);
  }

  function handleTouchStartDollyRotate(event) {
    if (scope.enableZoom) handleTouchStartDolly(event);
    if (scope.enableRotate) handleTouchStartRotate(event);
  }

  function handleTouchMoveRotate(event) {
    if (event.touches.length == 1) {
      rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
    } else {
      var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
      var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
      rotateEnd.set(x, y);
    }

    rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);
    var element = scope.domElement;
    rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight);
    rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);
    rotateStart.copy(rotateEnd);
  }

  function handleTouchMovePan(event) {
    if (event.touches.length == 1) {
      panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
    } else {
      var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
      var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
      panEnd.set(x, y);
    }

    panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);
    pan(panDelta.x, panDelta.y);
    panStart.copy(panEnd);
  }

  function handleTouchMoveDolly(event) {
    var dx = event.touches[0].pageX - event.touches[1].pageX;
    var dy = event.touches[0].pageY - event.touches[1].pageY;
    var distance = Math.sqrt(dx * dx + dy * dy);
    dollyEnd.set(0, distance);
    dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, scope.zoomSpeed));
    dollyIn(dollyDelta.y);
    dollyStart.copy(dollyEnd);
  }

  function handleTouchMoveDollyPan(event) {
    if (scope.enableZoom) handleTouchMoveDolly(event);
    if (scope.enablePan) handleTouchMovePan(event);
  }

  function handleTouchMoveDollyRotate(event) {
    if (scope.enableZoom) handleTouchMoveDolly(event);
    if (scope.enableRotate) handleTouchMoveRotate(event);
  }

  function handleTouchEnd() {}

  function onMouseDown(event) {
    if (scope.enabled === false) return;
    event.preventDefault();
    scope.domElement.focus ? scope.domElement.focus() : window.focus();
    var mouseAction;

    switch (event.button) {
      case 0:
        mouseAction = scope.mouseButtons.LEFT;
        break;

      case 1:
        mouseAction = scope.mouseButtons.MIDDLE;
        break;

      case 2:
        mouseAction = scope.mouseButtons.RIGHT;
        break;

      default:
        mouseAction = -1;
    }

    switch (mouseAction) {
      case MOUSE.DOLLY:
        if (scope.enableZoom === false) return;
        handleMouseDownDolly(event);
        state = STATE.DOLLY;
        break;

      case MOUSE.ROTATE:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (scope.enablePan === false) return;
          handleMouseDownPan(event);
          state = STATE.PAN;
        } else {
          if (scope.enableRotate === false) return;
          handleMouseDownRotate(event);
          state = STATE.ROTATE;
        }

        break;

      case MOUSE.PAN:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (scope.enableRotate === false) return;
          handleMouseDownRotate(event);
          state = STATE.ROTATE;
        } else {
          if (scope.enablePan === false) return;
          handleMouseDownPan(event);
          state = STATE.PAN;
        }

        break;

      default:
        state = STATE.NONE;
    }

    if (state !== STATE.NONE) {
      document.addEventListener('mousemove', onMouseMove, false);
      document.addEventListener('mouseup', onMouseUp, false);
      scope.dispatchEvent(startEvent);
    }
  }

  function onMouseMove(event) {
    if (scope.enabled === false) return;
    event.preventDefault();

    switch (state) {
      case STATE.ROTATE:
        if (scope.enableRotate === false) return;
        handleMouseMoveRotate(event);
        break;

      case STATE.DOLLY:
        if (scope.enableZoom === false) return;
        handleMouseMoveDolly(event);
        break;

      case STATE.PAN:
        if (scope.enablePan === false) return;
        handleMouseMovePan(event);
        break;
    }
  }

  function onMouseUp(event) {
    if (scope.enabled === false) return;
    handleMouseUp(event);
    document.removeEventListener('mousemove', onMouseMove, false);
    document.removeEventListener('mouseup', onMouseUp, false);
    scope.dispatchEvent(endEvent);
    state = STATE.NONE;
  }

  function onMouseWheel(event) {
    if (scope.enabled === false || scope.enableZoom === false || state !== STATE.NONE && state !== STATE.ROTATE) return;
    event.preventDefault();
    event.stopPropagation();
    scope.dispatchEvent(startEvent);
    handleMouseWheel(event);
    scope.dispatchEvent(endEvent);
  }

  function onKeyDown(event) {
    if (scope.enabled === false || scope.enableKeys === false || scope.enablePan === false) return;
    handleKeyDown(event);
  }

  function onTouchStart(event) {
    if (scope.enabled === false) return;
    event.preventDefault();

    switch (event.touches.length) {
      case 1:
        switch (scope.touches.ONE) {
          case TOUCH.ROTATE:
            if (scope.enableRotate === false) return;
            handleTouchStartRotate(event);
            state = STATE.TOUCH_ROTATE;
            break;

          case TOUCH.PAN:
            if (scope.enablePan === false) return;
            handleTouchStartPan(event);
            state = STATE.TOUCH_PAN;
            break;

          default:
            state = STATE.NONE;
        }

        break;

      case 2:
        switch (scope.touches.TWO) {
          case TOUCH.DOLLY_PAN:
            if (scope.enableZoom === false && scope.enablePan === false) return;
            handleTouchStartDollyPan(event);
            state = STATE.TOUCH_DOLLY_PAN;
            break;

          case TOUCH.DOLLY_ROTATE:
            if (scope.enableZoom === false && scope.enableRotate === false) return;
            handleTouchStartDollyRotate(event);
            state = STATE.TOUCH_DOLLY_ROTATE;
            break;

          default:
            state = STATE.NONE;
        }

        break;

      default:
        state = STATE.NONE;
    }

    if (state !== STATE.NONE) {
      scope.dispatchEvent(startEvent);
    }
  }

  function onTouchMove(event) {
    if (scope.enabled === false) return;
    event.preventDefault();
    event.stopPropagation();

    switch (state) {
      case STATE.TOUCH_ROTATE:
        if (scope.enableRotate === false) return;
        handleTouchMoveRotate(event);
        scope.update();
        break;

      case STATE.TOUCH_PAN:
        if (scope.enablePan === false) return;
        handleTouchMovePan(event);
        scope.update();
        break;

      case STATE.TOUCH_DOLLY_PAN:
        if (scope.enableZoom === false && scope.enablePan === false) return;
        handleTouchMoveDollyPan(event);
        scope.update();
        break;

      case STATE.TOUCH_DOLLY_ROTATE:
        if (scope.enableZoom === false && scope.enableRotate === false) return;
        handleTouchMoveDollyRotate(event);
        scope.update();
        break;

      default:
        state = STATE.NONE;
    }
  }

  function onTouchEnd(event) {
    if (scope.enabled === false) return;
    handleTouchEnd(event);
    scope.dispatchEvent(endEvent);
    state = STATE.NONE;
  }

  function onContextMenu(event) {
    if (scope.enabled === false) return;
    event.preventDefault();
  }

  scope.domElement.addEventListener('contextmenu', onContextMenu, false);
  scope.domElement.addEventListener('mousedown', onMouseDown, false);
  scope.domElement.addEventListener('wheel', onMouseWheel, false);
  scope.domElement.addEventListener('touchstart', onTouchStart, false);
  scope.domElement.addEventListener('touchend', onTouchEnd, false);
  scope.domElement.addEventListener('touchmove', onTouchMove, false);
  scope.domElement.addEventListener('keydown', onKeyDown, false);

  if (scope.domElement.tabIndex === -1) {
    scope.domElement.tabIndex = 0;
  }

  this.object.lookAt(scope.target);
  this.update();
  this.saveState();
};

THREE.CameraControls = CameraControls;
CameraControls.prototype = Object.create(THREE.EventDispatcher.prototype);
CameraControls.prototype.constructor = CameraControls;

var OrbitControls = function OrbitControls(object, domElement) {
  CameraControls.call(this, object, domElement);
  this.mouseButtons.LEFT = MOUSE.ROTATE;
  this.mouseButtons.RIGHT = MOUSE.PAN;
  this.touches.ONE = TOUCH.ROTATE;
  this.touches.TWO = TOUCH.DOLLY_PAN;
};

THREE.OrbitControls = OrbitControls;
OrbitControls.prototype = Object.create(EventDispatcher.prototype);
OrbitControls.prototype.constructor = OrbitControls;

var MapControls = function MapControls(object, domElement) {
  CameraControls.call(this, object, domElement);
  this.mouseButtons.LEFT = MOUSE.PAN;
  this.mouseButtons.RIGHT = MOUSE.ROTATE;
  this.touches.ONE = TOUCH.PAN;
  this.touches.TWO = TOUCH.DOLLY_ROTATE;
};

THREE.MapControls = MapControls;
MapControls.prototype = Object.create(EventDispatcher.prototype);
MapControls.prototype.constructor = MapControls;

var TrackballControls = function TrackballControls(object, domElement) {
  CameraControls.call(this, object, domElement);
  this.trackball = true;
  this.screenSpacePanning = true;
  this.autoRotate = false;
  this.mouseButtons.LEFT = MOUSE.ROTATE;
  this.mouseButtons.RIGHT = MOUSE.PAN;
  this.touches.ONE = TOUCH.ROTATE;
  this.touches.TWO = TOUCH.DOLLY_PAN;
};

THREE.TrackballControls = TrackballControls;
TrackballControls.prototype = Object.create(EventDispatcher.prototype);
TrackballControls.prototype.constructor = TrackballControls;