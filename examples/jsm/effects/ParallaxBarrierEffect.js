import {
	LinearFilter,
	NearestFilter,
	RGBAFormat,
	ShaderMaterial,
	StereoCamera,
	WebGLRenderTarget
} from 'three';
import { FullScreenQuad } from '../postprocessing/Pass.js';

/**
 * A class that creates an parallax barrier effect.
 *
 * Note that this class can only be used with {@link WebGLRenderer}.
 * When using {@link WebGPURenderer}, use {@link ParallaxBarrierPassNode}.
 */
class ParallaxBarrierEffect {

	/**
	 * Constructs a new parallax barrier effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 */
	constructor( renderer ) {

		const _stereo = new StereoCamera();

		const _params = { minFilter: LinearFilter, magFilter: NearestFilter, format: RGBAFormat };

		const _renderTargetL = new WebGLRenderTarget( 512, 512, _params );
		const _renderTargetR = new WebGLRenderTarget( 512, 512, _params );

		const _material = new ShaderMaterial( {

			uniforms: {

				'mapLeft': { value: _renderTargetL.texture },
				'mapRight': { value: _renderTargetR.texture }

			},

			vertexShader: [

				'varying vec2 vUv;',

				'void main() {',

				'	vUv = vec2( uv.x, uv.y );',
				'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

				'}'

			].join( '\n' ),

			fragmentShader: [

				'uniform sampler2D mapLeft;',
				'uniform sampler2D mapRight;',
				'varying vec2 vUv;',

				'void main() {',

				'	vec2 uv = vUv;',

				'	if ( ( mod( gl_FragCoord.y, 2.0 ) ) > 1.00 ) {',

				'		gl_FragColor = texture2D( mapLeft, uv );',

				'	} else {',

				'		gl_FragColor = texture2D( mapRight, uv );',

				'	}',

				'	#include <tonemapping_fragment>',
				'	#include <colorspace_fragment>',

				'}'

			].join( '\n' )

		} );

		const _quad = new FullScreenQuad( _material );

		/**
		 * Resizes the effect.
		 *
		 * @param {number} width - The width of the effect in logical pixels.
		 * @param {number} height - The height of the effect in logical pixels.
		 */
		this.setSize = function ( width, height ) {

			renderer.setSize( width, height );

			const pixelRatio = renderer.getPixelRatio();

			_renderTargetL.setSize( width * pixelRatio, height * pixelRatio );
			_renderTargetR.setSize( width * pixelRatio, height * pixelRatio );

		};

		/**
		 * When using this effect, this method should be called instead of the
		 * default {@link WebGLRenderer#render}.
		 *
		 * @param {Object3D} scene - The scene to render.
		 * @param {Camera} camera - The camera.
		 */
		this.render = function ( scene, camera ) {

			const currentRenderTarget = renderer.getRenderTarget();

			if ( scene.matrixWorldAutoUpdate === true ) scene.updateMatrixWorld();

			if ( camera.parent === null && camera.matrixWorldAutoUpdate === true ) camera.updateMatrixWorld();

			_stereo.update( camera );

			renderer.setRenderTarget( _renderTargetL );
			renderer.clear();
			renderer.render( scene, _stereo.cameraL );

			renderer.setRenderTarget( _renderTargetR );
			renderer.clear();
			renderer.render( scene, _stereo.cameraR );

			renderer.setRenderTarget( null );
			_quad.render( renderer );

			renderer.setRenderTarget( currentRenderTarget );

		};

		/**
		 * Frees internal resources. This method should be called
		 * when the effect is no longer required.
		 */
		this.dispose = function () {

			_renderTargetL.dispose();
			_renderTargetR.dispose();

			_material.dispose();
			_quad.dispose();

		};

	}

}

export { ParallaxBarrierEffect };
