import { LightShadow } from './LightShadow.js';
import { OrthographicCamera } from '../cameras/OrthographicCamera.js';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function DirectionalLightShadow() {

	LightShadow.call( this, new OrthographicCamera( - 5, 5, 5, - 5, 0.5, 500 ) );

}

DirectionalLightShadow.prototype = Object.assign( Object.create( LightShadow.prototype ), {

	constructor: DirectionalLightShadow,

	isDirectionalLightShadow: true,

	updateMatrices: function ( light, viewCamera, viewportIndex ) {

		var camera = this.camera,
			lightPositionWorld = this._lightPositionWorld,
			lookTarget = this._lookTarget;

		lightPositionWorld.setFromMatrixPosition( light.matrixWorld );
		camera.position.copy( lightPositionWorld );

		lookTarget.setFromMatrixPosition( light.target.matrixWorld );
		camera.lookAt( lookTarget );
		camera.updateMatrixWorld();

		LightShadow.prototype.updateMatrices.call( this, light, viewCamera, viewportIndex );

	}

} );


export { DirectionalLightShadow };
