"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.PackedPhongMaterial = PackedPhongMaterial;
THREE.GeometryCompressionUtils = void 0;
var GeometryCompressionUtils = {
  compressNormals: function compressNormals(mesh, encodeMethod) {
    if (!mesh.geometry) {
      console.error("Mesh must contain geometry. ");
    }

    var normal = mesh.geometry.attributes.normal;

    if (!normal) {
      console.error("Geometry must contain normal attribute. ");
    }

    if (normal.isPacked) return;

    if (normal.itemSize != 3) {
      console.error("normal.itemSize is not 3, which cannot be encoded. ");
    }

    var array = normal.array;
    var count = normal.count;
    var result;

    if (encodeMethod == "DEFAULT") {
      result = new Uint8Array(count * 3);

      for (var idx = 0; idx < array.length; idx += 3) {
        var encoded = this.EncodingFuncs.defaultEncode(array[idx], array[idx + 1], array[idx + 2], 1);
        result[idx + 0] = encoded[0];
        result[idx + 1] = encoded[1];
        result[idx + 2] = encoded[2];
      }

      mesh.geometry.setAttribute('normal', new THREE.BufferAttribute(result, 3, true));
      mesh.geometry.attributes.normal.bytes = result.length * 1;
    } else if (encodeMethod == "OCT1Byte") {
      result = new Int8Array(count * 2);

      for (var _idx = 0; _idx < array.length; _idx += 3) {
        var _encoded = this.EncodingFuncs.octEncodeBest(array[_idx], array[_idx + 1], array[_idx + 2], 1);

        result[_idx / 3 * 2 + 0] = _encoded[0];
        result[_idx / 3 * 2 + 1] = _encoded[1];
      }

      mesh.geometry.setAttribute('normal', new BufferAttribute(result, 2, true));
      mesh.geometry.attributes.normal.bytes = result.length * 1;
    } else if (encodeMethod == "OCT2Byte") {
      result = new Int16Array(count * 2);

      for (var _idx2 = 0; _idx2 < array.length; _idx2 += 3) {
        var _encoded2 = this.EncodingFuncs.octEncodeBest(array[_idx2], array[_idx2 + 1], array[_idx2 + 2], 2);

        result[_idx2 / 3 * 2 + 0] = _encoded2[0];
        result[_idx2 / 3 * 2 + 1] = _encoded2[1];
      }

      mesh.geometry.setAttribute('normal', new BufferAttribute(result, 2, true));
      mesh.geometry.attributes.normal.bytes = result.length * 2;
    } else if (encodeMethod == "ANGLES") {
      result = new Uint16Array(count * 2);

      for (var _idx3 = 0; _idx3 < array.length; _idx3 += 3) {
        var _encoded3 = this.EncodingFuncs.anglesEncode(array[_idx3], array[_idx3 + 1], array[_idx3 + 2]);

        result[_idx3 / 3 * 2 + 0] = _encoded3[0];
        result[_idx3 / 3 * 2 + 1] = _encoded3[1];
      }

      mesh.geometry.setAttribute('normal', new BufferAttribute(result, 2, true));
      mesh.geometry.attributes.normal.bytes = result.length * 2;
    } else {
      console.error("Unrecognized encoding method, should be `DEFAULT` or `ANGLES` or `OCT`. ");
    }

    mesh.geometry.attributes.normal.needsUpdate = true;
    mesh.geometry.attributes.normal.isPacked = true;
    mesh.geometry.attributes.normal.packingMethod = encodeMethod;

    if (!(mesh.material instanceof PackedPhongMaterial)) {
      mesh.material = new PackedPhongMaterial().copy(mesh.material);
    }

    if (encodeMethod == "ANGLES") {
      mesh.material.defines.USE_PACKED_NORMAL = 0;
    }

    if (encodeMethod == "OCT1Byte") {
      mesh.material.defines.USE_PACKED_NORMAL = 1;
    }

    if (encodeMethod == "OCT2Byte") {
      mesh.material.defines.USE_PACKED_NORMAL = 1;
    }

    if (encodeMethod == "DEFAULT") {
      mesh.material.defines.USE_PACKED_NORMAL = 2;
    }
  },
  compressPositions: function compressPositions(mesh) {
    if (!mesh.geometry) {
      console.error("Mesh must contain geometry. ");
    }

    var position = mesh.geometry.attributes.position;

    if (!position) {
      console.error("Geometry must contain position attribute. ");
    }

    if (position.isPacked) return;

    if (position.itemSize != 3) {
      console.error("position.itemSize is not 3, which cannot be packed. ");
    }

    var array = position.array;
    var encodingBytes = 2;
    var result = this.EncodingFuncs.quantizedEncode(array, encodingBytes);
    var quantized = result.quantized;
    var decodeMat = result.decodeMat;
    if (mesh.geometry.boundingBox == null) mesh.geometry.computeBoundingBox();
    if (mesh.geometry.boundingSphere == null) mesh.geometry.computeBoundingSphere();
    mesh.geometry.setAttribute('position', new BufferAttribute(quantized, 3));
    mesh.geometry.attributes.position.isPacked = true;
    mesh.geometry.attributes.position.needsUpdate = true;
    mesh.geometry.attributes.position.bytes = quantized.length * encodingBytes;

    if (!(mesh.material instanceof PackedPhongMaterial)) {
      mesh.material = new PackedPhongMaterial().copy(mesh.material);
    }

    mesh.material.defines.USE_PACKED_POSITION = 0;
    mesh.material.uniforms.quantizeMatPos.value = decodeMat;
    mesh.material.uniforms.quantizeMatPos.needsUpdate = true;
  },
  compressUvs: function compressUvs(mesh) {
    if (!mesh.geometry) {
      console.error("Mesh must contain geometry property. ");
    }

    var uvs = mesh.geometry.attributes.uv;

    if (!uvs) {
      console.error("Geometry must contain uv attribute. ");
    }

    if (uvs.isPacked) return;
    var range = {
      min: Infinity,
      max: -Infinity
    };
    var array = uvs.array;

    for (var i = 0; i < array.length; i++) {
      range.min = Math.min(range.min, array[i]);
      range.max = Math.max(range.max, array[i]);
    }

    var result;

    if (range.min >= -1.0 && range.max <= 1.0) {
      result = new Uint16Array(array.length);

      for (var _i = 0; _i < array.length; _i += 2) {
        var encoded = this.EncodingFuncs.defaultEncode(array[_i], array[_i + 1], 0, 2);
        result[_i] = encoded[0];
        result[_i + 1] = encoded[1];
      }

      mesh.geometry.setAttribute('uv', new BufferAttribute(result, 2, true));
      mesh.geometry.attributes.uv.isPacked = true;
      mesh.geometry.attributes.uv.needsUpdate = true;
      mesh.geometry.attributes.uv.bytes = result.length * 2;

      if (!(mesh.material instanceof PackedPhongMaterial)) {
        mesh.material = new PackedPhongMaterial().copy(mesh.material);
      }

      mesh.material.defines.USE_PACKED_UV = 0;
    } else {
      result = this.EncodingFuncs.quantizedEncodeUV(array, 2);
      mesh.geometry.setAttribute('uv', new BufferAttribute(result.quantized, 2));
      mesh.geometry.attributes.uv.isPacked = true;
      mesh.geometry.attributes.uv.needsUpdate = true;
      mesh.geometry.attributes.uv.bytes = result.quantized.length * 2;

      if (!(mesh.material instanceof PackedPhongMaterial)) {
        mesh.material = new PackedPhongMaterial().copy(mesh.material);
      }

      mesh.material.defines.USE_PACKED_UV = 1;
      mesh.material.uniforms.quantizeMatUV.value = result.decodeMat;
      mesh.material.uniforms.quantizeMatUV.needsUpdate = true;
    }
  },
  EncodingFuncs: {
    defaultEncode: function defaultEncode(x, y, z, bytes) {
      if (bytes == 1) {
        var tmpx = Math.round((x + 1) * 0.5 * 255);
        var tmpy = Math.round((y + 1) * 0.5 * 255);
        var tmpz = Math.round((z + 1) * 0.5 * 255);
        return new Uint8Array([tmpx, tmpy, tmpz]);
      } else if (bytes == 2) {
        var _tmpx = Math.round((x + 1) * 0.5 * 65535);

        var _tmpy = Math.round((y + 1) * 0.5 * 65535);

        var _tmpz = Math.round((z + 1) * 0.5 * 65535);

        return new Uint16Array([_tmpx, _tmpy, _tmpz]);
      } else {
        console.error("number of bytes must be 1 or 2");
      }
    },
    defaultDecode: function defaultDecode(array, bytes) {
      if (bytes == 1) {
        return [array[0] / 255 * 2.0 - 1.0, array[1] / 255 * 2.0 - 1.0, array[2] / 255 * 2.0 - 1.0];
      } else if (bytes == 2) {
        return [array[0] / 65535 * 2.0 - 1.0, array[1] / 65535 * 2.0 - 1.0, array[2] / 65535 * 2.0 - 1.0];
      } else {
        console.error("number of bytes must be 1 or 2");
      }
    },
    anglesEncode: function anglesEncode(x, y, z) {
      var normal0 = parseInt(0.5 * (1.0 + Math.atan2(y, x) / Math.PI) * 65535);
      var normal1 = parseInt(0.5 * (1.0 + z) * 65535);
      return new Uint16Array([normal0, normal1]);
    },
    octEncodeBest: function octEncodeBest(x, y, z, bytes) {
      var oct, dec, best, currentCos, bestCos;
      best = oct = octEncodeVec3(x, y, z, "floor", "floor");
      dec = octDecodeVec2(oct);
      bestCos = dot(x, y, z, dec);
      oct = octEncodeVec3(x, y, z, "ceil", "floor");
      dec = octDecodeVec2(oct);
      currentCos = dot(x, y, z, dec);

      if (currentCos > bestCos) {
        best = oct;
        bestCos = currentCos;
      }

      oct = octEncodeVec3(x, y, z, "floor", "ceil");
      dec = octDecodeVec2(oct);
      currentCos = dot(x, y, z, dec);

      if (currentCos > bestCos) {
        best = oct;
        bestCos = currentCos;
      }

      oct = octEncodeVec3(x, y, z, "ceil", "ceil");
      dec = octDecodeVec2(oct);
      currentCos = dot(x, y, z, dec);

      if (currentCos > bestCos) {
        best = oct;
      }

      return best;

      function octEncodeVec3(x0, y0, z0, xfunc, yfunc) {
        var x = x0 / (Math.abs(x0) + Math.abs(y0) + Math.abs(z0));
        var y = y0 / (Math.abs(x0) + Math.abs(y0) + Math.abs(z0));

        if (z < 0) {
          var tempx = (1 - Math.abs(y)) * (x >= 0 ? 1 : -1);
          var tempy = (1 - Math.abs(x)) * (y >= 0 ? 1 : -1);
          x = tempx;
          y = tempy;
          var diff = 1 - Math.abs(x) - Math.abs(y);

          if (diff > 0) {
            diff += 0.001;
            x += x > 0 ? diff / 2 : -diff / 2;
            y += y > 0 ? diff / 2 : -diff / 2;
          }
        }

        if (bytes == 1) {
          return new Int8Array([Math[xfunc](x * 127.5 + (x < 0 ? 1 : 0)), Math[yfunc](y * 127.5 + (y < 0 ? 1 : 0))]);
        }

        if (bytes == 2) {
          return new Int16Array([Math[xfunc](x * 32767.5 + (x < 0 ? 1 : 0)), Math[yfunc](y * 32767.5 + (y < 0 ? 1 : 0))]);
        }
      }

      function octDecodeVec2(oct) {
        var x = oct[0];
        var y = oct[1];

        if (bytes == 1) {
          x /= x < 0 ? 127 : 128;
          y /= y < 0 ? 127 : 128;
        } else if (bytes == 2) {
          x /= x < 0 ? 32767 : 32768;
          y /= y < 0 ? 32767 : 32768;
        }

        var z = 1 - Math.abs(x) - Math.abs(y);

        if (z < 0) {
          var tmpx = x;
          x = (1 - Math.abs(y)) * (x >= 0 ? 1 : -1);
          y = (1 - Math.abs(tmpx)) * (y >= 0 ? 1 : -1);
        }

        var length = Math.sqrt(x * x + y * y + z * z);
        return [x / length, y / length, z / length];
      }

      function dot(x, y, z, vec3) {
        return x * vec3[0] + y * vec3[1] + z * vec3[2];
      }
    },
    quantizedEncode: function quantizedEncode(array, bytes) {
      var quantized, segments;

      if (bytes == 1) {
        quantized = new Uint8Array(array.length);
        segments = 255;
      } else if (bytes == 2) {
        quantized = new Uint16Array(array.length);
        segments = 65535;
      } else {
        console.error("number of bytes error! ");
      }

      var decodeMat = new THREE.Matrix4();
      var min = new Float32Array(3);
      var max = new Float32Array(3);
      min[0] = min[1] = min[2] = Number.MAX_VALUE;
      max[0] = max[1] = max[2] = -Number.MAX_VALUE;

      for (var i = 0; i < array.length; i += 3) {
        min[0] = Math.min(min[0], array[i + 0]);
        min[1] = Math.min(min[1], array[i + 1]);
        min[2] = Math.min(min[2], array[i + 2]);
        max[0] = Math.max(max[0], array[i + 0]);
        max[1] = Math.max(max[1], array[i + 1]);
        max[2] = Math.max(max[2], array[i + 2]);
      }

      decodeMat.scale(new THREE.Vector3((max[0] - min[0]) / segments, (max[1] - min[1]) / segments, (max[2] - min[2]) / segments));
      decodeMat.elements[12] = min[0];
      decodeMat.elements[13] = min[1];
      decodeMat.elements[14] = min[2];
      decodeMat.transpose();
      var multiplier = new Float32Array([max[0] !== min[0] ? segments / (max[0] - min[0]) : 0, max[1] !== min[1] ? segments / (max[1] - min[1]) : 0, max[2] !== min[2] ? segments / (max[2] - min[2]) : 0]);

      for (var _i2 = 0; _i2 < array.length; _i2 += 3) {
        quantized[_i2 + 0] = Math.floor((array[_i2 + 0] - min[0]) * multiplier[0]);
        quantized[_i2 + 1] = Math.floor((array[_i2 + 1] - min[1]) * multiplier[1]);
        quantized[_i2 + 2] = Math.floor((array[_i2 + 2] - min[2]) * multiplier[2]);
      }

      return {
        quantized: quantized,
        decodeMat: decodeMat
      };
    },
    quantizedEncodeUV: function quantizedEncodeUV(array, bytes) {
      var quantized, segments;

      if (bytes == 1) {
        quantized = new Uint8Array(array.length);
        segments = 255;
      } else if (bytes == 2) {
        quantized = new Uint16Array(array.length);
        segments = 65535;
      } else {
        console.error("number of bytes error! ");
      }

      var decodeMat = new THREE.Matrix3();
      var min = new Float32Array(2);
      var max = new Float32Array(2);
      min[0] = min[1] = Number.MAX_VALUE;
      max[0] = max[1] = -Number.MAX_VALUE;

      for (var i = 0; i < array.length; i += 2) {
        min[0] = Math.min(min[0], array[i + 0]);
        min[1] = Math.min(min[1], array[i + 1]);
        max[0] = Math.max(max[0], array[i + 0]);
        max[1] = Math.max(max[1], array[i + 1]);
      }

      decodeMat.scale((max[0] - min[0]) / segments, (max[1] - min[1]) / segments);
      decodeMat.elements[6] = min[0];
      decodeMat.elements[7] = min[1];
      decodeMat.transpose();
      var multiplier = new Float32Array([max[0] !== min[0] ? segments / (max[0] - min[0]) : 0, max[1] !== min[1] ? segments / (max[1] - min[1]) : 0]);

      for (var _i3 = 0; _i3 < array.length; _i3 += 2) {
        quantized[_i3 + 0] = Math.floor((array[_i3 + 0] - min[0]) * multiplier[0]);
        quantized[_i3 + 1] = Math.floor((array[_i3 + 1] - min[1]) * multiplier[1]);
      }

      return {
        quantized: quantized,
        decodeMat: decodeMat
      };
    }
  }
};
THREE.GeometryCompressionUtils = GeometryCompressionUtils;

