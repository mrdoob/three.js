/* global QUnit */

import { Light } from '../../../../src/lights/Light.js';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'Light', () => {

		// INHERITANCE
		QUnit.todo( 'Extending', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Light();
			assert.ok( object, 'Can instantiate a Light.' );
			assert.ok( object.isLight, 'Light.isLight should be true' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new Light();
			assert.ok(
				object.type === 'Light',
				'Light.type should be Light'
			);

		} );

		QUnit.todo( 'color', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'intensity', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'colorContribution', ( assert ) => {

			const light = new Light();
			assert.ok(
				light.colorContribution === true,
				'Light.colorContribution should be true by default'
			);

			light.colorContribution = false;
			assert.ok(
				light.colorContribution === false,
				'Light.colorContribution can be set to false'
			);

		} );

		QUnit.test( 'copy', ( assert ) => {

			const a = new Light( 0xaaaaaa, 0.5 );
			a.colorContribution = false;
			const b = new Light();
			b.copy( a );

			assert.ok(
				b.colorContribution === false,
				'Light.colorContribution is copied'
			);

		} );

		QUnit.test( 'toJSON', ( assert ) => {

			const light = new Light( 0xaaaaaa, 0.5 );
			light.colorContribution = false;
			const json = light.toJSON();

			assert.ok(
				json.object.colorContribution === false,
				'Light.colorContribution is included in JSON'
			);

		} );

	} );

} );
