import { BackSide, LinearFilter, LinearMipmapLinearFilter, NoBlending, RGBAFormat } from '../constants.js';
import { Mesh } from '../objects/Mesh.js';
import { BoxBufferGeometry } from '../geometries/BoxGeometry.js';
import { ShaderMaterial } from '../materials/ShaderMaterial.js';
import { cloneUniforms } from './shaders/UniformsUtils.js';
import { WebGLRenderTarget } from './WebGLRenderTarget.js';
import { CubeCamera } from '../cameras/CubeCamera.js';

class WebGLCubeRenderTarget extends WebGLRenderTarget {

	constructor( size, options, dummy ) {

		if ( Number.isInteger( options ) ) {

			console.warn( 'THREE.WebGLCubeRenderTarget: constructor signature is now WebGLCubeRenderTarget( size, options )' );

			options = dummy;

		}

		super( size, size, options );

		Object.defineProperty( this, 'isWebGLCubeRenderTarget', { value: true } );

		this.texture.isWebGLCubeRenderTargetTexture = true; // HACK Why is texture not a CubeTexture?

	}

	fromEquirectangularTexture( renderer, texture ) {

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

		const geometry = new BoxBufferGeometry( 5, 5, 5 );

		const material = new ShaderMaterial( {

			name: 'CubemapFromEquirect',

			uniforms: cloneUniforms( shader.uniforms ),
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			side: BackSide,
			blending: NoBlending

		} );

		material.uniforms.tEquirect.value = texture;

		const mesh = new Mesh( geometry, material );

		const currentMinFilter = texture.minFilter;
		const currentRenderList = renderer.getRenderList();
		const currentRenderTarget = renderer.getRenderTarget();
		const currentRenderState = renderer.getRenderState();

		// Avoid blurred poles
		if ( texture.minFilter === LinearMipmapLinearFilter ) texture.minFilter = LinearFilter;

		const camera = new CubeCamera( 1, 10, this );
		camera.update( renderer, mesh );

		texture.minFilter = currentMinFilter;

		renderer.setRenderTarget( currentRenderTarget );
		renderer.setRenderList( currentRenderList );
		renderer.setRenderState( currentRenderState );

		return this;

	}

}

export { WebGLCubeRenderTarget };
