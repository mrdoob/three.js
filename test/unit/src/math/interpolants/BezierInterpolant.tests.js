import { BezierInterpolant } from '../../../../../src/math/interpolants/BezierInterpolant.js';

import { Interpolant } from '../../../../../src/math/Interpolant.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Interpolants', () => {

		QUnit.module( 'BezierInterpolant', () => {

			// INHERITANCE
			QUnit.test( 'Extending', ( assert ) => {

				const object = new BezierInterpolant( null, [ 1, 2 ], 1, [] );
				assert.strictEqual(
					object instanceof Interpolant, true,
					'BezierInterpolant extends from Interpolant'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( assert ) => {

				// parameterPositions, sampleValues, sampleSize, resultBuffer
				const object = new BezierInterpolant( null, [ 1, 2 ], 1, [] );
				assert.ok( object, 'Can instantiate a BezierInterpolant.' );

			} );

			// PRIVATE - TEMPLATE METHODS
			QUnit.test( 'interpolate_', ( assert ) => {

				// Two keyframes at t=0 (value v0) and t=1 (value v1) with COLLADA-style
				// free tangent control points. The chosen X control points make Bx( s )
				// non-monotone, so the Newton-Raphson solve does not converge within the
				// fixed iteration budget and its last step updates s. The value must still
				// be evaluated with the powers of that final s.

				const t0 = 0, t1 = 1;
				const v0 = - 3.9409040232346717, v1 = 2.5647222407848815;
				const c0x = 0.31457929469714085, c0y = - 4.946690276064974;
				const c1x = 1.6432901810391907, c1y = 4.793039761023614;

				const interpolant = new BezierInterpolant(
					[ t0, t1 ],
					[ v0, v1 ],
					1,
					[]
				);

				interpolant.outTangents = [ c0x, c0y, 0, 0 ]; // out-tangent of keyframe 0 ( C0 )
				interpolant.inTangents = [ 0, 0, c1x, c1y ]; // in-tangent of keyframe 1 ( C1 )

				const t = 0.75;
				const result = interpolant.interpolate_( 1, t0, t, t1 )[ 0 ];

				// Reference: solve Bx( s ) = t, then evaluate By( s ) with that same s.

				const bx = ( s ) => {

					const o = 1 - s;
					return o * o * o * t0 + 3 * o * o * s * c0x + 3 * o * s * s * c1x + s * s * s * t1;

				};

				const by = ( s ) => {

					const o = 1 - s;
					return o * o * o * v0 + 3 * o * o * s * c0y + 3 * o * s * s * c1y + s * s * s * v1;

				};

				const dbx = ( s ) => {

					const o = 1 - s;
					return 3 * o * o * ( c0x - t0 ) + 6 * o * s * ( c1x - c0x ) + 3 * s * s * ( t1 - c1x );

				};

				let s = ( t - t0 ) / ( t1 - t0 );

				for ( let i = 0; i < 8; i ++ ) {

					const error = bx( s ) - t;
					if ( Math.abs( error ) < 1e-10 ) break;
					const derivative = dbx( s );
					if ( Math.abs( derivative ) < 1e-10 ) break;
					s = s - error / derivative;
					s = Math.max( 0, Math.min( 1, s ) );

				}

				const expected = by( s );

				assert.ok(
					Math.abs( result - expected ) < 1e-3,
					'interpolate_ evaluates the value with the final solved parameter'
				);

			} );

		} );

	} );

} );
