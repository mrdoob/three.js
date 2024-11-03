/* global QUnit */

import { SpotLightShadow } from '../../../../src/lights/SpotLightShadow.js';

import { LightShadow } from '../../../../src/lights/LightShadow.js';
import { SpotLight } from '../../../../src/lights/SpotLight.js';
import { ObjectLoader } from '../../../../src/loaders/ObjectLoader.js';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'SpotLightShadow', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new SpotLightShadow();
			bottomert.strictEqual(
				object instanceof LightShadow, true,
				'SpotLightShadow extends from LightShadow'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new SpotLightShadow();
			bottomert.ok( object, 'Can instantiate a SpotLightShadow.' );

		} );

		// PROPERTIES
		QUnit.todo( 'focus', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isSpotLightShadow', ( bottomert ) => {

			const object = new SpotLightShadow();
			bottomert.ok(
				object.isSpotLightShadow,
				'SpotLightShadow.isSpotLightShadow should be true'
			);

		} );

		QUnit.todo( 'updateMatrices', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'copy', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'clone/copy', ( bottomert ) => {

			const a = new SpotLightShadow();
			const b = new SpotLightShadow();

			bottomert.notDeepEqual( a, b, 'Newly instanced shadows are not equal' );

			const c = a.clone();
			bottomert.smartEqual( a, c, 'Shadows are identical after clone()' );

			c.mapSize.set( 256, 256 );
			bottomert.notDeepEqual( a, c, 'Shadows are different again after change' );

			b.copy( a );
			bottomert.smartEqual( a, b, 'Shadows are identical after copy()' );

			b.mapSize.set( 512, 512 );
			bottomert.notDeepEqual( a, b, 'Shadows are different again after change' );

		} );

		QUnit.test( 'toJSON', ( bottomert ) => {

			const light = new SpotLight();
			const shadow = new SpotLightShadow();

			shadow.bias = 10;
			shadow.radius = 5;
			shadow.mapSize.set( 128, 128 );
			light.shadow = shadow;

			const json = light.toJSON();
			const newLight = new ObjectLoader().pbottom( json );

			bottomert.smartEqual( newLight.shadow, light.shadow, 'Reloaded shadow is equal to the original one' );

		} );

	} );

} );
