import { Interpolant } from '../Interpolant.js';

/**
 * A Bezier interpolant using cubic Bezier curves with 2D control points.
 *
 * This interpolant supports the COLLADA/Maya style of Bezier animation where
 * each keyframe has explicit in/out tangent control points specified as
 * 2D coordinates (time, value).
 *
 * The tangent data must be provided via the `settings` object:
 * - `settings.inTangents`: Float32Array with [time, value] pairs per keyframe per component
 * - `settings.outTangents`: Float32Array with [time, value] pairs per keyframe per component
 *
 * For a track with N keyframes and stride S:
 * - Each tangent array has N * S * 2 values
 * - Layout: [k0_c0_time, k0_c0_value, k0_c1_time, k0_c1_value, ..., k0_cS_time, k0_cS_value,
 *            k1_c0_time, k1_c0_value, ...]
 *
 * @augments Interpolant
 */
class BezierInterpolant extends Interpolant {

	/**
	 * Constructs a new Bezier interpolant.
	 *
	 * @param {TypedArray} parameterPositions - The parameter positions (keyframe times).
	 * @param {TypedArray} sampleValues - The sample values.
	 * @param {number} sampleSize - The sample size (stride).
	 * @param {TypedArray} [resultBuffer] - The result buffer.
	 */
	constructor( parameterPositions, sampleValues, sampleSize, resultBuffer ) {

		super( parameterPositions, sampleValues, sampleSize, resultBuffer );

	}

	interpolate_( i1, t0, t, t1 ) {

		const result = this.resultBuffer;
		const values = this.sampleValues;
		const stride = this.valueSize;

		const offset1 = i1 * stride;
		const offset0 = offset1 - stride;

		// Get tangent data from settings
		const settings = this.settings || this.DefaultSettings_;
		const inTangents = settings.inTangents;
		const outTangents = settings.outTangents;

		// If no tangent data, fall back to linear interpolation
		if ( ! inTangents || ! outTangents ) {

			const weight1 = ( t - t0 ) / ( t1 - t0 );
			const weight0 = 1 - weight1;

			for ( let i = 0; i !== stride; ++ i ) {

				result[ i ] = values[ offset0 + i ] * weight0 + values[ offset1 + i ] * weight1;

			}

			return result;

		}

		// Tangent data layout: 2 values (time, value) per keyframe per component
		const tangentStride = stride * 2;
		const i0 = i1 - 1;

		for ( let i = 0; i !== stride; ++ i ) {

			const v0 = values[ offset0 + i ];
			const v1 = values[ offset1 + i ];

			// Get control points for this component
			// outTangent of previous keyframe (C0)
			const outTangentOffset = i0 * tangentStride + i * 2;
			const c0x = outTangents[ outTangentOffset ];
			const c0y = outTangents[ outTangentOffset + 1 ];

			// inTangent of current keyframe (C1)
			const inTangentOffset = i1 * tangentStride + i * 2;
			const c1x = inTangents[ inTangentOffset ];
			const c1y = inTangents[ inTangentOffset + 1 ];

			// Solve for Bezier parameter s where Bx(s) = t using Newton-Raphson
			let s = ( t - t0 ) / ( t1 - t0 ); // Initial guess

			for ( let iter = 0; iter < 8; iter ++ ) {

				const s2 = s * s;
				const s3 = s2 * s;
				const oneMinusS = 1 - s;
				const oneMinusS2 = oneMinusS * oneMinusS;
				const oneMinusS3 = oneMinusS2 * oneMinusS;

				// Bezier X(s) = (1-s)³·t0 + 3(1-s)²s·c0x + 3(1-s)s²·c1x + s³·t1
				const bx = oneMinusS3 * t0 + 3 * oneMinusS2 * s * c0x + 3 * oneMinusS * s2 * c1x + s3 * t1;

				// Derivative dX/ds
				const dbx = 3 * oneMinusS2 * ( c0x - t0 ) + 6 * oneMinusS * s * ( c1x - c0x ) + 3 * s2 * ( t1 - c1x );

				if ( Math.abs( dbx ) < 1e-10 ) break;

				const error = bx - t;
				if ( Math.abs( error ) < 1e-10 ) break;

				s = s - error / dbx;
				s = Math.max( 0, Math.min( 1, s ) );

			}

			// Evaluate Bezier Y(s)
			const s2 = s * s;
			const s3 = s2 * s;
			const oneMinusS = 1 - s;
			const oneMinusS2 = oneMinusS * oneMinusS;
			const oneMinusS3 = oneMinusS2 * oneMinusS;

			result[ i ] = oneMinusS3 * v0 + 3 * oneMinusS2 * s * c0y + 3 * oneMinusS * s2 * c1y + s3 * v1;

		}

		return result;

	}

}

export { BezierInterpolant };
