/**
 * @author zz85 / http://joshuakoo.com
 */
/* global QUnit */

import { CatmullRomCurve3 } from '../../../../../src/extras/curves/CatmullRomCurve3';
import { Vector3 } from '../../../../../src/math/Vector3';

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

			QUnit.test( "catmullrom check", function ( assert ) {

				var curve = new CatmullRomCurve3( positions );
				curve.type = 'catmullrom';

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

			QUnit.test( "chordal basic check", function ( assert ) {

				var curve = new CatmullRomCurve3( positions );

				curve.type = 'chordal';

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

			QUnit.test( "centripetal basic check", function ( assert ) {

				var curve = new CatmullRomCurve3( positions );
				curve.type = 'centripetal';

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

			QUnit.test( "closed catmullrom basic check", function ( assert ) {

				var curve = new CatmullRomCurve3( positions );
				curve.type = 'catmullrom';
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

		} );

	} );

} );
