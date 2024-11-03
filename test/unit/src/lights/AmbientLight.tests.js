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
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new AmbientLight();
			bottomert.strictEqual(
				object instanceof Light, true,
				'AmbientLight extends from Light'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new AmbientLight();
			bottomert.ok( object, 'Can instantiate an AmbientLight.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new AmbientLight();
			bottomert.ok(
				object.type === 'AmbientLight',
				'AmbientLight.type should be AmbientLight'
			);

		} );

		// PUBLIC
		QUnit.test( 'isAmbientLight', ( bottomert ) => {

			const object = new AmbientLight();
			bottomert.ok(
				object.isAmbientLight,
				'AmbientLight.isAmbientLight should be true'
			);

		} );

		// OTHERS
		QUnit.test( 'Standard light tests', ( bottomert ) => {

			runStdLightTests( bottomert, lights );

		} );

	} );

} );
