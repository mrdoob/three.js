"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.SubdivisionModifier = void 0;

var SubdivisionModifier = function SubdivisionModifier(subdivisions) {
  this.subdivisions = subdivisions === undefined ? 1 : subdivisions;
};

THREE.SubdivisionModifier = SubdivisionModifier;

SubdivisionModifier.prototype.modify = function (geometry) {
  if (geometry.isBufferGeometry) {
    geometry = new THREE.Geometry().fromBufferGeometry(geometry);
  } else {
    geometry = geometry.clone();
  }

  geometry.mergeVertices();
  var repeats = this.subdivisions;

  while (repeats-- > 0) {
    this.smooth(geometry);
  }

  geometry.computeFaceNormals();
  geometry.computeVertexNormals();
  return geometry;
};

(function () {
  var ABC = ['a', 'b', 'c'];

  function getEdge(a, b, map) {
    var vertexIndexA = Math.min(a, b);
    var vertexIndexB = Math.max(a, b);
    var key = vertexIndexA + "_" + vertexIndexB;
    return map[key];
  }

  function processEdge(a, b, vertices, map, face, metaVertices) {
    var vertexIndexA = Math.min(a, b);
    var vertexIndexB = Math.max(a, b);
    var key = vertexIndexA + "_" + vertexIndexB;
    var edge;

    if (key in map) {
      edge = map[key];
    } else {
      var vertexA = vertices[vertexIndexA];
      var vertexB = vertices[vertexIndexB];
      edge = {
        a: vertexA,
        b: vertexB,
        newEdge: null,
        faces: []
      };
      map[key] = edge;
    }

    edge.faces.push(face);
    metaVertices[a].edges.push(edge);
    metaVertices[b].edges.push(edge);
  }

  function generateLookups(vertices, faces, metaVertices, edges) {
    var i, il, face;

    for (i = 0, il = vertices.length; i < il; i++) {
      metaVertices[i] = {
        edges: []
      };
    }

    for (i = 0, il = faces.length; i < il; i++) {
      face = faces[i];
      processEdge(face.a, face.b, vertices, edges, face, metaVertices);
      processEdge(face.b, face.c, vertices, edges, face, metaVertices);
      processEdge(face.c, face.a, vertices, edges, face, metaVertices);
    }
  }

  function newFace(newFaces, a, b, c, materialIndex) {
    newFaces.push(new THREE.Face3(a, b, c, undefined, undefined, materialIndex));
  }

  function midpoint(a, b) {
    return Math.abs(b - a) / 2 + Math.min(a, b);
  }

  function newUv(newUvs, a, b, c) {
    newUvs.push([a.clone(), b.clone(), c.clone()]);
  }

  SubdivisionModifier.prototype.smooth = function (geometry) {
    var tmp = new THREE.Vector3();
    var oldVertices, oldFaces, oldUvs;
    var newVertices,
        newFaces,
        newUVs = [];
    var n, i, il, j, k;
    var metaVertices, sourceEdges;
    var sourceEdges, newEdgeVertices, newSourceVertices;
    oldVertices = geometry.vertices;
    oldFaces = geometry.faces;
    oldUvs = geometry.faceVertexUvs;
    var hasUvs = oldUvs[0] !== undefined && oldUvs[0].length > 0;

    if (hasUvs) {
      for (var j = 0; j < oldUvs.length; j++) {
        newUVs.push([]);
      }
    }

    metaVertices = new Array(oldVertices.length);
    sourceEdges = {};
    generateLookups(oldVertices, oldFaces, metaVertices, sourceEdges);
    newEdgeVertices = [];
    var other, currentEdge, newEdge, face;
    var edgeVertexWeight, adjacentVertexWeight, connectedFaces;

    for (i in sourceEdges) {
      currentEdge = sourceEdges[i];
      newEdge = new Vector3();
      edgeVertexWeight = 3 / 8;
      adjacentVertexWeight = 1 / 8;
      connectedFaces = currentEdge.faces.length;

      if (connectedFaces != 2) {
        edgeVertexWeight = 0.5;
        adjacentVertexWeight = 0;

        if (connectedFaces != 1) {}
      }

      newEdge.addVectors(currentEdge.a, currentEdge.b).multiplyScalar(edgeVertexWeight);
      tmp.set(0, 0, 0);

      for (j = 0; j < connectedFaces; j++) {
        face = currentEdge.faces[j];

        for (k = 0; k < 3; k++) {
          other = oldVertices[face[ABC[k]]];
          if (other !== currentEdge.a && other !== currentEdge.b) break;
        }

        tmp.add(other);
      }

      tmp.multiplyScalar(adjacentVertexWeight);
      newEdge.add(tmp);
      currentEdge.newEdge = newEdgeVertices.length;
      newEdgeVertices.push(newEdge);
    }

    var beta, sourceVertexWeight, connectingVertexWeight;
    var connectingEdge, connectingEdges, oldVertex, newSourceVertex;
    newSourceVertices = [];

    for (i = 0, il = oldVertices.length; i < il; i++) {
      oldVertex = oldVertices[i];
      connectingEdges = metaVertices[i].edges;
      n = connectingEdges.length;

      if (n == 3) {
        beta = 3 / 16;
      } else if (n > 3) {
        beta = 3 / (8 * n);
      }

      sourceVertexWeight = 1 - n * beta;
      connectingVertexWeight = beta;

      if (n <= 2) {
        if (n == 2) {
          sourceVertexWeight = 3 / 4;
          connectingVertexWeight = 1 / 8;
        } else if (n == 1) {} else if (n == 0) {}
      }

      newSourceVertex = oldVertex.clone().multiplyScalar(sourceVertexWeight);
      tmp.set(0, 0, 0);

      for (j = 0; j < n; j++) {
        connectingEdge = connectingEdges[j];
        other = connectingEdge.a !== oldVertex ? connectingEdge.a : connectingEdge.b;
        tmp.add(other);
      }

      tmp.multiplyScalar(connectingVertexWeight);
      newSourceVertex.add(tmp);
      newSourceVertices.push(newSourceVertex);
    }

    newVertices = newSourceVertices.concat(newEdgeVertices);
    var sl = newSourceVertices.length,
        edge1,
        edge2,
        edge3;
    newFaces = [];
    var uv, x0, x1, x2;
    var x3 = new THREE.Vector2();
    var x4 = new Vector2();
    var x5 = new Vector2();

    for (i = 0, il = oldFaces.length; i < il; i++) {
      face = oldFaces[i];
      edge1 = getEdge(face.a, face.b, sourceEdges).newEdge + sl;
      edge2 = getEdge(face.b, face.c, sourceEdges).newEdge + sl;
      edge3 = getEdge(face.c, face.a, sourceEdges).newEdge + sl;
      newFace(newFaces, edge1, edge2, edge3, face.materialIndex);
      newFace(newFaces, face.a, edge1, edge3, face.materialIndex);
      newFace(newFaces, face.b, edge2, edge1, face.materialIndex);
      newFace(newFaces, face.c, edge3, edge2, face.materialIndex);

      if (hasUvs) {
        for (var j = 0; j < oldUvs.length; j++) {
          uv = oldUvs[j][i];
          x0 = uv[0];
          x1 = uv[1];
          x2 = uv[2];
          x3.set(midpoint(x0.x, x1.x), midpoint(x0.y, x1.y));
          x4.set(midpoint(x1.x, x2.x), midpoint(x1.y, x2.y));
          x5.set(midpoint(x0.x, x2.x), midpoint(x0.y, x2.y));
          newUv(newUVs[j], x3, x4, x5);
          newUv(newUVs[j], x0, x3, x5);
          newUv(newUVs[j], x1, x4, x3);
          newUv(newUVs[j], x2, x5, x4);
        }
      }
    }

    geometry.vertices = newVertices;
    geometry.faces = newFaces;
    if (hasUvs) geometry.faceVertexUvs = newUVs;
  };
})();