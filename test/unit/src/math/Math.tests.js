/**
 * @author humbletim / https://github.com/humbletim
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { _Math as ThreeMath } from '../../../../src/math/Math';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Math', () => {

		// PUBLIC STUFF
		QUnit.test( "generateUUID", ( assert ) => {

			var a = ThreeMath.generateUUID();
			var regex = /[A-Z0-9]{8}-[A-Z0-9]{4}-4[A-Z0-9]{3}-[A-Z0-9]{4}-[A-Z0-9]{12}/i;
			// note the fixed '4' here ----------^

			assert.ok( regex.test( a ), "Generated UUID matches the expected pattern" );

		} );

		QUnit.test( "clamp", ( assert ) => {

			assert.strictEqual( ThreeMath.clamp( 0.5, 0, 1 ), 0.5, "Value already within limits" );
			assert.strictEqual( ThreeMath.clamp( 0, 0, 1 ), 0, "Value equal to one limit" );
			assert.strictEqual( ThreeMath.clamp( - 0.1, 0, 1 ), 0, "Value too low" );
			assert.strictEqual( ThreeMath.clamp( 1.1, 0, 1 ), 1, "Value too high" );

		} );

		QUnit.test( "euclideanModulo", ( assert ) => {

			assert.ok( isNaN( ThreeMath.euclideanModulo( 6, 0 ) ), "Division by zero returns NaN" );
			assert.strictEqual( ThreeMath.euclideanModulo( 6, 1 ), 0, "Divison by trivial divisor" );
			assert.strictEqual( ThreeMath.euclideanModulo( 6, 2 ), 0, "Divison by non-trivial divisor" );
			assert.strictEqual( ThreeMath.euclideanModulo( 6, 5 ), 1, "Divison by itself - 1" );
			assert.strictEqual( ThreeMath.euclideanModulo( 6, 6 ), 0, "Divison by itself" );
			assert.strictEqual( ThreeMath.euclideanModulo( 6, 7 ), 6, "Divison by itself + 1" );

		} );

		QUnit.test( "mapLinear", ( assert ) => {

			assert.strictEqual( ThreeMath.mapLinear( 0.5, 0, 1, 0, 10 ), 5, "Value within range" );
			assert.strictEqual( ThreeMath.mapLinear( 0.0, 0, 1, 0, 10 ), 0, "Value equal to lower boundary" );
			assert.strictEqual( ThreeMath.mapLinear( 1.0, 0, 1, 0, 10 ), 10, "Value equal to upper boundary" );

		} );

		QUnit.test( "lerp", ( assert ) => {


			assert.strictEqual( ThreeMath.lerp( 1, 2, 0 ), 1, "Value equal to lower boundary" );
			assert.strictEqual( ThreeMath.lerp( 1, 2, 1 ), 2, "Value equal to upper boundary" );
			assert.strictEqual( ThreeMath.lerp( 1, 2, 0.4 ), 1.4, "Value within range" );


		} );

		QUnit.test( "smoothstep", ( assert ) => {

			assert.strictEqual( ThreeMath.smoothstep( - 1, 0, 2 ), 0, "Value lower than minimum" );
			assert.strictEqual( ThreeMath.smoothstep( 0, 0, 2 ), 0, "Value equal to minimum" );
			assert.strictEqual( ThreeMath.smoothstep( 0.5, 0, 2 ), 0.15625, "Value within limits" );
			assert.strictEqual( ThreeMath.smoothstep( 1, 0, 2 ), 0.5, "Value within limits" );
			assert.strictEqual( ThreeMath.smoothstep( 1.5, 0, 2 ), 0.84375, "Value within limits" );
			assert.strictEqual( ThreeMath.smoothstep( 2, 0, 2 ), 1, "Value equal to maximum" );
			assert.strictEqual( ThreeMath.smoothstep( 3, 0, 2 ), 1, "Value highter than maximum" );

		} );

		QUnit.test( "smootherstep", ( assert ) => {

			assert.strictEqual( ThreeMath.smootherstep( - 1, 0, 2 ), 0, "Value lower than minimum" );
			assert.strictEqual( ThreeMath.smootherstep( 0, 0, 2 ), 0, "Value equal to minimum" );
			assert.strictEqual( ThreeMath.smootherstep( 0.5, 0, 2 ), 0.103515625, "Value within limits" );
			assert.strictEqual( ThreeMath.smootherstep( 1, 0, 2 ), 0.5, "Value within limits" );
			assert.strictEqual( ThreeMath.smootherstep( 1.5, 0, 2 ), 0.896484375, "Value within limits" );
			assert.strictEqual( ThreeMath.smootherstep( 2, 0, 2 ), 1, "Value equal to maximum" );
			assert.strictEqual( ThreeMath.smootherstep( 3, 0, 2 ), 1, "Value highter than maximum" );

		} );

		QUnit.test( "randInt", ( assert ) => {

			var low = 1, high = 3;
			var a = ThreeMath.randInt( low, high );

			assert.ok( a >= low, "Value equal to or higher than lower limit" );
			assert.ok( a <= high, "Value equal to or lower than upper limit" );

		} );

		QUnit.test( "randFloat", ( assert ) => {

			var low = 1, high = 3;
			var a = ThreeMath.randFloat( low, high );

			assert.ok( a >= low, "Value equal to or higher than lower limit" );
			assert.ok( a <= high, "Value equal to or lower than upper limit" );

		} );

		QUnit.test( "randFloatSpread", ( assert ) => {

			var a = ThreeMath.randFloatSpread( 3 );

			assert.ok( a > - 3 / 2, "Value higher than lower limit" );
			assert.ok( a < 3 / 2, "Value lower than upper limit" );

		} );

		QUnit.test( "degToRad", ( assert ) => {

			assert.strictEqual( ThreeMath.degToRad( 0 ), 0, "0 degrees" );
			assert.strictEqual( ThreeMath.degToRad( 90 ), Math.PI / 2, "90 degrees" );
			assert.strictEqual( ThreeMath.degToRad( 180 ), Math.PI, "180 degrees" );
			assert.strictEqual( ThreeMath.degToRad( 360 ), Math.PI * 2, "360 degrees" );

		} );

		QUnit.test( "radToDeg", ( assert ) => {

			assert.strictEqual( ThreeMath.radToDeg( 0 ), 0, "0 radians" );
			assert.strictEqual( ThreeMath.radToDeg( Math.PI / 2 ), 90, "Math.PI / 2 radians" );
			assert.strictEqual( ThreeMath.radToDeg( Math.PI ), 180, "Math.PI radians" );
			assert.strictEqual( ThreeMath.radToDeg( Math.PI * 2 ), 360, "Math.PI * 2 radians" );

		} );

		QUnit.test( "isPowerOfTwo", ( assert ) => {

			assert.strictEqual( ThreeMath.isPowerOfTwo( 0 ), false, "0 is not a PoT" );
			assert.strictEqual( ThreeMath.isPowerOfTwo( 1 ), true, "1 is a PoT" );
			assert.strictEqual( ThreeMath.isPowerOfTwo( 2 ), true, "2 is a PoT" );
			assert.strictEqual( ThreeMath.isPowerOfTwo( 3 ), false, "3 is not a PoT" );
			assert.strictEqual( ThreeMath.isPowerOfTwo( 4 ), true, "4 is a PoT" );

		} );

		QUnit.test( "ceilPowerOfTwo", ( assert ) => {

			assert.strictEqual( ThreeMath.ceilPowerOfTwo( 1 ), 1, "Closest higher PoT to 1 is 1" );
			assert.strictEqual( ThreeMath.ceilPowerOfTwo( 3 ), 4, "Closest higher PoT to 3 is 4" );
			assert.strictEqual( ThreeMath.ceilPowerOfTwo( 4 ), 4, "Closest higher PoT to 4 is 4" );

		} );

		QUnit.test( "floorPowerOfTwo", ( assert ) => {

			assert.strictEqual( ThreeMath.floorPowerOfTwo( 1 ), 1, "Closest lower PoT to 1 is 1" );
			assert.strictEqual( ThreeMath.floorPowerOfTwo( 3 ), 2, "Closest lower PoT to 3 is 2" );
			assert.strictEqual( ThreeMath.floorPowerOfTwo( 4 ), 4, "Closest lower PoT to 4 is 4" );

		} );

	} );

} );
