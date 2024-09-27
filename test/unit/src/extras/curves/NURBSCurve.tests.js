/* global QUnit */

import { NURBSCurve } from '../../../../../examples/jsm/curves/NURBSCurve.js';
import { MathUtils } from '../../../../../src/math/MathUtils.js';
import { Vector4 } from '../../../../../src/math/Vector4.js';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Curves', () => {

		QUnit.module( 'NURBSCurve', () => {

			QUnit.test( 'toJSON', ( assert ) => {

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

				const nurbsCurve = new NURBSCurve( nurbsDegree, nurbsKnots, nurbsControlPoints );
				const json = nurbsCurve.toJSON();

				assert.equal( json.degree, nurbsCurve.degree, "json.degree ok" );
				assert.deepEqual( json.knots, nurbsCurve.knots, "json.knots ok" );
				assert.deepEqual( json.controlPoints, nurbsCurve.controlPoints.map( p => p.toArray() ), "json.controlPoints ok" );
				assert.equal( json.startKnot, nurbsCurve.startKnot, "json.startKnot ok" );
				assert.equal( json.endKnot, nurbsCurve.endKnot, "json.endKnot ok" );

			} );

		} );

	} );

} );