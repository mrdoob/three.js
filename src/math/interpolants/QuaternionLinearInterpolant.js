/**
 * Spherical linear unit quaternion interpolant.
 *
 * @author tschw
 */

THREE.QuaternionLinearInterpolant = function(
		parameterPositions, sampleValues, sampleSize, resultBuffer ) {

	THREE.Interpolant.call(
			this, parameterPositions, sampleValues, sampleSize, resultBuffer );

};

THREE.QuaternionLinearInterpolant.prototype =
		Object.assign( Object.create( THREE.Interpolant.prototype ), {

	constructor: THREE.QuaternionLinearInterpolant,

	interpolate_: function( i1, t0, t, t1 ) {

		var result = this.resultBuffer,
			values = this.sampleValues,
			stride = this.valueSize,

			offset = i1 * stride,

			alpha = ( t - t0 ) / ( t1 - t0 );

		for ( var end = offset + stride; offset !== end; offset += 4 ) {

			THREE.Quaternion.slerpFlat( result, 0,
					values, offset - stride, values, offset, alpha );

		}

		return result;

	}

} );
