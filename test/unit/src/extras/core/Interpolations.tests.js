import { CatmullRom, QuadraticBezier, CubicBezier } from '../../../../../src/extras/core/Interpolations.js';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Core', () => {

		QUnit.module( 'Interpolations', () => {

			// CatmullRom
			QUnit.test( 'CatmullRom - interpolates between the two middle control points', ( assert ) => {

				// The spline passes through p1 at t = 0 and p2 at t = 1; p0 and p3
				// only influence the tangents, so the endpoints are exact.
				assert.numEqual( CatmullRom( 0, 1, 2, 3, 4 ), 2, 't = 0 returns p1' );
				assert.numEqual( CatmullRom( 1, 1, 2, 3, 4 ), 3, 't = 1 returns p2' );

			} );

			QUnit.test( 'CatmullRom - is linear for evenly spaced control points', ( assert ) => {

				// With p0..p3 = 0,1,2,3 both tangents are 1 and the cubic and
				// quadratic terms cancel, leaving exactly p1 + t.
				for ( const t of [ 0, 0.25, 0.5, 0.75, 1 ] ) {

					assert.numEqual( CatmullRom( t, 0, 1, 2, 3 ), 1 + t, `t = ${ t } lies on the straight line` );

				}

			} );

			QUnit.test( 'CatmullRom - is symmetric under reversal of the control points', ( assert ) => {

				// Reversing the control points and the parameter has to trace the
				// same curve backwards.
				for ( const t of [ 0.1, 0.35, 0.5, 0.8 ] ) {

					assert.numEqual(
						CatmullRom( t, 5, 1, 4, 2 ),
						CatmullRom( 1 - t, 2, 4, 1, 5 ),
						`t = ${ t } matches the reversed spline at 1 - t`
					);

				}

			} );

			QUnit.test( 'CatmullRom - returns the shared value when all control points are equal', ( assert ) => {

				assert.numEqual( CatmullRom( 0.42, 7, 7, 7, 7 ), 7, 'a degenerate spline is constant' );

			} );

			// QuadraticBezier
			QUnit.test( 'QuadraticBezier - passes through its first and last control points', ( assert ) => {

				assert.numEqual( QuadraticBezier( 0, 1, 5, 9 ), 1, 't = 0 returns p0' );
				assert.numEqual( QuadraticBezier( 1, 1, 5, 9 ), 9, 't = 1 returns p2' );

			} );

			QUnit.test( 'QuadraticBezier - matches the Bernstein basis at the midpoint', ( assert ) => {

				// B(0.5) = 0.25 * p0 + 0.5 * p1 + 0.25 * p2
				assert.numEqual( QuadraticBezier( 0.5, 1, 5, 9 ), 0.25 * 1 + 0.5 * 5 + 0.25 * 9, 'midpoint uses weights 1/4, 1/2, 1/4' );

			} );

			QUnit.test( 'QuadraticBezier - its basis functions form a partition of unity', ( assert ) => {

				// Weights summing to 1 means equal control points produce that value
				// for every t -- the property that keeps the curve inside its hull.
				for ( const t of [ 0, 0.2, 0.5, 0.9, 1 ] ) {

					assert.numEqual( QuadraticBezier( t, 3, 3, 3 ), 3, `t = ${ t } returns the shared control point value` );

				}

			} );

			// CubicBezier
			QUnit.test( 'CubicBezier - passes through its first and last control points', ( assert ) => {

				assert.numEqual( CubicBezier( 0, 1, 5, 9, 13 ), 1, 't = 0 returns p0' );
				assert.numEqual( CubicBezier( 1, 1, 5, 9, 13 ), 13, 't = 1 returns p3' );

			} );

			QUnit.test( 'CubicBezier - matches the Bernstein basis at the midpoint', ( assert ) => {

				// B(0.5) = 0.125 * p0 + 0.375 * p1 + 0.375 * p2 + 0.125 * p3
				assert.numEqual(
					CubicBezier( 0.5, 1, 5, 9, 13 ),
					0.125 * 1 + 0.375 * 5 + 0.375 * 9 + 0.125 * 13,
					'midpoint uses weights 1/8, 3/8, 3/8, 1/8'
				);

			} );

			QUnit.test( 'CubicBezier - its basis functions form a partition of unity', ( assert ) => {

				for ( const t of [ 0, 0.2, 0.5, 0.9, 1 ] ) {

					assert.numEqual( CubicBezier( t, 4, 4, 4, 4 ), 4, `t = ${ t } returns the shared control point value` );

				}

			} );

			QUnit.test( 'CubicBezier - degree-elevates a quadratic curve exactly', ( assert ) => {

				// A quadratic ( q0, q1, q2 ) is the cubic
				// ( q0, q0/3 + 2q1/3, 2q1/3 + q2/3, q2 ) -- both must agree everywhere.
				const q0 = 2, q1 = 6, q2 = - 1;
				const c1 = q0 / 3 + 2 * q1 / 3;
				const c2 = 2 * q1 / 3 + q2 / 3;

				for ( const t of [ 0.1, 0.4, 0.7, 0.95 ] ) {

					assert.numEqual(
						CubicBezier( t, q0, c1, c2, q2 ),
						QuadraticBezier( t, q0, q1, q2 ),
						`t = ${ t } agrees with the degree-elevated quadratic`
					);

				}

			} );

		} );

	} );

} );
