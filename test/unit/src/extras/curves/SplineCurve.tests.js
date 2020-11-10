/* global QUnit */

import { SplineCurve } from '../../../../../src/extras/curves/SplineCurve';
import { Vector2 } from '../../../../../src/math/Vector2';

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
			QUnit.todo( "Extending", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

			// INSTANCING
			QUnit.todo( "Instancing", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

			// PUBLIC STUFF
			QUnit.todo( "isSplineCurve", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

			QUnit.todo( "getPoint", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

			// OTHERS
			QUnit.test( "Simple curve", ( assert ) => {

				var curve = _curve;

				var expectedPoints = [
					new Vector2( - 10, 0 ),
					new Vector2( - 6.08, 4.56 ),
					new Vector2( - 2, 2.48 ),
					new Vector2( 2, - 2.48 ),
					new Vector2( 6.08, - 4.56 ),
					new Vector2( 10, 0 )
				];

				var points = curve.getPoints( 5 );

				assert.strictEqual( points.length, expectedPoints.length, "1st: Correct number of points" );

				points.forEach( function ( point, i ) {

					assert.numEqual( point.x, expectedPoints[ i ].x, "points[" + i + "].x" );
					assert.numEqual( point.y, expectedPoints[ i ].y, "points[" + i + "].y" );

				} );

				//

				points = curve.getPoints( 4 );

				assert.deepEqual( points, curve.points, "2nd: Returned points are identical to control points" );

			} );

			QUnit.test( "getLength/getLengths", ( assert ) => {

				var curve = _curve;

				var length = curve.getLength();
				var expectedLength = 28.876950901868135;

				assert.numEqual( length, expectedLength, "Correct length of curve" );

				var expectedLengths = [
					0.0,
					Math.sqrt( 50 ),
					Math.sqrt( 200 ),
					Math.sqrt( 450 ),
					Math.sqrt( 800 )
				];

				var lengths = curve.getLengths( 4 );

				assert.deepEqual( lengths, expectedLengths, "Correct segment lengths" );

			} );

			QUnit.test( "getPointAt", ( assert ) => {

				var curve = _curve;
				var point = new Vector2();

				assert.ok( curve.getPointAt( 0, point ).equals( curve.points[ 0 ] ), "PointAt 0.0 correct" );
				assert.ok( curve.getPointAt( 1, point ).equals( curve.points[ 4 ] ), "PointAt 1.0 correct" );

				curve.getPointAt( 0.5, point );

				assert.numEqual( point.x, 0.0, "PointAt 0.5 x correct" );
				assert.numEqual( point.y, 0.0, "PointAt 0.5 y correct" );

			} );

			QUnit.test( "getTangent", ( assert ) => {

				var curve = _curve;

				var expectedTangent = [
					new Vector2( 0.7068243340243188, 0.7073891155729485 ), // 0
					new Vector2( 0.7069654305325396, - 0.7072481035902046 ), // 0.5
					new Vector2( 0.7068243340245123, 0.7073891155727552 ) // 1
				];

				var tangents = [
					curve.getTangent( 0, new Vector2() ),
					curve.getTangent( 0.5, new Vector2() ),
					curve.getTangent( 1, new Vector2() )
				];

				tangents.forEach( function ( tangent, i ) {

					assert.numEqual( tangent.x, expectedTangent[ i ].x, "tangent[" + i + "].x" );
					assert.numEqual( tangent.y, expectedTangent[ i ].y, "tangent[" + i + "].y" );

				} );

			} );

			QUnit.test( "getUtoTmapping", ( assert ) => {

				var curve = _curve;

				var start = curve.getUtoTmapping( 0, 0 );
				var end = curve.getUtoTmapping( 0, curve.getLength() );
				var middle = curve.getUtoTmapping( 0.5, 0 );

				assert.strictEqual( start, 0, "getUtoTmapping( 0, 0 ) is the starting point" );
				assert.strictEqual( end, 1, "getUtoTmapping( 0, length ) is the ending point" );
				assert.numEqual( middle, 0.5, "getUtoTmapping( 0.5, 0 ) is the middle" );

			} );

			QUnit.test( "getSpacedPoints", ( assert ) => {

				var curve = _curve;

				var expectedPoints = [
					new Vector2( - 10, 0 ),
					new Vector2( - 4.996509634683014, 4.999995128640857 ),
					new Vector2( 0, 0 ),
					new Vector2( 4.996509634683006, - 4.999995128640857 ),
					new Vector2( 10, 0 )
				];

				var points = curve.getSpacedPoints( 4 );

				assert.strictEqual( points.length, expectedPoints.length, "Correct number of points" );

				points.forEach( function ( point, i ) {

					assert.numEqual( point.x, expectedPoints[ i ].x, "points[" + i + "].x" );
					assert.numEqual( point.y, expectedPoints[ i ].y, "points[" + i + "].y" );

				} );

			} );

		} );

	} );

} );
