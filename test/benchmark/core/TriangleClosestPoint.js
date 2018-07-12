(function() {

  THREE = Bench.THREE;

  // these vertices and triangles are those of a unit icosahedron centered at the origin
  var phi = 1.618;
  var verts = [
    [phi, 1, 0], [-phi, 1, 0], [phi, -1, 0], [-phi, -1, 0],
    [1, 0, phi], [1, 0, -phi], [-1, 0, phi], [-1, 0, -phi],
    [0, phi, 1], [0, -phi, 1], [0, phi, -1], [0, -phi, -1],
  ];
  var createVertex = function(c) {
    return new THREE.Vector3(c[0], c[1], c[2]);
  };
  var createTriangle = function(i0, i1, i2) {
    return new THREE.Triangle(createVertex(verts[i0]), createVertex(verts[i1]), createVertex(verts[i2]));
  };
  var triangles = [
    createTriangle(0, 8, 4),
    createTriangle(0, 5, 10),
    createTriangle(2, 4, 9),
    createTriangle(2, 11, 5),
    createTriangle(1, 6, 8),
    createTriangle(1, 10, 7),
    createTriangle(3, 9, 6),
    createTriangle(3, 7, 11),
    createTriangle(0, 10, 8),
    createTriangle(1, 8, 10),
    createTriangle(2, 9, 11),
    createTriangle(3, 9, 11),
    createTriangle(4, 2, 0),
    createTriangle(5, 0, 2),
    createTriangle(6, 1, 3),
    createTriangle(7, 3, 1),
    createTriangle(8, 6, 4),
    createTriangle(9, 4, 6),
    createTriangle(10, 5, 7),
    createTriangle(11, 7, 5),
  ];
  // test a variety of points all in and around the icosahedron
  var testPoints = [];
  for (var x = -2; x <= 2; x += 0.5) {
    for (var y = -2; y <= 2; y += 0.5) {
      for (var z = -2; z <= 2; z += 0.5) {
        testPoints.push(new THREE.Vector3(x, y, z));
      }
    }
  }

  var s = Bench.newSuite("Clamping point into triangles");

  s.add('9^3 points, 20 triangles', function() {
    var target = new THREE.Vector3();
    for (var tidx = 0; tidx < triangles.length; tidx++) {
      var triangle = triangles[tidx];
      for (var pidx = 0; pidx < testPoints.length; pidx++) {
        triangle.closestPointToPoint(testPoints[pidx], target);
      }
    }
  });
})();
