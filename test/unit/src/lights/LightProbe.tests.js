/* global QUnit */

import { LightProbe } from '../../../../src/lights/LightProbe.js';

import { Light } from '../../../../src/lights/Light.js';

export default QUnit.module('Lights', () => {

	QUnit.module('LightProbe', () => {

		// INHERITANCE
		QUnit.test('Extending', (assert) => {

			const object = new LightProbe();
			assert.strictEqual(
				object instanceof Light, true,
				'LightProbe extends from Light'
			);

		});

		// INSTANCING
		QUnit.todo('Instancing', (assert) => {

			assert.ok(false, 'everything\'s gonna be alright');

		});

		// PROPERTIES
		QUnit.todo('sh', (assert) => {

			// SphericalHarmonics3 if not supplied
			assert.ok(false, 'everything\'s gonna be alright');

		});

		// PUBLIC
		QUnit.test('isLightProbe', (assert) => {

			const object = new LightProbe();
			assert.ok(
				object.isLightProbe,
				'LightProbe.isLightProbe should be true'
			);

		});

		QUnit.todo('copy', (assert) => {

			assert.ok(false, 'everything\'s gonna be alright');

		});

		QUnit.test('fromJSON', (assert) => {

			const lightProbe = new LightProbe(undefined, 2);
			const json = lightProbe.toJSON();
			const newLightProbe = new LightProbe().fromJSON(json.object);

			assert.strictEqual(newLightProbe.intensity, 2, 'Check intensity');

		});

		QUnit.test('toJSON', (assert) => {

			const lightProbe = new LightProbe(undefined, 2);
			const json = lightProbe.toJSON();

			assert.strictEqual(json.object.intensity, 2, 'Check intensity');
			assert.notEqual(json.object.sh, undefined, 'Check sh');

		});

	});

});
