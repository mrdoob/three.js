import { Matrix4 } from '../math/Matrix4';
import { _Math } from '../math/Math';
import { PerspectiveCamera } from './PerspectiveCamera';

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

    this.camFocus = null;
    this.camFov = null;
    this.camAspect = null;
    this.camNear = null;
    this.camFar = null;

}

Object.assign( StereoCamera.prototype, {

	update: ( function () {

		var eyeRight = new Matrix4();
		var eyeLeft = new Matrix4();

		return function update( camera ) {

			var needsUpdate = this.camFocus !== camera.fPocus || this.camFov !== camera.fov ||
												this.camAspect !== camera.aspect * this.aspect || this.camNear !== camera.near ||
												this.camFar !== camera.far;

			if ( needsUpdate ) {

				this.camFocus = camera.focus;
				this.camFov = camera.fov;
				this.camAspect = camera.aspect * this.aspect;
				this.camNear = camera.near;
				this.camFar = camera.far;

				// Off-axis stereoscopic effect based on
				// http://paulbourke.net/stereographics/stereorender/

				var projectionMatrix = camera.projectionMatrix.clone();
				var eyeSep = this.eyeSep / 2;
				var eyeSepOnProjection = eyeSep * this.camNear / this.camFocus;
				var ymax = this.camNear * Math.tan( _Math.DEG2RAD * this.camFov * 0.5 );
				var xmin, xmax;

				// translate xOffset

				eyeLeft.elements[ 12 ] = - eyeSep;
				eyeRight.elements[ 12 ] = eyeSep;

				// for left eye

				xmin = - ymax * this.camAspect + eyeSepOnProjection;
				xmax = ymax * this.camAspect + eyeSepOnProjection;

				projectionMatrix.elements[ 0 ] = 2 * this.camNear / ( xmax - xmin );
				projectionMatrix.elements[ 8 ] = ( xmax + xmin ) / ( xmax - xmin );

				this.cameraL.projectionMatrix.copy( projectionMatrix );

				// for right eye

				xmin = - ymax * this.camAspect - eyeSepOnProjection;
				xmax = ymax * this.camAspect - eyeSepOnProjection;

				projectionMatrix.elements[ 0 ] = 2 * this.camNear / ( xmax - xmin );
				projectionMatrix.elements[ 8 ] = ( xmax + xmin ) / ( xmax - xmin );

				this.cameraR.projectionMatrix.copy( projectionMatrix );

			}

			this.cameraL.matrixWorld.copy( camera.matrixWorld ).multiply( eyeLeft );
			this.cameraR.matrixWorld.copy( camera.matrixWorld ).multiply( eyeRight );

		};

	} )()

} );


export { StereoCamera };
