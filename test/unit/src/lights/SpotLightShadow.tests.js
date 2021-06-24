/* global QUnit */

import { SpotLightShadow } from '../../../../src/lights/SpotLightShadow';
import { SpotLight } from '../../../../src/lights/SpotLight';
import { ObjectLoader } from '../../../../src/loaders/ObjectLoader';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'SpotLightShadow', () => {

		// INHERITANCE
		QUnit.todo( "Extending", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// PUBLIC STUFF
		QUnit.todo( "isSpotLightShadow", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "update", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// OTHERS
		QUnit.test( "clone/copy", ( assert ) => {

			var a = new SpotLightShadow();
			var b = new SpotLightShadow();
			var c;

			assert.notDeepEqual( a, b, "Newly instanced shadows are not equal" );

			c = a.clone();
			assert.smartEqual( a, c, "Shadows are identical after clone()" );

			c.mapSize.set( 256, 256 );
			assert.notDeepEqual( a, c, "Shadows are different again after change" );

			b.copy( a );
			assert.smartEqual( a, b, "Shadows are identical after copy()" );

			b.mapSize.set( 512, 512 );
			assert.notDeepEqual( a, b, "Shadows are different again after change" );

		} );

		QUnit.test( "toJSON", ( assert ) => {

			var light = new SpotLight();
			var shadow = new SpotLightShadow();

			shadow.bias = 10;
			shadow.radius = 5;
			shadow.mapSize.set( 128, 128 );
			light.shadow = shadow;

			var json = light.toJSON();
			var newLight = new ObjectLoader().parse( json );

			assert.smartEqual( newLight.shadow, light.shadow, "Reloaded shadow is equal to the original one" );

		} );

	} );

} );
