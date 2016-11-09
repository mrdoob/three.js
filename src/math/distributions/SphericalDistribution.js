/**
 * @author abelnation / https://github.com/abelnation
 */

THREE.SphericalDistribution = function ( distributionFn ) {

	this.distributionFn = distributionFn;
	this.radius = 1.0;

	this.sphere = new THREE.Sphere( new THREE.Vector3(), this.radius );

};

THREE.SphericalDistribution.prototype = {
	constructor: THREE.SphericalDistribution,

	valueAtNormalizedPosVec3: function ( normalizedPos ) {

		if (this.distributionFn instanceof THREE.SphericalDistribution) {

			return this.distributionFn.valueAtNormalizedPosVec3( normalizedPos );

		} else if (typeof this.distributionFn === 'function') {

			return this.distributionFn( normalizedPos );

		}

	},

	valueAtPosVec3: function ( pos ) {

		var normalized = this.sphere.clampPoint( pos );
		return this.valueAtNormalizedPosVec3( normalized );

	},

	valueAtPos: function ( x, y, z ) {

		return this.valueAtPosVec3( new THREE.Vector3( x, y, z ) )

	},

	valueAtSphericalPos: function ( phi, theta ) {

		var spherical = new THREE.Spherical( this.radius, phi, theta );
		return this.valueAtPosVec3( spherical.getCartesian() );

	}
};
