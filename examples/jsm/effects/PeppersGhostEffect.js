import {
	PerspectiveCamera,
	Quaternion,
	Vector3
} from 'three';

/**
 * A class that implements a peppers ghost effect.
 *
 * Reference: [Reflective Prism]{@link http://www.instructables.com/id/Reflective-Prism/?ALLSTEPS}
 */
class PeppersGhostEffect {

	/**
	 * Constructs a new peppers ghost effect.
	 *
	 * @param {(WebGPURenderer|WebGLRenderer)} renderer - The renderer.
	 */
	constructor( renderer ) {

		const scope = this;

		scope.cameraDistance = 15;
		scope.reflectFromAbove = false;

		// Internals
		let _halfWidth, _width, _height;

		const _cameraF = new PerspectiveCamera(); //front
		const _cameraB = new PerspectiveCamera(); //back
		const _cameraL = new PerspectiveCamera(); //left
		const _cameraR = new PerspectiveCamera(); //right

		const _position = new Vector3();
		const _quaternion = new Quaternion();
		const _scale = new Vector3();

		// Initialization
		renderer.autoClear = false;

		/**
		 * Resizes the effect.
		 *
		 * @param {number} width - The width of the effect in logical pixels.
		 * @param {number} height - The height of the effect in logical pixels.
		 */
		this.setSize = function ( width, height ) {

			_halfWidth = width / 2;
			if ( width < height ) {

				_width = width / 3;
				_height = width / 3;

			} else {

				_width = height / 3;
				_height = height / 3;

			}

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

			camera.matrixWorld.decompose( _position, _quaternion, _scale );

			// front
			_cameraF.position.copy( _position );
			_cameraF.quaternion.copy( _quaternion );
			_cameraF.translateZ( scope.cameraDistance );
			_cameraF.lookAt( scene.position );

			// back
			_cameraB.position.copy( _position );
			_cameraB.quaternion.copy( _quaternion );
			_cameraB.translateZ( - ( scope.cameraDistance ) );
			_cameraB.lookAt( scene.position );
			_cameraB.rotation.z += 180 * ( Math.PI / 180 );

			// left
			_cameraL.position.copy( _position );
			_cameraL.quaternion.copy( _quaternion );
			_cameraL.translateX( - ( scope.cameraDistance ) );
			_cameraL.lookAt( scene.position );
			_cameraL.rotation.x += 90 * ( Math.PI / 180 );

			// right
			_cameraR.position.copy( _position );
			_cameraR.quaternion.copy( _quaternion );
			_cameraR.translateX( scope.cameraDistance );
			_cameraR.lookAt( scene.position );
			_cameraR.rotation.x += 90 * ( Math.PI / 180 );


			renderer.clear();
			renderer.setScissorTest( true );

			renderer.setScissor( _halfWidth - ( _width / 2 ), ( _height * 2 ), _width, _height );
			renderer.setViewport( _halfWidth - ( _width / 2 ), ( _height * 2 ), _width, _height );

			if ( scope.reflectFromAbove ) {

				renderer.render( scene, _cameraB );

			} else {

				renderer.render( scene, _cameraF );

			}

			renderer.setScissor( _halfWidth - ( _width / 2 ), 0, _width, _height );
			renderer.setViewport( _halfWidth - ( _width / 2 ), 0, _width, _height );

			if ( scope.reflectFromAbove ) {

				renderer.render( scene, _cameraF );

			} else {

				renderer.render( scene, _cameraB );

			}

			renderer.setScissor( _halfWidth - ( _width / 2 ) - _width, _height, _width, _height );
			renderer.setViewport( _halfWidth - ( _width / 2 ) - _width, _height, _width, _height );

			if ( scope.reflectFromAbove ) {

				renderer.render( scene, _cameraR );

			} else {

				renderer.render( scene, _cameraL );

			}

			renderer.setScissor( _halfWidth + ( _width / 2 ), _height, _width, _height );
			renderer.setViewport( _halfWidth + ( _width / 2 ), _height, _width, _height );

			if ( scope.reflectFromAbove ) {

				renderer.render( scene, _cameraL );

			} else {

				renderer.render( scene, _cameraR );

			}

			renderer.setScissorTest( false );

		};

	}

}

export { PeppersGhostEffect };
