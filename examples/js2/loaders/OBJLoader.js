"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.OBJLoader = void 0;

var OBJLoader = function () {
  var object_pattern = /^[og]\s*(.+)?/;
  var material_library_pattern = /^mtllib /;
  var material_use_pattern = /^usemtl /;
  var map_use_pattern = /^usemap /;
  var vA = new THREE.Vector3();
  var vB = new Vector3();
  var vC = new Vector3();
  var ab = new Vector3();
  var cb = new Vector3();

  function ParserState() {
    var state = {
      objects: [],
      object: {},
      vertices: [],
      normals: [],
      colors: [],
      uvs: [],
      materials: {},
      materialLibraries: [],
      startObject: function startObject(name, fromDeclaration) {
        if (this.object && this.object.fromDeclaration === false) {
          this.object.name = name;
          this.object.fromDeclaration = fromDeclaration !== false;
          return;
        }

        var previousMaterial = this.object && typeof this.object.currentMaterial === 'function' ? this.object.currentMaterial() : undefined;

        if (this.object && typeof this.object._finalize === 'function') {
          this.object._finalize(true);
        }

        this.object = {
          name: name || '',
          fromDeclaration: fromDeclaration !== false,
          geometry: {
            vertices: [],
            normals: [],
            colors: [],
            uvs: [],
            hasUVIndices: false
          },
          materials: [],
          smooth: true,
          startMaterial: function startMaterial(name, libraries) {
            var previous = this._finalize(false);

            if (previous && (previous.inherited || previous.groupCount <= 0)) {
              this.materials.splice(previous.index, 1);
            }

            var material = {
              index: this.materials.length,
              name: name || '',
              mtllib: Array.isArray(libraries) && libraries.length > 0 ? libraries[libraries.length - 1] : '',
              smooth: previous !== undefined ? previous.smooth : this.smooth,
              groupStart: previous !== undefined ? previous.groupEnd : 0,
              groupEnd: -1,
              groupCount: -1,
              inherited: false,
              clone: function clone(index) {
                var cloned = {
                  index: typeof index === 'number' ? index : this.index,
                  name: this.name,
                  mtllib: this.mtllib,
                  smooth: this.smooth,
                  groupStart: 0,
                  groupEnd: -1,
                  groupCount: -1,
                  inherited: false
                };
                cloned.clone = this.clone.bind(cloned);
                return cloned;
              }
            };
            this.materials.push(material);
            return material;
          },
          currentMaterial: function currentMaterial() {
            if (this.materials.length > 0) {
              return this.materials[this.materials.length - 1];
            }

            return undefined;
          },
          _finalize: function _finalize(end) {
            var lastMultiMaterial = this.currentMaterial();

            if (lastMultiMaterial && lastMultiMaterial.groupEnd === -1) {
              lastMultiMaterial.groupEnd = this.geometry.vertices.length / 3;
              lastMultiMaterial.groupCount = lastMultiMaterial.groupEnd - lastMultiMaterial.groupStart;
              lastMultiMaterial.inherited = false;
            }

            if (end && this.materials.length > 1) {
              for (var mi = this.materials.length - 1; mi >= 0; mi--) {
                if (this.materials[mi].groupCount <= 0) {
                  this.materials.splice(mi, 1);
                }
              }
            }

            if (end && this.materials.length === 0) {
              this.materials.push({
                name: '',
                smooth: this.smooth
              });
            }

            return lastMultiMaterial;
          }
        };

        if (previousMaterial && previousMaterial.name && typeof previousMaterial.clone === 'function') {
          var declared = previousMaterial.clone(0);
          declared.inherited = true;
          this.object.materials.push(declared);
        }

        this.objects.push(this.object);
      },
      finalize: function finalize() {
        if (this.object && typeof this.object._finalize === 'function') {
          this.object._finalize(true);
        }
      },
      parseVertexIndex: function parseVertexIndex(value, len) {
        var index = parseInt(value, 10);
        return (index >= 0 ? index - 1 : index + len / 3) * 3;
      },
      parseNormalIndex: function parseNormalIndex(value, len) {
        var index = parseInt(value, 10);
        return (index >= 0 ? index - 1 : index + len / 3) * 3;
      },
      parseUVIndex: function parseUVIndex(value, len) {
        var index = parseInt(value, 10);
        return (index >= 0 ? index - 1 : index + len / 2) * 2;
      },
      addVertex: function addVertex(a, b, c) {
        var src = this.vertices;
        var dst = this.object.geometry.vertices;
        dst.push(src[a + 0], src[a + 1], src[a + 2]);
        dst.push(src[b + 0], src[b + 1], src[b + 2]);
        dst.push(src[c + 0], src[c + 1], src[c + 2]);
      },
      addVertexPoint: function addVertexPoint(a) {
        var src = this.vertices;
        var dst = this.object.geometry.vertices;
        dst.push(src[a + 0], src[a + 1], src[a + 2]);
      },
      addVertexLine: function addVertexLine(a) {
        var src = this.vertices;
        var dst = this.object.geometry.vertices;
        dst.push(src[a + 0], src[a + 1], src[a + 2]);
      },
      addNormal: function addNormal(a, b, c) {
        var src = this.normals;
        var dst = this.object.geometry.normals;
        dst.push(src[a + 0], src[a + 1], src[a + 2]);
        dst.push(src[b + 0], src[b + 1], src[b + 2]);
        dst.push(src[c + 0], src[c + 1], src[c + 2]);
      },
      addFaceNormal: function addFaceNormal(a, b, c) {
        var src = this.vertices;
        var dst = this.object.geometry.normals;
        vA.fromArray(src, a);
        vB.fromArray(src, b);
        vC.fromArray(src, c);
        cb.subVectors(vC, vB);
        ab.subVectors(vA, vB);
        cb.cross(ab);
        cb.normalize();
        dst.push(cb.x, cb.y, cb.z);
        dst.push(cb.x, cb.y, cb.z);
        dst.push(cb.x, cb.y, cb.z);
      },
      addColor: function addColor(a, b, c) {
        var src = this.colors;
        var dst = this.object.geometry.colors;
        if (src[a] !== undefined) dst.push(src[a + 0], src[a + 1], src[a + 2]);
        if (src[b] !== undefined) dst.push(src[b + 0], src[b + 1], src[b + 2]);
        if (src[c] !== undefined) dst.push(src[c + 0], src[c + 1], src[c + 2]);
      },
      addUV: function addUV(a, b, c) {
        var src = this.uvs;
        var dst = this.object.geometry.uvs;
        dst.push(src[a + 0], src[a + 1]);
        dst.push(src[b + 0], src[b + 1]);
        dst.push(src[c + 0], src[c + 1]);
      },
      addDefaultUV: function addDefaultUV() {
        var dst = this.object.geometry.uvs;
        dst.push(0, 0);
        dst.push(0, 0);
        dst.push(0, 0);
      },
      addUVLine: function addUVLine(a) {
        var src = this.uvs;
        var dst = this.object.geometry.uvs;
        dst.push(src[a + 0], src[a + 1]);
      },
      addFace: function addFace(a, b, c, ua, ub, uc, na, nb, nc) {
        var vLen = this.vertices.length;
        var ia = this.parseVertexIndex(a, vLen);
        var ib = this.parseVertexIndex(b, vLen);
        var ic = this.parseVertexIndex(c, vLen);
        this.addVertex(ia, ib, ic);
        this.addColor(ia, ib, ic);

        if (na !== undefined && na !== '') {
          var nLen = this.normals.length;
          ia = this.parseNormalIndex(na, nLen);
          ib = this.parseNormalIndex(nb, nLen);
          ic = this.parseNormalIndex(nc, nLen);
          this.addNormal(ia, ib, ic);
        } else {
          this.addFaceNormal(ia, ib, ic);
        }

        if (ua !== undefined && ua !== '') {
          var uvLen = this.uvs.length;
          ia = this.parseUVIndex(ua, uvLen);
          ib = this.parseUVIndex(ub, uvLen);
          ic = this.parseUVIndex(uc, uvLen);
          this.addUV(ia, ib, ic);
          this.object.geometry.hasUVIndices = true;
        } else {
          this.addDefaultUV();
        }
      },
      addPointGeometry: function addPointGeometry(vertices) {
        this.object.geometry.type = 'Points';
        var vLen = this.vertices.length;

        for (var vi = 0, l = vertices.length; vi < l; vi++) {
          this.addVertexPoint(this.parseVertexIndex(vertices[vi], vLen));
        }
      },
      addLineGeometry: function addLineGeometry(vertices, uvs) {
        this.object.geometry.type = 'Line';
        var vLen = this.vertices.length;
        var uvLen = this.uvs.length;

        for (var vi = 0, l = vertices.length; vi < l; vi++) {
          this.addVertexLine(this.parseVertexIndex(vertices[vi], vLen));
        }

        for (var uvi = 0, l = uvs.length; uvi < l; uvi++) {
          this.addUVLine(this.parseUVIndex(uvs[uvi], uvLen));
        }
      }
    };
    state.startObject('', false);
    return state;
  }

  function OBJLoader(manager) {
    Loader.call(this, manager);
    this.materials = null;
  }

  OBJLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {
    constructor: OBJLoader,
    load: function load(url, onLoad, onProgress, onError) {
      var scope = this;
      var loader = new THREE.FileLoader(this.manager);
      loader.setPath(this.path);
      loader.setRequestHeader(this.requestHeader);
      loader.setWithCredentials(this.withCredentials);
      loader.load(url, function (text) {
        try {
          onLoad(scope.parse(text));
        } catch (e) {
          if (onError) {
            onError(e);
          } else {
            console.error(e);
          }

          scope.manager.itemError(url);
        }
      }, onProgress, onError);
    },
    setMaterials: function setMaterials(materials) {
      this.materials = materials;
      return this;
    },
    parse: function parse(text) {
      var state = new ParserState();

      if (text.indexOf('\r\n') !== -1) {
        text = text.replace(/\r\n/g, '\n');
      }

      if (text.indexOf('\\\n') !== -1) {
        text = text.replace(/\\\n/g, '');
      }

      var lines = text.split('\n');
      var line = '',
          lineFirstChar = '';
      var lineLength = 0;
      var result = [];
      var trimLeft = typeof ''.trimLeft === 'function';

      for (var i = 0, l = lines.length; i < l; i++) {
        line = lines[i];
        line = trimLeft ? line.trimLeft() : line.trim();
        lineLength = line.length;
        if (lineLength === 0) continue;
        lineFirstChar = line.charAt(0);
        if (lineFirstChar === '#') continue;

        if (lineFirstChar === 'v') {
          var data = line.split(/\s+/);

          switch (data[0]) {
            case 'v':
              state.vertices.push(parseFloat(data[1]), parseFloat(data[2]), parseFloat(data[3]));

              if (data.length >= 7) {
                state.colors.push(parseFloat(data[4]), parseFloat(data[5]), parseFloat(data[6]));
              } else {
                state.colors.push(undefined, undefined, undefined);
              }

              break;

            case 'vn':
              state.normals.push(parseFloat(data[1]), parseFloat(data[2]), parseFloat(data[3]));
              break;

            case 'vt':
              state.uvs.push(parseFloat(data[1]), parseFloat(data[2]));
              break;
          }
        } else if (lineFirstChar === 'f') {
          var lineData = line.substr(1).trim();
          var vertexData = lineData.split(/\s+/);
          var faceVertices = [];

          for (var j = 0, jl = vertexData.length; j < jl; j++) {
            var vertex = vertexData[j];

            if (vertex.length > 0) {
              var vertexParts = vertex.split('/');
              faceVertices.push(vertexParts);
            }
          }

          var v1 = faceVertices[0];

          for (var j = 1, jl = faceVertices.length - 1; j < jl; j++) {
            var v2 = faceVertices[j];
            var v3 = faceVertices[j + 1];
            state.addFace(v1[0], v2[0], v3[0], v1[1], v2[1], v3[1], v1[2], v2[2], v3[2]);
          }
        } else if (lineFirstChar === 'l') {
          var lineParts = line.substring(1).trim().split(" ");
          var lineVertices = [],
              lineUVs = [];

          if (line.indexOf("/") === -1) {
            lineVertices = lineParts;
          } else {
            for (var li = 0, llen = lineParts.length; li < llen; li++) {
              var parts = lineParts[li].split("/");
              if (parts[0] !== "") lineVertices.push(parts[0]);
              if (parts[1] !== "") lineUVs.push(parts[1]);
            }
          }

          state.addLineGeometry(lineVertices, lineUVs);
        } else if (lineFirstChar === 'p') {
          var lineData = line.substr(1).trim();
          var pointData = lineData.split(" ");
          state.addPointGeometry(pointData);
        } else if ((result = object_pattern.exec(line)) !== null) {
          var name = (" " + result[0].substr(1).trim()).substr(1);
          state.startObject(name);
        } else if (material_use_pattern.test(line)) {
          state.object.startMaterial(line.substring(7).trim(), state.materialLibraries);
        } else if (material_library_pattern.test(line)) {
          state.materialLibraries.push(line.substring(7).trim());
        } else if (map_use_pattern.test(line)) {
          console.warn('THREE.OBJLoader: Rendering identifier "usemap" not supported. Textures must be defined in MTL files.');
        } else if (lineFirstChar === 's') {
          result = line.split(' ');

          if (result.length > 1) {
            var value = result[1].trim().toLowerCase();
            state.object.smooth = value !== '0' && value !== 'off';
          } else {
            state.object.smooth = true;
          }

          var material = state.object.currentMaterial();
          if (material) material.smooth = state.object.smooth;
        } else {
          if (line === '\0') continue;
          console.warn('THREE.OBJLoader: Unexpected line: "' + line + '"');
        }
      }

      state.finalize();
      var container = new THREE.Group();
      container.materialLibraries = [].concat(state.materialLibraries);

      for (var i = 0, l = state.objects.length; i < l; i++) {
        var object = state.objects[i];
        var geometry = object.geometry;
        var materials = object.materials;
        var isLine = geometry.type === 'Line';
        var isPoints = geometry.type === 'Points';
        var hasVertexColors = false;
        if (geometry.vertices.length === 0) continue;
        var buffergeometry = new THREE.BufferGeometry();
        buffergeometry.setAttribute('position', new THREE.Float32BufferAttribute(geometry.vertices, 3));
        buffergeometry.setAttribute('normal', new Float32BufferAttribute(geometry.normals, 3));

        if (geometry.colors.length > 0) {
          hasVertexColors = true;
          buffergeometry.setAttribute('color', new Float32BufferAttribute(geometry.colors, 3));
        }

        if (geometry.hasUVIndices === true) {
          buffergeometry.setAttribute('uv', new Float32BufferAttribute(geometry.uvs, 2));
        }

        var createdMaterials = [];

        for (var mi = 0, miLen = materials.length; mi < miLen; mi++) {
          var sourceMaterial = materials[mi];
          var materialHash = sourceMaterial.name + '_' + sourceMaterial.smooth + '_' + hasVertexColors;
          var material = state.materials[materialHash];

          if (this.materials !== null) {
            material = this.materials.create(sourceMaterial.name);

            if (isLine && material && !(material instanceof LineBasicMaterial)) {
              var materialLine = new LineBasicMaterial();
              Material.prototype.copy.call(materialLine, material);
              materialLine.color.copy(material.color);
              material = materialLine;
            } else if (isPoints && material && !(material instanceof PointsMaterial)) {
              var materialPoints = new PointsMaterial({
                size: 10,
                sizeAttenuation: false
              });
              Material.prototype.copy.call(materialPoints, material);
              materialPoints.color.copy(material.color);
              materialPoints.map = material.map;
              material = materialPoints;
            }
          }

          if (material === undefined) {
            if (isLine) {
              material = new LineBasicMaterial();
            } else if (isPoints) {
              material = new PointsMaterial({
                size: 1,
                sizeAttenuation: false
              });
            } else {
              material = new THREE.MeshPhongMaterial();
            }

            material.name = sourceMaterial.name;
            material.flatShading = sourceMaterial.smooth ? false : true;
            material.vertexColors = hasVertexColors;
            state.materials[materialHash] = material;
          }

          createdMaterials.push(material);
        }

        var mesh;

        if (createdMaterials.length > 1) {
          for (var mi = 0, miLen = materials.length; mi < miLen; mi++) {
            var sourceMaterial = materials[mi];
            buffergeometry.addGroup(sourceMaterial.groupStart, sourceMaterial.groupCount, mi);
          }

          if (isLine) {
            mesh = new THREE.LineSegments(buffergeometry, createdMaterials);
          } else if (isPoints) {
            mesh = new Points(buffergeometry, createdMaterials);
          } else {
            mesh = new Mesh(buffergeometry, createdMaterials);
          }
        } else {
          if (isLine) {
            mesh = new LineSegments(buffergeometry, createdMaterials[0]);
          } else if (isPoints) {
            mesh = new Points(buffergeometry, createdMaterials[0]);
          } else {
            mesh = new Mesh(buffergeometry, createdMaterials[0]);
          }
        }

        mesh.name = object.name;
        container.add(mesh);
      }

      return container;
    }
  });
  return OBJLoader;
}();

THREE.OBJLoader = OBJLoader;