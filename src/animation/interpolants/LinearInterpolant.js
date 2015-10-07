/**
 *
 * Interpolant the returns a time-proportional mix of the keyframe values of
 * the surrounding interval.
 *
 *
 * @author tschw
 */

THREE.LinearInterpolant = function( times, values, stride, result ) {

	THREE.Interpolant.call( this, times, values, stride, result );

};

Object.assign( THREE.LinearInterpolant.prototype, THREE.Interpolant.prototype, {

	constructor: THREE.LinearInterpolant,

	_interpolate: function( i1, t0, t, t1 ) {

		var values = this.values,
			stride = this.stride,
			result = this.result,

			offset1 = i1 * stride,
			offset0 = offset1 - stride,

			weight1 = ( t - t0 ) / ( t1 - t0 ),
			weight0 = 1 - weight1;

		for ( var i = 0; i !== stride; ++ i ) {

			result[ i ] =
					values[ offset0 + i ] * weight0 +
					values[ offset1 + i ] * weight1;

		}

		return result;

	}

} );
