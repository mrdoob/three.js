/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = LineSegments;

var Line = require( "./Line" );

function LineSegments( geometry, material ) {

	Line.call( this, geometry, material );

	this.type = "LineSegments";

}

LineSegments.prototype = Object.create( Line.prototype );
LineSegments.prototype.constructor = LineSegments;
