import { BackSide, NoBlending, RGBAFormat } from '../constants.js';
import { Scene } from '../scenes/Scene.js';
import { Mesh } from '../objects/Mesh.js';
import { BoxBufferGeometry } from '../geometries/BoxGeometry.js';
import { ShaderMaterial } from '../materials/ShaderMaterial.js';
import { cloneUniforms } from './shaders/UniformsUtils.js';
import { WebGLRenderTarget } from './WebGLRenderTarget.js';
import { CubeCamera } from '../cameras/CubeCamera.js';

function WebGLCubeRenderTarget( size, options, dummy ) {

	if ( Number.isInteger( options ) ) {

		console.warn( 'THREE.WebGLCubeRenderTarget: constructor signature is now WebGLCubeRenderTarget( size, options )' );

		options = dummy;

	}

	WebGLRenderTarget.call( this, size, size, options );

}

WebGLCubeRenderTarget.prototype = Object.create( WebGLRenderTarget.prototype );
WebGLCubeRenderTarget.prototype.constructor = WebGLCubeRenderTarget;

WebGLCubeRenderTarget.prototype.isWebGLCubeRenderTarget = true;

WebGLCubeRenderTarget.prototype.fromEquirectangularTexture = function ( renderer, texture ) {

	this.texture.type = texture.type;
	this.texture.format = RGBAFormat; // see #18859
	this.texture.encoding = texture.encoding;

	this.texture.generateMipmaps = texture.generateMipmaps;
	this.texture.minFilter = texture.minFilter;
	this.texture.magFilter = texture.magFilter;

	const scene = new Scene();

	const shader = {

		uniforms: {
			tEquirect: { value: null },
		},

		vertexShader: /* glsl */`

			varying vec3 vWorldDirection;

			vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

				return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

			}

			void main() {

				vWorldDirection = transformDirection( position, modelMatrix );

				#include <begin_vertex>
				#include <project_vertex>

			}
		`,

		fragmentShader: /* glsl */`

			uniform sampler2D tEquirect;

			varying vec3 vWorldDirection;

			#include <common>

			void main() {

				vec3 direction = normalize( vWorldDirection );

				vec2 sampleUV = equirectUv( direction );

				gl_FragColor = texture2D( tEquirect, sampleUV );

			}
		`
	};

	const material = new ShaderMaterial( {

		name: 'CubemapFromEquirect',

		uniforms: cloneUniforms( shader.uniforms ),
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		side: BackSide,
		blending: NoBlending

	} );

	material.uniforms.tEquirect.value = texture;

	const mesh = new Mesh( new BoxBufferGeometry( 5, 5, 5 ), material );

	scene.add( mesh );

	const camera = new CubeCamera( 1, 10, this );
	camera.update( renderer, scene );

	mesh.geometry.dispose();
	mesh.material.dispose();

	return this;

};

export { WebGLCubeRenderTarget };
