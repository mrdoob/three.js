/* global QUnit */

import { CompressedTexture } from '../../../../src/textures/CompressedTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'CompressedTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			var object = new CompressedTexture();

			assert.strictEqual( object instanceof Texture, true, 'CompressedTexture extends from Texture' );

		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC STUFF
		QUnit.todo( 'isCompressedTexture', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
