/**
 * @author abelnation / http://github.com/abelnation
 */

THREE.ConeGeometry = function (
	radius, height,
	radialSegments, heightSegments,
	openEnded, thetaStart, thetaLength ) {

	THREE.CylinderGeometry.call( this,
		0, radius, height,
		radialSegments, heightSegments,
		openEnded, thetaStart, thetaLength );

	this.type = 'ConeGeometry';

	this.parameters = {
		radius: radius,
		height: height,
		radialSegments: radialSegments,
		heightSegments: heightSegments,
		openEnded: openEnded,
		thetaStart: thetaStart,
		thetaLength: thetaLength
	};

};

THREE.ConeGeometry.prototype = Object.create( THREE.CylinderGeometry.prototype );
THREE.ConeGeometry.prototype.constructor = THREE.ConeGeometry;
