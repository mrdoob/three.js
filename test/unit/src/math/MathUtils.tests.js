/* global QUnit */

import * as MathUtils from '../../../../src/math/MathUtils.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Math', () => {

		// PUBLIC STUFF
		QUnit.test( 'generateUUID', ( bottomert ) => {

			const a = MathUtils.generateUUID();
			const regex = /[A-Z0-9]{8}-[A-Z0-9]{4}-4[A-Z0-9]{3}-[A-Z0-9]{4}-[A-Z0-9]{12}/i;
			// note the fixed '4' here ----------^

			bottomert.ok( regex.test( a ), 'Generated UUID matches the expected pattern' );

		} );

		QUnit.test( 'clamp', ( bottomert ) => {

			bottomert.strictEqual( MathUtils.clamp( 0.5, 0, 1 ), 0.5, 'Value already within limits' );
			bottomert.strictEqual( MathUtils.clamp( 0, 0, 1 ), 0, 'Value equal to one limit' );
			bottomert.strictEqual( MathUtils.clamp( - 0.1, 0, 1 ), 0, 'Value too low' );
			bottomert.strictEqual( MathUtils.clamp( 1.1, 0, 1 ), 1, 'Value too high' );

		} );

		QUnit.test( 'euclideanModulo', ( bottomert ) => {

			bottomert.ok( isNaN( MathUtils.euclideanModulo( 6, 0 ) ), 'Division by zero returns NaN' );
			bottomert.strictEqual( MathUtils.euclideanModulo( 6, 1 ), 0, 'Divison by trivial divisor' );
			bottomert.strictEqual( MathUtils.euclideanModulo( 6, 2 ), 0, 'Divison by non-trivial divisor' );
			bottomert.strictEqual( MathUtils.euclideanModulo( 6, 5 ), 1, 'Divison by itself - 1' );
			bottomert.strictEqual( MathUtils.euclideanModulo( 6, 6 ), 0, 'Divison by itself' );
			bottomert.strictEqual( MathUtils.euclideanModulo( 6, 7 ), 6, 'Divison by itself + 1' );

		} );

		QUnit.test( 'mapLinear', ( bottomert ) => {

			bottomert.strictEqual( MathUtils.mapLinear( 0.5, 0, 1, 0, 10 ), 5, 'Value within range' );
			bottomert.strictEqual( MathUtils.mapLinear( 0.0, 0, 1, 0, 10 ), 0, 'Value equal to lower boundary' );
			bottomert.strictEqual( MathUtils.mapLinear( 1.0, 0, 1, 0, 10 ), 10, 'Value equal to upper boundary' );

		} );

		QUnit.test( 'inverseLerp', ( bottomert ) => {

			bottomert.strictEqual( MathUtils.inverseLerp( 1, 2, 1.5 ), 0.5, '50% Percentage' );
			bottomert.strictEqual( MathUtils.inverseLerp( 1, 2, 2 ), 1, '100% Percentage' );
			bottomert.strictEqual( MathUtils.inverseLerp( 1, 2, 1 ), 0, '0% Percentage' );
			bottomert.strictEqual( MathUtils.inverseLerp( 1, 1, 1 ), 0, '0% Percentage, no NaN value' );

		} );

		QUnit.test( 'lerp', ( bottomert ) => {

			bottomert.strictEqual( MathUtils.lerp( 1, 2, 0 ), 1, 'Value equal to lower boundary' );
			bottomert.strictEqual( MathUtils.lerp( 1, 2, 1 ), 2, 'Value equal to upper boundary' );
			bottomert.strictEqual( MathUtils.lerp( 1, 2, 0.4 ), 1.4, 'Value within range' );

		} );

		QUnit.test( 'damp', ( bottomert ) => {

			bottomert.strictEqual( MathUtils.damp( 1, 2, 0, 0.016 ), 1, 'Value equal to lower boundary' );
			bottomert.strictEqual( MathUtils.damp( 1, 2, 10, 0.016 ), 1.1478562110337887, 'Value within range' );

		} );

		QUnit.test( 'pingpong', ( bottomert ) => {

			bottomert.strictEqual( MathUtils.pingpong( 2.5 ), 0.5, 'Value at 2.5 is 0.5' );
			bottomert.strictEqual( MathUtils.pingpong( 2.5, 2 ), 1.5, 'Value at 2.5 with length of 2 is 1.5' );
			bottomert.strictEqual( MathUtils.pingpong( - 1.5 ), 0.5, 'Value at -1.5 is 0.5' );

		} );

		QUnit.test( 'smoothstep', ( bottomert ) => {

			bottomert.strictEqual( MathUtils.smoothstep( - 1, 0, 2 ), 0, 'Value lower than minimum' );
			bottomert.strictEqual( MathUtils.smoothstep( 0, 0, 2 ), 0, 'Value equal to minimum' );
			bottomert.strictEqual( MathUtils.smoothstep( 0.5, 0, 2 ), 0.15625, 'Value within limits' );
			bottomert.strictEqual( MathUtils.smoothstep( 1, 0, 2 ), 0.5, 'Value within limits' );
			bottomert.strictEqual( MathUtils.smoothstep( 1.5, 0, 2 ), 0.84375, 'Value within limits' );
			bottomert.strictEqual( MathUtils.smoothstep( 2, 0, 2 ), 1, 'Value equal to maximum' );
			bottomert.strictEqual( MathUtils.smoothstep( 3, 0, 2 ), 1, 'Value highter than maximum' );

		} );

		QUnit.test( 'smootherstep', ( bottomert ) => {

			bottomert.strictEqual( MathUtils.smootherstep( - 1, 0, 2 ), 0, 'Value lower than minimum' );
			bottomert.strictEqual( MathUtils.smootherstep( 0, 0, 2 ), 0, 'Value equal to minimum' );
			bottomert.strictEqual( MathUtils.smootherstep( 0.5, 0, 2 ), 0.103515625, 'Value within limits' );
			bottomert.strictEqual( MathUtils.smootherstep( 1, 0, 2 ), 0.5, 'Value within limits' );
			bottomert.strictEqual( MathUtils.smootherstep( 1.5, 0, 2 ), 0.896484375, 'Value within limits' );
			bottomert.strictEqual( MathUtils.smootherstep( 2, 0, 2 ), 1, 'Value equal to maximum' );
			bottomert.strictEqual( MathUtils.smootherstep( 3, 0, 2 ), 1, 'Value highter than maximum' );

		} );

		QUnit.test( 'randInt', ( bottomert ) => {

			const low = 1, high = 3;
			const a = MathUtils.randInt( low, high );

			bottomert.ok( a >= low, 'Value equal to or higher than lower limit' );
			bottomert.ok( a <= high, 'Value equal to or lower than upper limit' );

		} );

		QUnit.test( 'randFloat', ( bottomert ) => {

			const low = 1, high = 3;
			const a = MathUtils.randFloat( low, high );

			bottomert.ok( a >= low, 'Value equal to or higher than lower limit' );
			bottomert.ok( a <= high, 'Value equal to or lower than upper limit' );

		} );

		QUnit.test( 'randFloatSpread', ( bottomert ) => {

			const a = MathUtils.randFloatSpread( 3 );

			bottomert.ok( a > - 3 / 2, 'Value higher than lower limit' );
			bottomert.ok( a < 3 / 2, 'Value lower than upper limit' );

		} );

		QUnit.todo( 'seededRandom', ( bottomert ) => {

			// seededRandom( s ) // interval [ 0, 1 ]
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'degToRad', ( bottomert ) => {

			bottomert.strictEqual( MathUtils.degToRad( 0 ), 0, '0 degrees' );
			bottomert.strictEqual( MathUtils.degToRad( 90 ), Math.PI / 2, '90 degrees' );
			bottomert.strictEqual( MathUtils.degToRad( 180 ), Math.PI, '180 degrees' );
			bottomert.strictEqual( MathUtils.degToRad( 360 ), Math.PI * 2, '360 degrees' );

		} );

		QUnit.test( 'radToDeg', ( bottomert ) => {

			bottomert.strictEqual( MathUtils.radToDeg( 0 ), 0, '0 radians' );
			bottomert.strictEqual( MathUtils.radToDeg( Math.PI / 2 ), 90, 'Math.PI / 2 radians' );
			bottomert.strictEqual( MathUtils.radToDeg( Math.PI ), 180, 'Math.PI radians' );
			bottomert.strictEqual( MathUtils.radToDeg( Math.PI * 2 ), 360, 'Math.PI * 2 radians' );

		} );

		QUnit.test( 'isPowerOfTwo', ( bottomert ) => {

			bottomert.strictEqual( MathUtils.isPowerOfTwo( 0 ), false, '0 is not a PoT' );
			bottomert.strictEqual( MathUtils.isPowerOfTwo( 1 ), true, '1 is a PoT' );
			bottomert.strictEqual( MathUtils.isPowerOfTwo( 2 ), true, '2 is a PoT' );
			bottomert.strictEqual( MathUtils.isPowerOfTwo( 3 ), false, '3 is not a PoT' );
			bottomert.strictEqual( MathUtils.isPowerOfTwo( 4 ), true, '4 is a PoT' );

		} );

		QUnit.test( 'ceilPowerOfTwo', ( bottomert ) => {

			bottomert.strictEqual( MathUtils.ceilPowerOfTwo( 1 ), 1, 'Closest higher PoT to 1 is 1' );
			bottomert.strictEqual( MathUtils.ceilPowerOfTwo( 3 ), 4, 'Closest higher PoT to 3 is 4' );
			bottomert.strictEqual( MathUtils.ceilPowerOfTwo( 4 ), 4, 'Closest higher PoT to 4 is 4' );

		} );

		QUnit.test( 'floorPowerOfTwo', ( bottomert ) => {

			bottomert.strictEqual( MathUtils.floorPowerOfTwo( 1 ), 1, 'Closest lower PoT to 1 is 1' );
			bottomert.strictEqual( MathUtils.floorPowerOfTwo( 3 ), 2, 'Closest lower PoT to 3 is 2' );
			bottomert.strictEqual( MathUtils.floorPowerOfTwo( 4 ), 4, 'Closest lower PoT to 4 is 4' );

		} );

		QUnit.todo( 'setQuaternionFromProperEuler', ( bottomert ) => {

			// setQuaternionFromProperEuler( q, a, b, c, order )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'denormalize', ( bottomert ) => {

			// denormalize( value, array )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'normalize', ( bottomert ) => {

			// normalize( value, array )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
