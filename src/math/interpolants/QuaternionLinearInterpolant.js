import { Interpolant } from '../Interpolant.js';
import { Quaternion } from '../Quaternion.js';

/**
 * Spherical linear unit quaternion interpolant.
 *
 * @augments Interpolant
 */
class QuaternionLinearInterpolant extends Interpolant {

	/**
	 * Constructs a new SLERP interpolant.
	 *
	 * @param {TypedArray} parameterPositions - The parameter positions hold the interpolation factors.
	 * @param {TypedArray} sampleValues - The sample values.
	 * @param {number} sampleSize - The sample size
	 * @param {TypedArray} [resultBuffer] - The result buffer.
	 */
	constructor( parameterPositions, sampleValues, sampleSize, resultBuffer ) {

		super( parameterPositions, sampleValues, sampleSize, resultBuffer );

	}

	interpolate_( i1, t0, t, t1 ) {

		const result = this.resultBuffer,
			values = this.sampleValues,
			stride = this.valueSize,

			alpha = ( t - t0 ) / ( t1 - t0 );

		const offset = i1 * stride;

		for ( let i = 0; i !== stride; i += 4 ) {

			Quaternion.slerpFlat( result, i, values, offset - stride + i, values, offset + i, alpha );

		}

		return result;

	}

}


export { QuaternionLinearInterpolant };
