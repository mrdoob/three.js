/**
 * A helper to show the world-axis-aligned bounding box for an object.
 *
 * @author WestLangley / http://github.com/WestLangley
 */

module.exports = BoundingBoxHelper;

var BoxGeometry = require( "../geometries/BoxGeometry" ),
	MeshBasicMaterial = require( "../../materials/MeshBasicMaterial"),
	Box3 = require( "../../math/Box3" ),
	Mesh = require( "../../objects/Mesh" );

function BoundingBoxHelper( object, hex ) {

	var color = ( hex !== undefined ) ? hex : 0x888888;

	this.object = object;

	this.box = new Box3();

	Mesh.call( this, new BoxGeometry( 1, 1, 1 ), new MeshBasicMaterial( { color: color, wireframe: true } ) );

}

BoundingBoxHelper.prototype = Object.create( Mesh.prototype );
BoundingBoxHelper.prototype.constructor = BoundingBoxHelper;

BoundingBoxHelper.prototype.update = function () {

	this.box.setFromObject( this.object );

	this.box.size( this.scale );

	this.box.center( this.position );

};
