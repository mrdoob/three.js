/* global QUnit */

import { HemisphereLightProbe } from '../../../../src/lights/HemisphereLightProbe.js';

import { LightProbe } from '../../../../src/lights/LightProbe.js';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'HemisphereLightProbe', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new HemisphereLightProbe();
			assert.strictEqual(
				object instanceof LightProbe, true,
				'HemisphereLightProbe extends from LightProbe'
			);

		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isHemisphereLightProbe', ( assert ) => {

			const object = new HemisphereLightProbe();
			assert.ok(
				object.isHemisphereLightProbe,
				'HemisphereLightProbe.isHemisphereLightProbe should be true'
			);

		} );

	} );

} );
