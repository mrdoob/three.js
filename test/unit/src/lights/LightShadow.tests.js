/* global QUnit */

import { LightShadow } from '../../../../src/lights/LightShadow.js';
import { OrthographicCamera } from '../../../../src/cameras/OrthographicCamera.js';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'LightShadow', () => {

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'clone/copy', ( assert ) => {

			var a = new LightShadow( new OrthographicCamera( - 5, 5, 5, - 5, 0.5, 500 ) );
			var b = new LightShadow( new OrthographicCamera( - 3, 3, 3, - 3, 0.3, 300 ) );
			var c;

			assert.notDeepEqual( a, b, 'Newly instanced shadows are not equal' );

			c = a.clone();
			assert.smartEqual( a, c, 'Shadows are identical after clone()' );

			c.mapSize.set( 256, 256 );
			assert.notDeepEqual( a, c, 'Shadows are different again after change' );

			b.copy( a );
			assert.smartEqual( a, b, 'Shadows are identical after copy()' );

			b.mapSize.set( 512, 512 );
			assert.notDeepEqual( a, b, 'Shadows are different again after change' );

		} );

		QUnit.todo( 'toJSON', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
