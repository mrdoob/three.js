/**
 * @author Kaleb Murphy
 */

THREE.RingGeometry = function ( innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength ) {

	THREE.Geometry.call( this );

	this.type = 'RingGeometry';

	this.parameters = {
		innerRadius: innerRadius,
		outerRadius: outerRadius,
		thetaSegments: thetaSegments,
		phiSegments: phiSegments,
		thetaStart: thetaStart,
		thetaLength: thetaLength
	};

	this.fromBufferGeometry( new THREE.RingBufferGeometry( innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength ) );

};

THREE.RingGeometry.prototype = Object.create( THREE.Geometry.prototype );
THREE.RingGeometry.prototype.constructor = THREE.RingGeometry;
