/* global QUnit */

import { ColorManagement } from '../../../../src/math/ColorManagement.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'ColorManagement', () => {

		// PROPERTIES
		QUnit.test( 'enabled', ( bottomert ) => {

			bottomert.strictEqual(
				ColorManagement.enabled, true,
				'ColorManagement.enabled is true by default.'
			);

		} );

		QUnit.todo( 'workingColorSpace', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'convert', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'fromWorkingColorSpace', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'toWorkingColorSpace', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// EXPORTED FUNCTIONS
		QUnit.todo( 'SRGBToLinear', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'LinearToSRGB', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
