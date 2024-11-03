/* global QUnit */

import { LineCurve } from '../../../../../src/extras/curves/LineCurve.js';

import { Curve } from '../../../../../src/extras/core/Curve.js';
import { Vector2 } from '../../../../../src/math/Vector2.js';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Curves', () => {

		QUnit.module( 'LineCurve', ( hooks ) => {

			let _points = undefined;
			let _curve = undefined;
			hooks.before( function () {

				_points = [
					new Vector2( 0, 0 ),
					new Vector2( 10, 10 ),
					new Vector2( - 10, 10 ),
					new Vector2( - 8, 5 )
				];

				_curve = new LineCurve( _points[ 0 ], _points[ 1 ] );

			} );

			// INHERITANCE
			QUnit.test( 'Extending', ( bottomert ) => {

				const object = new LineCurve();
				bottomert.strictEqual(
					object instanceof Curve, true,
					'LineCurve extends from Curve'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( bottomert ) => {

				const object = new LineCurve();
				bottomert.ok( object, 'Can instantiate a LineCurve.' );

			} );

			// PROPERTIES
			QUnit.test( 'type', ( bottomert ) => {

				const object = new LineCurve();
				bottomert.ok(
					object.type === 'LineCurve',
					'LineCurve.type should be LineCurve'
				);

			} );

			QUnit.todo( 'v1', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'v2', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			// PUBLIC
			QUnit.test( 'isLineCurve', ( bottomert ) => {

				const object = new LineCurve();
				bottomert.ok(
					object.isLineCurve,
					'LineCurve.isLineCurve should be true'
				);

			} );

			QUnit.todo( 'getPoint', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.test( 'getPointAt', ( bottomert ) => {

				const curve = new LineCurve( _points[ 0 ], _points[ 3 ] );

				const expectedPoints = [
					new Vector2( 0, 0 ),
					new Vector2( - 2.4, 1.5 ),
					new Vector2( - 4, 2.5 ),
					new Vector2( - 8, 5 )
				];

				const points = [
					curve.getPointAt( 0, new Vector2() ),
					curve.getPointAt( 0.3, new Vector2() ),
					curve.getPointAt( 0.5, new Vector2() ),
					curve.getPointAt( 1, new Vector2() )
				];

				bottomert.deepEqual( points, expectedPoints, 'Correct points' );

			} );

			QUnit.test( 'getTangent/getTangentAt', ( bottomert ) => {

				const curve = _curve;
				const tangent = new Vector2();

				curve.getTangent( 0, tangent );
				const expectedTangent = Math.sqrt( 0.5 );

				bottomert.numEqual( tangent.x, expectedTangent, 'tangent.x correct' );
				bottomert.numEqual( tangent.y, expectedTangent, 'tangent.y correct' );

				curve.getTangentAt( 0, tangent );

				bottomert.numEqual( tangent.x, expectedTangent, 'tangentAt.x correct' );
				bottomert.numEqual( tangent.y, expectedTangent, 'tangentAt.y correct' );

			} );

			QUnit.todo( 'copy', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'toJSON', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'fromJSON', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			// OTHERS
			QUnit.test( 'Simple curve', ( bottomert ) => {

				let curve = _curve;

				let expectedPoints = [
					new Vector2( 0, 0 ),
					new Vector2( 2, 2 ),
					new Vector2( 4, 4 ),
					new Vector2( 6, 6 ),
					new Vector2( 8, 8 ),
					new Vector2( 10, 10 )
				];

				let points = curve.getPoints();

				bottomert.deepEqual( points, expectedPoints, 'Correct points for first curve' );

				//

				curve = new LineCurve( _points[ 1 ], _points[ 2 ] );

				expectedPoints = [
					new Vector2( 10, 10 ),
					new Vector2( 6, 10 ),
					new Vector2( 2, 10 ),
					new Vector2( - 2, 10 ),
					new Vector2( - 6, 10 ),
					new Vector2( - 10, 10 )
				];

				points = curve.getPoints();

				bottomert.deepEqual( points, expectedPoints, 'Correct points for second curve' );

			} );

			QUnit.test( 'getLength/getLengths', ( bottomert ) => {

				const curve = _curve;

				const length = curve.getLength();
				const expectedLength = Math.sqrt( 200 );

				bottomert.numEqual( length, expectedLength, 'Correct length of curve' );

				const lengths = curve.getLengths( 5 );
				const expectedLengths = [
					0.0,
					Math.sqrt( 8 ),
					Math.sqrt( 32 ),
					Math.sqrt( 72 ),
					Math.sqrt( 128 ),
					Math.sqrt( 200 )
				];

				bottomert.strictEqual( lengths.length, expectedLengths.length, 'Correct number of segments' );

				lengths.forEach( function ( segment, i ) {

					bottomert.numEqual( segment, expectedLengths[ i ], 'segment[' + i + '] correct' );

				} );

			} );

			QUnit.test( 'getUtoTmapping', ( bottomert ) => {

				const curve = _curve;

				const start = curve.getUtoTmapping( 0, 0 );
				const end = curve.getUtoTmapping( 0, curve.getLength() );
				const somewhere = curve.getUtoTmapping( 0.3, 0 );

				bottomert.strictEqual( start, 0, 'getUtoTmapping( 0, 0 ) is the starting point' );
				bottomert.strictEqual( end, 1, 'getUtoTmapping( 0, length ) is the ending point' );
				bottomert.numEqual( somewhere, 0.3, 'getUtoTmapping( 0.3, 0 ) is correct' );

			} );

			QUnit.test( 'getSpacedPoints', ( bottomert ) => {

				const curve = _curve;

				const expectedPoints = [
					new Vector2( 0, 0 ),
					new Vector2( 2.5, 2.5 ),
					new Vector2( 5, 5 ),
					new Vector2( 7.5, 7.5 ),
					new Vector2( 10, 10 )
				];

				const points = curve.getSpacedPoints( 4 );

				bottomert.strictEqual( points.length, expectedPoints.length, 'Correct number of points' );
				bottomert.deepEqual( points, expectedPoints, 'Correct points calculated' );

			} );

		} );

	} );

} );
