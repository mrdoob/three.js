import { ZeroCurvatureEnding } from '../../constants.js';
import { Interpolant } from '../Interpolant.js';
import { WrapAroundEnding, ZeroSlopeEnding } from '../../constants.js';

/**
 * Fast and simple cubic spline interpolant.
 *
 * It was derived from a Hermitian construction setting the first derivative
 * at each sample position to the linear slope between neighboring positions
 * over their parameter interval.
 *
 * @author tschw
 */

function CubicInterpolant( parameterPositions, sampleValues, sampleSize, resultBuffer ) {

	Interpolant.call( this, parameterPositions, sampleValues, sampleSize, resultBuffer );

	this._weightPrev = - 0;
	this._offsetPrev = - 0;
	this._weightNext = - 0;
	this._offsetNext = - 0;

}

CubicInterpolant.prototype = Object.assign( Object.create( Interpolant.prototype ), {

	constructor: CubicInterpolant,

	DefaultSettings_: {

		endingStart: ZeroCurvatureEnding,
		endingEnd: ZeroCurvatureEnding

	},

	intervalChanged_: function ( i1, t0, t1 ) {

		let pp = this.parameterPositions,
			iPrev = i1 - 2,
			iNext = i1 + 1,

			tPrev = pp[ iPrev ],
			tNext = pp[ iNext ];

		if ( tPrev === undefined ) {

			switch ( this.getSettings_().endingStart ) {

				case ZeroSlopeEnding:

					// f'(t0) = 0
					iPrev = i1;
					tPrev = 2 * t0 - t1;

					break;

				case WrapAroundEnding:

					// use the other end of the curve
					iPrev = pp.length - 2;
					tPrev = t0 + pp[ iPrev ] - pp[ iPrev + 1 ];

					break;

				default: // ZeroCurvatureEnding

					// f''(t0) = 0 a.k.a. Natural Spline
					iPrev = i1;
					tPrev = t1;

			}

		}

		if ( tNext === undefined ) {

			switch ( this.getSettings_().endingEnd ) {

				case ZeroSlopeEnding:

					// f'(tN) = 0
					iNext = i1;
					tNext = 2 * t1 - t0;

					break;

				case WrapAroundEnding:

					// use the other end of the curve
					iNext = 1;
					tNext = t1 + pp[ 1 ] - pp[ 0 ];

					break;

				default: // ZeroCurvatureEnding

					// f''(tN) = 0, a.k.a. Natural Spline
					iNext = i1 - 1;
					tNext = t0;

			}

		}

		const halfDt = ( t1 - t0 ) * 0.5,
			stride = this.valueSize;

		this._weightPrev = halfDt / ( t0 - tPrev );
		this._weightNext = halfDt / ( tNext - t1 );
		this._offsetPrev = iPrev * stride;
		this._offsetNext = iNext * stride;

	},

	interpolate_: function ( i1, t0, t, t1 ) {

		const result = this.resultBuffer,
			values = this.sampleValues,
			stride = this.valueSize,

			o1 = i1 * stride,		o0 = o1 - stride,
			oP = this._offsetPrev, 	oN = this._offsetNext,
			wP = this._weightPrev,	wN = this._weightNext,

			p = ( t - t0 ) / ( t1 - t0 ),
			pp = p * p,
			ppp = pp * p;

		// evaluate polynomials

		const sP = - wP * ppp + 2 * wP * pp - wP * p;
		const s0 = ( 1 + wP ) * ppp + ( - 1.5 - 2 * wP ) * pp + ( - 0.5 + wP ) * p + 1;
		const s1 = ( - 1 - wN ) * ppp + ( 1.5 + wN ) * pp + 0.5 * p;
		const sN = wN * ppp - wN * pp;

		// combine data linearly

		for ( let i = 0; i !== stride; ++ i ) {

			result[ i ] =
					sP * values[ oP + i ] +
					s0 * values[ o0 + i ] +
					s1 * values[ o1 + i ] +
					sN * values[ oN + i ];

		}

		return result;

	}

} );


export { CubicInterpolant };
