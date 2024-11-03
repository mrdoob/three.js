/* global QUnit */

import { CompressedTexture } from '../../../../src/textures/CompressedTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'CompressedTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new CompressedTexture();
			bottomert.strictEqual(
				object instanceof Texture, true,
				'CompressedTexture extends from Texture'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new CompressedTexture();
			bottomert.ok( object, 'Can instantiate a CompressedTexture.' );

		} );

		// PROPERTIES
		QUnit.todo( 'image', ( bottomert ) => {

			// { width: width, height: height }
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'mipmaps', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'flipY', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'generateMipmaps', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isCompressedTexture', ( bottomert ) => {

			const object = new CompressedTexture();
			bottomert.ok(
				object.isCompressedTexture,
				'CompressedTexture.isCompressedTexture should be true'
			);

		} );

	} );

} );
