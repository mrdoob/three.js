/**
 * This class generates custom mipmaps for a roughness map by encoding the lost variation in the
 * normal map mip levels as increased roughness in the corresponding roughness mip levels. This
 * helps with rendering accuracy for MeshStandardMaterial, and also helps with anti-aliasing when
 * using PMREM. If the normal map is larger than the roughness map, the roughness map will be
 * enlarged to match the dimensions of the normal map.
 */

import {
	MathUtils,
	Mesh,
	NoBlending,
	OrthographicCamera,
	PlaneGeometry,
	RawShaderMaterial,
	Vector2,
	WebGLRenderTarget
} from '../../../build/three.module.js';

var _mipmapMaterial = _getMipmapMaterial();

var _mesh = new Mesh( new PlaneGeometry( 2, 2 ), _mipmapMaterial );

var _flatCamera = new OrthographicCamera( 0, 1, 0, 1, 0, 1 );

var _tempTarget = null;

var _renderer = null;

function RoughnessMipmapper( renderer ) {

	_renderer = renderer;

	_renderer.compile( _mesh, _flatCamera );

}

RoughnessMipmapper.prototype = {

	constructor: RoughnessMipmapper,

	generateMipmaps: function ( material ) {

		if ( 'roughnessMap' in material === false ) return;

		var { roughnessMap, normalMap } = material;

		if ( roughnessMap === null || normalMap === null || ! roughnessMap.generateMipmaps || material.userData.roughnessUpdated ) return;

		material.userData.roughnessUpdated = true;

		var width = Math.max( roughnessMap.image.width, normalMap.image.width );

		var height = Math.max( roughnessMap.image.height, normalMap.image.height );

		if ( ! MathUtils.isPowerOfTwo( width ) || ! MathUtils.isPowerOfTwo( height ) ) return;

		var oldTarget = _renderer.getRenderTarget();

		var autoClear = _renderer.autoClear;

		_renderer.autoClear = false;

		if ( _tempTarget === null || _tempTarget.width !== width || _tempTarget.height !== height ) {

			if ( _tempTarget !== null ) _tempTarget.dispose();

			_tempTarget = new WebGLRenderTarget( width, height, { depthBuffer: false } );

			_tempTarget.scissorTest = true;

		}

		if ( width !== roughnessMap.image.width || height !== roughnessMap.image.height ) {

			var params = {
				wrapS: roughnessMap.wrapS,
				wrapT: roughnessMap.wrapT,
				magFilter: roughnessMap.magFilter,
				minFilter: roughnessMap.minFilter,
				depthBuffer: false
			};

			var newRoughnessTarget = new WebGLRenderTarget( width, height, params );

			newRoughnessTarget.texture.generateMipmaps = true;

			// Setting the render target causes the memory to be allocated.

			_renderer.setRenderTarget( newRoughnessTarget );

			material.roughnessMap = newRoughnessTarget.texture;

			if ( material.metalnessMap == roughnessMap ) material.metalnessMap = material.roughnessMap;

			if ( material.aoMap == roughnessMap ) material.aoMap = material.roughnessMap;

		}

		_mipmapMaterial.uniforms.roughnessMap.value = roughnessMap;

		_mipmapMaterial.uniforms.normalMap.value = normalMap;

		var position = new Vector2( 0, 0 );

		var texelSize = _mipmapMaterial.uniforms.texelSize.value;

		for ( var mip = 0; width >= 1 && height >= 1; ++ mip, width /= 2, height /= 2 ) {

			// Rendering to a mip level is not allowed in webGL1. Instead we must set
			// up a secondary texture to write the result to, then copy it back to the
			// proper mipmap level.

			texelSize.set( 1.0 / width, 1.0 / height );

			if ( mip == 0 ) texelSize.set( 0.0, 0.0 );

			_tempTarget.viewport.set( position.x, position.y, width, height );

			_tempTarget.scissor.set( position.x, position.y, width, height );

			_renderer.setRenderTarget( _tempTarget );

			_renderer.render( _mesh, _flatCamera );

			_renderer.copyFramebufferToTexture( position, material.roughnessMap, mip );

			_mipmapMaterial.uniforms.roughnessMap.value = material.roughnessMap;

		}

		if ( roughnessMap !== material.roughnessMap ) roughnessMap.dispose();

		_renderer.setRenderTarget( oldTarget );

		_renderer.autoClear = autoClear;

	},

	dispose: function () {

		_mipmapMaterial.dispose();

		_mesh.geometry.dispose();

		if ( _tempTarget != null ) _tempTarget.dispose();

	}

};

