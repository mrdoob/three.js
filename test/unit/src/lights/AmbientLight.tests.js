/* global QUnit */

import { AmbientLight } from '../../../../src/lights/AmbientLight.js';

import { Light } from '../../../../src/lights/Light.js';
import { runStdLightTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'AmbientLight', ( hooks ) => {

		let lights = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				color: 0xaaaaaa,
				intensity: 0.5
			};

			lights = [
				new AmbientLight(),
				new AmbientLight( parameters.color ),
				new AmbientLight( parameters.color, parameters.intensity )
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new AmbientLight();
			assert.strictEqual(
				object instanceof Light, true,
				'AmbientLight extends from Light'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new AmbientLight();
			assert.ok( object, 'Can instantiate an AmbientLight.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new AmbientLight();
			assert.ok(
				object.type === 'AmbientLight',
				'AmbientLight.type should be AmbientLight'
			);

		} );

		// PUBLIC
		QUnit.test( 'isAmbientLight', ( assert ) => {

			const object = new AmbientLight();
			assert.ok(
				object.isAmbientLight,
				'AmbientLight.isAmbientLight should be true'
			);

		} );

		// OTHERS
		QUnit.test( 'Standard light tests', ( assert ) => {

			runStdLightTests( assert, lights );

		} );

	} );

} );
