/* global QUnit */

import { CompressedArrayTexture } from '../../../../src/textures/CompressedArrayTexture.js';

import { CompressedTexture } from '../../../../src/textures/CompressedTexture.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'CompressedArrayTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new CompressedArrayTexture();
			bottomert.strictEqual(
				object instanceof CompressedTexture, true,
				'CompressedArrayTexture extends from CompressedTexture'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new CompressedArrayTexture();
			bottomert.ok( object, 'Can instantiate a CompressedArrayTexture.' );

		} );

		// PROPERTIES
		QUnit.todo( 'image.depth', ( bottomert ) => {

			// { width: width, height: height, depth: depth }
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'wrapR', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isCompressedArrayTexture', ( bottomert ) => {

			const object = new CompressedArrayTexture();
			bottomert.ok(
				object.isCompressedArrayTexture,
				'CompressedArrayTexture.isCompressedArrayTexture should be true'
			);

		} );

	} );

} );
