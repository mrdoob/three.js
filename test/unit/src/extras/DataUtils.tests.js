import * as DataUtils from '../../../../src/extras/DataUtils.js';

import { CONSOLE_LEVEL } from '../../utils/console-wrapper.js';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'DataUtils', () => {

		// PUBLIC
		QUnit.test( 'toHalfFloat', ( assert ) => {

			assert.ok( DataUtils.toHalfFloat( 0 ) === 0, 'Passed!' );

			// suppress the following console message during testing
			// THREE.DataUtils.toHalfFloat(): Value out of range.

			console.level = CONSOLE_LEVEL.OFF;
			assert.ok( DataUtils.toHalfFloat( 100000 ) === 31743, 'Passed!' );
			assert.ok( DataUtils.toHalfFloat( - 100000 ) === 64511, 'Passed!' );
			console.level = CONSOLE_LEVEL.DEFAULT;

			assert.ok( DataUtils.toHalfFloat( 65504 ) === 31743, 'Passed!' );
			assert.ok( DataUtils.toHalfFloat( - 65504 ) === 64511, 'Passed!' );
			assert.ok( DataUtils.toHalfFloat( Math.PI ) === 16968, 'Passed!' );
			assert.ok( DataUtils.toHalfFloat( - Math.PI ) === 49736, 'Passed!' );

			// values between two FP16 values round to the nearest one

			assert.strictEqual( DataUtils.toHalfFloat( 0.16461517995438313 ), 12613, 'Rounds up.' );
			assert.strictEqual( DataUtils.toHalfFloat( - 0.16461517995438313 ), 45381, 'Rounds up, negative.' );
			assert.strictEqual( DataUtils.toHalfFloat( 1 + 2 ** - 12 ), 15360, 'Rounds down.' );
			assert.strictEqual( DataUtils.toHalfFloat( 2 - 2 ** - 12 ), 16384, 'Carries into the exponent.' );

			// ties round to the even one

			assert.strictEqual( DataUtils.toHalfFloat( 1 + 2 ** - 11 ), 15360, 'Tie, down to even.' );
			assert.strictEqual( DataUtils.toHalfFloat( 1 + 3 * 2 ** - 11 ), 15362, 'Tie, up to even.' );
			assert.strictEqual( DataUtils.toHalfFloat( 1 + 2 ** - 11 + 2 ** - 23 ), 15361, 'Just above a tie.' );

			// denormals

			assert.strictEqual( DataUtils.toHalfFloat( 2 ** - 24 ), 1, 'Smallest denormal.' );
			assert.strictEqual( DataUtils.toHalfFloat( 3 * 2 ** - 25 ), 2, 'Denormal tie, up to even.' );
			assert.strictEqual( DataUtils.toHalfFloat( 2 ** - 14 - 2 ** - 26 ), 1024, 'Carries into the normal range.' );
			assert.strictEqual( DataUtils.toHalfFloat( 2 ** - 25 ), 0, 'Tie with zero, down to even.' );
			assert.strictEqual( DataUtils.toHalfFloat( 2 ** - 25 + 2 ** - 48 ), 1, 'Just above the tie with zero.' );
			assert.strictEqual( DataUtils.toHalfFloat( - ( 2 ** - 25 + 2 ** - 48 ) ), 32769, 'Just above the tie with zero, negative.' );
			assert.strictEqual( DataUtils.toHalfFloat( 2 ** - 26 ), 0, 'Below the tie with zero.' );
			assert.strictEqual( DataUtils.toHalfFloat( 2 ** - 30 ), 0, 'Very small value.' );
			assert.strictEqual( DataUtils.toHalfFloat( - ( 2 ** - 30 ) ), 32768, 'Very small value, negative.' );

		} );

		QUnit.test( 'fromHalfFloat', ( assert ) => {

			assert.ok( DataUtils.fromHalfFloat( 0 ) === 0, 'Passed!' );
			assert.ok( DataUtils.fromHalfFloat( 31744 ) === Infinity, 'Passed!' );
			assert.ok( DataUtils.fromHalfFloat( 64512 ) === - Infinity, 'Passed!' );
			assert.ok( DataUtils.fromHalfFloat( 31743 ) === 65504, 'Passed!' );
			assert.ok( DataUtils.fromHalfFloat( 64511 ) === - 65504, 'Passed!' );
			assert.ok( DataUtils.fromHalfFloat( 16968 ) === 3.140625, 'Passed!' );
			assert.ok( DataUtils.fromHalfFloat( 49736 ) === - 3.140625, 'Passed!' );

		} );


	} );

} );
