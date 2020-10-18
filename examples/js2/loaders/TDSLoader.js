"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.TDSLoader = void 0;

var TDSLoader = function TDSLoader(manager) {
  Loader.call(this, manager);
  this.debug = false;
  this.group = null;
  this.position = 0;
  this.materials = [];
  this.meshes = [];
};

THREE.TDSLoader = TDSLoader;
TDSLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {
  constructor: TDSLoader,
  load: function load(url, onLoad, onProgress, onError) {
    var scope = this;
    var path = this.path === '' ? THREE.LoaderUtils.extractUrlBase(url) : this.path;
    var loader = new THREE.FileLoader(this.manager);
    loader.setPath(this.path);
    loader.setResponseType('arraybuffer');
    loader.setRequestHeader(this.requestHeader);
    loader.setWithCredentials(this.withCredentials);
    loader.load(url, function (data) {
      try {
        onLoad(scope.parse(data, path));
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
  parse: function parse(arraybuffer, path) {
    this.group = new THREE.Group();
    this.position = 0;
    this.materials = [];
    this.meshes = [];
    this.readFile(arraybuffer, path);

    for (var i = 0; i < this.meshes.length; i++) {
      this.group.add(this.meshes[i]);
    }

    return this.group;
  },
  readFile: function readFile(arraybuffer, path) {
    var data = new DataView(arraybuffer);
    var chunk = this.readChunk(data);

    if (chunk.id === MLIBMAGIC || chunk.id === CMAGIC || chunk.id === M3DMAGIC) {
      var next = this.nextChunk(data, chunk);

      while (next !== 0) {
        if (next === M3D_VERSION) {
          var version = this.readDWord(data);
          this.debugMessage('3DS file version: ' + version);
        } else if (next === MDATA) {
          this.resetPosition(data);
          this.readMeshData(data, path);
        } else {
          this.debugMessage('Unknown main chunk: ' + next.toString(16));
        }

        next = this.nextChunk(data, chunk);
      }
    }

    this.debugMessage('Parsed ' + this.meshes.length + ' meshes');
  },
  readMeshData: function readMeshData(data, path) {
    var chunk = this.readChunk(data);
    var next = this.nextChunk(data, chunk);

    while (next !== 0) {
      if (next === MESH_VERSION) {
        var version = +this.readDWord(data);
        this.debugMessage('Mesh Version: ' + version);
      } else if (next === MASTER_SCALE) {
        var scale = this.readFloat(data);
        this.debugMessage('Master scale: ' + scale);
        this.group.scale.set(scale, scale, scale);
      } else if (next === NAMED_OBJECT) {
        this.debugMessage('Named Object');
        this.resetPosition(data);
        this.readNamedObject(data);
      } else if (next === MAT_ENTRY) {
        this.debugMessage('Material');
        this.resetPosition(data);
        this.readMaterialEntry(data, path);
      } else {
        this.debugMessage('Unknown MDATA chunk: ' + next.toString(16));
      }

      next = this.nextChunk(data, chunk);
    }
  },
  readNamedObject: function readNamedObject(data) {
    var chunk = this.readChunk(data);
    var name = this.readString(data, 64);
    chunk.cur = this.position;
    var next = this.nextChunk(data, chunk);

    while (next !== 0) {
      if (next === N_TRI_OBJECT) {
        this.resetPosition(data);
        var mesh = this.readMesh(data);
        mesh.name = name;
        this.meshes.push(mesh);
      } else {
        this.debugMessage('Unknown named object chunk: ' + next.toString(16));
      }

      next = this.nextChunk(data, chunk);
    }

    this.endChunk(chunk);
  },
  readMaterialEntry: function readMaterialEntry(data, path) {
    var chunk = this.readChunk(data);
    var next = this.nextChunk(data, chunk);
    var material = new THREE.MeshPhongMaterial();

    while (next !== 0) {
      if (next === MAT_NAME) {
        material.name = this.readString(data, 64);
        this.debugMessage('   Name: ' + material.name);
      } else if (next === MAT_WIRE) {
        this.debugMessage('   Wireframe');
        material.wireframe = true;
      } else if (next === MAT_WIRE_SIZE) {
        var value = this.readByte(data);
        material.wireframeLinewidth = value;
        this.debugMessage('   Wireframe Thickness: ' + value);
      } else if (next === MAT_TWO_SIDE) {
        material.side = THREE.DoubleSide;
        this.debugMessage('   DoubleSided');
      } else if (next === MAT_ADDITIVE) {
        this.debugMessage('   Additive Blending');
        material.blending = THREE.AdditiveBlending;
      } else if (next === MAT_DIFFUSE) {
        this.debugMessage('   Diffuse THREE.Color');
        material.color = this.readColor(data);
      } else if (next === MAT_SPECULAR) {
        this.debugMessage('   Specular Color');
        material.specular = this.readColor(data);
      } else if (next === MAT_AMBIENT) {
        this.debugMessage('   Ambient color');
        material.color = this.readColor(data);
      } else if (next === MAT_SHININESS) {
        var shininess = this.readWord(data);
        material.shininess = shininess;
        this.debugMessage('   Shininess : ' + shininess);
      } else if (next === MAT_TRANSPARENCY) {
        var opacity = this.readWord(data);
        material.opacity = opacity * 0.01;
        this.debugMessage('  Opacity : ' + opacity);
        material.transparent = opacity < 100 ? true : false;
      } else if (next === MAT_TEXMAP) {
        this.debugMessage('   ColorMap');
        this.resetPosition(data);
        material.map = this.readMap(data, path);
      } else if (next === MAT_BUMPMAP) {
        this.debugMessage('   BumpMap');
        this.resetPosition(data);
        material.bumpMap = this.readMap(data, path);
      } else if (next === MAT_OPACMAP) {
        this.debugMessage('   OpacityMap');
        this.resetPosition(data);
        material.alphaMap = this.readMap(data, path);
      } else if (next === MAT_SPECMAP) {
        this.debugMessage('   SpecularMap');
        this.resetPosition(data);
        material.specularMap = this.readMap(data, path);
      } else {
        this.debugMessage('   Unknown material chunk: ' + next.toString(16));
      }

      next = this.nextChunk(data, chunk);
    }

    this.endChunk(chunk);
    this.materials[material.name] = material;
  },
  readMesh: function readMesh(data) {
    var chunk = this.readChunk(data);
    var next = this.nextChunk(data, chunk);
    var geometry = new THREE.BufferGeometry();
    var uvs = [];
    var material = new MeshPhongMaterial();
    var mesh = new Mesh(geometry, material);
    mesh.name = 'mesh';

    while (next !== 0) {
      if (next === POINT_ARRAY) {
        var points = this.readWord(data);
        this.debugMessage('   Vertex: ' + points);
        var vertices = [];

        for (var i = 0; i < points; i++) {
          vertices.push(this.readFloat(data));
          vertices.push(this.readFloat(data));
          vertices.push(this.readFloat(data));
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      } else if (next === FACE_ARRAY) {
        this.resetPosition(data);
        this.readFaceArray(data, mesh);
      } else if (next === TEX_VERTS) {
        var texels = this.readWord(data);
        this.debugMessage('   UV: ' + texels);
        var uvs = [];

        for (var i = 0; i < texels; i++) {
          uvs.push(this.readFloat(data));
          uvs.push(this.readFloat(data));
        }

        geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
      } else if (next === MESH_MATRIX) {
        this.debugMessage('   Tranformation Matrix (TODO)');
        var values = [];

        for (var i = 0; i < 12; i++) {
          values[i] = this.readFloat(data);
        }

        var matrix = new THREE.Matrix4();
        matrix.elements[0] = values[0];
        matrix.elements[1] = values[6];
        matrix.elements[2] = values[3];
        matrix.elements[3] = values[9];
        matrix.elements[4] = values[2];
        matrix.elements[5] = values[8];
        matrix.elements[6] = values[5];
        matrix.elements[7] = values[11];
        matrix.elements[8] = values[1];
        matrix.elements[9] = values[7];
        matrix.elements[10] = values[4];
        matrix.elements[11] = values[10];
        matrix.elements[12] = 0;
        matrix.elements[13] = 0;
        matrix.elements[14] = 0;
        matrix.elements[15] = 1;
        matrix.transpose();
        var inverse = new Matrix4();
        inverse.getInverse(matrix);
        geometry.applyMatrix4(inverse);
        matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
      } else {
        this.debugMessage('   Unknown mesh chunk: ' + next.toString(16));
      }

      next = this.nextChunk(data, chunk);
    }

    this.endChunk(chunk);
    geometry.computeVertexNormals();
    return mesh;
  },
  readFaceArray: function readFaceArray(data, mesh) {
    var chunk = this.readChunk(data);
    var faces = this.readWord(data);
    this.debugMessage('   Faces: ' + faces);
    var index = [];

    for (var i = 0; i < faces; ++i) {
      index.push(this.readWord(data), this.readWord(data), this.readWord(data));
      this.readWord(data);
    }

    mesh.geometry.setIndex(index);

    while (this.position < chunk.end) {
      var chunk = this.readChunk(data);

      if (chunk.id === MSH_MAT_GROUP) {
        this.debugMessage('      Material Group');
        this.resetPosition(data);
        var group = this.readMaterialGroup(data);
        var material = this.materials[group.name];

        if (material !== undefined) {
          mesh.material = material;

          if (material.name === '') {
            material.name = mesh.name;
          }
        }
      } else {
        this.debugMessage('      Unknown face array chunk: ' + chunk.toString(16));
      }

      this.endChunk(chunk);
    }

    this.endChunk(chunk);
  },
  readMap: function readMap(data, path) {
    var chunk = this.readChunk(data);
    var next = this.nextChunk(data, chunk);
    var texture = {};
    var loader = new THREE.TextureLoader(this.manager);
    loader.setPath(this.resourcePath || path).setCrossOrigin(this.crossOrigin);

    while (next !== 0) {
      if (next === MAT_MAPNAME) {
        var name = this.readString(data, 128);
        texture = loader.load(name);
        this.debugMessage('      File: ' + path + name);
      } else if (next === MAT_MAP_UOFFSET) {
        texture.offset.x = this.readFloat(data);
        this.debugMessage('      OffsetX: ' + texture.offset.x);
      } else if (next === MAT_MAP_VOFFSET) {
        texture.offset.y = this.readFloat(data);
        this.debugMessage('      OffsetY: ' + texture.offset.y);
      } else if (next === MAT_MAP_USCALE) {
        texture.repeat.x = this.readFloat(data);
        this.debugMessage('      RepeatX: ' + texture.repeat.x);
      } else if (next === MAT_MAP_VSCALE) {
        texture.repeat.y = this.readFloat(data);
        this.debugMessage('      RepeatY: ' + texture.repeat.y);
      } else {
        this.debugMessage('      Unknown map chunk: ' + next.toString(16));
      }

      next = this.nextChunk(data, chunk);
    }

    this.endChunk(chunk);
    return texture;
  },
  readMaterialGroup: function readMaterialGroup(data) {
    this.readChunk(data);
    var name = this.readString(data, 64);
    var numFaces = this.readWord(data);
    this.debugMessage('         Name: ' + name);
    this.debugMessage('         Faces: ' + numFaces);
    var index = [];

    for (var i = 0; i < numFaces; ++i) {
      index.push(this.readWord(data));
    }

    return {
      name: name,
      index: index
    };
  },
  readColor: function readColor(data) {
    var chunk = this.readChunk(data);
    var color = new Color();

    if (chunk.id === COLOR_24 || chunk.id === LIN_COLOR_24) {
      var r = this.readByte(data);
      var g = this.readByte(data);
      var b = this.readByte(data);
      color.setRGB(r / 255, g / 255, b / 255);
      this.debugMessage('      Color: ' + color.r + ', ' + color.g + ', ' + color.b);
    } else if (chunk.id === COLOR_F || chunk.id === LIN_COLOR_F) {
      var r = this.readFloat(data);
      var g = this.readFloat(data);
      var b = this.readFloat(data);
      color.setRGB(r, g, b);
      this.debugMessage('      Color: ' + color.r + ', ' + color.g + ', ' + color.b);
    } else {
      this.debugMessage('      Unknown color chunk: ' + chunk.toString(16));
    }

    this.endChunk(chunk);
    return color;
  },
  readChunk: function readChunk(data) {
    var chunk = {};
    chunk.cur = this.position;
    chunk.id = this.readWord(data);
    chunk.size = this.readDWord(data);
    chunk.end = chunk.cur + chunk.size;
    chunk.cur += 6;
    return chunk;
  },
  endChunk: function endChunk(chunk) {
    this.position = chunk.end;
  },
  nextChunk: function nextChunk(data, chunk) {
    if (chunk.cur >= chunk.end) {
      return 0;
    }

    this.position = chunk.cur;

    try {
      var next = this.readChunk(data);
      chunk.cur += next.size;
      return next.id;
    } catch (e) {
      this.debugMessage('Unable to read chunk at ' + this.position);
      return 0;
    }
  },
  resetPosition: function resetPosition() {
    this.position -= 6;
  },
  readByte: function readByte(data) {
    var v = data.getUint8(this.position, true);
    this.position += 1;
    return v;
  },
  readFloat: function readFloat(data) {
    try {
      var v = data.getFloat32(this.position, true);
      this.position += 4;
      return v;
    } catch (e) {
      this.debugMessage(e + ' ' + this.position + ' ' + data.byteLength);
    }
  },
  readInt: function readInt(data) {
    var v = data.getInt32(this.position, true);
    this.position += 4;
    return v;
  },
  readShort: function readShort(data) {
    var v = data.getInt16(this.position, true);
    this.position += 2;
    return v;
  },
  readDWord: function readDWord(data) {
    var v = data.getUint32(this.position, true);
    this.position += 4;
    return v;
  },
  readWord: function readWord(data) {
    var v = data.getUint16(this.position, true);
    this.position += 2;
    return v;
  },
  readString: function readString(data, maxLength) {
    var s = '';

    for (var i = 0; i < maxLength; i++) {
      var c = this.readByte(data);

      if (!c) {
        break;
      }

      s += String.fromCharCode(c);
    }

    return s;
  },
  debugMessage: function debugMessage(message) {
    if (this.debug) {
      console.log(message);
    }
  }
});
var M3DMAGIC = 0x4D4D;
var MLIBMAGIC = 0x3DAA;
var CMAGIC = 0xC23D;
var M3D_VERSION = 0x0002;
var COLOR_F = 0x0010;
var COLOR_24 = 0x0011;
var LIN_COLOR_24 = 0x0012;
var LIN_COLOR_F = 0x0013;
var MDATA = 0x3D3D;
var MESH_VERSION = 0x3D3E;
var MASTER_SCALE = 0x0100;
var MAT_ENTRY = 0xAFFF;
var MAT_NAME = 0xA000;
var MAT_AMBIENT = 0xA010;
var MAT_DIFFUSE = 0xA020;
var MAT_SPECULAR = 0xA030;
var MAT_SHININESS = 0xA040;
var MAT_TRANSPARENCY = 0xA050;
var MAT_TWO_SIDE = 0xA081;
var MAT_ADDITIVE = 0xA083;
var MAT_WIRE = 0xA085;
var MAT_WIRE_SIZE = 0xA087;
var MAT_TEXMAP = 0xA200;
var MAT_OPACMAP = 0xA210;
var MAT_BUMPMAP = 0xA230;
var MAT_SPECMAP = 0xA204;
var MAT_MAPNAME = 0xA300;
var MAT_MAP_USCALE = 0xA354;
var MAT_MAP_VSCALE = 0xA356;
var MAT_MAP_UOFFSET = 0xA358;
var MAT_MAP_VOFFSET = 0xA35A;
var NAMED_OBJECT = 0x4000;
var N_TRI_OBJECT = 0x4100;
var POINT_ARRAY = 0x4110;
var FACE_ARRAY = 0x4120;
var MSH_MAT_GROUP = 0x4130;
var TEX_VERTS = 0x4140;
var MESH_MATRIX = 0x4160;