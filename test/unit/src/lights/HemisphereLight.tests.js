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
		QUnit.test( 'Extending', ( assert ) => {

			const object = new HemisphereLight();
			assert.strictEqual(
				object instanceof Light, true,
				'HemisphereLight extends from Light'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new HemisphereLight();
			assert.ok( object, 'Can instantiate a HemisphereLight.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new HemisphereLight();
			assert.ok(
				object.type === 'HemisphereLight',
				'HemisphereLight.type should be HemisphereLight'
			);

		} );

		QUnit.todo( 'position', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'groundColor', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isHemisphereLight', ( assert ) => {

			const object = new HemisphereLight();
			assert.ok(
				object.isHemisphereLight,
				'HemisphereLight.isHemisphereLight should be true'
			);

		} );

		QUnit.todo( 'copy', ( assert ) => {

			// copy( source, recursive )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'Standard light tests', ( assert ) => {

			runStdLightTests( assert, lights );

		} );

	} );

} );
