/* global QUnit */

import { Data3DTexture } from '../../../../src/textures/Data3DTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'Data3DTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new Data3DTexture();
			assert.strictEqual(
				object instanceof Texture, true,
				'Data3DTexture extends from Texture'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Data3DTexture();
			assert.ok( object, 'Can instantiate a Data3DTexture.' );

		} );

		// PROPERTIES
		QUnit.todo( 'image', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'magFilter', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'minFilter', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'wrapR', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'generateMipmaps', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'flipY', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'unpackAlignment', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isData3DTexture', ( assert ) => {

			const object = new Data3DTexture();
			assert.ok(
				object.isData3DTexture,
				'Data3DTexture.isData3DTexture should be true'
			);

		} );

	} );

} );
