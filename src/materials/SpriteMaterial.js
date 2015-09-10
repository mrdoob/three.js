/**
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new Texture( <Image> ),
 *
 *  blending: Constants.NormalBlending,
 *  depthTest: <bool>,
 *  depthWrite: <bool>,
 *
 *	uvOffset: new Vector2(),
 *	uvScale: new Vector2(),
 *
 *  fog: <bool>
 * }
 */

module.exports = SpriteMaterial;

var Color = require( "../math/Color" ),
	Material = require( "../materials/Material" );

function SpriteMaterial( parameters ) {

	Material.call( this );

	this.type = "SpriteMaterial";

	this.color = new Color( 0xffffff );
	this.map = null;

	this.rotation = 0;

	this.fog = false;

	// set parameters

	this.setValues( parameters );

}

SpriteMaterial.prototype = Object.create( Material.prototype );
SpriteMaterial.prototype.constructor = SpriteMaterial;

SpriteMaterial.prototype.copy = function ( source ) {

	Material.prototype.copy.call( this, source );

	this.color.copy( source.color );
	this.map = source.map;

	this.rotation = source.rotation;

	this.fog = source.fog;

	return this;

};
