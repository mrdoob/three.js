/**
 * @author abelnation / https://github.com/abelnation
 */

THREE.CosineSphericalDistribution = function () {

	var oneOverPi = 1.0 / Math.PI;

	THREE.SphericalDistribution.call( this, function( pos ) {

		// see: Real-Time Polygonal-Light Shading with Linearly Transformed Cosines
		//      Eric Heitz, Jonathan Dupuy, Stephen Hill and David Neubelt
		//      https://eheitzresearch.wordpress.com/415-2/
		return oneOverPi * Math.max( 0, pos.z );

	} );
}

THREE.CosineSphericalDistribution.prototype = Object.create( THREE.SphericalDistribution.prototype );
THREE.CosineSphericalDistribution.prototype.constructor = THREE.CosineSphericalDistribution;
