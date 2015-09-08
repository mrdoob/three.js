/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = SphereGeometry;

var SphereBufferGeometry = require( "./SphereBufferGeometry" ),
	Geometry = require( "../../core/Geometry" );

function SphereGeometry( radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength ) {

	Geometry.call( this );

	this.type = "SphereGeometry";

	this.parameters = {
		radius: radius,
		widthSegments: widthSegments,
		heightSegments: heightSegments,
		phiStart: phiStart,
		phiLength: phiLength,
		thetaStart: thetaStart,
		thetaLength: thetaLength
	};

	this.fromBufferGeometry( new SphereBufferGeometry( radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength ) );

}

SphereGeometry.prototype = Object.create( Geometry.prototype );
SphereGeometry.prototype.constructor = SphereGeometry;

SphereGeometry.prototype.clone = function () {

	var geometry = new SphereGeometry(
		this.parameters.radius,
		this.parameters.widthSegments,
		this.parameters.heightSegments,
		this.parameters.phiStart,
		this.parameters.phiLength,
		this.parameters.thetaStart,
		this.parameters.thetaLength
	);

	return geometry;

};
