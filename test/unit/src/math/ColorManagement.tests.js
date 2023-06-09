/* global QUnit */

import { ColorManagement } from '../../../../src/math/ColorManagement.js';

import { CONSOLE_LEVEL } from '../../utils/console-wrapper.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'ColorManagement', () => {

		// PROPERTIES
		QUnit.test( 'enabled', ( assert ) => {

			assert.strictEqual(
				ColorManagement.enabled, true,
				'ColorManagement.enabled is true by default.'
			);

		} );

		QUnit.test( 'legacyMode', ( assert ) => {

			// surpress the following console message during testing
			// THREE.ColorManagement: .legacyMode=false renamed to .enabled=true in r150.

			console.level = CONSOLE_LEVEL.OFF;
			const expected = ColorManagement.legacyMode === false;
			console.level = CONSOLE_LEVEL.DEFAULT;

			assert.ok(
				expected,
				'ColorManagement.legacyMode is false by default.'
			);

		} );

		QUnit.todo( 'workingColorSpace', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'convert', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'fromWorkingColorSpace', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'toWorkingColorSpace', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// EXPORTED FUNCTIONS
		QUnit.todo( 'SRGBToLinear', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'LinearToSRGB', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
