/* global QUnit */

import { SplineCurve } from '../../../../../src/extras/curves/SplineCurve.js';

import { Curve } from '../../../../../src/extras/core/Curve.js';
import { Vector2 } from '../../../../../src/math/Vector2.js';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Curves', () => {

		QUnit.module( 'SplineCurve', ( hooks ) => {

			let _curve = undefined;
			hooks.before( function () {

				_curve = new SplineCurve( [
					new Vector2( - 10, 0 ),
					new Vector2( - 5, 5 ),
					new Vector2( 0, 0 ),
					new Vector2( 5, - 5 ),
					new Vector2( 10, 0 )
				] );

			} );

			// INHERITANCE
			QUnit.test( 'Extending', ( assert ) => {

				const object = new SplineCurve();
				assert.strictEqual(
					object instanceof Curve, true,
					'SplineCurve extends from Curve'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( assert ) => {

				const object = new SplineCurve();
				assert.ok( object, 'Can instantiate a SplineCurve.' );

			} );

			// PROPERTIES
			QUnit.test( 'type', ( assert ) => {

				const object = new SplineCurve();
				assert.ok(
					object.type === 'SplineCurve',
					'SplineCurve.type should be SplineCurve'
				);

			} );

			QUnit.todo( 'points', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			// PUBLIC
			QUnit.test( 'isSplineCurve', ( assert ) => {

				const object = new SplineCurve();
				assert.ok(
					object.isSplineCurve,
					'SplineCurve.isSplineCurve should be true'
				);

			} );

			QUnit.todo( 'getPoint', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

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

				const curve = _curve;

				const expectedPoints = [
					new Vector2( - 10, 0 ),
					new Vector2( - 6.08, 4.56 ),
					new Vector2( - 2, 2.48 ),
					new Vector2( 2, - 2.48 ),
					new Vector2( 6.08, - 4.56 ),
					new Vector2( 10, 0 )
				];

				let points = curve.getPoints( 5 );

				assert.strictEqual( points.length, expectedPoints.length, '1st: Correct number of points' );

				points.forEach( function ( point, i ) {

					assert.numEqual( point.x, expectedPoints[ i ].x, 'points[' + i + '].x' );
					assert.numEqual( point.y, expectedPoints[ i ].y, 'points[' + i + '].y' );

				} );

				//

				points = curve.getPoints( 4 );

				assert.deepEqual( points, curve.points, '2nd: Returned points are identical to control points' );

			} );

			QUnit.test( 'getLength/getLengths', ( assert ) => {

				const curve = _curve;

				const length = curve.getLength();
				const expectedLength = 28.876950901868135;

				assert.numEqual( length, expectedLength, 'Correct length of curve' );

				const expectedLengths = [
					0.0,
					Math.sqrt( 50 ),
					Math.sqrt( 200 ),
					Math.sqrt( 450 ),
					Math.sqrt( 800 )
				];

				const lengths = curve.getLengths( 4 );

				assert.deepEqual( lengths, expectedLengths, 'Correct segment lengths' );

			} );

			QUnit.test( 'getPointAt', ( assert ) => {

				const curve = _curve;
				const point = new Vector2();

				assert.ok( curve.getPointAt( 0, point ).equals( curve.points[ 0 ] ), 'PointAt 0.0 correct' );
				assert.ok( curve.getPointAt( 1, point ).equals( curve.points[ 4 ] ), 'PointAt 1.0 correct' );

				curve.getPointAt( 0.5, point );

				assert.numEqual( point.x, 0.0, 'PointAt 0.5 x correct' );
				assert.numEqual( point.y, 0.0, 'PointAt 0.5 y correct' );

			} );

			QUnit.test( 'getTangent', ( assert ) => {

				const curve = _curve;

				const expectedTangent = [
					new Vector2( 0.7068243340243188, 0.7073891155729485 ), // 0
					new Vector2( 0.7069654305325396, - 0.7072481035902046 ), // 0.5
					new Vector2( 0.7068243340245123, 0.7073891155727552 ) // 1
				];

				const tangents = [
					curve.getTangent( 0, new Vector2() ),
					curve.getTangent( 0.5, new Vector2() ),
					curve.getTangent( 1, new Vector2() )
				];

				tangents.forEach( function ( tangent, i ) {

					assert.numEqual( tangent.x, expectedTangent[ i ].x, 'tangent[' + i + '].x' );
					assert.numEqual( tangent.y, expectedTangent[ i ].y, 'tangent[' + i + '].y' );

				} );

			} );

			QUnit.test( 'getUtoTmapping', ( assert ) => {

				const curve = _curve;

				const start = curve.getUtoTmapping( 0, 0 );
				const end = curve.getUtoTmapping( 0, curve.getLength() );
				const middle = curve.getUtoTmapping( 0.5, 0 );

				assert.strictEqual( start, 0, 'getUtoTmapping( 0, 0 ) is the starting point' );
				assert.strictEqual( end, 1, 'getUtoTmapping( 0, length ) is the ending point' );
				assert.numEqual( middle, 0.5, 'getUtoTmapping( 0.5, 0 ) is the middle' );

			} );

			QUnit.test( 'getSpacedPoints', ( assert ) => {

				const curve = _curve;

				const expectedPoints = [
					new Vector2( - 10, 0 ),
					new Vector2( - 4.996509634683014, 4.999995128640857 ),
					new Vector2( 0, 0 ),
					new Vector2( 4.996509634683006, - 4.999995128640857 ),
					new Vector2( 10, 0 )
				];

				const points = curve.getSpacedPoints( 4 );

				assert.strictEqual( points.length, expectedPoints.length, 'Correct number of points' );

				points.forEach( function ( point, i ) {

					assert.numEqual( point.x, expectedPoints[ i ].x, 'points[' + i + '].x' );
					assert.numEqual( point.y, expectedPoints[ i ].y, 'points[' + i + '].y' );

				} );

			} );

		} );

	} );

} );
