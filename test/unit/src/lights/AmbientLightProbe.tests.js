/* global QUnit */

import { AmbientLightProbe } from '../../../../src/lights/AmbientLightProbe.js';

import { LightProbe } from '../../../../src/lights/LightProbe.js';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'AmbientLightProbe', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new AmbientLightProbe();
			assert.strictEqual(
				object instanceof LightProbe, true,
				'AmbientLightProbe extends from LightProbe'
			);

		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isAmbientLightProbe', ( assert ) => {

			const object = new AmbientLightProbe();
			assert.ok(
				object.isAmbientLightProbe,
				'AmbientLightProbe.isAmbientLightProbe should be true'
			);

		} );

	} );

} );
