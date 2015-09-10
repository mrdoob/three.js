/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = WireframeHelper;

var WireframeGeometry = require( "../geometries/WireframeGeometry" ),
	LineSegments = require( "../../objects/LineSegments" ),
	LineBasicMaterial = require( "../../materials/LineBasicMaterial" );

function WireframeHelper( object, hex ) {

	var color = ( hex !== undefined ) ? hex : 0xffffff;

	LineSegments.call( this, new WireframeGeometry( object.geometry ), new LineBasicMaterial( { color: color } ) );

	this.matrix = object.matrixWorld;
	this.matrixAutoUpdate = false;

}

WireframeHelper.prototype = Object.create( LineSegments.prototype );
WireframeHelper.prototype.constructor = WireframeHelper;
