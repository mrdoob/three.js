/**
 * @author WestLangley / http://github.com/WestLangley
 * @param object Mesh whose geometry will be used
 * @param hex line color
 * @param thresholdAngle the minimum angle (in degrees),
 * between the face normals of adjacent faces,
 * that is required to render an edge. A value of 10 means
 * an edge is only rendered if the angle is at least 10 degrees.
 */

module.exports = EdgesHelper;

var EdgesGeometry = require( "../geometries/EdgesGeometry" ),
	LineBasicMaterial = require( "../../materials/LineBasicMaterial" ),
	LineSegments = require( "../../objects/LineSegments" );

function EdgesHelper( object, hex, thresholdAngle ) {

	var color = ( hex !== undefined ) ? hex : 0xffffff;

	LineSegments.call( this, new EdgesGeometry( object.geometry, thresholdAngle ), new LineBasicMaterial( { color: color } ) );

	this.matrix = object.matrixWorld;
	this.matrixAutoUpdate = false;

}

EdgesHelper.prototype = Object.create( LineSegments.prototype );
EdgesHelper.prototype.constructor = EdgesHelper;
