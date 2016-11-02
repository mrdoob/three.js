/**
 * @author abelnation / https://github.com/abelnation
 */

THREE.LinearlyTransformedSphericalDistribution = function( distributionFn, transformMat4 ) {

	THREE.SphericalDistribution.call( this, distributionFn );

	this.transformMat4 = transformMat4 || new THREE.Matrix4();
	this.transformMat3 = new THREE.Matrix3();
	this.updateTransform();
}

// inherit from SphericalDistribution
THREE.LinearlyTransformedSphericalDistribution.prototype =
	Object.create( THREE.SphericalDistribution.prototype );
THREE.LinearlyTransformedSphericalDistribution.prototype.constructor =
	THREE.LinearlyTransformedSphericalDistribution;

// Overridden methods
THREE.LinearlyTransformedSphericalDistribution.prototype.valueAtNormalizedPosVec3 = function ( pos ) {

	var transformedPos = pos.clone().applyMatrix3( this.transformInverseMat3 );
	var transformedPosMag = transformedPos.length();

	// normalize with length (calling normalize would recalculate length)
	transformedPos.divideScalar(transformedPosMag);

	var distFnValue;
	if (this.distributionFn instanceof THREE.SphericalDistribution) {

		distFnValue = this.distributionFn.valueAtNormalizedPosVec3( transformedPos );

	} else if (typeof this.distributionFn === 'function') {

		distFnValue = this.distributionFn( transformedPos );

	}

	var angleScalarValue = ( this.transformInverseDet / Math.pow( transformedPosMag, 3 ) );
	var result = distFnValue * angleScalarValue;

	return result;

}

THREE.LinearlyTransformedSphericalDistribution.prototype.updateTransform = function() {

	this.transformMat3.setFromMatrix4( this.transformMat4 );
	this.transformInverseMat3 = this.transformMat3.getInverse(this.transformMat3, true);
	this.transformInverseDet = this.transformInverseMat3.determinant();

}

THREE.LinearlyTransformedSphericalDistribution.prototype.scale = function ( x, y, z ) {

	var scale = new THREE.Matrix4().makeScale( x, y, z );
	this.transformMat4.multiply( scale );
	this.updateTransform();

	return this;

}

THREE.LinearlyTransformedSphericalDistribution.prototype.rotate = function ( rx, ry, rz ) {

	var rot = new THREE.Matrix4().makeRotationFromEuler( new THREE.Euler( rx, ry, rz ) );
	this.transformMat4.multiply( rot );
	this.updateTransform();

	return this;

}

THREE.LinearlyTransformedSphericalDistribution.prototype.shear = function ( x, y, z ) {

	var shear = new THREE.Matrix4().makeShear( x, y, z );
	this.transformMat4.multiply( shear );
	this.updateTransform();

	return this;

}

THREE.LinearlyTransformedSphericalDistribution.prototype.transformMat4 = function ( mat4 ) {

	this.transformMat4 = mat4.clone();
	this.updateTransform();

	return this;

}
