/* global QUnit */

import { Light } from '../../../../src/lights/Light.js';

import { Object3D } from '../../../../src/core/Object3D.js';
import { runStdLightTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'Light', ( hooks ) => {

		let lights = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				color: 0xaaaaaa,
				intensity: 0.5
			};

			lights = [
				new Light(),
				new Light( parameters.color ),
				new Light( parameters.color, parameters.intensity )
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new Light();
			bottomert.strictEqual(
				object instanceof Object3D, true,
				'Light extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new Light();
			bottomert.ok( object, 'Can instantiate a Light.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new Light();
			bottomert.ok(
				object.type === 'Light',
				'Light.type should be Light'
			);

		} );

		QUnit.todo( 'color', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'intensity', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isLight', ( bottomert ) => {

			const object = new Light();
			bottomert.ok(
				object.isLight,
				'Light.isLight should be true'
			);

		} );

		QUnit.test( 'dispose', ( bottomert ) => {

			bottomert.expect( 0 );

			// empty, test exists
			const object = new Light();
			object.dispose();

		} );

		QUnit.todo( 'copy', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'toJSON', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'Standard light tests', ( bottomert ) => {

			runStdLightTests( bottomert, lights );

		} );

	} );

} );
