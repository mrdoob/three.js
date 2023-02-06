/* global QUnit */

import * as DataUtils from '../../../../src/extras/DataUtils.js';

import { CONSOLE_LEVEL } from '../../utils/console-wrapper.js';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'DataUtils', () => {

		// PUBLIC
		QUnit.test( 'toHalfFloat', ( assert ) => {

			assert.ok( DataUtils.toHalfFloat( 0 ) === 0, 'Passed!' );

			// surpress the following console message during testing
			// THREE.DataUtils.toHalfFloat(): Value out of range.

			console.level = CONSOLE_LEVEL.OFF;
			assert.ok( DataUtils.toHalfFloat( 100000 ) === 31743, 'Passed!' );
			assert.ok( DataUtils.toHalfFloat( - 100000 ) === 64511, 'Passed!' );
			console.level = CONSOLE_LEVEL.DEFAULT;

			assert.ok( DataUtils.toHalfFloat( 65504 ) === 31743, 'Passed!' );
			assert.ok( DataUtils.toHalfFloat( - 65504 ) === 64511, 'Passed!' );
			assert.ok( DataUtils.toHalfFloat( Math.PI ) === 16968, 'Passed!' );
			assert.ok( DataUtils.toHalfFloat( - Math.PI ) === 49736, 'Passed!' );

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
