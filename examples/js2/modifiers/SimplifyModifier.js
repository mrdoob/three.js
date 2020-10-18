"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.SimplifyModifier = void 0;

var SimplifyModifier = function SimplifyModifier() {};

THREE.SimplifyModifier = SimplifyModifier;

(function () {
  var cb = new THREE.Vector3(),
      ab = new Vector3();

  function pushIfUnique(array, object) {
    if (array.indexOf(object) === -1) array.push(object);
  }

  function removeFromArray(array, object) {
    var k = array.indexOf(object);
    if (k > -1) array.splice(k, 1);
  }

  function computeEdgeCollapseCost(u, v) {
    var edgelength = v.position.distanceTo(u.position);
    var curvature = 0;
    var sideFaces = [];
    var i,
        il = u.faces.length,
        face,
        sideFace;

    for (i = 0; i < il; i++) {
      face = u.faces[i];

      if (face.hasVertex(v)) {
        sideFaces.push(face);
      }
    }

    for (i = 0; i < il; i++) {
      var minCurvature = 1;
      face = u.faces[i];

      for (var j = 0; j < sideFaces.length; j++) {
        sideFace = sideFaces[j];
        var dotProd = face.normal.dot(sideFace.normal);
        minCurvature = Math.min(minCurvature, (1.001 - dotProd) / 2);
      }

      curvature = Math.max(curvature, minCurvature);
    }

    var borders = 0;

    if (sideFaces.length < 2) {
      curvature = 1;
    }

    var amt = edgelength * curvature + borders;
    return amt;
  }

  function computeEdgeCostAtVertex(v) {
    if (v.neighbors.length === 0) {
      v.collapseNeighbor = null;
      v.collapseCost = -0.01;
      return;
    }

    v.collapseCost = 100000;
    v.collapseNeighbor = null;

    for (var i = 0; i < v.neighbors.length; i++) {
      var collapseCost = computeEdgeCollapseCost(v, v.neighbors[i]);

      if (!v.collapseNeighbor) {
        v.collapseNeighbor = v.neighbors[i];
        v.collapseCost = collapseCost;
        v.minCost = collapseCost;
        v.totalCost = 0;
        v.costCount = 0;
      }

      v.costCount++;
      v.totalCost += collapseCost;

      if (collapseCost < v.minCost) {
        v.collapseNeighbor = v.neighbors[i];
        v.minCost = collapseCost;
      }
    }

    v.collapseCost = v.totalCost / v.costCount;
  }

  function removeVertex(v, vertices) {
    console.assert(v.faces.length === 0);

    while (v.neighbors.length) {
      var n = v.neighbors.pop();
      removeFromArray(n.neighbors, v);
    }

    removeFromArray(vertices, v);
  }

  function removeFace(f, faces) {
    removeFromArray(faces, f);
    if (f.v1) removeFromArray(f.v1.faces, f);
    if (f.v2) removeFromArray(f.v2.faces, f);
    if (f.v3) removeFromArray(f.v3.faces, f);
    var vs = [f.v1, f.v2, f.v3];
    var v1, v2;

    for (var i = 0; i < 3; i++) {
      v1 = vs[i];
      v2 = vs[(i + 1) % 3];
      if (!v1 || !v2) continue;
      v1.removeIfNonNeighbor(v2);
      v2.removeIfNonNeighbor(v1);
    }
  }

  function collapse(vertices, faces, u, v) {
    if (!v) {
      removeVertex(u, vertices);
      return;
    }

    var i;
    var tmpVertices = [];

    for (i = 0; i < u.neighbors.length; i++) {
      tmpVertices.push(u.neighbors[i]);
    }

    for (i = u.faces.length - 1; i >= 0; i--) {
      if (u.faces[i].hasVertex(v)) {
        removeFace(u.faces[i], faces);
      }
    }

    for (i = u.faces.length - 1; i >= 0; i--) {
      u.faces[i].replaceVertex(u, v);
    }

    removeVertex(u, vertices);

    for (i = 0; i < tmpVertices.length; i++) {
      computeEdgeCostAtVertex(tmpVertices[i]);
    }
  }

  function minimumCostEdge(vertices) {
    var least = vertices[0];

    for (var i = 0; i < vertices.length; i++) {
      if (vertices[i].collapseCost < least.collapseCost) {
        least = vertices[i];
      }
    }

    return least;
  }

  function Triangle(v1, v2, v3, a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.v1 = v1;
    this.v2 = v2;
    this.v3 = v3;
    this.normal = new Vector3();
    this.computeNormal();
    v1.faces.push(this);
    v1.addUniqueNeighbor(v2);
    v1.addUniqueNeighbor(v3);
    v2.faces.push(this);
    v2.addUniqueNeighbor(v1);
    v2.addUniqueNeighbor(v3);
    v3.faces.push(this);
    v3.addUniqueNeighbor(v1);
    v3.addUniqueNeighbor(v2);
  }

  Triangle.prototype.computeNormal = function () {
    var vA = this.v1.position;
    var vB = this.v2.position;
    var vC = this.v3.position;
    cb.subVectors(vC, vB);
    ab.subVectors(vA, vB);
    cb.cross(ab).normalize();
    this.normal.copy(cb);
  };

  Triangle.prototype.hasVertex = function (v) {
    return v === this.v1 || v === this.v2 || v === this.v3;
  };

  Triangle.prototype.replaceVertex = function (oldv, newv) {
    if (oldv === this.v1) this.v1 = newv;else if (oldv === this.v2) this.v2 = newv;else if (oldv === this.v3) this.v3 = newv;
    removeFromArray(oldv.faces, this);
    newv.faces.push(this);
    oldv.removeIfNonNeighbor(this.v1);
    this.v1.removeIfNonNeighbor(oldv);
    oldv.removeIfNonNeighbor(this.v2);
    this.v2.removeIfNonNeighbor(oldv);
    oldv.removeIfNonNeighbor(this.v3);
    this.v3.removeIfNonNeighbor(oldv);
    this.v1.addUniqueNeighbor(this.v2);
    this.v1.addUniqueNeighbor(this.v3);
    this.v2.addUniqueNeighbor(this.v1);
    this.v2.addUniqueNeighbor(this.v3);
    this.v3.addUniqueNeighbor(this.v1);
    this.v3.addUniqueNeighbor(this.v2);
    this.computeNormal();
  };

  function Vertex(v, id) {
    this.position = v;
    this.id = id;
    this.faces = [];
    this.neighbors = [];
    this.collapseCost = 0;
    this.collapseNeighbor = null;
  }

  Vertex.prototype.addUniqueNeighbor = function (vertex) {
    pushIfUnique(this.neighbors, vertex);
  };

  Vertex.prototype.removeIfNonNeighbor = function (n) {
    var neighbors = this.neighbors;
    var faces = this.faces;
    var offset = neighbors.indexOf(n);
    if (offset === -1) return;

    for (var i = 0; i < faces.length; i++) {
      if (faces[i].hasVertex(n)) return;
    }

    neighbors.splice(offset, 1);
  };

  SimplifyModifier.prototype.modify = function (geometry, count) {
    if (geometry.isBufferGeometry) {
      geometry = new THREE.Geometry().fromBufferGeometry(geometry);
    }

    geometry.mergeVertices();
    var oldVertices = geometry.vertices;
    var oldFaces = geometry.faces;
    var vertices = [];
    var faces = [];
    var i, il;

    for (i = 0, il = oldVertices.length; i < il; i++) {
      var vertex = new Vertex(oldVertices[i], i);
      vertices.push(vertex);
    }

    for (i = 0, il = oldFaces.length; i < il; i++) {
      var face = oldFaces[i];
      var a = face.a;
      var b = face.b;
      var c = face.c;
      var triangle = new Triangle(vertices[a], vertices[b], vertices[c], a, b, c);
      faces.push(triangle);
    }

    for (i = 0, il = vertices.length; i < il; i++) {
      computeEdgeCostAtVertex(vertices[i]);
    }

    var nextVertex;
    var z = count;

    while (z--) {
      nextVertex = minimumCostEdge(vertices);

      if (!nextVertex) {
        console.log('THREE.SimplifyModifier: No next vertex');
        break;
      }

      collapse(vertices, faces, nextVertex, nextVertex.collapseNeighbor);
    }

    var simplifiedGeometry = new THREE.BufferGeometry();
    var position = [];
    var index = [];

    for (i = 0; i < vertices.length; i++) {
      var vertex = vertices[i].position;
      position.push(vertex.x, vertex.y, vertex.z);
    }

    for (i = 0; i < faces.length; i++) {
      var face = faces[i];
      var a = vertices.indexOf(face.v1);
      var b = vertices.indexOf(face.v2);
      var c = vertices.indexOf(face.v3);
      index.push(a, b, c);
    }

    simplifiedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));
    simplifiedGeometry.setIndex(index);
    return simplifiedGeometry;
  };
})();