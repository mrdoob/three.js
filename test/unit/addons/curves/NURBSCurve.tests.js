import { NURBSCurve } from '../../../../examples/jsm/curves/NURBSCurve.js';
import { MathUtils, Vector3, Vector4 } from 'three';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Curves', () => {

		QUnit.module( 'NURBSCurve', ( hooks ) => {

			let _nurbsCurve = undefined;

			hooks.before( function () {

				const nurbsControlPoints = [];
				const nurbsKnots = [];
				const nurbsDegree = 3;

				for ( let i = 0; i <= nurbsDegree; i ++ ) {

					nurbsKnots.push( 0 );

				}

				for ( let i = 0, j = 20; i < j; i ++ ) {

					const point = new Vector4( Math.random(), Math.random(), Math.random(), 1 );
					nurbsControlPoints.push( point );

					const knot = ( i + 1 ) / ( j - nurbsDegree );
					nurbsKnots.push( MathUtils.clamp( knot, 0, 1 ) );

				}

				 _nurbsCurve = new NURBSCurve( nurbsDegree, nurbsKnots, nurbsControlPoints );

			} );

			QUnit.test( 'getTangent respects the knot range', ( assert ) => {

				const knots = [ 0, 0, 0, 1, 2, 3, 3, 3 ];
				const points = [
					new Vector4( 0, 0, 0, 1 ),
					new Vector4( 1, 2, 0, 1 ),
					new Vector4( 2, 0, 0, 2 ),
					new Vector4( 3, 3, 0, 1 ),
					new Vector4( 4, 0, 0, 1 )
				];
				const curves = [
					new NURBSCurve( 2, knots, points ),
					new NURBSCurve( 2, knots, points, 3, 4 )
				];
				const target = new Vector3();
				const delta = 1e-6;

				for ( const curve of curves ) {

					for ( const t of [ 0, 0.25, 0.5, 0.75, 1 ] ) {

						const before = curve.getPoint( Math.max( 0, t - delta ) );
						const after = curve.getPoint( Math.min( 1, t + delta ) );
						const expected = after.sub( before ).normalize();
						const tangent = curve.getTangent( t, target );

						assert.strictEqual( tangent, target, 'Writes to the optional target.' );
						assert.ok( tangent.distanceTo( expected ) < 1e-4, `Tangent follows the curve at t=${t}, startKnot=${curve.startKnot}.` );

					}

				}

			} );

			QUnit.test( 'clone', ( assert ) => {

				const clone = _nurbsCurve.clone();

				assert.equal( clone.degree, _nurbsCurve.degree, 'clone.degree ok' );
				assert.deepEqual( clone.knots, _nurbsCurve.knots, 'clone.knots ok' );
				assert.deepEqual( clone.controlPoints, _nurbsCurve.controlPoints, 'clone.controlPoints ok' );
				assert.equal( clone.startKnot, _nurbsCurve.startKnot, 'clone.startKnot ok' );
				assert.equal( clone.endKnot, _nurbsCurve.endKnot, 'clone.endKnot ok' );

				assert.notStrictEqual( clone.knots, _nurbsCurve.knots, 'clone.knots is not shared' );
				assert.notStrictEqual( clone.controlPoints[ 0 ], _nurbsCurve.controlPoints[ 0 ], 'clone.controlPoints are not shared' );

				assert.deepEqual( clone.getPoint( 0.5 ), _nurbsCurve.getPoint( 0.5 ), 'clone.getPoint() ok' );

			} );

			QUnit.test( 'toJSON', ( assert ) => {

				const json = _nurbsCurve.toJSON();

				assert.equal( json.degree, _nurbsCurve.degree, 'json.degree ok' );
				assert.deepEqual( json.knots, _nurbsCurve.knots, 'json.knots ok' );
				assert.deepEqual( json.controlPoints, _nurbsCurve.controlPoints.map( p => p.toArray() ), 'json.controlPoints ok' );
				assert.equal( json.startKnot, _nurbsCurve.startKnot, 'json.startKnot ok' );
				assert.equal( json.endKnot, _nurbsCurve.endKnot, 'json.endKnot ok' );

			} );

			QUnit.test( 'fromJSON', ( assert ) => {

				const json = _nurbsCurve.toJSON();
				const fromJson = new NURBSCurve().fromJSON( json );

				assert.equal( fromJson.degree, _nurbsCurve.degree, 'json.degree ok' );
				assert.deepEqual( fromJson.knots, _nurbsCurve.knots, 'json.knots ok' );
				assert.deepEqual( fromJson.controlPoints, _nurbsCurve.controlPoints, 'json.controlPoints ok' );
				assert.equal( fromJson.startKnot, _nurbsCurve.startKnot, 'json.startKnot ok' );
				assert.equal( fromJson.endKnot, _nurbsCurve.endKnot, 'json.endKnot ok' );

			} );

		} );

	} );

} );
