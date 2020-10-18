"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.CSS3DRenderer = THREE.CSS3DSprite = THREE.CSS3DObject = void 0;

var CSS3DObject = function CSS3DObject(element) {
  Object3D.call(this);
  this.element = element || document.createElement('div');
  this.element.style.position = 'absolute';
  this.element.style.pointerEvents = 'auto';
  this.addEventListener('removed', function () {
    this.traverse(function (object) {
      if (object.element instanceof Element && object.element.parentNode !== null) {
        object.element.parentNode.removeChild(object.element);
      }
    });
  });
};

THREE.CSS3DObject = CSS3DObject;
CSS3DObject.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {
  constructor: CSS3DObject,
  copy: function copy(source, recursive) {
    Object3D.prototype.copy.call(this, source, recursive);
    this.element = source.element.cloneNode(true);
    return this;
  }
});

var CSS3DSprite = function CSS3DSprite(element) {
  CSS3DObject.call(this, element);
};

THREE.CSS3DSprite = CSS3DSprite;
CSS3DSprite.prototype = Object.create(CSS3DObject.prototype);
CSS3DSprite.prototype.constructor = CSS3DSprite;

var CSS3DRenderer = function CSS3DRenderer() {
  var _this = this;

  var _width, _height;

  var _widthHalf, _heightHalf;

  var matrix = new THREE.Matrix4();
  var cache = {
    camera: {
      fov: 0,
      style: ''
    },
    objects: new WeakMap()
  };
  var domElement = document.createElement('div');
  domElement.style.overflow = 'hidden';
  this.domElement = domElement;
  var cameraElement = document.createElement('div');
  cameraElement.style.WebkitTransformStyle = 'preserve-3d';
  cameraElement.style.transformStyle = 'preserve-3d';
  cameraElement.style.pointerEvents = 'none';
  domElement.appendChild(cameraElement);
  var isIE = /Trident/i.test(navigator.userAgent);

  this.getSize = function () {
    return {
      width: _width,
      height: _height
    };
  };

  this.setSize = function (width, height) {
    _width = width;
    _height = height;
    _widthHalf = _width / 2;
    _heightHalf = _height / 2;
    domElement.style.width = width + 'px';
    domElement.style.height = height + 'px';
    cameraElement.style.width = width + 'px';
    cameraElement.style.height = height + 'px';
  };

  function epsilon(value) {
    return Math.abs(value) < 1e-10 ? 0 : value;
  }

  function getCameraCSSMatrix(matrix) {
    var elements = matrix.elements;
    return 'matrix3d(' + epsilon(elements[0]) + ',' + epsilon(-elements[1]) + ',' + epsilon(elements[2]) + ',' + epsilon(elements[3]) + ',' + epsilon(elements[4]) + ',' + epsilon(-elements[5]) + ',' + epsilon(elements[6]) + ',' + epsilon(elements[7]) + ',' + epsilon(elements[8]) + ',' + epsilon(-elements[9]) + ',' + epsilon(elements[10]) + ',' + epsilon(elements[11]) + ',' + epsilon(elements[12]) + ',' + epsilon(-elements[13]) + ',' + epsilon(elements[14]) + ',' + epsilon(elements[15]) + ')';
  }

  function getObjectCSSMatrix(matrix, cameraCSSMatrix) {
    var elements = matrix.elements;
    var matrix3d = 'matrix3d(' + epsilon(elements[0]) + ',' + epsilon(elements[1]) + ',' + epsilon(elements[2]) + ',' + epsilon(elements[3]) + ',' + epsilon(-elements[4]) + ',' + epsilon(-elements[5]) + ',' + epsilon(-elements[6]) + ',' + epsilon(-elements[7]) + ',' + epsilon(elements[8]) + ',' + epsilon(elements[9]) + ',' + epsilon(elements[10]) + ',' + epsilon(elements[11]) + ',' + epsilon(elements[12]) + ',' + epsilon(elements[13]) + ',' + epsilon(elements[14]) + ',' + epsilon(elements[15]) + ')';

    if (isIE) {
      return 'translate(-50%,-50%)' + 'translate(' + _widthHalf + 'px,' + _heightHalf + 'px)' + cameraCSSMatrix + matrix3d;
    }

    return 'translate(-50%,-50%)' + matrix3d;
  }

  function renderObject(object, scene, camera, cameraCSSMatrix) {
    if (object instanceof CSS3DObject) {
      object.onBeforeRender(_this, scene, camera);
      var style;

      if (object instanceof CSS3DSprite) {
        matrix.copy(camera.matrixWorldInverse);
        matrix.transpose();
        matrix.copyPosition(object.matrixWorld);
        matrix.scale(object.scale);
        matrix.elements[3] = 0;
        matrix.elements[7] = 0;
        matrix.elements[11] = 0;
        matrix.elements[15] = 1;
        style = getObjectCSSMatrix(matrix, cameraCSSMatrix);
      } else {
        style = getObjectCSSMatrix(object.matrixWorld, cameraCSSMatrix);
      }

      var element = object.element;
      var cachedObject = cache.objects.get(object);

      if (cachedObject === undefined || cachedObject.style !== style) {
        element.style.WebkitTransform = style;
        element.style.transform = style;
        var objectData = {
          style: style
        };

        if (isIE) {
          objectData.distanceToCameraSquared = getDistanceToSquared(camera, object);
        }

        cache.objects.set(object, objectData);
      }

      element.style.display = object.visible ? '' : 'none';

      if (element.parentNode !== cameraElement) {
        cameraElement.appendChild(element);
      }

      object.onAfterRender(_this, scene, camera);
    }

    for (var i = 0, l = object.children.length; i < l; i++) {
      renderObject(object.children[i], scene, camera, cameraCSSMatrix);
    }
  }

  var getDistanceToSquared = function () {
    var a = new THREE.Vector3();
    var b = new Vector3();
    return function (object1, object2) {
      a.setFromMatrixPosition(object1.matrixWorld);
      b.setFromMatrixPosition(object2.matrixWorld);
      return a.distanceToSquared(b);
    };
  }();

  function filterAndFlatten(scene) {
    var result = [];
    scene.traverse(function (object) {
      if (object instanceof CSS3DObject) result.push(object);
    });
    return result;
  }

  function zOrder(scene) {
    var sorted = filterAndFlatten(scene).sort(function (a, b) {
      var distanceA = cache.objects.get(a).distanceToCameraSquared;
      var distanceB = cache.objects.get(b).distanceToCameraSquared;
      return distanceA - distanceB;
    });
    var zMax = sorted.length;

    for (var i = 0, l = sorted.length; i < l; i++) {
      sorted[i].element.style.zIndex = zMax - i;
    }
  }

  this.render = function (scene, camera) {
    var fov = camera.projectionMatrix.elements[5] * _heightHalf;

    if (cache.camera.fov !== fov) {
      if (camera.isPerspectiveCamera) {
        domElement.style.WebkitPerspective = fov + 'px';
        domElement.style.perspective = fov + 'px';
      } else {
        domElement.style.WebkitPerspective = '';
        domElement.style.perspective = '';
      }

      cache.camera.fov = fov;
    }

    if (scene.autoUpdate === true) scene.updateMatrixWorld();
    if (camera.parent === null) camera.updateMatrixWorld();

    if (camera.isOrthographicCamera) {
      var tx = -(camera.right + camera.left) / 2;
      var ty = (camera.top + camera.bottom) / 2;
    }

    var cameraCSSMatrix = camera.isOrthographicCamera ? 'scale(' + fov + ')' + 'translate(' + epsilon(tx) + 'px,' + epsilon(ty) + 'px)' + getCameraCSSMatrix(camera.matrixWorldInverse) : 'translateZ(' + fov + 'px)' + getCameraCSSMatrix(camera.matrixWorldInverse);
    var style = cameraCSSMatrix + 'translate(' + _widthHalf + 'px,' + _heightHalf + 'px)';

    if (cache.camera.style !== style && !isIE) {
      cameraElement.style.WebkitTransform = style;
      cameraElement.style.transform = style;
      cache.camera.style = style;
    }

    renderObject(scene, scene, camera, cameraCSSMatrix);

    if (isIE) {
      zOrder(scene);
    }
  };
};

THREE.CSS3DRenderer = CSS3DRenderer;