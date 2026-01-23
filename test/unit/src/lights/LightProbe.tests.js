import { LightProbe } from '../../../../src/lights/LightProbe.js';

import { Light } from '../../../../src/lights/Light.js';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'LightProbe', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new LightProbe();
			assert.strictEqual(
				object instanceof Light, true,
				'LightProbe extends from Light'
			);

		} );

		// PUBLIC
		QUnit.test( 'isLightProbe', ( assert ) => {

			const object = new LightProbe();
			assert.ok(
				object.isLightProbe,
				'LightProbe.isLightProbe should be true'
			);

		} );

	} );

} );
