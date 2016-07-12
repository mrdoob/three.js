/*
 * @author: abelnation / http://github.com/abelnation
 */

THREE.ConeBufferGeometry = function (
	radius, height,
	radialSegments, heightSegments,
	openEnded, thetaStart, thetaLength ) {

	THREE.CylinderBufferGeometry.call( this,
		0, radius, height,
		radialSegments, heightSegments,
		openEnded, thetaStart, thetaLength );

	this.type = 'ConeBufferGeometry';

	this.parameters = {
		radius: radius,
		height: height,
		radialSegments: radialSegments,
		heightSegments: heightSegments,
		thetaStart: thetaStart,
		thetaLength: thetaLength
	};

};

THREE.ConeBufferGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.ConeBufferGeometry.prototype.constructor = THREE.ConeBufferGeometry;
