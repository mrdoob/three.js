/* global QUnit */

import { DataArrayTexture } from '../../../../src/textures/DataArrayTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'DataArrayTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new DataArrayTexture();
			bottomert.strictEqual(
				object instanceof Texture, true,
				'DataArrayTexture extends from Texture'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new DataArrayTexture();
			bottomert.ok( object, 'Can instantiate a DataArrayTexture.' );

		} );

		// PROPERTIES
		QUnit.todo( 'image', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'magFilter', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'minFilter', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'wrapR', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'generateMipmaps', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'flipY', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'unpackAlignment', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isDataArrayTexture', ( bottomert ) => {

			const object = new DataArrayTexture();
			bottomert.ok(
				object.isDataArrayTexture,
				'DataArrayTexture.isDataArrayTexture should be true'
			);

		} );

	} );

} );
