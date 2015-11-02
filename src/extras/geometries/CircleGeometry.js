/**
 * @author hughes
 */

THREE.CircleGeometry = function ( radius, segments, thetaStart, thetaLength ) {

	THREE.Geometry.call( this );

	this.type = 'CircleGeometry';

	this.parameters = {
		radius: radius,
		segments: segments,
		thetaStart: thetaStart,
		thetaLength: thetaLength
	};

	this.fromBufferGeometry( new THREE.CircleBufferGeometry( radius, segments, thetaStart, thetaLength ) );

};

THREE.CircleGeometry.prototype = Object.create( THREE.Geometry.prototype );
THREE.CircleGeometry.prototype.constructor = THREE.CircleGeometry;

THREE.CircleGeometry.prototype.clone = function () {

	var parameters = this.parameters;

	return new THREE.CircleGeometry(
		parameters.radius,
		parameters.segments,
		parameters.thetaStart,
		parameters.thetaLength
	);

};
