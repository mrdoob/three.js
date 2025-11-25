/* global QUnit */

import { SplineHelper } from '../../../../examples/jsm/helpers/SplineHelper.js';

import { Line } from '../../../../src/objects/Line.js';
import { CatmullRomCurve3 } from '../../../../src/extras/curves/CatmullRomCurve3.js';
import { Vector3 } from '../../../../src/math/Vector3.js';

export default QUnit.module( 'Helpers', () => {

	QUnit.module( 'SplineHelper', () => {

		const points = [
			new Vector3( 0, 0, 0 ),
			new Vector3( 10, 5, 0 ),
			new Vector3( 20, 0, 0 )
		];

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const curve = new CatmullRomCurve3( points );
			const helper = new SplineHelper( curve );

			// Note: instanceof checks don't work for addons since they import from 'three' bundle
			// while tests import from source. Check for Line-like properties instead.
			assert.ok( helper.isLine, 'SplineHelper has isLine property' );
			assert.ok( helper.geometry, 'SplineHelper has geometry property' );
			assert.ok( helper.material, 'SplineHelper has material property' );

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const curve = new CatmullRomCurve3( points );
			const helper = new SplineHelper( curve );

			assert.ok( helper, 'Can instantiate a SplineHelper' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const curve = new CatmullRomCurve3( points );
			const helper = new SplineHelper( curve );

			assert.strictEqual(
				helper.type, 'SplineHelper',
				'SplineHelper.type should be SplineHelper'
			);

		} );

		QUnit.test( 'curve', ( assert ) => {

			const curve = new CatmullRomCurve3( points );
			const helper = new SplineHelper( curve );

			assert.strictEqual( helper.curve, curve, 'curve property is set correctly' );

		} );

		QUnit.test( 'pointsCount', ( assert ) => {

			const curve = new CatmullRomCurve3( points );
			const helper = new SplineHelper( curve, 50 );

			assert.strictEqual( helper.pointsCount, 50, 'pointsCount is set correctly' );

		} );

		QUnit.test( 'pointsCount default', ( assert ) => {

			const curve = new CatmullRomCurve3( points );
			const helper = new SplineHelper( curve );

			assert.strictEqual( helper.pointsCount, 100, 'pointsCount defaults to 100' );

		} );

		QUnit.test( 'geometry is created', ( assert ) => {

			const curve = new CatmullRomCurve3( points );
			const helper = new SplineHelper( curve, 50 );

			assert.ok( helper.geometry, 'geometry exists' );
			assert.ok( helper.geometry.attributes.position, 'geometry has position attribute' );

		} );

		QUnit.test( 'geometry has correct point count', ( assert ) => {

			const curve = new CatmullRomCurve3( points );
			const helper = new SplineHelper( curve, 50 );

			const positionCount = helper.geometry.attributes.position.count;
			// getPoints returns pointsCount + 1 points for open curves
			assert.ok( positionCount >= 50, 'geometry has expected number of points' );

		} );

		QUnit.test( 'material is created', ( assert ) => {

			const curve = new CatmullRomCurve3( points );
			const helper = new SplineHelper( curve );

			assert.ok( helper.material, 'material exists' );
			assert.strictEqual( helper.material.toneMapped, false, 'material has toneMapped set to false' );

		} );

		QUnit.test( 'material color', ( assert ) => {

			const curve = new CatmullRomCurve3( points );
			const helper = new SplineHelper( curve, 100, 0xff0000 );

			assert.strictEqual( helper.material.color.getHex(), 0xff0000, 'material color is set correctly' );

		} );

		// METHODS
		QUnit.test( 'update', ( assert ) => {

			const curve = new CatmullRomCurve3( points );
			const helper = new SplineHelper( curve, 50 );

			// Modify the curve
			curve.points[ 0 ].x = 100;

			// Update should not throw
			helper.update();

			assert.ok( true, 'update() completes without error' );

		} );

		QUnit.test( 'update returns this', ( assert ) => {

			const curve = new CatmullRomCurve3( points );
			const helper = new SplineHelper( curve );

			const result = helper.update();

			assert.strictEqual( result, helper, 'update() returns this for chaining' );

		} );

		QUnit.test( 'dispose', ( assert ) => {

			const curve = new CatmullRomCurve3( points );
			const helper = new SplineHelper( curve );

			// Should not throw
			helper.dispose();

			assert.ok( true, 'dispose() does not throw' );

		} );

	} );

} );
