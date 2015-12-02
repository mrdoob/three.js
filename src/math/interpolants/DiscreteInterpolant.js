/**
 *
 * Interpolant that evaluates to the sample value at the position preceeding
 * the parameter.
 *
 * @author tschw
 */

THREE.DiscreteInterpolant = function(
		parameterPositions, sampleValues, sampleSize, resultBuffer ) {

	THREE.Interpolant.call(
			this, parameterPositions, sampleValues, sampleSize, resultBuffer );

};

THREE.DiscreteInterpolant.prototype =
		Object.assign( Object.create( THREE.Interpolant.prototype ), {

	constructor: THREE.DiscreteInterpolant,

	interpolate_: function( i1, t0, t, t1 ) {

		return this.copySampleValue_( i1 - 1 );

	}

} );
