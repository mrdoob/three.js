"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.CSMHelper = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var CSMHelper = /*#__PURE__*/function (_Group) {
  _inherits(CSMHelper, _Group);

  var _super = _createSuper(CSMHelper);

  function CSMHelper(csm) {
    var _this;

    _classCallCheck(this, CSMHelper);

    _this = _super.call(this);
    _this.csm = csm;
    _this.displayFrustum = true;
    _this.displayPlanes = true;
    _this.displayShadowBounds = true;
    var indices = new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]);
    var positions = new Float32Array(24);
    var frustumGeometry = new THREE.BufferGeometry();
    frustumGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
    frustumGeometry.setAttribute('position', new BufferAttribute(positions, 3, false));
    var frustumLines = new THREE.LineSegments(frustumGeometry, new THREE.LineBasicMaterial());

    _this.add(frustumLines);

    _this.frustumLines = frustumLines;
    _this.cascadeLines = [];
    _this.cascadePlanes = [];
    _this.shadowLines = [];
    return _this;
  }

  _createClass(CSMHelper, [{
    key: "updateVisibility",
    value: function updateVisibility() {
      var displayFrustum = this.displayFrustum;
      var displayPlanes = this.displayPlanes;
      var displayShadowBounds = this.displayShadowBounds;
      var frustumLines = this.frustumLines;
      var cascadeLines = this.cascadeLines;
      var cascadePlanes = this.cascadePlanes;
      var shadowLines = this.shadowLines;

      for (var i = 0, l = cascadeLines.length; i < l; i++) {
        var cascadeLine = cascadeLines[i];
        var cascadePlane = cascadePlanes[i];
        var shadowLineGroup = shadowLines[i];
        cascadeLine.visible = displayFrustum;
        cascadePlane.visible = displayFrustum && displayPlanes;
        shadowLineGroup.visible = displayShadowBounds;
      }

      frustumLines.visible = displayFrustum;
    }
  }, {
    key: "update",
    value: function update() {
      var csm = this.csm;
      var camera = csm.camera;
      var cascades = csm.cascades;
      var mainFrustum = csm.mainFrustum;
      var frustums = csm.frustums;
      var lights = csm.lights;
      var frustumLines = this.frustumLines;
      var frustumLinePositions = frustumLines.geometry.getAttribute('position');
      var cascadeLines = this.cascadeLines;
      var cascadePlanes = this.cascadePlanes;
      var shadowLines = this.shadowLines;
      this.position.copy(camera.position);
      this.quaternion.copy(camera.quaternion);
      this.scale.copy(camera.scale);
      this.updateMatrixWorld(true);

      while (cascadeLines.length > cascades) {
        this.remove(cascadeLines.pop());
        this.remove(cascadePlanes.pop());
        this.remove(shadowLines.pop());
      }

      while (cascadeLines.length < cascades) {
        var cascadeLine = new THREE.Box3Helper(new THREE.Box3(), 0xffffff);
        var planeMat = new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0.1,
          depthWrite: false,
          side: DoubleSide
        });
        var cascadePlane = new Mesh(new THREE.PlaneBufferGeometry(), planeMat);
        var shadowLineGroup = new Group();
        var shadowLine = new Box3Helper(new Box3(), 0xffff00);
        shadowLineGroup.add(shadowLine);
        this.add(cascadeLine);
        this.add(cascadePlane);
        this.add(shadowLineGroup);
        cascadeLines.push(cascadeLine);
        cascadePlanes.push(cascadePlane);
        shadowLines.push(shadowLineGroup);
      }

      for (var i = 0; i < cascades; i++) {
        var frustum = frustums[i];
        var light = lights[i];
        var shadowCam = light.shadow.camera;
        var _farVerts = frustum.vertices.far;
        var _cascadeLine = cascadeLines[i];
        var _cascadePlane = cascadePlanes[i];
        var _shadowLineGroup = shadowLines[i];
        var _shadowLine = _shadowLineGroup.children[0];

        _cascadeLine.box.min.copy(_farVerts[2]);

        _cascadeLine.box.max.copy(_farVerts[0]);

        _cascadeLine.box.max.z += 1e-4;

        _cascadePlane.position.addVectors(_farVerts[0], _farVerts[2]);

        _cascadePlane.position.multiplyScalar(0.5);

        _cascadePlane.scale.subVectors(_farVerts[0], _farVerts[2]);

        _cascadePlane.scale.z = 1e-4;
        this.remove(_shadowLineGroup);

        _shadowLineGroup.position.copy(shadowCam.position);

        _shadowLineGroup.quaternion.copy(shadowCam.quaternion);

        _shadowLineGroup.scale.copy(shadowCam.scale);

        _shadowLineGroup.updateMatrixWorld(true);

        this.attach(_shadowLineGroup);

        _shadowLine.box.min.set(shadowCam.bottom, shadowCam.left, -shadowCam.far);

        _shadowLine.box.max.set(shadowCam.top, shadowCam.right, -shadowCam.near);
      }

      var nearVerts = mainFrustum.vertices.near;
      var farVerts = mainFrustum.vertices.far;
      frustumLinePositions.setXYZ(0, farVerts[0].x, farVerts[0].y, farVerts[0].z);
      frustumLinePositions.setXYZ(1, farVerts[3].x, farVerts[3].y, farVerts[3].z);
      frustumLinePositions.setXYZ(2, farVerts[2].x, farVerts[2].y, farVerts[2].z);
      frustumLinePositions.setXYZ(3, farVerts[1].x, farVerts[1].y, farVerts[1].z);
      frustumLinePositions.setXYZ(4, nearVerts[0].x, nearVerts[0].y, nearVerts[0].z);
      frustumLinePositions.setXYZ(5, nearVerts[3].x, nearVerts[3].y, nearVerts[3].z);
      frustumLinePositions.setXYZ(6, nearVerts[2].x, nearVerts[2].y, nearVerts[2].z);
      frustumLinePositions.setXYZ(7, nearVerts[1].x, nearVerts[1].y, nearVerts[1].z);
      frustumLinePositions.needsUpdate = true;
    }
  }]);

  return CSMHelper;
}(Group);

THREE.CSMHelper = CSMHelper;