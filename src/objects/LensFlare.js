/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

module.exports = LensFlare;

var Constants = require( "../Constants" ),
	Object3D = require( "../core/Object3D" ),
	Color = require( "../math/Color" ),
	Vector3 = require( "../math/Vector3" );

function LensFlare( texture, size, distance, blending, color ) {

	Object3D.call( this );

	this.lensFlares = [];

	this.positionScreen = new Vector3();
	this.customUpdateCallback = undefined;

	if ( texture !== undefined ) {

		this.add( texture, size, distance, blending, color );

	}

}

LensFlare.prototype = Object.create( Object3D.prototype );
LensFlare.prototype.constructor = LensFlare;

/*
 * Add: adds another flare
 */

LensFlare.prototype.add = function ( texture, size, distance, blending, color, opacity ) {

	if ( size === undefined ) { size = - 1; }
	if ( distance === undefined ) { distance = 0; }
	if ( opacity === undefined ) { opacity = 1; }
	if ( color === undefined ) { color = new Color( 0xffffff ); }
	if ( blending === undefined ) { blending = Constants.NormalBlending; }

	distance = Math.min( distance, Math.max( 0, distance ) );

	this.lensFlares.push( {
		texture: texture, // Texture instance
		size: size, // size in pixels (-1 = use texture.width)
		distance: distance, // distance (0-1) from light source (0=at light source)
		x: 0, y: 0, z: 0, // screen position (-1 => 1) z = 0 is in front z = 1 is back
		scale: 1,
		rotation: 0,
		opacity: opacity,
		color: color,
		blending: blending
	} );

};

/*
 * Update lens flares update positions on all flares based on the screen position
 * Set myLensFlare.customUpdateCallback to alter the flares in your project specific way.
 */

LensFlare.prototype.updateLensFlares = function () {

	var f, fl = this.lensFlares.length;
	var flare;
	var vecX = - this.positionScreen.x * 2;
	var vecY = - this.positionScreen.y * 2;

	for ( f = 0; f < fl; f ++ ) {

		flare = this.lensFlares[ f ];

		flare.x = this.positionScreen.x + vecX * flare.distance;
		flare.y = this.positionScreen.y + vecY * flare.distance;

		flare.wantedRotation = flare.x * Math.PI * 0.25;
		flare.rotation += ( flare.wantedRotation - flare.rotation ) * 0.25;

	}

};

LensFlare.prototype.copy = function ( source ) {

	Object3D.prototype.copy.call( this, source );

	this.positionScreen.copy( source.positionScreen );
	this.customUpdateCallback = source.customUpdateCallback;

	for ( var i = 0, l = source.lensFlares.length; i < l; i ++ ) {

		this.lensFlares.push( source.lensFlares[ i ] );

	}

	return this;

};
