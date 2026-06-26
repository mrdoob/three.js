import { Interpolant } from '../Interpolant.js';

/**
 * Interpolant that evaluates to the sample value at the position preceding
 * the parameter.
 *
 * @augments Interpolant
 */
class DiscreteInterpolant extends Interpolant {

	/**
	 * Constructs a new discrete interpolant.
	 *
	 * @param {TypedArray} parameterPositions - The parameter positions hold the interpolation factors.
	 * @param {TypedArray} sampleValues - The sample values.
	 * @param {number} sampleSize - The sample size
	 * @param {TypedArray} [resultBuffer] - The result buffer.
	 */
	constructor( parameterPositions, sampleValues, sampleSize, resultBuffer ) {

		super( parameterPositions, sampleValues, sampleSize, resultBuffer );

	}

	interpolate_( i1 /*, t0, t, t1 */ ) {

		return this.copySampleValue_( i1 - 1 );

	}

}


export { DiscreteInterpolant };
