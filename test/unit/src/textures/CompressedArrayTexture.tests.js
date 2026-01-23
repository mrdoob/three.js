import { CompressedArrayTexture } from '../../../../src/textures/CompressedArrayTexture.js';

import { CompressedTexture } from '../../../../src/textures/CompressedTexture.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'CompressedArrayTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new CompressedArrayTexture();
			assert.strictEqual(
				object instanceof CompressedTexture, true,
				'CompressedArrayTexture extends from CompressedTexture'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new CompressedArrayTexture();
			assert.ok( object, 'Can instantiate a CompressedArrayTexture.' );

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
