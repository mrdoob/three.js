/**
 *
 * Spherical linear quaternion interpolant.
 *
 *
 * @author tschw
 */

THREE.SlerpInterpolant = function( times, values, stride, result ) {

	THREE.Interpolant.call( this, times, values, stride, result );

};

Object.assign( THREE.SlerpInterpolant.prototype, THREE.Interpolant.prototype, {

	constructor: THREE.SlerpInterpolant,

	_interpolate: function( i1, t0, t, t1 ) {

		var values = this.values,
			stride = this.stride,
			result = this.result,

			offset = i1 * stride,

			alpha = ( t - t0 ) / ( t1 - t0 );

		for ( var end = offset + stride; offset !== end; offset += 4 ) {

			THREE.AnimationUtils.slerp(
					result, 0, values, offset - stride, offset, alpha );

		}

		return result;

	}

} );
