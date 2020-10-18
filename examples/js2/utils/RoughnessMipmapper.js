"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.RoughnessMipmapper = RoughnessMipmapper;

var _mipmapMaterial = _getMipmapMaterial();

var _mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), _mipmapMaterial);

var _flatCamera = new THREE.OrthographicCamera(0, 1, 0, 1, 0, 1);

var _tempTarget = null;
var _renderer = null;

function RoughnessMipmapper(renderer) {
  _renderer = renderer;

  _renderer.compile(_mesh, _flatCamera);
}

RoughnessMipmapper.prototype = {
  constructor: RoughnessMipmapper,
  generateMipmaps: function generateMipmaps(material) {
    if ('roughnessMap' in material === false) return;
    var roughnessMap = material.roughnessMap,
        normalMap = material.normalMap;
    if (roughnessMap === null || normalMap === null || !roughnessMap.generateMipmaps || material.userData.roughnessUpdated) return;
    material.userData.roughnessUpdated = true;
    var width = Math.max(roughnessMap.image.width, normalMap.image.width);
    var height = Math.max(roughnessMap.image.height, normalMap.image.height);
    if (!THREE.MathUtils.isPowerOfTwo(width) || !MathUtils.isPowerOfTwo(height)) return;

    var oldTarget = _renderer.getRenderTarget();

    var autoClear = _renderer.autoClear;
    _renderer.autoClear = false;

    if (_tempTarget === null || _tempTarget.width !== width || _tempTarget.height !== height) {
      if (_tempTarget !== null) _tempTarget.dispose();
      _tempTarget = new THREE.WebGLRenderTarget(width, height, {
        depthBuffer: false
      });
      _tempTarget.scissorTest = true;
    }

    if (width !== roughnessMap.image.width || height !== roughnessMap.image.height) {
      var params = {
        wrapS: roughnessMap.wrapS,
        wrapT: roughnessMap.wrapT,
        magFilter: roughnessMap.magFilter,
        minFilter: roughnessMap.minFilter,
        depthBuffer: false
      };
      var newRoughnessTarget = new WebGLRenderTarget(width, height, params);
      newRoughnessTarget.texture.generateMipmaps = true;

      _renderer.setRenderTarget(newRoughnessTarget);

      material.roughnessMap = newRoughnessTarget.texture;
      if (material.metalnessMap == roughnessMap) material.metalnessMap = material.roughnessMap;
      if (material.aoMap == roughnessMap) material.aoMap = material.roughnessMap;
    }

    _mipmapMaterial.uniforms.roughnessMap.value = roughnessMap;
    _mipmapMaterial.uniforms.normalMap.value = normalMap;
    var position = new THREE.Vector2(0, 0);
    var texelSize = _mipmapMaterial.uniforms.texelSize.value;

    for (var mip = 0; width >= 1 && height >= 1; ++mip, width /= 2, height /= 2) {
      texelSize.set(1.0 / width, 1.0 / height);
      if (mip == 0) texelSize.set(0.0, 0.0);

      _tempTarget.viewport.set(position.x, position.y, width, height);

      _tempTarget.scissor.set(position.x, position.y, width, height);

      _renderer.setRenderTarget(_tempTarget);

      _renderer.render(_mesh, _flatCamera);

      _renderer.copyFramebufferToTexture(position, material.roughnessMap, mip);

      _mipmapMaterial.uniforms.roughnessMap.value = material.roughnessMap;
    }

    if (roughnessMap !== material.roughnessMap) roughnessMap.dispose();

    _renderer.setRenderTarget(oldTarget);

    _renderer.autoClear = autoClear;
  },
  dispose: function dispose() {
    _mipmapMaterial.dispose();

    _mesh.geometry.dispose();

    if (_tempTarget != null) _tempTarget.dispose();
  }
};