function _getMipmapMaterial() {

	var shaderMaterial = new RawShaderMaterial( {

		uniforms: {
			roughnessMap: { value: null },
			normalMap: { value: null },
			texelSize: { value: new Vector2( 1, 1 ) }
		},

		vertexShader: /* glsl */`
			precision mediump float;
			precision mediump int;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {

				vUv = uv;

				gl_Position = vec4( position, 1.0 );

			}
		`,

		fragmentShader: /* glsl */`
			precision mediump float;
			precision mediump int;

			varying vec2 vUv;

			uniform sampler2D roughnessMap;
			uniform sampler2D normalMap;
			uniform vec2 texelSize;

			#define ENVMAP_TYPE_CUBE_UV

			vec4 envMapTexelToLinear( vec4 a ) { return a; }

			#include <cube_uv_reflection_fragment>

			float roughnessToVariance( float roughness ) {

				float variance = 0.0;

				if ( roughness >= r1 ) {

					variance = ( r0 - roughness ) * ( v1 - v0 ) / ( r0 - r1 ) + v0;

				} else if ( roughness >= r4 ) {

					variance = ( r1 - roughness ) * ( v4 - v1 ) / ( r1 - r4 ) + v1;

				} else if ( roughness >= r5 ) {

					variance = ( r4 - roughness ) * ( v5 - v4 ) / ( r4 - r5 ) + v4;

				} else {

					float roughness2 = roughness * roughness;

					variance = 1.79 * roughness2 * roughness2;

				}

				return variance;

			}

			float varianceToRoughness( float variance ) {

				float roughness = 0.0;

				if ( variance >= v1 ) {

					roughness = ( v0 - variance ) * ( r1 - r0 ) / ( v0 - v1 ) + r0;

				} else if ( variance >= v4 ) {

					roughness = ( v1 - variance ) * ( r4 - r1 ) / ( v1 - v4 ) + r1;

				} else if ( variance >= v5 ) {

					roughness = ( v4 - variance ) * ( r5 - r4 ) / ( v4 - v5 ) + r4;

				} else {

					roughness = pow( 0.559 * variance, 0.25 ); // 0.559 = 1.0 / 1.79

				}

				return roughness;

			}

			void main() {

				gl_FragColor = texture2D( roughnessMap, vUv, - 1.0 );

				if ( texelSize.x == 0.0 ) return;

				float roughness = gl_FragColor.g;

				float variance = roughnessToVariance( roughness );

				vec3 avgNormal;

				for ( float x = - 1.0; x < 2.0; x += 2.0 ) {

					for ( float y = - 1.0; y < 2.0; y += 2.0 ) {

						vec2 uv = vUv + vec2( x, y ) * 0.25 * texelSize;

						avgNormal += normalize( texture2D( normalMap, uv, - 1.0 ).xyz - 0.5 );

					}

				}

				variance += 1.0 - 0.25 * length( avgNormal );

				gl_FragColor.g = varianceToRoughness( variance );

			}
		`,

		blending: NoBlending,
		depthTest: false,
		depthWrite: false

	} );

	shaderMaterial.type = 'RoughnessMipmapper';

	return shaderMaterial;

}

export { RoughnessMipmapper };
