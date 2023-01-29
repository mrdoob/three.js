/* global QUnit */

import { DepthTexture } from '../../../../src/textures/DepthTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'DepthTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			var object = new DepthTexture();

			assert.strictEqual( object instanceof Texture, true, 'DepthTexture extends from Texture' );

		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC STUFF
		QUnit.todo( 'isDepthTexture', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
