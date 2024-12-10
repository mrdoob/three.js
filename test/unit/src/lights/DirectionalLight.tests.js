/* global QUnit */

import { DirectionalLight } from '../../../../src/lights/DirectionalLight.js';
import { Object3D } from '../../../../src/core/Object3D.js';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'DirectionalLight', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new DirectionalLight();
			assert.strictEqual(
				object instanceof Object3D, true,
				'DirectionalLight extends from Object3D'
			);

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new DirectionalLight();
			assert.ok(
				object.type === 'DirectionalLight',
				'DirectionalLight.type should be DirectionalLight'
			);

		} );

		// PROPERTIES
		QUnit.test( 'colorContribution', ( assert ) => {

			const light = new DirectionalLight();
			assert.ok(
				light.colorContribution === true,
				'DirectionalLight.colorContribution should be true by default'
			);

			light.colorContribution = false;
			assert.ok(
				light.colorContribution === false,
				'DirectionalLight.colorContribution can be set to false'
			);

		} );

		// COPY
		QUnit.test( 'copy', ( assert ) => {

			const a = new DirectionalLight( 0xaaaaaa, 0.5 );
			a.colorContribution = false;
			const b = new DirectionalLight();
			b.copy( a );

			assert.ok(
				b.colorContribution === false,
				'DirectionalLight.colorContribution is copied'
			);

		} );

		// JSON
		QUnit.test( 'toJSON', ( assert ) => {

			const light = new DirectionalLight( 0xaaaaaa, 0.5 );
			light.colorContribution = false;
			const json = light.toJSON();

			assert.ok(
				json.object.colorContribution === false,
				'DirectionalLight.colorContribution is included in JSON'
			);

		} );

	} );

} );
