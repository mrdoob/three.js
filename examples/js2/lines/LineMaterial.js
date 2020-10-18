"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.LineMaterial = void 0;
UniformsLib.line = {
  linewidth: {
    value: 1
  },
  resolution: {
    value: new THREE.Vector2(1, 1)
  },
  dashScale: {
    value: 1
  },
  dashSize: {
    value: 1
  },
  gapSize: {
    value: 1
  },
  opacity: {
    value: 1
  }
};
ShaderLib['line'] = {
  uniforms: THREE.UniformsUtils.merge([UniformsLib.common, UniformsLib.fog, UniformsLib.line]),
  vertexShader: "\t\t#include <common>\t\t#include <color_pars_vertex>\t\t#include <fog_pars_vertex>\t\t#include <logdepthbuf_pars_vertex>\t\t#include <clipping_planes_pars_vertex>\t\tuniform float linewidth;\t\tuniform vec2 resolution;\t\tattribute vec3 instanceStart;\t\tattribute vec3 instanceEnd;\t\tattribute vec3 instanceColorStart;\t\tattribute vec3 instanceColorEnd;\t\tvarying vec2 vUv;\t\t#ifdef USE_DASH\t\t\tuniform float dashScale;\t\t\tattribute float instanceDistanceStart;\t\t\tattribute float instanceDistanceEnd;\t\t\tvarying float vLineDistance;\t\t#endif\t\tvoid trimSegment( const in vec4 start, inout vec4 end ) {\t\t\t\t\t\t\tfloat a = projectionMatrix[ 2 ][ 2 ];\t\t\tfloat b = projectionMatrix[ 3 ][ 2 ];\t\t\tfloat nearEstimate = - 0.5 * b / a;\t\t\tfloat alpha = ( nearEstimate - start.z ) / ( end.z - start.z );\t\t\tend.xyz = mix( start.xyz, end.xyz, alpha );\t\t}\t\tvoid main() {\t\t\t#ifdef USE_COLOR\t\t\t\tvColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;\t\t\t#endif\t\t\t#ifdef USE_DASH\t\t\t\tvLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;\t\t\t#endif\t\t\tfloat aspect = resolution.x / resolution.y;\t\t\tvUv = uv;\t\t\t\t\tvec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );\t\t\tvec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );\t\t\t\t\t\t\t\t\t\t\tbool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 );\t\t\tif ( perspective ) {\t\t\t\tif ( start.z < 0.0 && end.z >= 0.0 ) {\t\t\t\t\ttrimSegment( start, end );\t\t\t\t} else if ( end.z < 0.0 && start.z >= 0.0 ) {\t\t\t\t\ttrimSegment( end, start );\t\t\t\t}\t\t\t}\t\t\t\t\tvec4 clipStart = projectionMatrix * start;\t\t\tvec4 clipEnd = projectionMatrix * end;\t\t\t\t\tvec2 ndcStart = clipStart.xy / clipStart.w;\t\t\tvec2 ndcEnd = clipEnd.xy / clipEnd.w;\t\t\t\t\tvec2 dir = ndcEnd - ndcStart;\t\t\t\t\tdir.x *= aspect;\t\t\tdir = normalize( dir );\t\t\t\t\tvec2 offset = vec2( dir.y, - dir.x );\t\t\t\t\tdir.x /= aspect;\t\t\toffset.x /= aspect;\t\t\t\t\tif ( position.x < 0.0 ) offset *= - 1.0;\t\t\t\t\tif ( position.y < 0.0 ) {\t\t\t\toffset += - dir;\t\t\t} else if ( position.y > 1.0 ) {\t\t\t\toffset += dir;\t\t\t}\t\t\t\t\toffset *= linewidth;\t\t\t\t\toffset /= resolution.y;\t\t\t\t\tvec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;\t\t\t\t\toffset *= clip.w;\t\t\tclip.xy += offset;\t\t\tgl_Position = clip;\t\t\tvec4 mvPosition = ( position.y < 0.5 ) ? start : end;\t\t\t#include <logdepthbuf_vertex>\t\t\t#include <clipping_planes_vertex>\t\t\t#include <fog_vertex>\t\t}\t\t",
  fragmentShader: "\t\tuniform vec3 diffuse;\t\tuniform float opacity;\t\t#ifdef USE_DASH\t\t\tuniform float dashSize;\t\t\tuniform float gapSize;\t\t#endif\t\tvarying float vLineDistance;\t\t#include <common>\t\t#include <color_pars_fragment>\t\t#include <fog_pars_fragment>\t\t#include <logdepthbuf_pars_fragment>\t\t#include <clipping_planes_pars_fragment>\t\tvarying vec2 vUv;\t\tvoid main() {\t\t\t#include <clipping_planes_fragment>\t\t\t#ifdef USE_DASH\t\t\t\tif ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard;\t\t\t\tif ( mod( vLineDistance, dashSize + gapSize ) > dashSize ) discard;\t\t\t#endif\t\t\tif ( abs( vUv.y ) > 1.0 ) {\t\t\t\tfloat a = vUv.x;\t\t\t\tfloat b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;\t\t\t\tfloat len2 = a * a + b * b;\t\t\t\tif ( len2 > 1.0 ) discard;\t\t\t}\t\t\tvec4 diffuseColor = vec4( diffuse, opacity );\t\t\t#include <logdepthbuf_fragment>\t\t\t#include <color_fragment>\t\t\tgl_FragColor = vec4( diffuseColor.rgb, diffuseColor.a );\t\t\t#include <tonemapping_fragment>\t\t\t#include <encodings_fragment>\t\t\t#include <fog_fragment>\t\t\t#include <premultiplied_alpha_fragment>\t\t}\t\t"
};

