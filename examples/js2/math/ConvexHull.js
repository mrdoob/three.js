"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.ConvexHull = void 0;

var ConvexHull = function () {
  var Visible = 0;
  var Deleted = 1;
  var v1 = new THREE.Vector3();

  function ConvexHull() {
    this.tolerance = -1;
    this.faces = [];
    this.newFaces = [];
    this.assigned = new VertexList();
    this.unassigned = new VertexList();
    this.vertices = [];
  }

  Object.assign(ConvexHull.prototype, {
    setFromPoints: function setFromPoints(points) {
      if (Array.isArray(points) !== true) {
        console.error('THREE.ConvexHull: Points parameter is not an array.');
      }

      if (points.length < 4) {
        console.error('THREE.ConvexHull: The algorithm needs at least four points.');
      }

      this.makeEmpty();

      for (var i = 0, l = points.length; i < l; i++) {
        this.vertices.push(new VertexNode(points[i]));
      }

      this.compute();
      return this;
    },
    setFromObject: function setFromObject(object) {
      var points = [];
      object.updateMatrixWorld(true);
      object.traverse(function (node) {
        var i, l, point;
        var geometry = node.geometry;

        if (geometry !== undefined) {
          if (geometry.isGeometry) {
            var vertices = geometry.vertices;

            for (i = 0, l = vertices.length; i < l; i++) {
              point = vertices[i].clone();
              point.applyMatrix4(node.matrixWorld);
              points.push(point);
            }
          } else if (geometry.isBufferGeometry) {
            var attribute = geometry.attributes.position;

            if (attribute !== undefined) {
              for (i = 0, l = attribute.count; i < l; i++) {
                point = new Vector3();
                point.fromBufferAttribute(attribute, i).applyMatrix4(node.matrixWorld);
                points.push(point);
              }
            }
          }
        }
      });
      return this.setFromPoints(points);
    },
    containsPoint: function containsPoint(point) {
      var faces = this.faces;

      for (var i = 0, l = faces.length; i < l; i++) {
        var face = faces[i];
        if (face.distanceToPoint(point) > this.tolerance) return false;
      }

      return true;
    },
    intersectRay: function intersectRay(ray, target) {
      var faces = this.faces;
      var tNear = -Infinity;
      var tFar = Infinity;

      for (var i = 0, l = faces.length; i < l; i++) {
        var face = faces[i];
        var vN = face.distanceToPoint(ray.origin);
        var vD = face.normal.dot(ray.direction);
        if (vN > 0 && vD >= 0) return null;
        var t = vD !== 0 ? -vN / vD : 0;
        if (t <= 0) continue;

        if (vD > 0) {
          tFar = Math.min(t, tFar);
        } else {
          tNear = Math.max(t, tNear);
        }

        if (tNear > tFar) {
          return null;
        }
      }

      if (tNear !== -Infinity) {
        ray.at(tNear, target);
      } else {
        ray.at(tFar, target);
      }

      return target;
    },
    intersectsRay: function intersectsRay(ray) {
      return this.intersectRay(ray, v1) !== null;
    },
    makeEmpty: function makeEmpty() {
      this.faces = [];
      this.vertices = [];
      return this;
    },
    addVertexToFace: function addVertexToFace(vertex, face) {
      vertex.face = face;

      if (face.outside === null) {
        this.assigned.append(vertex);
      } else {
        this.assigned.insertBefore(face.outside, vertex);
      }

      face.outside = vertex;
      return this;
    },
    removeVertexFromFace: function removeVertexFromFace(vertex, face) {
      if (vertex === face.outside) {
        if (vertex.next !== null && vertex.next.face === face) {
          face.outside = vertex.next;
        } else {
          face.outside = null;
        }
      }

      this.assigned.remove(vertex);
      return this;
    },
    removeAllVerticesFromFace: function removeAllVerticesFromFace(face) {
      if (face.outside !== null) {
        var start = face.outside;
        var end = face.outside;

        while (end.next !== null && end.next.face === face) {
          end = end.next;
        }

        this.assigned.removeSubList(start, end);
        start.prev = end.next = null;
        face.outside = null;
        return start;
      }
    },
    deleteFaceVertices: function deleteFaceVertices(face, absorbingFace) {
      var faceVertices = this.removeAllVerticesFromFace(face);

      if (faceVertices !== undefined) {
        if (absorbingFace === undefined) {
          this.unassigned.appendChain(faceVertices);
        } else {
          var vertex = faceVertices;

          do {
            var nextVertex = vertex.next;
            var distance = absorbingFace.distanceToPoint(vertex.point);

            if (distance > this.tolerance) {
              this.addVertexToFace(vertex, absorbingFace);
            } else {
              this.unassigned.append(vertex);
            }

            vertex = nextVertex;
          } while (vertex !== null);
        }
      }

      return this;
    },
    resolveUnassignedPoints: function resolveUnassignedPoints(newFaces) {
      if (this.unassigned.isEmpty() === false) {
        var vertex = this.unassigned.first();

        do {
          var nextVertex = vertex.next;
          var maxDistance = this.tolerance;
          var maxFace = null;

          for (var i = 0; i < newFaces.length; i++) {
            var face = newFaces[i];

            if (face.mark === Visible) {
              var distance = face.distanceToPoint(vertex.point);

              if (distance > maxDistance) {
                maxDistance = distance;
                maxFace = face;
              }

              if (maxDistance > 1000 * this.tolerance) break;
            }
          }

          if (maxFace !== null) {
            this.addVertexToFace(vertex, maxFace);
          }

          vertex = nextVertex;
        } while (vertex !== null);
      }

      return this;
    },
    computeExtremes: function computeExtremes() {
      var min = new Vector3();
      var max = new Vector3();
      var minVertices = [];
      var maxVertices = [];
      var i, l, j;

      for (i = 0; i < 3; i++) {
        minVertices[i] = maxVertices[i] = this.vertices[0];
      }

      min.copy(this.vertices[0].point);
      max.copy(this.vertices[0].point);

      for (i = 0, l = this.vertices.length; i < l; i++) {
        var vertex = this.vertices[i];
        var point = vertex.point;

        for (j = 0; j < 3; j++) {
          if (point.getComponent(j) < min.getComponent(j)) {
            min.setComponent(j, point.getComponent(j));
            minVertices[j] = vertex;
          }
        }

        for (j = 0; j < 3; j++) {
          if (point.getComponent(j) > max.getComponent(j)) {
            max.setComponent(j, point.getComponent(j));
            maxVertices[j] = vertex;
          }
        }
      }

      this.tolerance = 3 * Number.EPSILON * (Math.max(Math.abs(min.x), Math.abs(max.x)) + Math.max(Math.abs(min.y), Math.abs(max.y)) + Math.max(Math.abs(min.z), Math.abs(max.z)));
      return {
        min: minVertices,
        max: maxVertices
      };
    },
    computeInitialHull: function () {
      var line3, plane, closestPoint;
      return function computeInitialHull() {
        if (line3 === undefined) {
          line3 = new THREE.Line3();
          plane = new THREE.Plane();
          closestPoint = new Vector3();
        }

        var vertex,
            vertices = this.vertices;
        var extremes = this.computeExtremes();
        var min = extremes.min;
        var max = extremes.max;
        var v0, v1, v2, v3;
        var i, l, j;
        var distance,
            maxDistance = 0;
        var index = 0;

        for (i = 0; i < 3; i++) {
          distance = max[i].point.getComponent(i) - min[i].point.getComponent(i);

          if (distance > maxDistance) {
            maxDistance = distance;
            index = i;
          }
        }

        v0 = min[index];
        v1 = max[index];
        maxDistance = 0;
        line3.set(v0.point, v1.point);

        for (i = 0, l = this.vertices.length; i < l; i++) {
          vertex = vertices[i];

          if (vertex !== v0 && vertex !== v1) {
            line3.closestPointToPoint(vertex.point, true, closestPoint);
            distance = closestPoint.distanceToSquared(vertex.point);

            if (distance > maxDistance) {
              maxDistance = distance;
              v2 = vertex;
            }
          }
        }

        maxDistance = -1;
        plane.setFromCoplanarPoints(v0.point, v1.point, v2.point);

        for (i = 0, l = this.vertices.length; i < l; i++) {
          vertex = vertices[i];

          if (vertex !== v0 && vertex !== v1 && vertex !== v2) {
            distance = Math.abs(plane.distanceToPoint(vertex.point));

            if (distance > maxDistance) {
              maxDistance = distance;
              v3 = vertex;
            }
          }
        }

        var faces = [];

        if (plane.distanceToPoint(v3.point) < 0) {
          faces.push(Face.create(v0, v1, v2), Face.create(v3, v1, v0), Face.create(v3, v2, v1), Face.create(v3, v0, v2));

          for (i = 0; i < 3; i++) {
            j = (i + 1) % 3;
            faces[i + 1].getEdge(2).setTwin(faces[0].getEdge(j));
            faces[i + 1].getEdge(1).setTwin(faces[j + 1].getEdge(0));
          }
        } else {
          faces.push(Face.create(v0, v2, v1), Face.create(v3, v0, v1), Face.create(v3, v1, v2), Face.create(v3, v2, v0));

          for (i = 0; i < 3; i++) {
            j = (i + 1) % 3;
            faces[i + 1].getEdge(2).setTwin(faces[0].getEdge((3 - i) % 3));
            faces[i + 1].getEdge(0).setTwin(faces[j + 1].getEdge(1));
          }
        }

        for (i = 0; i < 4; i++) {
          this.faces.push(faces[i]);
        }

        for (i = 0, l = vertices.length; i < l; i++) {
          vertex = vertices[i];

          if (vertex !== v0 && vertex !== v1 && vertex !== v2 && vertex !== v3) {
            maxDistance = this.tolerance;
            var maxFace = null;

            for (j = 0; j < 4; j++) {
              distance = this.faces[j].distanceToPoint(vertex.point);

              if (distance > maxDistance) {
                maxDistance = distance;
                maxFace = this.faces[j];
              }
            }

            if (maxFace !== null) {
              this.addVertexToFace(vertex, maxFace);
            }
          }
        }

        return this;
      };
    }(),
    reindexFaces: function reindexFaces() {
      var activeFaces = [];

      for (var i = 0; i < this.faces.length; i++) {
        var face = this.faces[i];

        if (face.mark === Visible) {
          activeFaces.push(face);
        }
      }

      this.faces = activeFaces;
      return this;
    },
    nextVertexToAdd: function nextVertexToAdd() {
      if (this.assigned.isEmpty() === false) {
        var eyeVertex,
            maxDistance = 0;
        var eyeFace = this.assigned.first().face;
        var vertex = eyeFace.outside;

        do {
          var distance = eyeFace.distanceToPoint(vertex.point);

          if (distance > maxDistance) {
            maxDistance = distance;
            eyeVertex = vertex;
          }

          vertex = vertex.next;
        } while (vertex !== null && vertex.face === eyeFace);

        return eyeVertex;
      }
    },
    computeHorizon: function computeHorizon(eyePoint, crossEdge, face, horizon) {
      this.deleteFaceVertices(face);
      face.mark = Deleted;
      var edge;

      if (crossEdge === null) {
        edge = crossEdge = face.getEdge(0);
      } else {
        edge = crossEdge.next;
      }

      do {
        var twinEdge = edge.twin;
        var oppositeFace = twinEdge.face;

        if (oppositeFace.mark === Visible) {
          if (oppositeFace.distanceToPoint(eyePoint) > this.tolerance) {
            this.computeHorizon(eyePoint, twinEdge, oppositeFace, horizon);
          } else {
            horizon.push(edge);
          }
        }

        edge = edge.next;
      } while (edge !== crossEdge);

      return this;
    },
    addAdjoiningFace: function addAdjoiningFace(eyeVertex, horizonEdge) {
      var face = Face.create(eyeVertex, horizonEdge.tail(), horizonEdge.head());
      this.faces.push(face);
      face.getEdge(-1).setTwin(horizonEdge.twin);
      return face.getEdge(0);
    },
    addNewFaces: function addNewFaces(eyeVertex, horizon) {
      this.newFaces = [];
      var firstSideEdge = null;
      var previousSideEdge = null;

      for (var i = 0; i < horizon.length; i++) {
        var horizonEdge = horizon[i];
        var sideEdge = this.addAdjoiningFace(eyeVertex, horizonEdge);

        if (firstSideEdge === null) {
          firstSideEdge = sideEdge;
        } else {
          sideEdge.next.setTwin(previousSideEdge);
        }

        this.newFaces.push(sideEdge.face);
        previousSideEdge = sideEdge;
      }

      firstSideEdge.next.setTwin(previousSideEdge);
      return this;
    },
    addVertexToHull: function addVertexToHull(eyeVertex) {
      var horizon = [];
      this.unassigned.clear();
      this.removeVertexFromFace(eyeVertex, eyeVertex.face);
      this.computeHorizon(eyeVertex.point, null, eyeVertex.face, horizon);
      this.addNewFaces(eyeVertex, horizon);
      this.resolveUnassignedPoints(this.newFaces);
      return this;
    },
    cleanup: function cleanup() {
      this.assigned.clear();
      this.unassigned.clear();
      this.newFaces = [];
      return this;
    },
    compute: function compute() {
      var vertex;
      this.computeInitialHull();

      while ((vertex = this.nextVertexToAdd()) !== undefined) {
        this.addVertexToHull(vertex);
      }

      this.reindexFaces();
      this.cleanup();
      return this;
    }
  });

  function Face() {
    this.normal = new Vector3();
    this.midpoint = new Vector3();
    this.area = 0;
    this.constant = 0;
    this.outside = null;
    this.mark = Visible;
    this.edge = null;
  }

  Object.assign(Face, {
    create: function create(a, b, c) {
      var face = new Face();
      var e0 = new HalfEdge(a, face);
      var e1 = new HalfEdge(b, face);
      var e2 = new HalfEdge(c, face);
      e0.next = e2.prev = e1;
      e1.next = e0.prev = e2;
      e2.next = e1.prev = e0;
      face.edge = e0;
      return face.compute();
    }
  });
  Object.assign(Face.prototype, {
    getEdge: function getEdge(i) {
      var edge = this.edge;

      while (i > 0) {
        edge = edge.next;
        i--;
      }

      while (i < 0) {
        edge = edge.prev;
        i++;
      }

      return edge;
    },
    compute: function () {
      var triangle;
      return function compute() {
        if (triangle === undefined) triangle = new THREE.Triangle();
        var a = this.edge.tail();
        var b = this.edge.head();
        var c = this.edge.next.head();
        triangle.set(a.point, b.point, c.point);
        triangle.getNormal(this.normal);
        triangle.getMidpoint(this.midpoint);
        this.area = triangle.getArea();
        this.constant = this.normal.dot(this.midpoint);
        return this;
      };
    }(),
    distanceToPoint: function distanceToPoint(point) {
      return this.normal.dot(point) - this.constant;
    }
  });

  function HalfEdge(vertex, face) {
    this.vertex = vertex;
    this.prev = null;
    this.next = null;
    this.twin = null;
    this.face = face;
  }

  Object.assign(HalfEdge.prototype, {
    head: function head() {
      return this.vertex;
    },
    tail: function tail() {
      return this.prev ? this.prev.vertex : null;
    },
    length: function length() {
      var head = this.head();
      var tail = this.tail();

      if (tail !== null) {
        return tail.point.distanceTo(head.point);
      }

      return -1;
    },
    lengthSquared: function lengthSquared() {
      var head = this.head();
      var tail = this.tail();

      if (tail !== null) {
        return tail.point.distanceToSquared(head.point);
      }

      return -1;
    },
    setTwin: function setTwin(edge) {
      this.twin = edge;
      edge.twin = this;
      return this;
    }
  });

  function VertexNode(point) {
    this.point = point;
    this.prev = null;
    this.next = null;
    this.face = null;
  }

  function VertexList() {
    this.head = null;
    this.tail = null;
  }

  Object.assign(VertexList.prototype, {
    first: function first() {
      return this.head;
    },
    last: function last() {
      return this.tail;
    },
    clear: function clear() {
      this.head = this.tail = null;
      return this;
    },
    insertBefore: function insertBefore(target, vertex) {
      vertex.prev = target.prev;
      vertex.next = target;

      if (vertex.prev === null) {
        this.head = vertex;
      } else {
        vertex.prev.next = vertex;
      }

      target.prev = vertex;
      return this;
    },
    insertAfter: function insertAfter(target, vertex) {
      vertex.prev = target;
      vertex.next = target.next;

      if (vertex.next === null) {
        this.tail = vertex;
      } else {
        vertex.next.prev = vertex;
      }

      target.next = vertex;
      return this;
    },
    append: function append(vertex) {
      if (this.head === null) {
        this.head = vertex;
      } else {
        this.tail.next = vertex;
      }

      vertex.prev = this.tail;
      vertex.next = null;
      this.tail = vertex;
      return this;
    },
    appendChain: function appendChain(vertex) {
      if (this.head === null) {
        this.head = vertex;
      } else {
        this.tail.next = vertex;
      }

      vertex.prev = this.tail;

      while (vertex.next !== null) {
        vertex = vertex.next;
      }

      this.tail = vertex;
      return this;
    },
    remove: function remove(vertex) {
      if (vertex.prev === null) {
        this.head = vertex.next;
      } else {
        vertex.prev.next = vertex.next;
      }

      if (vertex.next === null) {
        this.tail = vertex.prev;
      } else {
        vertex.next.prev = vertex.prev;
      }

      return this;
    },
    removeSubList: function removeSubList(a, b) {
      if (a.prev === null) {
        this.head = b.next;
      } else {
        a.prev.next = b.next;
      }

      if (b.next === null) {
        this.tail = a.prev;
      } else {
        b.next.prev = a.prev;
      }

      return this;
    },
    isEmpty: function isEmpty() {
      return this.head === null;
    }
  });
  return ConvexHull;
}();

THREE.ConvexHull = ConvexHull;