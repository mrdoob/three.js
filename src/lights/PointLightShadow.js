import { LightShadow } from './LightShadow.js';
import { PerspectiveCamera } from '../cameras/PerspectiveCamera.js';
import { Vector2 } from '../math/Vector2.js';
import { Vector3 } from '../math/Vector3.js';
import { Vector4 } from '../math/Vector4.js';

function PointLightShadow() {

	LightShadow.call( this, new PerspectiveCamera( 90, 1, 0.5, 500 ) );

	this._frameExtents = new Vector2( 4, 2 );

	this._viewportCount = 6;

	this._viewports = [
		// These viewports map a cube-map onto a 2D texture with the
		// following orientation:
		//
		//  xzXZ
		//   y Y
		//
		// X - Positive x direction
		// x - Negative x direction
		// Y - Positive y direction
		// y - Negative y direction
		// Z - Positive z direction
		// z - Negative z direction

		// positive X
		new Vector4( 2, 1, 1, 1 ),
		// negative X
		new Vector4( 0, 1, 1, 1 ),
		// positive Z
		new Vector4( 3, 1, 1, 1 ),
		// negative Z
		new Vector4( 1, 1, 1, 1 ),
		// positive Y
		new Vector4( 3, 0, 1, 1 ),
		// negative Y
		new Vector4( 1, 0, 1, 1 )
	];

	this._cubeDirections = [
		new Vector3( 1, 0, 0 ), new Vector3( - 1, 0, 0 ), new Vector3( 0, 0, 1 ),
		new Vector3( 0, 0, - 1 ), new Vector3( 0, 1, 0 ), new Vector3( 0, - 1, 0 )
	];

	this._cubeUps = [
		new Vector3( 0, 1, 0 ), new Vector3( 0, 1, 0 ), new Vector3( 0, 1, 0 ),
		new Vector3( 0, 1, 0 ), new Vector3( 0, 0, 1 ),	new Vector3( 0, 0, - 1 )
	];

}

PointLightShadow.prototype = Object.assign( Object.create( LightShadow.prototype ), {

	constructor: PointLightShadow,

	isPointLightShadow: true,

	updateMatrices: function ( light, viewportIndex ) {

		if ( viewportIndex === undefined ) viewportIndex = 0;

		const camera = this.camera,
			shadowMatrix = this.matrix,
			lightPositionWorld = this._lightPositionWorld,
			lookTarget = this._lookTarget,
			projScreenMatrix = this._projScreenMatrix;

		lightPositionWorld.setFromMatrixPosition( light.matrixWorld );
		camera.position.copy( lightPositionWorld );

		lookTarget.copy( camera.position );
		lookTarget.add( this._cubeDirections[ viewportIndex ] );
		camera.up.copy( this._cubeUps[ viewportIndex ] );
		camera.lookAt( lookTarget );
		camera.updateMatrixWorld();

		shadowMatrix.makeTranslation( - lightPositionWorld.x, - lightPositionWorld.y, - lightPositionWorld.z );

		projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
		this._frustum.setFromProjectionMatrix( projScreenMatrix );

	}

} );


export { PointLightShadow };
