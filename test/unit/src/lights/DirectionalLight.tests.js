import { DirectionalLight } from '../../../../src/lights/DirectionalLight.js';

import { Light } from '../../../../src/lights/Light.js';
import { runStdLightTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'DirectionalLight', ( hooks ) => {

		let lights = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				color: 0xaaaaaa,
				intensity: 0.8
			};

			lights = [
				new DirectionalLight(),
				new DirectionalLight( parameters.color ),
				new DirectionalLight( parameters.color, parameters.intensity )
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new DirectionalLight();
			assert.strictEqual(
				object instanceof Light, true,
				'DirectionalLight extends from Light'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new DirectionalLight();
			assert.ok( object, 'Can instantiate a DirectionalLight.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new DirectionalLight();
			assert.ok(
				object.type === 'DirectionalLight',
				'DirectionalLight.type should be DirectionalLight'
			);

		} );

		// PUBLIC
		QUnit.test( 'isDirectionalLight', ( assert ) => {

			const object = new DirectionalLight();
			assert.ok(
				object.isDirectionalLight,
				'DirectionalLight.isDirectionalLight should be true'
			);

		} );

		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const object = new DirectionalLight();
			object.dispose();

			// ensure calls dispose() on shadow

		} );

		// OTHERS
		QUnit.test( 'Standard light tests', ( assert ) => {

			runStdLightTests( assert, lights );

		} );

	} );

} );
