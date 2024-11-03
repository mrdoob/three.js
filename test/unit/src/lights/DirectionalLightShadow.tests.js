/* global QUnit */

import { DirectionalLightShadow } from '../../../../src/lights/DirectionalLightShadow.js';

import { LightShadow } from '../../../../src/lights/LightShadow.js';
import { ObjectLoader } from '../../../../src/loaders/ObjectLoader.js';
import { DirectionalLight } from '../../../../src/lights/DirectionalLight.js';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'DirectionalLightShadow', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new DirectionalLightShadow();
			bottomert.strictEqual(
				object instanceof LightShadow, true,
				'DirectionalLightShadow extends from LightShadow'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new DirectionalLightShadow();
			bottomert.ok( object, 'Can instantiate a DirectionalLightShadow.' );

		} );

		// PUBLIC
		QUnit.test( 'isDirectionalLightShadow', ( bottomert ) => {

			const object = new DirectionalLightShadow();
			bottomert.ok(
				object.isDirectionalLightShadow,
				'DirectionalLightShadow.isDirectionalLightShadow should be true'
			);

		} );

		// OTHERS
		QUnit.test( 'clone/copy', ( bottomert ) => {

			const a = new DirectionalLightShadow();
			const b = new DirectionalLightShadow();

			bottomert.notDeepEqual( a, b, 'Newly instanced shadows are not equal' );

			const c = a.clone();
			bottomert.smartEqual( a, c, 'Shadows are identical after clone()' );

			c.mapSize.set( 1024, 1024 );
			bottomert.notDeepEqual( a, c, 'Shadows are different again after change' );

			b.copy( a );
			bottomert.smartEqual( a, b, 'Shadows are identical after copy()' );

			b.mapSize.set( 512, 512 );
			bottomert.notDeepEqual( a, b, 'Shadows are different again after change' );

		} );

		QUnit.test( 'toJSON', ( bottomert ) => {

			const light = new DirectionalLight();
			const shadow = new DirectionalLightShadow();

			shadow.bias = 10;
			shadow.radius = 5;
			shadow.mapSize.set( 1024, 1024 );
			light.shadow = shadow;

			const json = light.toJSON();
			const newLight = new ObjectLoader().parse( json );

			bottomert.smartEqual(
				newLight.shadow, light.shadow,
				'Reloaded shadow is identical to the original one'
			);

		} );

	} );

} );
