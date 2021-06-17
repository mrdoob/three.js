/* global QUnit */

import * as MathUtils from '../../../../src/math/MathUtils';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Math', () => {

		// PUBLIC STUFF
		QUnit.test( 'generateUUID', ( assert ) => {

			var a = MathUtils.generateUUID();
			var regex = /[A-Z0-9]{8}-[A-Z0-9]{4}-4[A-Z0-9]{3}-[A-Z0-9]{4}-[A-Z0-9]{12}/i;
			// note the fixed '4' here ----------^

			assert.ok( regex.test( a ), 'Generated UUID matches the expected pattern' );

		} );

		QUnit.test( 'clamp', ( assert ) => {

			assert.strictEqual( MathUtils.clamp( 0.5, 0, 1 ), 0.5, 'Value already within limits' );
			assert.strictEqual( MathUtils.clamp( 0, 0, 1 ), 0, 'Value equal to one limit' );
			assert.strictEqual( MathUtils.clamp( - 0.1, 0, 1 ), 0, 'Value too low' );
			assert.strictEqual( MathUtils.clamp( 1.1, 0, 1 ), 1, 'Value too high' );

		} );

		QUnit.test( 'euclideanModulo', ( assert ) => {

			assert.ok( isNaN( MathUtils.euclideanModulo( 6, 0 ) ), 'Division by zero returns NaN' );
			assert.strictEqual( MathUtils.euclideanModulo( 6, 1 ), 0, 'Divison by trivial divisor' );
			assert.strictEqual( MathUtils.euclideanModulo( 6, 2 ), 0, 'Divison by non-trivial divisor' );
			assert.strictEqual( MathUtils.euclideanModulo( 6, 5 ), 1, 'Divison by itself - 1' );
			assert.strictEqual( MathUtils.euclideanModulo( 6, 6 ), 0, 'Divison by itself' );
			assert.strictEqual( MathUtils.euclideanModulo( 6, 7 ), 6, 'Divison by itself + 1' );

		} );

		QUnit.test( 'mapLinear', ( assert ) => {

			assert.strictEqual( MathUtils.mapLinear( 0.5, 0, 1, 0, 10 ), 5, 'Value within range' );
			assert.strictEqual( MathUtils.mapLinear( 0.0, 0, 1, 0, 10 ), 0, 'Value equal to lower boundary' );
			assert.strictEqual( MathUtils.mapLinear( 1.0, 0, 1, 0, 10 ), 10, 'Value equal to upper boundary' );

		} );

		QUnit.test( 'inverseLerp', ( assert ) => {

			assert.strictEqual( MathUtils.inverseLerp( 1, 2, 1.5 ), 0.5, '50% Percentage' );
			assert.strictEqual( MathUtils.inverseLerp( 1, 2, 2 ), 1, '100% Percentage' );
			assert.strictEqual( MathUtils.inverseLerp( 1, 2, 1 ), 0, '0% Percentage' );
			assert.strictEqual( MathUtils.inverseLerp( 1, 1, 1 ), 0, '0% Percentage, no NaN value' );

		} );

		QUnit.test( 'lerp', ( assert ) => {

			assert.strictEqual( MathUtils.lerp( 1, 2, 0 ), 1, 'Value equal to lower boundary' );
			assert.strictEqual( MathUtils.lerp( 1, 2, 1 ), 2, 'Value equal to upper boundary' );
			assert.strictEqual( MathUtils.lerp( 1, 2, 0.4 ), 1.4, 'Value within range' );

		} );

		QUnit.test( 'damp', ( assert ) => {

			assert.strictEqual( MathUtils.damp( 1, 2, 0, 0.016 ), 1, 'Value equal to lower boundary' );
			assert.strictEqual( MathUtils.damp( 1, 2, 10, 0.016 ), 1.1478562110337887, 'Value within range' );

		} );

		QUnit.test( 'smoothstep', ( assert ) => {

			assert.strictEqual( MathUtils.smoothstep( - 1, 0, 2 ), 0, 'Value lower than minimum' );
			assert.strictEqual( MathUtils.smoothstep( 0, 0, 2 ), 0, 'Value equal to minimum' );
			assert.strictEqual( MathUtils.smoothstep( 0.5, 0, 2 ), 0.15625, 'Value within limits' );
			assert.strictEqual( MathUtils.smoothstep( 1, 0, 2 ), 0.5, 'Value within limits' );
			assert.strictEqual( MathUtils.smoothstep( 1.5, 0, 2 ), 0.84375, 'Value within limits' );
			assert.strictEqual( MathUtils.smoothstep( 2, 0, 2 ), 1, 'Value equal to maximum' );
			assert.strictEqual( MathUtils.smoothstep( 3, 0, 2 ), 1, 'Value highter than maximum' );

		} );

		QUnit.test( 'smootherstep', ( assert ) => {

			assert.strictEqual( MathUtils.smootherstep( - 1, 0, 2 ), 0, 'Value lower than minimum' );
			assert.strictEqual( MathUtils.smootherstep( 0, 0, 2 ), 0, 'Value equal to minimum' );
			assert.strictEqual( MathUtils.smootherstep( 0.5, 0, 2 ), 0.103515625, 'Value within limits' );
			assert.strictEqual( MathUtils.smootherstep( 1, 0, 2 ), 0.5, 'Value within limits' );
			assert.strictEqual( MathUtils.smootherstep( 1.5, 0, 2 ), 0.896484375, 'Value within limits' );
			assert.strictEqual( MathUtils.smootherstep( 2, 0, 2 ), 1, 'Value equal to maximum' );
			assert.strictEqual( MathUtils.smootherstep( 3, 0, 2 ), 1, 'Value highter than maximum' );

		} );

		QUnit.test( 'randInt', ( assert ) => {

			var low = 1, high = 3;
			var a = MathUtils.randInt( low, high );

			assert.ok( a >= low, 'Value equal to or higher than lower limit' );
			assert.ok( a <= high, 'Value equal to or lower than upper limit' );

		} );

		QUnit.test( 'randFloat', ( assert ) => {

			var low = 1, high = 3;
			var a = MathUtils.randFloat( low, high );

			assert.ok( a >= low, 'Value equal to or higher than lower limit' );
			assert.ok( a <= high, 'Value equal to or lower than upper limit' );

		} );

		QUnit.test( 'randFloatSpread', ( assert ) => {

			var a = MathUtils.randFloatSpread( 3 );

			assert.ok( a > - 3 / 2, 'Value higher than lower limit' );
			assert.ok( a < 3 / 2, 'Value lower than upper limit' );

		} );

		QUnit.test( 'degToRad', ( assert ) => {

			assert.strictEqual( MathUtils.degToRad( 0 ), 0, '0 degrees' );
			assert.strictEqual( MathUtils.degToRad( 90 ), Math.PI / 2, '90 degrees' );
			assert.strictEqual( MathUtils.degToRad( 180 ), Math.PI, '180 degrees' );
			assert.strictEqual( MathUtils.degToRad( 360 ), Math.PI * 2, '360 degrees' );

		} );

		QUnit.test( 'radToDeg', ( assert ) => {

			assert.strictEqual( MathUtils.radToDeg( 0 ), 0, '0 radians' );
			assert.strictEqual( MathUtils.radToDeg( Math.PI / 2 ), 90, 'Math.PI / 2 radians' );
			assert.strictEqual( MathUtils.radToDeg( Math.PI ), 180, 'Math.PI radians' );
			assert.strictEqual( MathUtils.radToDeg( Math.PI * 2 ), 360, 'Math.PI * 2 radians' );

		} );

		QUnit.test( 'isPowerOfTwo', ( assert ) => {

			assert.strictEqual( MathUtils.isPowerOfTwo( 0 ), false, '0 is not a PoT' );
			assert.strictEqual( MathUtils.isPowerOfTwo( 1 ), true, '1 is a PoT' );
			assert.strictEqual( MathUtils.isPowerOfTwo( 2 ), true, '2 is a PoT' );
			assert.strictEqual( MathUtils.isPowerOfTwo( 3 ), false, '3 is not a PoT' );
			assert.strictEqual( MathUtils.isPowerOfTwo( 4 ), true, '4 is a PoT' );

		} );

		QUnit.test( 'ceilPowerOfTwo', ( assert ) => {

			assert.strictEqual( MathUtils.ceilPowerOfTwo( 1 ), 1, 'Closest higher PoT to 1 is 1' );
			assert.strictEqual( MathUtils.ceilPowerOfTwo( 3 ), 4, 'Closest higher PoT to 3 is 4' );
			assert.strictEqual( MathUtils.ceilPowerOfTwo( 4 ), 4, 'Closest higher PoT to 4 is 4' );

		} );

		QUnit.test( 'floorPowerOfTwo', ( assert ) => {

			assert.strictEqual( MathUtils.floorPowerOfTwo( 1 ), 1, 'Closest lower PoT to 1 is 1' );
			assert.strictEqual( MathUtils.floorPowerOfTwo( 3 ), 2, 'Closest lower PoT to 3 is 2' );
			assert.strictEqual( MathUtils.floorPowerOfTwo( 4 ), 4, 'Closest lower PoT to 4 is 4' );

		} );


		QUnit.test( 'pingpong', ( assert ) => {

			assert.strictEqual( MathUtils.pingpong( 2.5 ), 0.5, 'Value at 2.5 is 0.5' );
			assert.strictEqual( MathUtils.pingpong( 2.5, 2 ), 1.5, 'Value at 2.5 with length of 2 is 1.5' );
			assert.strictEqual( MathUtils.pingpong( - 1.5 ), 0.5, 'Value at -1.5 is 0.5' );

		} );

	} );

} );
