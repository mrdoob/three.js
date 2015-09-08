/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

module.exports = Light;

var Color = require( "../math/Color" ),
	Object3D = require( "../core/Object3D" );

function Light( color ) {

	Object3D.call( this );

	this.type = "Light";

	this.color = new Color( color );

}

Light.prototype = Object.create( Object3D.prototype );
Light.prototype.constructor = Light;

Light.prototype.copy = function ( source ) {

	Object3D.prototype.copy.call( this, source );

	this.color.copy( source.color );

	return this;

};
