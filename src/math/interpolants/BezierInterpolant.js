import { Interpolant } from '../Interpolant.js';

/**
 * A Bezier interpolant using cubic Bezier curves with 2D control points.
 *
 * This interpolant supports the COLLADA/Maya style of Bezier animation where
 * each keyframe has explicit in/out tangent control points specified as
 * 2D coordinates (time, value).
 *
 * Tangent data is read from `inTangents` and `outTangents` on the interpolant
 * (populated by `KeyframeTrack.InterpolantFactoryMethodBezier`).
 *
 * For a track with N keyframes and stride S:
 * - Each tangent array has N * S * 2 values
 * - Layout: [k0_c0_time, k0_c0_value, k0_c1_time, k0_c1_value, ..., k0_cS_time, k0_cS_value,
 *            k1_c0_time, k1_c0_value, ...]
 *
 * @augments Interpolant
 */
class BezierInterpolant extends Interpolant {

	interpolate_( i1, t0, t, t1 ) {

		const result = this.resultBuffer;
		const values = this.sampleValues;
		const stride = this.valueSize;

		const offset1 = i1 * stride;
		const offset0 = offset1 - stride;

		const inTangents = this.inTangents;
		const outTangents = this.outTangents;

		// If no tangent data, fall back to linear interpolation
		if ( ! inTangents || ! outTangents ) {

			const weight1 = ( t - t0 ) / ( t1 - t0 );
			const weight0 = 1 - weight1;

			for ( let i = 0; i !== stride; ++ i ) {

				result[ i ] = values[ offset0 + i ] * weight0 + values[ offset1 + i ] * weight1;

			}

			return result;

		}

		const tangentStride = stride * 2;
		const i0 = i1 - 1;

		for ( let i = 0; i !== stride; ++ i ) {

			const v0 = values[ offset0 + i ];
			const v1 = values[ offset1 + i ];

			// outTangent of previous keyframe (C0)
			const outTangentOffset = i0 * tangentStride + i * 2;
			const c0x = outTangents[ outTangentOffset ];
			const c0y = outTangents[ outTangentOffset + 1 ];

			// inTangent of current keyframe (C1)
			const inTangentOffset = i1 * tangentStride + i * 2;
			const c1x = inTangents[ inTangentOffset ];
			const c1y = inTangents[ inTangentOffset + 1 ];

			// Find the curve parameter s where the Bezier X(s) matches t, then evaluate Y(s)
			const s = solveBezierParameter( t, t0, c0x, c1x, t1 );

			result[ i ] = cubicBezier( s, v0, c0y, c1y, v1 );

		}

		return result;

	}

}

function cubicBezier( s, p0, p1, p2, p3 ) {

	const k = 1 - s;

	return k * k * k * p0 + 3 * k * k * s * p1 + 3 * k * s * s * p2 + s * s * s * p3;

}

function cubicBezierSlope( s, p0, p1, p2, p3 ) {

	const k = 1 - s;

	return 3 * k * k * ( p1 - p0 ) + 6 * k * s * ( p2 - p1 ) + 3 * s * s * ( p3 - p2 );

}

// Solves cubicBezier( s, x0, x1, x2, x3 ) = x for s in [0,1] using Newton-Raphson

function solveBezierParameter( x, x0, x1, x2, x3 ) {

	let s = ( x - x0 ) / ( x3 - x0 );

	for ( let i = 0; i < 8; i ++ ) {

		const error = cubicBezier( s, x0, x1, x2, x3 ) - x;
		if ( Math.abs( error ) < 1e-10 ) break;

		const slope = cubicBezierSlope( s, x0, x1, x2, x3 );
		if ( Math.abs( slope ) < 1e-10 ) break;

		s = Math.max( 0, Math.min( 1, s - error / slope ) );

	}

	return s;

}

export { BezierInterpolant };
