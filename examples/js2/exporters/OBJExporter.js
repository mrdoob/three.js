"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.OBJExporter = void 0;

var OBJExporter = function OBJExporter() {};

THREE.OBJExporter = OBJExporter;
OBJExporter.prototype = {
  constructor: OBJExporter,
  parse: function parse(object) {
    var output = '';
    var indexVertex = 0;
    var indexVertexUvs = 0;
    var indexNormals = 0;
    var vertex = new THREE.Vector3();
    var normal = new Vector3();
    var uv = new THREE.Vector2();
    var i,
        j,
        k,
        l,
        m,
        face = [];

    var parseMesh = function parseMesh(mesh) {
      var nbVertex = 0;
      var nbNormals = 0;
      var nbVertexUvs = 0;
      var geometry = mesh.geometry;
      var normalMatrixWorld = new THREE.Matrix3();

      if (geometry instanceof Geometry) {
        geometry = new THREE.BufferGeometry().setFromObject(mesh);
      }

      if (geometry instanceof BufferGeometry) {
        var vertices = geometry.getAttribute('position');
        var normals = geometry.getAttribute('normal');
        var uvs = geometry.getAttribute('uv');
        var indices = geometry.getIndex();
        output += 'o ' + mesh.name + '\n';

        if (mesh.material && mesh.material.name) {
          output += 'usemtl ' + mesh.material.name + '\n';
        }

        if (vertices !== undefined) {
          for (i = 0, l = vertices.count; i < l; i++, nbVertex++) {
            vertex.x = vertices.getX(i);
            vertex.y = vertices.getY(i);
            vertex.z = vertices.getZ(i);
            vertex.applyMatrix4(mesh.matrixWorld);
            output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';
          }
        }

        if (uvs !== undefined) {
          for (i = 0, l = uvs.count; i < l; i++, nbVertexUvs++) {
            uv.x = uvs.getX(i);
            uv.y = uvs.getY(i);
            output += 'vt ' + uv.x + ' ' + uv.y + '\n';
          }
        }

        if (normals !== undefined) {
          normalMatrixWorld.getNormalMatrix(mesh.matrixWorld);

          for (i = 0, l = normals.count; i < l; i++, nbNormals++) {
            normal.x = normals.getX(i);
            normal.y = normals.getY(i);
            normal.z = normals.getZ(i);
            normal.applyMatrix3(normalMatrixWorld).normalize();
            output += 'vn ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';
          }
        }

        if (indices !== null) {
          for (i = 0, l = indices.count; i < l; i += 3) {
            for (m = 0; m < 3; m++) {
              j = indices.getX(i + m) + 1;
              face[m] = indexVertex + j + (normals || uvs ? '/' + (uvs ? indexVertexUvs + j : '') + (normals ? '/' + (indexNormals + j) : '') : '');
            }

            output += 'f ' + face.join(' ') + "\n";
          }
        } else {
          for (i = 0, l = vertices.count; i < l; i += 3) {
            for (m = 0; m < 3; m++) {
              j = i + m + 1;
              face[m] = indexVertex + j + (normals || uvs ? '/' + (uvs ? indexVertexUvs + j : '') + (normals ? '/' + (indexNormals + j) : '') : '');
            }

            output += 'f ' + face.join(' ') + "\n";
          }
        }
      } else {
        console.warn('THREE.OBJExporter.parseMesh(): geometry type unsupported', geometry);
      }

      indexVertex += nbVertex;
      indexVertexUvs += nbVertexUvs;
      indexNormals += nbNormals;
    };

    var parseLine = function parseLine(line) {
      var nbVertex = 0;
      var geometry = line.geometry;
      var type = line.type;

      if (geometry instanceof Geometry) {
        geometry = new BufferGeometry().setFromObject(line);
      }

      if (geometry instanceof BufferGeometry) {
        var vertices = geometry.getAttribute('position');
        output += 'o ' + line.name + '\n';

        if (vertices !== undefined) {
          for (i = 0, l = vertices.count; i < l; i++, nbVertex++) {
            vertex.x = vertices.getX(i);
            vertex.y = vertices.getY(i);
            vertex.z = vertices.getZ(i);
            vertex.applyMatrix4(line.matrixWorld);
            output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';
          }
        }

        if (type === 'Line') {
          output += 'l ';

          for (j = 1, l = vertices.count; j <= l; j++) {
            output += indexVertex + j + ' ';
          }

          output += '\n';
        }

        if (type === 'LineSegments') {
          for (j = 1, k = j + 1, l = vertices.count; j < l; j += 2, k = j + 1) {
            output += 'l ' + (indexVertex + j) + ' ' + (indexVertex + k) + '\n';
          }
        }
      } else {
        console.warn('THREE.OBJExporter.parseLine(): geometry type unsupported', geometry);
      }

      indexVertex += nbVertex;
    };

    object.traverse(function (child) {
      if (child instanceof Mesh) {
        parseMesh(child);
      }

      if (child instanceof Line) {
        parseLine(child);
      }
    });
    return output;
  }
};