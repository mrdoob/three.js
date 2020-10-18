"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.TubePainter = TubePainter;

function TubePainter() {
  var BUFFER_SIZE = 1000000 * 3;
  var positions = new THREE.BufferAttribute(new Float32Array(BUFFER_SIZE), 3);
  positions.usage = THREE.DynamicDrawUsage;
  var normals = new BufferAttribute(new Float32Array(BUFFER_SIZE), 3);
  normals.usage = DynamicDrawUsage;
  var colors = new BufferAttribute(new Float32Array(BUFFER_SIZE), 3);
  colors.usage = DynamicDrawUsage;
  var geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', positions);
  geometry.setAttribute('normal', normals);
  geometry.setAttribute('color', colors);
  geometry.drawRange.count = 0;
  var material = new THREE.MeshStandardMaterial({
    vertexColors: true
  });
  var mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;

  function getPoints(size) {
    var PI2 = Math.PI * 2;
    var sides = 10;
    var array = [];
    var radius = 0.01 * size;

    for (var i = 0; i < sides; i++) {
      var angle = i / sides * PI2;
      array.push(new THREE.Vector3(Math.sin(angle) * radius, Math.cos(angle) * radius, 0));
    }

    return array;
  }

  var vector1 = new Vector3();
  var vector2 = new Vector3();
  var vector3 = new Vector3();
  var vector4 = new Vector3();
  var color = new THREE.Color(0xffffff);
  var size = 1;

  function stroke(position1, position2, matrix1, matrix2) {
    if (position1.distanceToSquared(position2) === 0) return;
    var count = geometry.drawRange.count;
    var points = getPoints(size);

    for (var i = 0, il = points.length; i < il; i++) {
      var vertex1 = points[i];
      var vertex2 = points[(i + 1) % il];
      vector1.copy(vertex1).applyMatrix4(matrix2).add(position2);
      vector2.copy(vertex2).applyMatrix4(matrix2).add(position2);
      vector3.copy(vertex2).applyMatrix4(matrix1).add(position1);
      vector4.copy(vertex1).applyMatrix4(matrix1).add(position1);
      vector1.toArray(positions.array, (count + 0) * 3);
      vector2.toArray(positions.array, (count + 1) * 3);
      vector4.toArray(positions.array, (count + 2) * 3);
      vector2.toArray(positions.array, (count + 3) * 3);
      vector3.toArray(positions.array, (count + 4) * 3);
      vector4.toArray(positions.array, (count + 5) * 3);
      vector1.copy(vertex1).applyMatrix4(matrix2).normalize();
      vector2.copy(vertex2).applyMatrix4(matrix2).normalize();
      vector3.copy(vertex2).applyMatrix4(matrix1).normalize();
      vector4.copy(vertex1).applyMatrix4(matrix1).normalize();
      vector1.toArray(normals.array, (count + 0) * 3);
      vector2.toArray(normals.array, (count + 1) * 3);
      vector4.toArray(normals.array, (count + 2) * 3);
      vector2.toArray(normals.array, (count + 3) * 3);
      vector3.toArray(normals.array, (count + 4) * 3);
      vector4.toArray(normals.array, (count + 5) * 3);
      color.toArray(colors.array, (count + 0) * 3);
      color.toArray(colors.array, (count + 1) * 3);
      color.toArray(colors.array, (count + 2) * 3);
      color.toArray(colors.array, (count + 3) * 3);
      color.toArray(colors.array, (count + 4) * 3);
      color.toArray(colors.array, (count + 5) * 3);
      count += 6;
    }

    geometry.drawRange.count = count;
  }

  var up = new Vector3(0, 1, 0);
  var point1 = new Vector3();
  var point2 = new Vector3();
  var matrix1 = new THREE.Matrix4();
  var matrix2 = new Matrix4();

  function moveTo(position) {
    point1.copy(position);
    matrix1.lookAt(point2, point1, up);
    point2.copy(position);
    matrix2.copy(matrix1);
  }

  function lineTo(position) {
    point1.copy(position);
    matrix1.lookAt(point2, point1, up);
    stroke(point1, point2, matrix1, matrix2);
    point2.copy(point1);
    matrix2.copy(matrix1);
  }

  function setSize(value) {
    size = value;
  }

  var count = 0;

  function update() {
    var start = count;
    var end = geometry.drawRange.count;
    if (start === end) return;
    positions.updateRange.offset = start * 3;
    positions.updateRange.count = (end - start) * 3;
    positions.needsUpdate = true;
    normals.updateRange.offset = start * 3;
    normals.updateRange.count = (end - start) * 3;
    normals.needsUpdate = true;
    colors.updateRange.offset = start * 3;
    colors.updateRange.count = (end - start) * 3;
    colors.needsUpdate = true;
    count = geometry.drawRange.count;
  }

  return {
    mesh: mesh,
    moveTo: moveTo,
    lineTo: lineTo,
    setSize: setSize,
    update: update
  };
}