var LineMaterial = function LineMaterial(parameters) {
  ShaderMaterial.call(this, {
    type: 'LineMaterial',
    uniforms: UniformsUtils.clone(THREE.ShaderLib['line'].uniforms),
    vertexShader: ShaderLib['line'].vertexShader,
    fragmentShader: ShaderLib['line'].fragmentShader,
    clipping: true
  });
  this.dashed = false;
  Object.defineProperties(this, {
    color: {
      enumerable: true,
      get: function get() {
        return this.uniforms.diffuse.value;
      },
      set: function set(value) {
        this.uniforms.diffuse.value = value;
      }
    },
    linewidth: {
      enumerable: true,
      get: function get() {
        return this.uniforms.linewidth.value;
      },
      set: function set(value) {
        this.uniforms.linewidth.value = value;
      }
    },
    dashScale: {
      enumerable: true,
      get: function get() {
        return this.uniforms.dashScale.value;
      },
      set: function set(value) {
        this.uniforms.dashScale.value = value;
      }
    },
    dashSize: {
      enumerable: true,
      get: function get() {
        return this.uniforms.dashSize.value;
      },
      set: function set(value) {
        this.uniforms.dashSize.value = value;
      }
    },
    gapSize: {
      enumerable: true,
      get: function get() {
        return this.uniforms.gapSize.value;
      },
      set: function set(value) {
        this.uniforms.gapSize.value = value;
      }
    },
    opacity: {
      enumerable: true,
      get: function get() {
        return this.uniforms.opacity.value;
      },
      set: function set(value) {
        this.uniforms.opacity.value = value;
      }
    },
    resolution: {
      enumerable: true,
      get: function get() {
        return this.uniforms.resolution.value;
      },
      set: function set(value) {
        this.uniforms.resolution.value.copy(value);
      }
    }
  });
  this.setValues(parameters);
};

THREE.LineMaterial = LineMaterial;
LineMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
LineMaterial.prototype.constructor = LineMaterial;
LineMaterial.prototype.isLineMaterial = true;