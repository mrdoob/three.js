/**
 * @author humbletim / https://github.com/humbletim
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { Math } from '../../../../src/math/Math';
import { Vector3 } from '../../../../src/math/Vector3';

export default QUnit.module.todo( 'Maths', () => {

	QUnit.module.todo( 'Math', () => {

		//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign
		//http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.sign
		/*
		 20.2.2.29 Math.sign(x)

		 Returns the sign of the x, indicating whether x is positive, negative or zero.

		 If x is NaN, the result is NaN.
		 If x is -0, the result is -0.
		 If x is +0, the result is +0.
		 If x is negative and not -0, the result is -1.
		 If x is positive and not +0, the result is +1.
		 */

		QUnit.test( "Math.sign/polyfill", function ( assert ) {

			assert.ok( isNaN( Math.sign( NaN ) ), "If x is NaN<NaN>, the result is NaN." );
			assert.ok( isNaN( Math.sign( new Vector3() ) ), "If x is NaN<object>, the result is NaN." );
			assert.ok( isNaN( Math.sign() ), "If x is NaN<undefined>, the result is NaN." );
			assert.ok( isNaN( Math.sign( '--3' ) ), "If x is NaN<'--3'>, the result is NaN." );
			assert.ok( isNegativeZero( Math.sign( - 0 ) ), "If x is -0, the result is -0." );
			assert.ok( Math.sign( + 0 ) === + 0, "If x is +0, the result is +0." );
			assert.ok( Math.sign( - Infinity ) === - 1, "If x is negative<-Infinity> and not -0, the result is -1." );
			assert.ok( Math.sign( '-3' ) === - 1, "If x is negative<'-3'> and not -0, the result is -1." );
			assert.ok( Math.sign( '-1e-10' ) === - 1, "If x is negative<'-1e-10'> and not -0, the result is -1." );
			assert.ok( Math.sign( + Infinity ) === + 1, "If x is positive<+Infinity> and not +0, the result is +1." );
			assert.ok( Math.sign( '+3' ) === + 1, "If x is positive<'+3'> and not +0, the result is +1." );

			// Comparing with -0 is tricky because 0 === -0. But
			// luckily 1 / -0 === -Infinity so we can use that.

			function isNegativeZero( value ) {

				return value === 0 && 1 / value < 0;

			}

		} );

		QUnit.test( "generateUUID", function ( assert ) {

			var a = Math.generateUUID();
			var regex = /[A-Z0-9]{8}-[A-Z0-9]{4}-4[A-Z0-9]{3}-[A-Z0-9]{4}-[A-Z0-9]{12}/i;
			// note the fixed '4' here ----------^

			assert.ok( regex.QUnit.test( a ), "Generated UUID matches the expected pattern" );

		} );

		QUnit.test( "clamp", function ( assert ) {

			assert.strictEqual( Math.clamp( 0.5, 0, 1 ), 0.5, "Value already within limits" );
			assert.strictEqual( Math.clamp( 0, 0, 1 ), 0, "Value equal to one limit" );
			assert.strictEqual( Math.clamp( - 0.1, 0, 1 ), 0, "Value too low" );
			assert.strictEqual( Math.clamp( 1.1, 0, 1 ), 1, "Value too high" );

		} );

		QUnit.test( "euclideanModulo", function ( assert ) {

			assert.ok( isNaN( Math.euclideanModulo( 6, 0 ) ), "Division by zero returns NaN" );
			assert.strictEqual( Math.euclideanModulo( 6, 1 ), 0, "Divison by trivial divisor" );
			assert.strictEqual( Math.euclideanModulo( 6, 2 ), 0, "Divison by non-trivial divisor" );
			assert.strictEqual( Math.euclideanModulo( 6, 5 ), 1, "Divison by itself - 1" );
			assert.strictEqual( Math.euclideanModulo( 6, 6 ), 0, "Divison by itself" );
			assert.strictEqual( Math.euclideanModulo( 6, 7 ), 6, "Divison by itself + 1" );

		} );

		QUnit.test( "mapLinear", function ( assert ) {

			assert.strictEqual( Math.mapLinear( 0.5, 0, 1, 0, 10 ), 5, "Value within range" );
			assert.strictEqual( Math.mapLinear( 0.0, 0, 1, 0, 10 ), 0, "Value equal to lower boundary" );
			assert.strictEqual( Math.mapLinear( 1.0, 0, 1, 0, 10 ), 10, "Value equal to upper boundary" );

		} );

		QUnit.test( "smoothstep", function ( assert ) {

			assert.strictEqual( Math.smoothstep( - 1, 0, 2 ), 0, "Value lower than minimum" );
			assert.strictEqual( Math.smoothstep( 0, 0, 2 ), 0, "Value equal to minimum" );
			assert.strictEqual( Math.smoothstep( 0.5, 0, 2 ), 0.15625, "Value within limits" );
			assert.strictEqual( Math.smoothstep( 1, 0, 2 ), 0.5, "Value within limits" );
			assert.strictEqual( Math.smoothstep( 1.5, 0, 2 ), 0.84375, "Value within limits" );
			assert.strictEqual( Math.smoothstep( 2, 0, 2 ), 1, "Value equal to maximum" );
			assert.strictEqual( Math.smoothstep( 3, 0, 2 ), 1, "Value highter than maximum" );

		} );

		QUnit.test( "randInt", function ( assert ) {

			var low = 1, high = 3;
			var a = Math.randInt( low, high );

			assert.ok( a >= low, "Value equal to or higher than lower limit" );
			assert.ok( a <= high, "Value equal to or lower than upper limit" );

		} );

		QUnit.test( "randFloat", function ( assert ) {

			var low = 1, high = 3;
			var a = Math.randFloat( low, high );

			assert.ok( a >= low, "Value equal to or higher than lower limit" );
			assert.ok( a <= high, "Value equal to or lower than upper limit" );

		} );

		QUnit.test( "randFloatSpread", function ( assert ) {

			var a = Math.randFloatSpread( 3 );

			assert.ok( a > - 3 / 2, "Value higher than lower limit" );
			assert.ok( a < 3 / 2, "Value lower than upper limit" );

		} );

		QUnit.test( "degToRad", function ( assert ) {

			assert.strictEqual( Math.degToRad( 0 ), 0, "0 degrees" );
			assert.strictEqual( Math.degToRad( 90 ), Math.PI / 2, "90 degrees" );
			assert.strictEqual( Math.degToRad( 180 ), Math.PI, "180 degrees" );
			assert.strictEqual( Math.degToRad( 360 ), Math.PI * 2, "360 degrees" );

		} );

		QUnit.test( "radToDeg", function ( assert ) {

			assert.strictEqual( Math.radToDeg( 0 ), 0, "0 radians" );
			assert.strictEqual( Math.radToDeg( Math.PI / 2 ), 90, "Math.PI / 2 radians" );
			assert.strictEqual( Math.radToDeg( Math.PI ), 180, "Math.PI radians" );
			assert.strictEqual( Math.radToDeg( Math.PI * 2 ), 360, "Math.PI * 2 radians" );

		} );

		QUnit.test( "isPowerOfTwo", function ( assert ) {

			assert.strictEqual( Math.isPowerOfTwo( 0 ), false, "0 is not a PoT" );
			assert.strictEqual( Math.isPowerOfTwo( 1 ), true, "1 is a PoT" );
			assert.strictEqual( Math.isPowerOfTwo( 2 ), true, "2 is a PoT" );
			assert.strictEqual( Math.isPowerOfTwo( 3 ), false, "3 is not a PoT" );
			assert.strictEqual( Math.isPowerOfTwo( 4 ), true, "4 is a PoT" );

		} );

		QUnit.test( "ceilPowerOfTwo", function ( assert ) {

			assert.strictEqual( Math.ceilPowerOfTwo( 1 ), 1, "Closest higher PoT to 1 is 1" );
			assert.strictEqual( Math.ceilPowerOfTwo( 3 ), 4, "Closest higher PoT to 3 is 4" );
			assert.strictEqual( Math.ceilPowerOfTwo( 4 ), 4, "Closest higher PoT to 4 is 4" );

		} );

		QUnit.test( "floorPowerOfTwo", function ( assert ) {

			assert.strictEqual( Math.floorPowerOfTwo( 1 ), 1, "Closest lower PoT to 1 is 1" );
			assert.strictEqual( Math.floorPowerOfTwo( 3 ), 2, "Closest lower PoT to 3 is 2" );
			assert.strictEqual( Math.floorPowerOfTwo( 4 ), 4, "Closest lower PoT to 4 is 4" );

		} );

	} );

} );
