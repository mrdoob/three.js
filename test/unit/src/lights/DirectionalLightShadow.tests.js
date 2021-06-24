/* global QUnit */

import { ObjectLoader } from '../../../../src/loaders/ObjectLoader';
import { DirectionalLight } from '../../../../src/lights/DirectionalLight';
import { DirectionalLightShadow } from '../../../../src/lights/DirectionalLightShadow';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'DirectionalLightShadow', () => {

		// INHERITANCE
		QUnit.todo( "Extending", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// OTHERS
		QUnit.test( "clone/copy", ( assert ) => {

			var a = new DirectionalLightShadow();
			var b = new DirectionalLightShadow();
			var c;

			assert.notDeepEqual( a, b, "Newly instanced shadows are not equal" );

			c = a.clone();
			assert.smartEqual( a, c, "Shadows are identical after clone()" );

			c.mapSize.set( 1024, 1024 );
			assert.notDeepEqual( a, c, "Shadows are different again after change" );

			b.copy( a );
			assert.smartEqual( a, b, "Shadows are identical after copy()" );

			b.mapSize.set( 512, 512 );
			assert.notDeepEqual( a, b, "Shadows are different again after change" );

		} );

		QUnit.test( "toJSON", ( assert ) => {

			var light = new DirectionalLight();
			var shadow = new DirectionalLightShadow();

			shadow.bias = 10;
			shadow.radius = 5;
			shadow.mapSize.set( 1024, 1024 );
			light.shadow = shadow;

			var json = light.toJSON();
			var newLight = new ObjectLoader().parse( json );

			assert.smartEqual( newLight.shadow, light.shadow, "Reloaded shadow is identical to the original one" );

		} );

	} );

} );
