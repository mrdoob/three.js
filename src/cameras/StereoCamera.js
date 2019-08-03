import { Matrix4 } from '../math/Matrix4.js';
import { _Math } from '../math/Math.js';
import { PerspectiveCamera } from './PerspectiveCamera.js';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function StereoCamera() {

	this.type = 'StereoCamera';

	this.aspect = 1;

	this.eyeSep = 0.064;

	this.cameraL = new PerspectiveCamera();
	this.cameraL.layers.enable( 1 );
	this.cameraL.matrixAutoUpdate = false;

	this.cameraR = new PerspectiveCamera();
	this.cameraR.layers.enable( 2 );
	this.cameraR.matrixAutoUpdate = false;

}

Object.assign( StereoCamera.prototype, {

	update: ( function () {

		var instance, focus, fov, aspect, near, far, zoom, eyeSep;

		var eyeRight = new Matrix4();
		var eyeLeft = new Matrix4();

		return function update( camera ) {

			var needsUpdate = instance !== this || focus !== camera.focus || fov !== camera.fov ||
												aspect !== camera.aspect * this.aspect || near !== camera.near ||
												far !== camera.far || zoom !== camera.zoom || eyeSep !== this.eyeSep;

			if ( needsUpdate ) {

				instance = this;
				focus = camera.focus;
				fov = camera.fov;
				aspect = camera.aspect * this.aspect;
				near = camera.near;
				far = camera.far;
				zoom = camera.zoom;
				eyeSep = this.eyeSep;

				// Off-axis stereoscopic effect based on
				// http://paulbourke.net/stereographics/stereorender/

				var projectionMatrix = camera.projectionMatrix.clone();
				var eyeSepHalf = eyeSep / 2;
				var eyeSepOnProjection = eyeSepHalf * near / focus;
				var ymax = ( near * Math.tan( _Math.DEG2RAD * fov * 0.5 ) ) / zoom;
				var xmin, xmax;

				// translate xOffset

				eyeLeft.elements[ 12 ] = - eyeSepHalf;
				eyeRight.elements[ 12 ] = eyeSepHalf;

				// for left eye

				xmin = - ymax * aspect + eyeSepOnProjection;
				xmax = ymax * aspect + eyeSepOnProjection;

				projectionMatrix.elements[ 0 ] = 2 * near / ( xmax - xmin );
				projectionMatrix.elements[ 8 ] = ( xmax + xmin ) / ( xmax - xmin );

				this.cameraL.projectionMatrix.copy( projectionMatrix );

				// for right eye

				xmin = - ymax * aspect - eyeSepOnProjection;
				xmax = ymax * aspect - eyeSepOnProjection;

				projectionMatrix.elements[ 0 ] = 2 * near / ( xmax - xmin );
				projectionMatrix.elements[ 8 ] = ( xmax + xmin ) / ( xmax - xmin );

				this.cameraR.projectionMatrix.copy( projectionMatrix );

			}

			this.cameraL.matrixWorld.copy( camera.matrixWorld ).multiply( eyeLeft );
			this.cameraR.matrixWorld.copy( camera.matrixWorld ).multiply( eyeRight );

		};

	} )()

} );


export { StereoCamera };