function PackedPhongMaterial(parameters) {
  MeshPhongMaterial.call(this);
  this.defines = {};
  this.type = 'PackedPhongMaterial';
  this.uniforms = THREE.UniformsUtils.merge([ShaderLib.phong.uniforms, {
    quantizeMatPos: {
      value: null
    },
    quantizeMatUV: {
      value: null
    }
  }]);
  this.vertexShader = ["#define PHONG", "varying vec3 vViewPosition;", "#ifndef FLAT_SHADED", "varying vec3 vNormal;", "#endif", ShaderChunk.common, ShaderChunk.uv_pars_vertex, ShaderChunk.uv2_pars_vertex, ShaderChunk.displacementmap_pars_vertex, ShaderChunk.envmap_pars_vertex, ShaderChunk.color_pars_vertex, ShaderChunk.fog_pars_vertex, ShaderChunk.morphtarget_pars_vertex, ShaderChunk.skinning_pars_vertex, ShaderChunk.shadowmap_pars_vertex, ShaderChunk.logdepthbuf_pars_vertex, ShaderChunk.clipping_planes_pars_vertex, "#ifdef USE_PACKED_NORMAL\t\t\t#if USE_PACKED_NORMAL == 0\t\t\t\tvec3 decodeNormal(vec3 packedNormal)\t\t\t\t{\t\t\t\t\tfloat x = packedNormal.x * 2.0 - 1.0;\t\t\t\t\tfloat y = packedNormal.y * 2.0 - 1.0;\t\t\t\t\tvec2 scth = vec2(sin(x * PI), cos(x * PI));\t\t\t\t\tvec2 scphi = vec2(sqrt(1.0 - y * y), y);\t\t\t\t\treturn normalize( vec3(scth.y * scphi.x, scth.x * scphi.x, scphi.y) );\t\t\t\t}\t\t\t#endif\t\t\t#if USE_PACKED_NORMAL == 1\t\t\t\tvec3 decodeNormal(vec3 packedNormal)\t\t\t\t{\t\t\t\t\tvec3 v = vec3(packedNormal.xy, 1.0 - abs(packedNormal.x) - abs(packedNormal.y));\t\t\t\t\tif (v.z < 0.0)\t\t\t\t\t{\t\t\t\t\t\tv.xy = (1.0 - abs(v.yx)) * vec2((v.x >= 0.0) ? +1.0 : -1.0, (v.y >= 0.0) ? +1.0 : -1.0);\t\t\t\t\t}\t\t\t\t\treturn normalize(v);\t\t\t\t}\t\t\t#endif\t\t\t#if USE_PACKED_NORMAL == 2\t\t\t\tvec3 decodeNormal(vec3 packedNormal)\t\t\t\t{\t\t\t\t\tvec3 v = (packedNormal * 2.0) - 1.0;\t\t\t\t\treturn normalize(v);\t\t\t\t}\t\t\t#endif\t\t#endif", "#ifdef USE_PACKED_POSITION\t\t\t#if USE_PACKED_POSITION == 0\t\t\t\tuniform mat4 quantizeMatPos;\t\t\t#endif\t\t#endif", "#ifdef USE_PACKED_UV\t\t\t#if USE_PACKED_UV == 1\t\t\t\tuniform mat3 quantizeMatUV;\t\t\t#endif\t\t#endif", "#ifdef USE_PACKED_UV\t\t\t#if USE_PACKED_UV == 0\t\t\t\tvec2 decodeUV(vec2 packedUV)\t\t\t\t{\t\t\t\t\tvec2 uv = (packedUV * 2.0) - 1.0;\t\t\t\t\treturn uv;\t\t\t\t}\t\t\t#endif\t\t\t#if USE_PACKED_UV == 1\t\t\t\tvec2 decodeUV(vec2 packedUV)\t\t\t\t{\t\t\t\t\tvec2 uv = ( vec3(packedUV, 1.0) * quantizeMatUV ).xy;\t\t\t\t\treturn uv;\t\t\t\t}\t\t\t#endif\t\t#endif", "void main() {", ShaderChunk.uv_vertex, "#ifdef USE_UV\t\t\t#ifdef USE_PACKED_UV\t\t\t\tvUv = decodeUV(vUv);\t\t\t#endif\t\t#endif", ShaderChunk.uv2_vertex, ShaderChunk.color_vertex, ShaderChunk.beginnormal_vertex, "#ifdef USE_PACKED_NORMAL\t\t\tobjectNormal = decodeNormal(objectNormal);\t\t#endif\t\t#ifdef USE_TANGENT\t\t\tvec3 objectTangent = vec3( tangent.xyz );\t\t#endif\t\t", ShaderChunk.morphnormal_vertex, ShaderChunk.skinbase_vertex, ShaderChunk.skinnormal_vertex, ShaderChunk.defaultnormal_vertex, "#ifndef FLAT_SHADED", "	vNormal = normalize( transformedNormal );", "#endif", ShaderChunk.begin_vertex, "#ifdef USE_PACKED_POSITION\t\t\t#if USE_PACKED_POSITION == 0\t\t\t\ttransformed = ( vec4(transformed, 1.0) * quantizeMatPos ).xyz;\t\t\t#endif\t\t#endif", ShaderChunk.morphtarget_vertex, ShaderChunk.skinning_vertex, ShaderChunk.displacementmap_vertex, ShaderChunk.project_vertex, ShaderChunk.logdepthbuf_vertex, ShaderChunk.clipping_planes_vertex, "vViewPosition = - mvPosition.xyz;", ShaderChunk.worldpos_vertex, ShaderChunk.envmap_vertex, ShaderChunk.shadowmap_vertex, ShaderChunk.fog_vertex, "}"].join("\n");
  this.fragmentShader = ["#define PHONG", "uniform vec3 diffuse;", "uniform vec3 emissive;", "uniform vec3 specular;", "uniform float shininess;", "uniform float opacity;", ShaderChunk.common, ShaderChunk.packing, ShaderChunk.dithering_pars_fragment, ShaderChunk.color_pars_fragment, ShaderChunk.uv_pars_fragment, ShaderChunk.uv2_pars_fragment, ShaderChunk.map_pars_fragment, ShaderChunk.alphamap_pars_fragment, ShaderChunk.aomap_pars_fragment, ShaderChunk.lightmap_pars_fragment, ShaderChunk.emissivemap_pars_fragment, ShaderChunk.envmap_common_pars_fragment, ShaderChunk.envmap_pars_fragment, ShaderChunk.cube_uv_reflection_fragment, ShaderChunk.fog_pars_fragment, ShaderChunk.bsdfs, ShaderChunk.lights_pars_begin, ShaderChunk.lights_phong_pars_fragment, ShaderChunk.shadowmap_pars_fragment, ShaderChunk.bumpmap_pars_fragment, ShaderChunk.normalmap_pars_fragment, ShaderChunk.specularmap_pars_fragment, ShaderChunk.logdepthbuf_pars_fragment, ShaderChunk.clipping_planes_pars_fragment, "void main() {", ShaderChunk.clipping_planes_fragment, "vec4 diffuseColor = vec4( diffuse, opacity );", "ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );", "vec3 totalEmissiveRadiance = emissive;", ShaderChunk.logdepthbuf_fragment, ShaderChunk.map_fragment, ShaderChunk.color_fragment, ShaderChunk.alphamap_fragment, ShaderChunk.alphatest_fragment, ShaderChunk.specularmap_fragment, ShaderChunk.normal_fragment_begin, ShaderChunk.normal_fragment_maps, ShaderChunk.emissivemap_fragment, ShaderChunk.lights_phong_fragment, ShaderChunk.lights_fragment_begin, ShaderChunk.lights_fragment_maps, ShaderChunk.lights_fragment_end, ShaderChunk.aomap_fragment, "vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;", ShaderChunk.envmap_fragment, "gl_FragColor = vec4( outgoingLight, diffuseColor.a );", ShaderChunk.tonemapping_fragment, ShaderChunk.encodings_fragment, ShaderChunk.fog_fragment, ShaderChunk.premultiplied_alpha_fragment, ShaderChunk.dithering_fragment, "}"].join("\n");
  this.setValues(parameters);
}

PackedPhongMaterial.prototype = Object.create(THREE.MeshPhongMaterial.prototype);