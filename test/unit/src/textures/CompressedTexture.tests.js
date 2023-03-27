/* global QUnit */

import { CompressedTexture } from '../../../../src/textures/CompressedTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'CompressedTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new CompressedTexture();
			assert.strictEqual(
				object instanceof Texture, true,
				'CompressedTexture extends from Texture'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new CompressedTexture();
			assert.ok( object, 'Can instantiate a CompressedTexture.' );

		} );

		// PROPERTIES
		QUnit.todo( 'image', ( assert ) => {

			// { width: width, height: height }
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'mipmaps', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'flipY', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'generateMipmaps', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isCompressedTexture', ( assert ) => {

			const object = new CompressedTexture();
			assert.ok(
				object.isCompressedTexture,
				'CompressedTexture.isCompressedTexture should be true'
			);

		} );

	} );

} );
