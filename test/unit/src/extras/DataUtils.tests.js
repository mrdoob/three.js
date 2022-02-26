/* global QUnit */

import { DataUtils } from '../../../../src/extras/DataUtils.js';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'ShapeUtils', () => {

		// PUBLIC STUFF
		QUnit.todo( 'toHalfFloat', ( assert ) => {

			assert.ok( DataUtils.toHalfFloat( 0 ) === 0, 'Passed!' );
			assert.ok( DataUtils.toHalfFloat( 100000 ) === 31744, 'Passed!' ); // Infinity
			assert.ok( DataUtils.toHalfFloat( - 100000 ) === 64512, 'Passed!' ); // -Infinity
			assert.ok( DataUtils.toHalfFloat( 65504 ) === 31743, 'Passed!' );
			assert.ok( DataUtils.toHalfFloat( - 65504 ) === 64511, 'Passed!' );
			assert.ok( DataUtils.toHalfFloat( Math.PI ) === 16968, 'Passed!' );
			assert.ok( DataUtils.toHalfFloat( - Math.PI ) === 49736, 'Passed!' );

		} );

		QUnit.todo( 'fromHalfFloat', ( assert ) => {

			assert.ok( DataUtils.fromHalfFloat( 0 ) === 0, 'Passed!' );
			assert.ok( DataUtils.fromHalfFloat( 31744 ) === Infinity, 'Passed!' );
			assert.ok( DataUtils.fromHalfFloat( 64512 ) === - Infinity, 'Passed!' );
			assert.ok( DataUtils.fromHalfFloat( 31743 ) === 65504, 'Passed!' );
			assert.ok( DataUtils.fromHalfFloat( 64511 ) === - 65504, 'Passed!' );
			assert.ok( DataUtils.fromHalfFloat( 31743 ) === 3.140625, 'Passed!' );
			assert.ok( DataUtils.fromHalfFloat( 64511 ) === - 3.140625, 'Passed!' );

		} );


	} );

} );
