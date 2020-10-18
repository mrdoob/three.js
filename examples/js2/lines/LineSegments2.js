"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.LineSegments2 = void 0;

var LineSegments2 = function LineSegments2(geometry, material) {
  if (geometry === undefined) geometry = new THREE.LineSegmentsGeometry();
  if (material === undefined) material = new THREE.LineMaterial({
    color: Math.random() * 0xffffff
  });
  Mesh.call(this, geometry, material);
  this.type = 'LineSegments2';
};

THREE.LineSegments2 = LineSegments2;
LineSegments2.prototype = Object.assign(Object.create(THREE.Mesh.prototype), {
  constructor: LineSegments2,
  isLineSegments2: true,
  computeLineDistances: function () {
    var start = new THREE.Vector3();
    var end = new Vector3();
    return function computeLineDistances() {
      var geometry = this.geometry;
      var instanceStart = geometry.attributes.instanceStart;
      var instanceEnd = geometry.attributes.instanceEnd;
      var lineDistances = new Float32Array(2 * instanceStart.data.count);

      for (var i = 0, j = 0, l = instanceStart.data.count; i < l; i++, j += 2) {
        start.fromBufferAttribute(instanceStart, i);
        end.fromBufferAttribute(instanceEnd, i);
        lineDistances[j] = j === 0 ? 0 : lineDistances[j - 1];
        lineDistances[j + 1] = lineDistances[j] + start.distanceTo(end);
      }

      var instanceDistanceBuffer = new THREE.InstancedInterleavedBuffer(lineDistances, 2, 1);
      geometry.setAttribute('instanceDistanceStart', new THREE.InterleavedBufferAttribute(instanceDistanceBuffer, 1, 0));
      geometry.setAttribute('instanceDistanceEnd', new InterleavedBufferAttribute(instanceDistanceBuffer, 1, 1));
      return this;
    };
  }(),
  raycast: function () {
    var start = new THREE.Vector4();
    var end = new Vector4();
    var ssOrigin = new Vector4();
    var ssOrigin3 = new Vector3();
    var mvMatrix = new THREE.Matrix4();
    var line = new THREE.Line3();
    var closestPoint = new Vector3();
    return function raycast(raycaster, intersects) {
      if (raycaster.camera === null) {
        console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2.');
      }

      var threshold = raycaster.params.Line2 !== undefined ? raycaster.params.Line2.threshold || 0 : 0;
      var ray = raycaster.ray;
      var camera = raycaster.camera;
      var projectionMatrix = camera.projectionMatrix;
      var geometry = this.geometry;
      var material = this.material;
      var resolution = material.resolution;
      var lineWidth = material.linewidth + threshold;
      var instanceStart = geometry.attributes.instanceStart;
      var instanceEnd = geometry.attributes.instanceEnd;
      ray.at(1, ssOrigin);
      ssOrigin.w = 1;
      ssOrigin.applyMatrix4(camera.matrixWorldInverse);
      ssOrigin.applyMatrix4(projectionMatrix);
      ssOrigin.multiplyScalar(1 / ssOrigin.w);
      ssOrigin.x *= resolution.x / 2;
      ssOrigin.y *= resolution.y / 2;
      ssOrigin.z = 0;
      ssOrigin3.copy(ssOrigin);
      var matrixWorld = this.matrixWorld;
      mvMatrix.multiplyMatrices(camera.matrixWorldInverse, matrixWorld);

      for (var i = 0, l = instanceStart.count; i < l; i++) {
        start.fromBufferAttribute(instanceStart, i);
        end.fromBufferAttribute(instanceEnd, i);
        start.w = 1;
        end.w = 1;
        start.applyMatrix4(mvMatrix);
        end.applyMatrix4(mvMatrix);
        start.applyMatrix4(projectionMatrix);
        end.applyMatrix4(projectionMatrix);
        start.multiplyScalar(1 / start.w);
        end.multiplyScalar(1 / end.w);
        var isBehindCameraNear = start.z < -1 && end.z < -1;
        var isPastCameraFar = start.z > 1 && end.z > 1;

        if (isBehindCameraNear || isPastCameraFar) {
          continue;
        }

        start.x *= resolution.x / 2;
        start.y *= resolution.y / 2;
        end.x *= resolution.x / 2;
        end.y *= resolution.y / 2;
        line.start.copy(start);
        line.start.z = 0;
        line.end.copy(end);
        line.end.z = 0;
        var param = line.closestPointToPointParameter(ssOrigin3, true);
        line.at(param, closestPoint);
        var zPos = THREE.MathUtils.lerp(start.z, end.z, param);
        var isInClipSpace = zPos >= -1 && zPos <= 1;
        var isInside = ssOrigin3.distanceTo(closestPoint) < lineWidth * 0.5;

        if (isInClipSpace && isInside) {
          line.start.fromBufferAttribute(instanceStart, i);
          line.end.fromBufferAttribute(instanceEnd, i);
          line.start.applyMatrix4(matrixWorld);
          line.end.applyMatrix4(matrixWorld);
          var pointOnLine = new Vector3();
          var point = new Vector3();
          ray.distanceSqToSegment(line.start, line.end, point, pointOnLine);
          intersects.push({
            point: point,
            pointOnLine: pointOnLine,
            distance: ray.origin.distanceTo(point),
            object: this,
            face: null,
            faceIndex: i,
            uv: null,
            uv2: null
          });
        }
      }
    };
  }()
});