import {
	StereoCamera,
	Vector2
} from 'three';

/**
 * A class that creates an stereo effect.
 *
 * Note that this class can only be used with {@link WebGLRenderer}.
 * When using {@link WebGPURenderer}, use {@link StereoPassNode}.
 *
 * @three_import import { StereoEffect } from 'three/addons/effects/StereoEffect.js';
 */
class StereoEffect {

	/**
	 * Constructs a new stereo effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 */
	constructor( renderer ) {

		const _stereo = new StereoCamera();
		_stereo.aspect = 0.5;
		const size = new Vector2();

		/**
		 * Sets the given eye separation.
		 *
		 * @param {number} eyeSep - The eye separation to set.
		 */
		this.setEyeSeparation = function ( eyeSep ) {

			_stereo.eyeSep = eyeSep;

		};

		/**
		 * Resizes the effect.
		 *
		 * @param {number} width - The width of the effect in logical pixels.
		 * @param {number} height - The height of the effect in logical pixels.
		 */
		this.setSize = function ( width, height ) {

			renderer.setSize( width, height );

		};

		/**
		 * When using this effect, this method should be called instead of the
		 * default {@link WebGLRenderer#render}.
		 *
		 * @param {Object3D} scene - The scene to render.
		 * @param {Camera} camera - The camera.
		 */
		this.render = function ( scene, camera ) {

			if ( scene.matrixWorldAutoUpdate === true ) scene.updateMatrixWorld();

			if ( camera.parent === null && camera.matrixWorldAutoUpdate === true ) camera.updateMatrixWorld();

			_stereo.update( camera );

			const currentAutoClear = renderer.autoClear;
			renderer.getSize( size );

			renderer.autoClear = false;
			renderer.clear();

			renderer.setScissorTest( true );

			renderer.setScissor( 0, 0, size.width / 2, size.height );
			renderer.setViewport( 0, 0, size.width / 2, size.height );
			renderer.render( scene, _stereo.cameraL );

			renderer.setScissor( size.width / 2, 0, size.width / 2, size.height );
			renderer.setViewport( size.width / 2, 0, size.width / 2, size.height );
			renderer.render( scene, _stereo.cameraR );

			renderer.setScissorTest( false );

			renderer.autoClear = currentAutoClear;

		};

	}

}

export { StereoEffect };
