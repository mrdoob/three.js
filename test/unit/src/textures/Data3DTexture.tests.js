/* global QUnit */

import { Data3DTexture } from '../../../../src/textures/Data3DTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'Data3DTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new Data3DTexture();
			bottomert.strictEqual(
				object instanceof Texture, true,
				'Data3DTexture extends from Texture'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new Data3DTexture();
			bottomert.ok( object, 'Can instantiate a Data3DTexture.' );

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
		QUnit.test( 'isData3DTexture', ( bottomert ) => {

			const object = new Data3DTexture();
			bottomert.ok(
				object.isData3DTexture,
				'Data3DTexture.isData3DTexture should be true'
			);

		} );

	} );

} );
