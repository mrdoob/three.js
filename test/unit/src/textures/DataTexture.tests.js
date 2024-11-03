/* global QUnit */

import { DataTexture } from '../../../../src/textures/DataTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'DataTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new DataTexture();
			bottomert.strictEqual(
				object instanceof Texture, true,
				'DataTexture extends from Texture'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new DataTexture();
			bottomert.ok( object, 'Can instantiate a DataTexture.' );

		} );

		// PROPERTIES
		QUnit.todo( 'image', ( bottomert ) => {

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
		QUnit.test( 'isDataTexture', ( bottomert ) => {

			const object = new DataTexture();
			bottomert.ok(
				object.isDataTexture,
				'DataTexture.isDataTexture should be true'
			);

		} );

	} );

} );
