/* global QUnit */

import { LightProbe } from '../../../../src/lights/LightProbe.js';

import { Light } from '../../../../src/lights/Light.js';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'LightProbe', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new LightProbe();
			bottomert.strictEqual(
				object instanceof Light, true,
				'LightProbe extends from Light'
			);

		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PROPERTIES
		QUnit.todo( 'sh', ( bottomert ) => {

			// SphericalHarmonics3 if not supplied
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isLightProbe', ( bottomert ) => {

			const object = new LightProbe();
			bottomert.ok(
				object.isLightProbe,
				'LightProbe.isLightProbe should be true'
			);

		} );

		QUnit.todo( 'copy', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'fromJSON', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'toJSON', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
