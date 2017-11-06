import { Light } from './Light.js';
import { Color } from '../math/Color.js';
import { Object3D } from '../core/Object3D.js';

/**
 * @author alteredq / http://alteredqualia.com/
 */

function HemisphereLight( skyColor, groundColor, intensity ) {

	Light.call( this, skyColor, intensity );

	this.type = 'HemisphereLight';

	this.castShadow = undefined;

	this.position.copy( Object3D.DefaultUp );
	this.updateMatrix();

	this.groundColor = new Color( groundColor );

}

HemisphereLight.prototype = Object.assign( Object.create( Light.prototype ), {

	constructor: HemisphereLight,

	isHemisphereLight: true,

	copy: function ( source ) {

		Light.prototype.copy.call( this, source );

		this.groundColor.copy( source.groundColor );

		return this;

	}

} );


export { HemisphereLight };
