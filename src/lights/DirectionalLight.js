import { Light } from './Light.js';
import { DirectionalLightShadow } from './DirectionalLightShadow.js';
import { Object3D } from '../core/Object3D.js';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

function DirectionalLight( color, intensity ) {

	Light.call( this, color, intensity );

	this.type = 'DirectionalLight';

	this.position.copy( Object3D.DefaultUp );
	this.updateMatrix();

	//If lookAt is called after the target has been set to a different
	//object in the scene, it will be reset to this internal target.
	//This will prevent accidentally making changes to another object's position
	var internalTarget = new Object3D();
	internalTarget.name = this.uuid + '_target';
	Object.defineProperty( this, 'internalTarget', { value: internalTarget } );

	this.target = this.internalTarget;

	this.shadow = new DirectionalLightShadow();

}

DirectionalLight.prototype = Object.assign( Object.create( Light.prototype ), {

	constructor: DirectionalLight,

	isDirectionalLight: true,

	copy: function ( source ) {

		Light.prototype.copy.call( this, source );

		this.target = source.target.clone();

		this.shadow = source.shadow.clone();

		return this;

	},

	lookAt( point ) {

		//reset the target if it has been changed
		if ( this.target.name !== this.uuid + '_target' ) {

			this.target = this.internalTarget;

		}

		if ( point.isVector3 ) {

			this.target.position.copy( point );
			this.target.updateMatrixWorld();

		}	else if ( point.isObject3D ) {

			this.target.position.copy( point.position );
			this.target.updateMatrixWorld();

		}	else {

			console.error( 'DirectionalLight.lookAt: the argument must be a Vector3 or Object3D' );

		}

	}

} );


export { DirectionalLight };
