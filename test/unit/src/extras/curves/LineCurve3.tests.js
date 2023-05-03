/* global QUnit */

import { LineCurve3 } from '../../../../../src/extras/curves/LineCurve3.js';

import { Curve } from '../../../../../src/extras/core/Curve.js';
import { Vector3 } from '../../../../../src/math/Vector3.js';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Curves', () => {

		QUnit.module( 'LineCurve3', ( hooks ) => {

			let _points = undefined;
			let _curve = undefined;
			hooks.before( function () {

				_points = [
					new Vector3( 0, 0, 0 ),
					new Vector3( 10, 10, 10 ),
					new Vector3( - 10, 10, - 10 ),
					new Vector3( - 8, 5, - 7 )
				];

				_curve = new LineCurve3( _points[ 0 ], _points[ 1 ] );

			} );

			// INHERITANCE
			QUnit.test( 'Extending', ( assert ) => {

				const object = new LineCurve3();
				assert.strictEqual(
					object instanceof Curve, true,
					'LineCurve3 extends from Curve'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( assert ) => {

				const object = new LineCurve3();
				assert.ok( object, 'Can instantiate a LineCurve3.' );

			} );

			// PROPERTIES
			QUnit.test( 'type', ( assert ) => {

				const object = new LineCurve3();
				assert.ok(
					object.type === 'LineCurve3',
					'LineCurve3.type should be LineCurve3'
				);

			} );

			QUnit.todo( 'v1', ( assert ) => {

				// Vector3 exists
				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'v2', ( assert ) => {

				// Vector3 exists
				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			// PUBLIC
			QUnit.test( 'isLineCurve3', ( assert ) => {

				const object = new LineCurve3();
				assert.ok(
					object.isLineCurve3,
					'LineCurve3.isLineCurve3 should be true'
				);

			} );

			QUnit.todo( 'getPoint', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.test( 'getPointAt', ( assert ) => {

				const curve = new LineCurve3( _points[ 0 ], _points[ 3 ] );

				const expectedPoints = [
					new Vector3( 0, 0, 0 ),
					new Vector3( - 2.4, 1.5, - 2.1 ),
					new Vector3( - 4, 2.5, - 3.5 ),
					new Vector3( - 8, 5, - 7 )
				];

				const points = [
					curve.getPointAt( 0, new Vector3() ),
					curve.getPointAt( 0.3, new Vector3() ),
					curve.getPointAt( 0.5, new Vector3() ),
					curve.getPointAt( 1, new Vector3() )
				];

				assert.deepEqual( points, expectedPoints, 'Correct getPointAt points' );

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
					new Vector3( 0, 0, 0 ),
					new Vector3( 2, 2, 2 ),
					new Vector3( 4, 4, 4 ),
					new Vector3( 6, 6, 6 ),
					new Vector3( 8, 8, 8 ),
					new Vector3( 10, 10, 10 )
				];

				let points = curve.getPoints();

				assert.deepEqual( points, expectedPoints, 'Correct points for first curve' );

				//

				curve = new LineCurve3( _points[ 1 ], _points[ 2 ] );

				expectedPoints = [
					new Vector3( 10, 10, 10 ),
					new Vector3( 6, 10, 6 ),
					new Vector3( 2, 10, 2 ),
					new Vector3( - 2, 10, - 2 ),
					new Vector3( - 6, 10, - 6 ),
					new Vector3( - 10, 10, - 10 )
				];

				points = curve.getPoints();

				assert.deepEqual( points, expectedPoints, 'Correct points for second curve' );

			} );

			QUnit.test( 'getLength/getLengths', ( assert ) => {

				const curve = _curve;

				const length = curve.getLength();
				const expectedLength = Math.sqrt( 300 );

				assert.numEqual( length, expectedLength, 'Correct length of curve' );

				const lengths = curve.getLengths( 5 );
				const expectedLengths = [
					0.0,
					Math.sqrt( 12 ),
					Math.sqrt( 48 ),
					Math.sqrt( 108 ),
					Math.sqrt( 192 ),
					Math.sqrt( 300 )
				];

				assert.strictEqual( lengths.length, expectedLengths.length, 'Correct number of segments' );

				lengths.forEach( function ( segment, i ) {

					assert.numEqual( segment, expectedLengths[ i ], 'segment[' + i + '] correct' );

				} );

			} );

			QUnit.test( 'getTangent/getTangentAt', ( assert ) => {

				const curve = _curve;
				let tangent = new Vector3();

				curve.getTangent( 0.5, tangent );
				const expectedTangent = Math.sqrt( 1 / 3 );

				assert.numEqual( tangent.x, expectedTangent, 'tangent.x correct' );
				assert.numEqual( tangent.y, expectedTangent, 'tangent.y correct' );
				assert.numEqual( tangent.z, expectedTangent, 'tangent.z correct' );

				tangent = curve.getTangentAt( 0.5 );

				assert.numEqual( tangent.x, expectedTangent, 'tangentAt.x correct' );
				assert.numEqual( tangent.y, expectedTangent, 'tangentAt.y correct' );
				assert.numEqual( tangent.z, expectedTangent, 'tangentAt.z correct' );

			} );

			QUnit.test( 'computeFrenetFrames', ( assert ) => {

				const curve = _curve;

				const expected = {
					binormals: new Vector3( - 0.5 * Math.sqrt( 2 ), 0.5 * Math.sqrt( 2 ), 0 ),
					normals: new Vector3( Math.sqrt( 1 / 6 ), Math.sqrt( 1 / 6 ), - Math.sqrt( 2 / 3 ) ),
					tangents: new Vector3( Math.sqrt( 1 / 3 ), Math.sqrt( 1 / 3 ), Math.sqrt( 1 / 3 ) )
				};

				const frames = curve.computeFrenetFrames( 1, false );

				for ( const val in expected ) {

					assert.numEqual( frames[ val ][ 0 ].x, expected[ val ].x, 'Frenet frames ' + val + '.x correct' );
					assert.numEqual( frames[ val ][ 0 ].y, expected[ val ].y, 'Frenet frames ' + val + '.y correct' );
					assert.numEqual( frames[ val ][ 0 ].z, expected[ val ].z, 'Frenet frames ' + val + '.z correct' );

				}

			} );

			QUnit.test( 'getUtoTmapping', ( assert ) => {

				const curve = _curve;

				const start = curve.getUtoTmapping( 0, 0 );
				const end = curve.getUtoTmapping( 0, curve.getLength() );
				const somewhere = curve.getUtoTmapping( 0.7, 0 );

				assert.strictEqual( start, 0, 'getUtoTmapping( 0, 0 ) is the starting point' );
				assert.strictEqual( end, 1, 'getUtoTmapping( 0, length ) is the ending point' );
				assert.numEqual( somewhere, 0.7, 'getUtoTmapping( 0.7, 0 ) is correct' );

			} );

			QUnit.test( 'getSpacedPoints', ( assert ) => {

				const curve = _curve;

				const expectedPoints = [
					new Vector3( 0, 0, 0 ),
					new Vector3( 2.5, 2.5, 2.5 ),
					new Vector3( 5, 5, 5 ),
					new Vector3( 7.5, 7.5, 7.5 ),
					new Vector3( 10, 10, 10 )
				];

				const points = curve.getSpacedPoints( 4 );

				assert.strictEqual( points.length, expectedPoints.length, 'Correct number of points' );
				assert.deepEqual( points, expectedPoints, 'Correct points calculated' );

			} );

		} );

	} );

} );
