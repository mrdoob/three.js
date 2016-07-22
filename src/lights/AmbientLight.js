import { Light } from './Light';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function AmbientLight ( color, intensity ) {
	this.isAmbientLight = true;

	Light.call( this, color, intensity );

	this.type = 'AmbientLight';

	this.castShadow = undefined;

};

AmbientLight.prototype = Object.assign( Object.create( Light.prototype ), {

	constructor: AmbientLight

} );


export { AmbientLight };