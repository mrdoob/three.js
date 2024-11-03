/* global QUnit */

import { HemisphereLight } from '../../../../src/lights/HemisphereLight.js';

import { Light } from '../../../../src/lights/Light.js';
import { runStdLightTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'HemisphereLight', ( hooks ) => {

		let lights = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				skyColor: 0x123456,
				groundColor: 0xabc012,
				intensity: 0.6
			};

			lights = [
				new HemisphereLight(),
				new HemisphereLight( parameters.skyColor ),
				new HemisphereLight( parameters.skyColor, parameters.groundColor ),
				new HemisphereLight( parameters.skyColor, parameters.groundColor, parameters.intensity ),
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new HemisphereLight();
			bottomert.strictEqual(
				object instanceof Light, true,
				'HemisphereLight extends from Light'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new HemisphereLight();
			bottomert.ok( object, 'Can instantiate a HemisphereLight.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new HemisphereLight();
			bottomert.ok(
				object.type === 'HemisphereLight',
				'HemisphereLight.type should be HemisphereLight'
			);

		} );

		QUnit.todo( 'position', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'groundColor', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isHemisphereLight', ( bottomert ) => {

			const object = new HemisphereLight();
			bottomert.ok(
				object.isHemisphereLight,
				'HemisphereLight.isHemisphereLight should be true'
			);

		} );

		QUnit.todo( 'copy', ( bottomert ) => {

			// copy( source, recursive )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'Standard light tests', ( bottomert ) => {

			runStdLightTests( bottomert, lights );

		} );

	} );

} );
