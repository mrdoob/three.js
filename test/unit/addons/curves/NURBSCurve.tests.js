import { NURBSCurve } from '../../../../examples/jsm/curves/NURBSCurve.js';
import { MathUtils, Vector4 } from 'three';

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
