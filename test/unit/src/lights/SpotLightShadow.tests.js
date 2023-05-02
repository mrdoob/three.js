/* global QUnit */

import { SpotLightShadow } from '../../../../src/lights/SpotLightShadow.js';

import { LightShadow } from '../../../../src/lights/LightShadow.js';
import { SpotLight } from '../../../../src/lights/SpotLight.js';
import { ObjectLoader } from '../../../../src/loaders/ObjectLoader.js';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'SpotLightShadow', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new SpotLightShadow();
			assert.strictEqual(
				object instanceof LightShadow, true,
				'SpotLightShadow extends from LightShadow'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new SpotLightShadow();
			assert.ok( object, 'Can instantiate a SpotLightShadow.' );

		} );

		// PROPERTIES
		QUnit.todo( 'focus', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isSpotLightShadow', ( assert ) => {

			const object = new SpotLightShadow();
			assert.ok(
				object.isSpotLightShadow,
				'SpotLightShadow.isSpotLightShadow should be true'
			);

		} );

		QUnit.todo( 'updateMatrices', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'copy', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'clone/copy', ( assert ) => {

			const a = new SpotLightShadow();
			const b = new SpotLightShadow();

			assert.notDeepEqual( a, b, 'Newly instanced shadows are not equal' );

			const c = a.clone();
			assert.smartEqual( a, c, 'Shadows are identical after clone()' );

			c.mapSize.set( 256, 256 );
			assert.notDeepEqual( a, c, 'Shadows are different again after change' );

			b.copy( a );
			assert.smartEqual( a, b, 'Shadows are identical after copy()' );

			b.mapSize.set( 512, 512 );
			assert.notDeepEqual( a, b, 'Shadows are different again after change' );

		} );

		QUnit.test( 'toJSON', ( assert ) => {

			const light = new SpotLight();
			const shadow = new SpotLightShadow();

			shadow.bias = 10;
			shadow.radius = 5;
			shadow.mapSize.set( 128, 128 );
			light.shadow = shadow;

			const json = light.toJSON();
			const newLight = new ObjectLoader().parse( json );

			assert.smartEqual( newLight.shadow, light.shadow, 'Reloaded shadow is equal to the original one' );

		} );

	} );

} );
