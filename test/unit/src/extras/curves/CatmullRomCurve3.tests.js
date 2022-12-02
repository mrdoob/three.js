/* global QUnit */

import { CatmullRomCurve3 } from '../../../../../src/extras/curves/CatmullRomCurve3.js';
import { Vector3 } from '../../../../../src/math/Vector3.js';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Curves', () => {

		QUnit.module( 'CatmullRomCurve3', () => {

			/* eslint-disable */
			var positions = [
				new Vector3( - 60, - 100,   60 ),
				new Vector3( - 60,    20,   60 ),
				new Vector3( - 60,   120,   60 ),
				new Vector3(   60,    20, - 60 ),
				new Vector3(   60, - 100, - 60 )
			];
			/* eslint-enable */

			// INHERITANCE
			QUnit.todo( 'Extending', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			// INSTANCING
			QUnit.todo( 'Instancing', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			// PUBLIC STUFF
			QUnit.todo( 'isCatmullRomCurve3', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'getPoint', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			// OTHERS
			QUnit.test( 'catmullrom check', ( assert ) => {

				var curve = new CatmullRomCurve3( positions );
				curve.curveType = 'catmullrom';

				var expectedPoints = [

					new Vector3( - 60, - 100, 60 ),
					new Vector3( - 60, - 51.04, 60 ),
					new Vector3( - 60, - 2.7199999999999998, 60 ),
					new Vector3( - 61.92, 44.48, 61.92 ),
					new Vector3( - 68.64, 95.36000000000001, 68.64 ),
					new Vector3( - 60, 120, 60 ),
					new Vector3( - 14.880000000000017, 95.36000000000001, 14.880000000000017 ),
					new Vector3( 41.75999999999997, 44.48000000000003, - 41.75999999999997 ),
					new Vector3( 67.68, - 2.720000000000023, - 67.68 ),
					new Vector3( 65.75999999999999, - 51.04000000000001, - 65.75999999999999 ),
					new Vector3( 60, - 100, - 60 )

				];

				var points = curve.getPoints( 10 );

				assert.equal( points.length, expectedPoints.length, 'correct number of points.' );

				points.forEach( function ( point, i ) {

					assert.numEqual( point.x, expectedPoints[ i ].x, 'points[' + i + '].x' );
					assert.numEqual( point.y, expectedPoints[ i ].y, 'points[' + i + '].y' );
					assert.numEqual( point.z, expectedPoints[ i ].z, 'points[' + i + '].z' );

				} );

			} );

			QUnit.test( 'chordal basic check', ( assert ) => {

				var curve = new CatmullRomCurve3( positions );

				curve.curveType = 'chordal';

				var expectedPoints = [
					new Vector3( - 60, - 100, 60 ),
					new Vector3( - 60, - 52, 60 ),
					new Vector3( - 60, - 4, 60 ),
					new Vector3( - 60.656435889910924, 41.62455386421379, 60.656435889910924 ),
					new Vector3( - 62.95396150459915, 87.31049238896205, 62.95396150459915 ),
					new Vector3( - 60, 120, 60 ),
					new Vector3( - 16.302568199486444, 114.1500463116312, 16.302568199486444 ),
					new Vector3( 42.998098664956586, 54.017050116427455, - 42.998098664956586 ),
					new Vector3( 63.542500175682434, - 1.137153397546383, - 63.542500175682434 ),
					new Vector3( 62.65687513176183, - 49.85286504815978, - 62.65687513176183 ),
					new Vector3( 60.00000000000001, - 100, - 60.00000000000001 )
				];

				var points = curve.getPoints( 10 );

				assert.equal( points.length, expectedPoints.length, 'correct number of points.' );

				points.forEach( function ( point, i ) {

					assert.numEqual( point.x, expectedPoints[ i ].x, 'points[' + i + '].x' );
					assert.numEqual( point.y, expectedPoints[ i ].y, 'points[' + i + '].y' );
					assert.numEqual( point.z, expectedPoints[ i ].z, 'points[' + i + '].z' );

				} );

			} );

			QUnit.test( 'centripetal basic check', ( assert ) => {

				var curve = new CatmullRomCurve3( positions );
				curve.curveType = 'centripetal';

				var expectedPoints = [
					new Vector3( - 60, - 100, 60 ),
					new Vector3( - 60, - 51.47527724919028, 60 ),
					new Vector3( - 60, - 3.300369665587032, 60 ),
					new Vector3( - 61.13836565863938, 42.86306307781241, 61.13836565863938 ),
					new Vector3( - 65.1226454638772, 90.69743905511538, 65.1226454638772 ),
					new Vector3( - 60, 120, 60 ),
					new Vector3( - 15.620412575504497, 103.10790870179872, 15.620412575504497 ),
					new Vector3( 42.384384731047874, 48.35477686933143, - 42.384384731047874 ),
					new Vector3( 65.25545512241153, - 1.646250966068339, - 65.25545512241153 ),
					new Vector3( 63.94159134180865, - 50.234688224551256, - 63.94159134180865 ),
					new Vector3( 59.99999999999999, - 100, - 59.99999999999999 ),
				];

				var points = curve.getPoints( 10 );

				assert.equal( points.length, expectedPoints.length, 'correct number of points.' );

				points.forEach( function ( point, i ) {

					assert.numEqual( point.x, expectedPoints[ i ].x, 'points[' + i + '].x' );
					assert.numEqual( point.y, expectedPoints[ i ].y, 'points[' + i + '].y' );
					assert.numEqual( point.z, expectedPoints[ i ].z, 'points[' + i + '].z' );

				} );

			} );

			QUnit.test( 'closed catmullrom basic check', ( assert ) => {

				var curve = new CatmullRomCurve3( positions );
				curve.curveType = 'catmullrom';
				curve.closed = true;

				var expectedPoints = [
					new Vector3( - 60, - 100, 60 ),
					new Vector3( - 67.5, - 46.25, 67.5 ),
					new Vector3( - 60, 20, 60 ),
					new Vector3( - 67.5, 83.75, 67.5 ),
					new Vector3( - 60, 120, 60 ),
					new Vector3( 0, 83.75, 0 ),
					new Vector3( 60, 20, - 60 ),
					new Vector3( 75, - 46.25, - 75 ),
					new Vector3( 60, - 100, - 60 ),
					new Vector3( 0, - 115, 0 ),
					new Vector3( - 60, - 100, 60 ),
				];

				var points = curve.getPoints( 10 );

				assert.equal( points.length, expectedPoints.length, 'correct number of points.' );

				points.forEach( function ( point, i ) {

					assert.numEqual( point.x, expectedPoints[ i ].x, 'points[' + i + '].x' );
					assert.numEqual( point.y, expectedPoints[ i ].y, 'points[' + i + '].y' );
					assert.numEqual( point.z, expectedPoints[ i ].z, 'points[' + i + '].z' );

				} );

			} );

			//
			// curve.type = 'catmullrom'; only from here on
			//
			QUnit.test( 'getLength/getLengths', ( assert ) => {

				var curve = new CatmullRomCurve3( positions );
				curve.curveType = 'catmullrom';

				var length = curve.getLength();
				var expectedLength = 551.549686276872;

				assert.numEqual( length, expectedLength, 'Correct length of curve' );

				var expectedLengths = [
					0,
					120,
					220,
					416.9771560359221,
					536.9771560359221
				];
				var lengths = curve.getLengths( expectedLengths.length - 1 );

				assert.strictEqual( lengths.length, expectedLengths.length, 'Correct number of segments' );

				lengths.forEach( function ( segment, i ) {

					assert.numEqual( segment, expectedLengths[ i ], 'segment[' + i + '] correct' );

				} );

			} );

			QUnit.test( 'getPointAt', ( assert ) => {

				var curve = new CatmullRomCurve3( positions );
				curve.curveType = 'catmullrom';

				var expectedPoints = [
					new Vector3( - 60, - 100, 60 ),
					new Vector3( - 64.84177333183106, 64.86956465359813, 64.84177333183106 ),
					new Vector3( - 28.288507045700854, 104.83101184518996, 28.288507045700854 ),
					new Vector3( 60, - 100, - 60 )
				];

				var points = [
					curve.getPointAt( 0, new Vector3() ),
					curve.getPointAt( 0.3, new Vector3() ),
					curve.getPointAt( 0.5, new Vector3() ),
					curve.getPointAt( 1, new Vector3() )
				];

				assert.deepEqual( points, expectedPoints, 'Correct points' );

			} );

			QUnit.test( 'getTangent/getTangentAt', ( assert ) => {

				var curve = new CatmullRomCurve3( positions );
				curve.curveType = 'catmullrom';

				var expectedTangents = [
					new Vector3( 0, 1, 0 ),
					new Vector3( - 0.0001090274561657922, 0.9999999881130137, 0.0001090274561657922 ),
					new Vector3( 0.7071067811865475, - 2.0930381713877622e-13, - 0.7071067811865475 ),
					new Vector3( 0.43189437062802816, - 0.7917919583070032, - 0.43189437062802816 ),
					new Vector3( - 0.00019991333100812723, - 0.9999999600346592, 0.00019991333100812723 )
				];

				var tangents = [
					curve.getTangent( 0, new Vector3() ),
					curve.getTangent( 0.25, new Vector3() ),
					curve.getTangent( 0.5, new Vector3() ),
					curve.getTangent( 0.75, new Vector3() ),
					curve.getTangent( 1, new Vector3() )
				];

				expectedTangents.forEach( function ( exp, i ) {

					var tangent = tangents[ i ];

					assert.numEqual( tangent.x, exp.x, 'getTangent #' + i + ': x correct' );
					assert.numEqual( tangent.y, exp.y, 'getTangent #' + i + ': y correct' );

				} );

				//

				expectedTangents = [
					new Vector3( 0, 1, 0 ),
					new Vector3( - 0.10709018822205997, 0.9884651653817284, 0.10709018822205997 ),
					new Vector3( 0.6396363672964268, - 0.4262987629159402, - 0.6396363672964268 ),
					new Vector3( 0.5077298411616501, - 0.6960034603275557, - 0.5077298411616501 ),
					new Vector3( - 0.00019991333100812723, - 0.9999999600346592, 0.00019991333100812723 )
				];

				tangents = [
					curve.getTangentAt( 0, new Vector3() ),
					curve.getTangentAt( 0.25, new Vector3() ),
					curve.getTangentAt( 0.5, new Vector3() ),
					curve.getTangentAt( 0.75, new Vector3() ),
					curve.getTangentAt( 1, new Vector3() )
				];

				expectedTangents.forEach( function ( exp, i ) {

					var tangent = tangents[ i ];

					assert.numEqual( tangent.x, exp.x, 'getTangentAt #' + i + ': x correct' );
					assert.numEqual( tangent.y, exp.y, 'getTangentAt #' + i + ': y correct' );

				} );

			} );

			QUnit.test( 'computeFrenetFrames', ( assert ) => {

				var curve = new CatmullRomCurve3( positions );
				curve.curveType = 'catmullrom';

				var expected = {
					binormals: [
						new Vector3( - 1, 0, 0 ),
						new Vector3( - 0.28685061854203, 0.6396363672964267, - 0.7131493814579701 ),
						new Vector3( - 1.9982670528160395e-8, - 0.0001999133310081272, - 0.9999999800173295 )
					],
					normals: [
						new Vector3( 0, 0, - 1 ),
						new Vector3( - 0.7131493814579699, - 0.6396363672964268, - 0.2868506185420297 ),
						new Vector3( - 0.9999999800173294, 0.00019991333100810582, - 1.99826701852146e-8 )
					],
					tangents: [
						new Vector3( 0, 1, 0 ),
						new Vector3( 0.6396363672964269, - 0.4262987629159403, - 0.6396363672964269 ),
						new Vector3( - 0.0001999133310081273, - 0.9999999600346594, 0.0001999133310081273 )
					]
				};

				var frames = curve.computeFrenetFrames( 2, false );

				Object.keys( expected ).forEach( function ( group, i ) {

					expected[ group ].forEach( function ( vec, j ) {

						assert.numEqual( frames[ group ][ j ].x, vec.x, 'Frenet frames [' + i + ', ' + j + '].x correct' );
						assert.numEqual( frames[ group ][ j ].y, vec.y, 'Frenet frames [' + i + ', ' + j + '].y correct' );
						assert.numEqual( frames[ group ][ j ].z, vec.z, 'Frenet frames [' + i + ', ' + j + '].z correct' );

					} );

				} );

			} );

			QUnit.test( 'getUtoTmapping', ( assert ) => {

				var curve = new CatmullRomCurve3( positions );
				curve.curveType = 'catmullrom';

				var start = curve.getUtoTmapping( 0, 0 );
				var end = curve.getUtoTmapping( 0, curve.getLength() );
				var somewhere = curve.getUtoTmapping( 0.5, 500 );

				var expectedSomewhere = 0.8964116382083199;

				assert.strictEqual( start, 0, 'getUtoTmapping( 0, 0 ) is the starting point' );
				assert.strictEqual( end, 1, 'getUtoTmapping( 0, length ) is the ending point' );
				assert.numEqual( somewhere, expectedSomewhere, 'getUtoTmapping( 0.5, 500 ) is correct' );

			} );

			QUnit.test( 'getSpacedPoints', ( assert ) => {

				var curve = new CatmullRomCurve3( positions );
				curve.curveType = 'catmullrom';

				var expectedPoints = [
					new Vector3( - 60, - 100, 60 ),
					new Vector3( - 60, 10.311489426555056, 60 ),
					new Vector3( - 65.05889864636504, 117.99691802595966, 65.05889864636504 ),
					new Vector3( 6.054276900088592, 78.7153118386369, - 6.054276900088592 ),
					new Vector3( 64.9991491385602, 8.386980812799566, - 64.9991491385602 ),
					new Vector3( 60, - 100, - 60 )
				];

				var points = curve.getSpacedPoints();

				assert.strictEqual( points.length, expectedPoints.length, 'Correct number of points' );
				assert.deepEqual( points, expectedPoints, 'Correct points calculated' );

			} );

		} );

	} );

} );
