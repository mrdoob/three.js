/* global QUnit */

import { EllipseCurve } from '../../../../../src/extras/curves/EllipseCurve.js';

import { Curve } from '../../../../../src/extras/core/Curve.js';
import { Vector2 } from '../../../../../src/math/Vector2.js';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Curves', () => {

		QUnit.module( 'EllipseCurve', ( hooks ) => {

			let curve = undefined;
			hooks.before( function () {

				curve = new EllipseCurve(
					0, 0, // ax, aY
					10, 10, // xRadius, yRadius
					0, 2 * Math.PI, // aStartAngle, aEndAngle
					false, // aClockwise
					0 // aRotation
				);

			} );

			// INHERITANCE
			QUnit.test( 'Extending', ( assert ) => {

				const object = new EllipseCurve();
				assert.strictEqual(
					object instanceof Curve, true,
					'EllipseCurve extends from Curve'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( assert ) => {

				const object = new EllipseCurve();
				assert.ok( object, 'Can instantiate an EllipseCurve.' );

			} );

			// PROPERTIES
			QUnit.test( 'type', ( assert ) => {

				const object = new EllipseCurve();
				assert.ok(
					object.type === 'EllipseCurve',
					'EllipseCurve.type should be EllipseCurve'
				);

			} );

			QUnit.todo( 'aX', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'aY', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'xRadius', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'yRadius', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'aStartAngle', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'aEndAngle', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'aClockwise', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'aRotation', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			// PUBLIC
			QUnit.test( 'isEllipseCurve', ( assert ) => {

				const object = new EllipseCurve();
				assert.ok(
					object.isEllipseCurve,
					'EllipseCurve.isEllipseCurve should be true'
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

				const expectedPoints = [
					new Vector2( 10, 0 ),
					new Vector2( 0, 10 ),
					new Vector2( - 10, 0 ),
					new Vector2( 0, - 10 ),
					new Vector2( 10, 0 )
				];

				const points = curve.getPoints( expectedPoints.length - 1 );

				assert.strictEqual( points.length, expectedPoints.length, 'Correct number of points' );

				points.forEach( function ( point, i ) {

					assert.numEqual( point.x, expectedPoints[ i ].x, 'point[' + i + '].x correct' );
					assert.numEqual( point.y, expectedPoints[ i ].y, 'point[' + i + '].y correct' );

				} );

			} );

			QUnit.test( 'getLength/getLengths', ( assert ) => {

				const length = curve.getLength();
				const expectedLength = 62.829269247282795;

				assert.numEqual( length, expectedLength, 'Correct length of curve' );

				const lengths = curve.getLengths( 5 );
				const expectedLengths = [
					0,
					11.755705045849462,
					23.51141009169892,
					35.26711513754839,
					47.02282018339785,
					58.77852522924731
				];

				assert.strictEqual( lengths.length, expectedLengths.length, 'Correct number of segments' );

				lengths.forEach( function ( segment, i ) {

					assert.numEqual( segment, expectedLengths[ i ], 'segment[' + i + '] correct' );

				} );

			} );

			QUnit.test( 'getPoint/getPointAt', ( assert ) => {

				const testValues = [ 0, 0.3, 0.5, 0.7, 1 ];

				const p = new Vector2();
				const a = new Vector2();

				testValues.forEach( function ( val ) {

					const expectedX = Math.cos( val * Math.PI * 2 ) * 10;
					const expectedY = Math.sin( val * Math.PI * 2 ) * 10;

					curve.getPoint( val, p );
					curve.getPointAt( val, a );

					assert.numEqual( p.x, expectedX, 'getPoint(' + val + ').x correct' );
					assert.numEqual( p.y, expectedY, 'getPoint(' + val + ').y correct' );

					assert.numEqual( a.x, expectedX, 'getPointAt(' + val + ').x correct' );
					assert.numEqual( a.y, expectedY, 'getPointAt(' + val + ').y correct' );

				} );

			} );

			QUnit.test( 'getTangent', ( assert ) => {

				const expectedTangents = [
					new Vector2( - 0.000314159260186071, 0.9999999506519786 ),
					new Vector2( - 1, 0 ),
					new Vector2( 0, - 1 ),
					new Vector2( 1, 0 ),
					new Vector2( 0.00031415926018600165, 0.9999999506519784 )
				];

				const tangents = [
					curve.getTangent( 0, new Vector2() ),
					curve.getTangent( 0.25, new Vector2() ),
					curve.getTangent( 0.5, new Vector2() ),
					curve.getTangent( 0.75, new Vector2() ),
					curve.getTangent( 1, new Vector2() )
				];

				expectedTangents.forEach( function ( exp, i ) {

					const tangent = tangents[ i ];

					assert.numEqual( tangent.x, exp.x, 'getTangent #' + i + ': x correct' );
					assert.numEqual( tangent.y, exp.y, 'getTangent #' + i + ': y correct' );

				} );

			} );

			QUnit.test( 'getUtoTmapping', ( assert ) => {

				const start = curve.getUtoTmapping( 0, 0 );
				const end = curve.getUtoTmapping( 0, curve.getLength() );
				const somewhere = curve.getUtoTmapping( 0.7, 1 );

				const expectedSomewhere = 0.01591614882650014;

				assert.strictEqual( start, 0, 'getUtoTmapping( 0, 0 ) is the starting point' );
				assert.strictEqual( end, 1, 'getUtoTmapping( 0, length ) is the ending point' );
				assert.numEqual( somewhere, expectedSomewhere, 'getUtoTmapping( 0.7, 1 ) is correct' );

			} );

			QUnit.test( 'getSpacedPoints', ( assert ) => {

				const expectedPoints = [
					new Vector2( 10, 0 ),
					new Vector2( 3.0901699437494603, 9.51056516295154 ),
					new Vector2( - 8.090169943749492, 5.877852522924707 ),
					new Vector2( - 8.090169943749459, - 5.877852522924751 ),
					new Vector2( 3.0901699437494807, - 9.510565162951533 ),
					new Vector2( 10, - 2.4492935982947065e-15 )
				];

				const points = curve.getSpacedPoints();

				assert.strictEqual( points.length, expectedPoints.length, 'Correct number of points' );

				expectedPoints.forEach( function ( exp, i ) {

					const point = points[ i ];

					assert.numEqual( point.x, exp.x, 'Point #' + i + ': x correct' );
					assert.numEqual( point.y, exp.y, 'Point #' + i + ': y correct' );

				} );

			} );

		} );

	} );

} );