function _getMipmapMaterial() {
  var shaderMaterial = new THREE.RawShaderMaterial({
    uniforms: {
      roughnessMap: {
        value: null
      },
      normalMap: {
        value: null
      },
      texelSize: {
        value: new Vector2(1, 1)
      }
    },
    vertexShader: "\t\t\tprecision mediump float;\t\t\tprecision mediump int;\t\t\tattribute vec3 position;\t\t\tattribute vec2 uv;\t\t\tvarying vec2 vUv;\t\t\tvoid main() {\t\t\t\tvUv = uv;\t\t\t\tgl_Position = vec4( position, 1.0 );\t\t\t}\t\t",
    fragmentShader: "\t\t\tprecision mediump float;\t\t\tprecision mediump int;\t\t\tvarying vec2 vUv;\t\t\tuniform sampler2D roughnessMap;\t\t\tuniform sampler2D normalMap;\t\t\tuniform vec2 texelSize;\t\t\t#define ENVMAP_TYPE_CUBE_UV\t\t\tvec4 envMapTexelToLinear( vec4 a ) { return a; }\t\t\t#include <cube_uv_reflection_fragment>\t\t\tfloat roughnessToVariance( float roughness ) {\t\t\t\tfloat variance = 0.0;\t\t\t\tif ( roughness >= r1 ) {\t\t\t\t\tvariance = ( r0 - roughness ) * ( v1 - v0 ) / ( r0 - r1 ) + v0;\t\t\t\t} else if ( roughness >= r4 ) {\t\t\t\t\tvariance = ( r1 - roughness ) * ( v4 - v1 ) / ( r1 - r4 ) + v1;\t\t\t\t} else if ( roughness >= r5 ) {\t\t\t\t\tvariance = ( r4 - roughness ) * ( v5 - v4 ) / ( r4 - r5 ) + v4;\t\t\t\t} else {\t\t\t\t\tfloat roughness2 = roughness * roughness;\t\t\t\t\tvariance = 1.79 * roughness2 * roughness2;\t\t\t\t}\t\t\t\treturn variance;\t\t\t}\t\t\tfloat varianceToRoughness( float variance ) {\t\t\t\tfloat roughness = 0.0;\t\t\t\tif ( variance >= v1 ) {\t\t\t\t\troughness = ( v0 - variance ) * ( r1 - r0 ) / ( v0 - v1 ) + r0;\t\t\t\t} else if ( variance >= v4 ) {\t\t\t\t\troughness = ( v1 - variance ) * ( r4 - r1 ) / ( v1 - v4 ) + r1;\t\t\t\t} else if ( variance >= v5 ) {\t\t\t\t\troughness = ( v4 - variance ) * ( r5 - r4 ) / ( v4 - v5 ) + r4;\t\t\t\t} else {\t\t\t\t\troughness = pow( 0.559 * variance, 0.25 );\t\t\t\t}\t\t\t\treturn roughness;\t\t\t}\t\t\tvoid main() {\t\t\t\tgl_FragColor = texture2D( roughnessMap, vUv, - 1.0 );\t\t\t\tif ( texelSize.x == 0.0 ) return;\t\t\t\tfloat roughness = gl_FragColor.g;\t\t\t\tfloat variance = roughnessToVariance( roughness );\t\t\t\tvec3 avgNormal;\t\t\t\tfor ( float x = - 1.0; x < 2.0; x += 2.0 ) {\t\t\t\t\tfor ( float y = - 1.0; y < 2.0; y += 2.0 ) {\t\t\t\t\t\tvec2 uv = vUv + vec2( x, y ) * 0.25 * texelSize;\t\t\t\t\t\tavgNormal += normalize( texture2D( normalMap, uv, - 1.0 ).xyz - 0.5 );\t\t\t\t\t}\t\t\t\t}\t\t\t\tvariance += 1.0 - 0.25 * length( avgNormal );\t\t\t\tgl_FragColor.g = varianceToRoughness( variance );\t\t\t}\t\t",
    blending: THREE.NoBlending,
    depthTest: false,
    depthWrite: false
  });
  shaderMaterial.type = 'RoughnessMipmapper';
  return shaderMaterial;
}