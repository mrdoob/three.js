import { Interpolant } from '../../../../../src/math/Interpolant.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Interpolants', () => {

		QUnit.module( 'CustomInterpolant', () => {

			// A custom cubic spline interpolant mimicking `GLTFCubicSplineInterpolant`
			// from `GLTFLoader`. The keyframe layout for CUBICSPLINE animations is:
			// [ inTangent_1, splineVertex_1, outTangent_1, inTangent_2, splineVertex_2, ... ]

			class CubicSplineInterpolant extends Interpolant {

				constructor( parameterPositions, sampleValues, sampleSize, resultBuffer ) {

					super( parameterPositions, sampleValues, sampleSize, resultBuffer );

				}

				copySampleValue_( index ) {

					const result = this.resultBuffer,
						values = this.sampleValues,
						valueSize = this.valueSize,
						offset = index * valueSize * 3 + valueSize;

					for ( let i = 0; i !== valueSize; i ++ ) {

						result[ i ] = values[ offset + i ];

					}

					return result;

				}

				interpolate_( i1, t0, t, t1 ) {

					const result = this.resultBuffer;
					const values = this.sampleValues;
					const stride = this.valueSize;

					const stride2 = stride * 2;
					const stride3 = stride * 3;

					const td = t1 - t0;

					const p = ( t - t0 ) / td;
					const pp = p * p;
					const ppp = pp * p;

					const offset1 = i1 * stride3;
					const offset0 = offset1 - stride3;

					const s2 = - 2 * ppp + 3 * pp;
					const s3 = ppp - pp;
					const s0 = 1 - s2;
					const s1 = s3 - pp + p;

					for ( let i = 0; i !== stride; i ++ ) {

						const p0 = values[ offset0 + i + stride ];
						const m0 = values[ offset0 + i + stride2 ] * td;
						const p1 = values[ offset1 + i + stride ];
						const m1 = values[ offset1 + i ] * td;

						result[ i ] = s0 * p0 + s1 * m0 + s2 * p1 + s3 * m1;

					}

					return result;

				}

			}

			// INHERITANCE
			QUnit.test( 'Extending', ( assert ) => {

				// parameterPositions, sampleValues, sampleSize, resultBuffer
				const object = new CubicSplineInterpolant( [ 0, 1 ], [ 0, 0, 0, 0, 0, 0 ], 1, [] );
				assert.strictEqual(
					object instanceof Interpolant, true,
					'CubicSplineInterpolant extends from Interpolant'
				);

			} );

			// PUBLIC
			QUnit.test( 'evaluate', ( assert ) => {

				// Two keyframes at t = 0 and t = 1, valueSize = 1.
				// Layout: [ in_0, v_0, out_0, in_1, v_1, out_1 ]
				// Vertex values 0 -> 1 with non-zero tangents to exercise all spline terms.
				const positions = [ 0, 1 ];
				const values = [ 0, 0, 1, - 1, 1, 0 ];
				const interpolant = new CubicSplineInterpolant( positions, values, 1, [ 0 ] );

				assert.deepEqual( interpolant.evaluate( 0 ), [ 0 ], 'evaluate at first keyframe' );
				assert.deepEqual( interpolant.evaluate( 1 ), [ 1 ], 'evaluate at last keyframe' );

				// At t = 0.5 with td = 1, p = 0.5 → s0 = 0.5, s1 = 0.125, s2 = 0.5, s3 = -0.125
				// result = 0.5 * 0 + 0.125 * 1 + 0.5 * 1 + ( -0.125 ) * ( -1 ) = 0.75
				assert.deepEqual( interpolant.evaluate( 0.5 ), [ 0.75 ], 'evaluate inside interval' );

				// Out-of-range queries clamp to the boundary spline vertex.
				assert.deepEqual( interpolant.evaluate( - 1 ), [ 0 ], 'evaluate before first keyframe' );
				assert.deepEqual( interpolant.evaluate( 2 ), [ 1 ], 'evaluate after last keyframe' );

			} );

		} );

	} );

} );
