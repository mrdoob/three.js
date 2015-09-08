/**
 * @author timothypratley / https://github.com/timothypratley
 */

module.exports = TetrahedronGeometry;

var PolyhedronGeometry = require( "./PolyhedronGeometry" );

function TetrahedronGeometry( radius, detail ) {

	var vertices = [
		 1,  1,  1,   - 1, - 1,  1,   - 1,  1, - 1,    1, - 1, - 1
	];

	var indices = [
		 2,  1,  0,    0,  3,  2,    1,  3,  0,    2,  3,  1
	];

	PolyhedronGeometry.call( this, vertices, indices, radius, detail );

	this.type = "TetrahedronGeometry";

	this.parameters = {
		radius: radius,
		detail: detail
	};

}

TetrahedronGeometry.prototype = Object.create( PolyhedronGeometry.prototype );
TetrahedronGeometry.prototype.constructor = TetrahedronGeometry;

TetrahedronGeometry.prototype.clone = function () {

	var geometry = new TetrahedronGeometry(
		this.parameters.radius,
		this.parameters.detail
	);

	geometry.copy( this );

	return geometry;

};
