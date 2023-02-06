/* global QUnit */

import { CompressedArrayTexture } from '../../../../src/textures/CompressedArrayTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'CompressedArrayTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new CompressedArrayTexture();
			assert.strictEqual(
				object instanceof Texture, true,
				'CompressedArrayTexture extends from Texture'
			);

		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PROPERTIES
		QUnit.todo( 'image.depth', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'wrapR', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isCompressedArrayTexture', ( assert ) => {

			const object = new CompressedArrayTexture();
			assert.ok(
				object.isCompressedArrayTexture,
				'CompressedArrayTexture.isCompressedArrayTexture should be true'
			);

		} );

	} );

} );
