/**
 * @author WestLangley / http://github.com/WestLangley
 * @author zz85 / http://github.com/zz85
 * @author bhouston / http://exocortex.com
 *
 * Creates an arrow for visualizing directions
 *
 * Parameters:
 *  dir - Vector3
 *  origin - Vector3
 *  length - Number
 *  color - color in hex value
 *  headLength - Number
 *  headWidth - Number
 */

var CylinderGeometry = require( "../geometries/CylinderGeometry" ),
	Geometry = require( "../../core/Geometry" ),
	Object3D = require( "../../core/Object3D" ),
	Vector3 = require( "../../math/Vector3" ),
	LineBasicMaterial = require( "../../materials/LineBasicMaterial" ),
	MeshBasicMaterial = require( "../../materials/MeshBasicMaterial" ),
	Line = require( "../../objects/Line" ),
	Mesh = require( "../../objects/Mesh" );

module.exports = ( function () {

	var lineGeometry = new Geometry();
	lineGeometry.vertices.push( new Vector3( 0, 0, 0 ), new Vector3( 0, 1, 0 ) );

	var coneGeometry = new CylinderGeometry( 0, 0.5, 1, 5, 1 );
	coneGeometry.translate( 0, - 0.5, 0 );

	return function ( dir, origin, length, color, headLength, headWidth ) {

		// dir is assumed to be normalized

		Object3D.call( this );

		if ( color === undefined ) { color = 0xffff00; }
		if ( length === undefined ) { length = 1; }
		if ( headLength === undefined ) { headLength = 0.2 * length; }
		if ( headWidth === undefined ) { headWidth = 0.2 * headLength; }

		this.position.copy( origin );
		
		if ( headLength < length ) {
			this.line = new Line( lineGeometry, new LineBasicMaterial( { color: color } ) );
			this.line.matrixAutoUpdate = false;
			this.add( this.line );
		}

		this.cone = new Mesh( coneGeometry, new MeshBasicMaterial( { color: color } ) );
		this.cone.matrixAutoUpdate = false;
		this.add( this.cone );

		this.setDirection( dir );
		this.setLength( length, headLength, headWidth );

	};

}() );

module.exports.prototype = Object.create( Object3D.prototype );
module.exports.prototype.constructor = module.exports;

module.exports.prototype.setDirection = ( function () {

	var axis = new Vector3();
	var radians;

	return function ( dir ) {

		// dir is assumed to be normalized

		if ( dir.y > 0.99999 ) {

			this.quaternion.set( 0, 0, 0, 1 );

		} else if ( dir.y < - 0.99999 ) {

			this.quaternion.set( 1, 0, 0, 0 );

		} else {

			axis.set( dir.z, 0, - dir.x ).normalize();

			radians = Math.acos( dir.y );

			this.quaternion.setFromAxisAngle( axis, radians );

		}

	};

}() );

module.exports.prototype.setLength = function ( length, headLength, headWidth ) {

	if ( headLength === undefined ) { headLength = 0.2 * length; }
	if ( headWidth === undefined ) { headWidth = 0.2 * headLength; }

	if ( headLength < length ){
		this.line.scale.set( 1, length - headLength, 1 );
		this.line.updateMatrix();
	}

	this.cone.scale.set( headWidth, headLength, headWidth );
	this.cone.position.y = length;
	this.cone.updateMatrix();

};

module.exports.prototype.setColor = function ( color ) {

	if ( this.line !== undefined ) { this.line.material.color.set( color ); }
	this.cone.material.color.set( color );

};
