/**
 *
 * Cubic hermite spline interpolant.
 *
 *
 * @author tschw
 */

THREE.SmoothInterpolant = function( times, values, stride, result ) {

	THREE.Interpolant.call( this, times, values, stride, result );

};

Object.assign( THREE.SmoothInterpolant.prototype, THREE.Interpolant.prototype, {

	constructor: THREE.SmoothInterpolant,

	DefaultParameters: {

		zeroVelocityAtStart: false,
		zeroVelocityAtEnd: false

	},

	_intervalChanged: function( i1, t0, t1 ) {

		var times = this.times,
			iPrev = i1 - 2,
			iNext = i1 + 1,

			tPrev = times[ iPrev ],
			tNext = times[ iNext ];

		if ( tPrev === undefined ) {

			iPrev = i1;

			tPrev = this._getParameters().zeroVelocityAtStart ?
					2 * t0 - t1 : // yields f'(t0) = 0, IOW accelerates
					t1; // yields f''(t0) = 0, IOW turns into a straight line

		}

		if ( tNext === undefined ) {

			iNext = i1 - 1;
			tNext = this._getParameters().zeroVelocityAtEnd ?
					2 * t1 - t0 : // yields f'(tN) = 0, IOW decelerates
					t0; // yields f''(tN) = 0, IOW turns into a straight line

		}

		var halfDt = ( t1 - t0 ) * 0.5,
			stride = this.stride;

		this.weightPrev = halfDt / ( t0 - tPrev );
		this.weightNext = halfDt / ( tNext - t1 );
		this.offsetPrev = iPrev * stride;
		this.offsetNext = iNext * stride;

	},

	_interpolate: function( i1, t0, t, t1 ) {

		var times = this.times,
			values = this.values,
			stride = this.stride,
			result = this.result,

			o1 = i1 * stride,		o0 = o1 - stride,
			oP = this.offsetPrev, 	oN = this.offsetNext,

			wP = this.weightPrev, wN = this.weightNext,

			p = ( t - t0 ) / ( t1 - t0 ),
			pp = p * p,
			ppp = pp * p;

		// evaluate polynomials

		var sP = - wP * ppp + 2 * wP * pp  - wP * p;
		var s0 = ( 1 + wP ) * ppp + ( -1.5 - 2 * wP ) * pp + ( -0.5 + wP ) * p + 1;
		var s1 = ( -1 - wN ) * ppp + ( 1.5 + wN ) * pp + 0.5 * p;
		var sN = wN * ppp - wN * pp;

		// mix down

		for ( var i = 0; i !== stride; ++ i ) {

			result[ i ] =
					sP * values[ oP + i ] +
					s0 * values[ o0 + i ] +
					s1 * values[ o1 + i ] +
					sN * values[ oN + i ];

		}

		return result;

	}

} );
