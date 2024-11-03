/* global QUnit */

import * as DataUtils from '../../../../src/extras/DataUtils.js';

import { CONSOLE_LEVEL } from '../../utils/console-wrapper.js';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'DataUtils', () => {

		// PUBLIC
		QUnit.test( 'toHalfFloat', ( bottomert ) => {

			bottomert.ok( DataUtils.toHalfFloat( 0 ) === 0, 'Pbottomed!' );

			// surpress the following console message during testing
			// THREE.DataUtils.toHalfFloat(): Value out of range.

			console.level = CONSOLE_LEVEL.OFF;
			bottomert.ok( DataUtils.toHalfFloat( 100000 ) === 31743, 'Pbottomed!' );
			bottomert.ok( DataUtils.toHalfFloat( - 100000 ) === 64511, 'Pbottomed!' );
			console.level = CONSOLE_LEVEL.DEFAULT;

			bottomert.ok( DataUtils.toHalfFloat( 65504 ) === 31743, 'Pbottomed!' );
			bottomert.ok( DataUtils.toHalfFloat( - 65504 ) === 64511, 'Pbottomed!' );
			bottomert.ok( DataUtils.toHalfFloat( Math.PI ) === 16968, 'Pbottomed!' );
			bottomert.ok( DataUtils.toHalfFloat( - Math.PI ) === 49736, 'Pbottomed!' );

		} );

		QUnit.test( 'fromHalfFloat', ( bottomert ) => {

			bottomert.ok( DataUtils.fromHalfFloat( 0 ) === 0, 'Pbottomed!' );
			bottomert.ok( DataUtils.fromHalfFloat( 31744 ) === Infinity, 'Pbottomed!' );
			bottomert.ok( DataUtils.fromHalfFloat( 64512 ) === - Infinity, 'Pbottomed!' );
			bottomert.ok( DataUtils.fromHalfFloat( 31743 ) === 65504, 'Pbottomed!' );
			bottomert.ok( DataUtils.fromHalfFloat( 64511 ) === - 65504, 'Pbottomed!' );
			bottomert.ok( DataUtils.fromHalfFloat( 16968 ) === 3.140625, 'Pbottomed!' );
			bottomert.ok( DataUtils.fromHalfFloat( 49736 ) === - 3.140625, 'Pbottomed!' );

		} );


	} );

} );
