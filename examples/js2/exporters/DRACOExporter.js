"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.DRACOExporter = void 0;

var DRACOExporter = function DRACOExporter() {};

THREE.DRACOExporter = DRACOExporter;
DRACOExporter.prototype = {
  constructor: DRACOExporter,
  parse: function parse(geometry, options) {
    if (DracoEncoderModule === undefined) {
      throw new Error('THREE.DRACOExporter: required the draco_decoder to work.');
    }

    if (options === undefined) {
      options = {
        decodeSpeed: 5,
        encodeSpeed: 5,
        encoderMethod: DRACOExporter.MESH_EDGEBREAKER_ENCODING,
        quantization: [16, 8, 8, 8, 8],
        exportUvs: true,
        exportNormals: true,
        exportColor: false
      };
    }

    var dracoEncoder = DracoEncoderModule();
    var encoder = new dracoEncoder.Encoder();
    var builder = new dracoEncoder.MeshBuilder();
    var mesh = new dracoEncoder.Mesh();

    if (geometry.isGeometry === true) {
      var bufferGeometry = new THREE.BufferGeometry();
      bufferGeometry.fromGeometry(geometry);
      geometry = bufferGeometry;
    }

    if (geometry.isBufferGeometry !== true) {
      throw new Error('THREE.DRACOExporter.parse(geometry, options): geometry is not a THREE.Geometry or BufferGeometry instance.');
    }

    var vertices = geometry.getAttribute('position');
    builder.AddFloatAttributeToMesh(mesh, dracoEncoder.POSITION, vertices.count, vertices.itemSize, vertices.array);
    var faces = geometry.getIndex();

    if (faces !== null) {
      builder.AddFacesToMesh(mesh, faces.count / 3, faces.array);
    } else {
      var faces = new (vertices.count > 65535 ? Uint32Array : Uint16Array)(vertices.count);

      for (var i = 0; i < faces.length; i++) {
        faces[i] = i;
      }

      builder.AddFacesToMesh(mesh, vertices.count, faces);
    }

    if (options.exportNormals === true) {
      var normals = geometry.getAttribute('normal');

      if (normals !== undefined) {
        builder.AddFloatAttributeToMesh(mesh, dracoEncoder.NORMAL, normals.count, normals.itemSize, normals.array);
      }
    }

    if (options.exportUvs === true) {
      var uvs = geometry.getAttribute('uv');

      if (uvs !== undefined) {
        builder.AddFloatAttributeToMesh(mesh, dracoEncoder.TEX_COORD, uvs.count, uvs.itemSize, uvs.array);
      }
    }

    if (options.exportColor === true) {
      var colors = geometry.getAttribute('color');

      if (colors !== undefined) {
        builder.AddFloatAttributeToMesh(mesh, dracoEncoder.COLOR, colors.count, colors.itemSize, colors.array);
      }
    }

    var encodedData = new dracoEncoder.DracoInt8Array();
    encoder.SetSpeedOptions(options.encodeSpeed || 5, options.decodeSpeed || 5);

    if (options.encoderMethod !== undefined) {
      encoder.SetEncodingMethod(options.encoderMethod);
    }

    if (options.quantization !== undefined) {
      for (var i = 0; i < 5; i++) {
        if (options.quantization[i] !== undefined) {
          encoder.SetAttributeQuantization(i, options.quantization[i]);
        }
      }
    }

    var length = encoder.EncodeMeshToDracoBuffer(mesh, encodedData);
    dracoEncoder.destroy(mesh);

    if (length === 0) {
      throw new Error('THREE.DRACOExporter: Draco encoding failed.');
    }

    var outputData = new Int8Array(new ArrayBuffer(length));

    for (var i = 0; i < length; i++) {
      outputData[i] = encodedData.GetValue(i);
    }

    dracoEncoder.destroy(encodedData);
    dracoEncoder.destroy(encoder);
    dracoEncoder.destroy(builder);
    return outputData;
  }
};
DRACOExporter.MESH_EDGEBREAKER_ENCODING = 1;
DRACOExporter.MESH_SEQUENTIAL_ENCODING = 0;
DRACOExporter.POINT_CLOUD = 0;
DRACOExporter.TRIANGULAR_MESH = 1;
DRACOExporter.INVALID = -1;
DRACOExporter.POSITION = 0;
DRACOExporter.NORMAL = 1;
DRACOExporter.COLOR = 2;
DRACOExporter.TEX_COORD = 3;
DRACOExporter.GENERIC = 4;