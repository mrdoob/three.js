/* global QUnit */

import { ColorManagement } from '../../../../src/math/ColorManagement.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'ColorManagement', () => {

		// PROPERTIES
		QUnit.test( 'legacyMode', ( assert ) => {

			assert.ok(
				ColorManagement.legacyMode == true,
				'ColorManagement.legacyMode is true by default.'
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
