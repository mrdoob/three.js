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
			QUnit.test( 'Extending', ( assert ) => {

				const object = new LineCurve();
				assert.strictEqual(
					object instanceof Curve, true,
					'LineCurve extends from Curve'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( assert ) => {

				const object = new LineCurve();
				assert.ok( object, 'Can instantiate a LineCurve.' );

			} );

			// PROPERTIES
			QUnit.test( 'type', ( assert ) => {

				const object = new LineCurve();
				assert.ok(
					object.type === 'LineCurve',
					'LineCurve.type should be LineCurve'
				);

			} );

			QUnit.todo( 'v1', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'v2', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			// PUBLIC
			QUnit.test( 'isLineCurve', ( assert ) => {

				const object = new LineCurve();
				assert.ok(
					object.isLineCurve,
					'LineCurve.isLineCurve should be true'
				);

			} );

			QUnit.todo( 'getPoint', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.test( 'getPointAt', ( assert ) => {

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

				assert.deepEqual( points, expectedPoints, 'Correct points' );

			} );

			QUnit.test( 'getTangent/getTangentAt', ( assert ) => {

				const curve = _curve;
				const tangent = new Vector2();

				curve.getTangent( 0, tangent );
				const expectedTangent = Math.sqrt( 0.5 );

				assert.numEqual( tangent.x, expectedTangent, 'tangent.x correct' );
				assert.numEqual( tangent.y, expectedTangent, 'tangent.y correct' );

				curve.getTangentAt( 0, tangent );

				assert.numEqual( tangent.x, expectedTangent, 'tangentAt.x correct' );
				assert.numEqual( tangent.y, expectedTangent, 'tangentAt.y correct' );

			} );

			QUnit.todo( 'copy', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'toJSON', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'fromJSON', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			// OTHERS
			QUnit.test( 'Simple curve', ( assert ) => {

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

				assert.deepEqual( points, expectedPoints, 'Correct points for first curve' );

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

				assert.deepEqual( points, expectedPoints, 'Correct points for second curve' );

			} );

			QUnit.test( 'getLength/getLengths', ( assert ) => {

				const curve = _curve;

				const length = curve.getLength();
				const expectedLength = Math.sqrt( 200 );

				assert.numEqual( length, expectedLength, 'Correct length of curve' );

				const lengths = curve.getLengths( 5 );
				const expectedLengths = [
					0.0,
					Math.sqrt( 8 ),
					Math.sqrt( 32 ),
					Math.sqrt( 72 ),
					Math.sqrt( 128 ),
					Math.sqrt( 200 )
				];

				assert.strictEqual( lengths.length, expectedLengths.length, 'Correct number of segments' );

				lengths.forEach( function ( segment, i ) {

					assert.numEqual( segment, expectedLengths[ i ], 'segment[' + i + '] correct' );

				} );

			} );

			QUnit.test( 'getUtoTmapping', ( assert ) => {

				const curve = _curve;

				const start = curve.getUtoTmapping( 0, 0 );
				const end = curve.getUtoTmapping( 0, curve.getLength() );
				const somewhere = curve.getUtoTmapping( 0.3, 0 );

				assert.strictEqual( start, 0, 'getUtoTmapping( 0, 0 ) is the starting point' );
				assert.strictEqual( end, 1, 'getUtoTmapping( 0, length ) is the ending point' );
				assert.numEqual( somewhere, 0.3, 'getUtoTmapping( 0.3, 0 ) is correct' );

			} );

			QUnit.test( 'getSpacedPoints', ( assert ) => {

				const curve = _curve;

				const expectedPoints = [
					new Vector2( 0, 0 ),
					new Vector2( 2.5, 2.5 ),
					new Vector2( 5, 5 ),
					new Vector2( 7.5, 7.5 ),
					new Vector2( 10, 10 )
				];

				const points = curve.getSpacedPoints( 4 );

				assert.strictEqual( points.length, expectedPoints.length, 'Correct number of points' );
				assert.deepEqual( points, expectedPoints, 'Correct points calculated' );

			} );

		} );

	} );

} );
