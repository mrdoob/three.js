/* global QUnit */

import { CubeTexture } from '../../../../src/textures/CubeTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'CubeTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new CubeTexture();
			assert.strictEqual(
				object instanceof Texture, true,
				'CubeTexture extends from Texture'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new CubeTexture();
			assert.ok( object, 'Can instantiate a CubeTexture.' );

		} );

		// PROPERTIES
		QUnit.todo( 'images', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'flipY', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isCubeTexture', ( assert ) => {

			const object = new CubeTexture();
			assert.ok(
				object.isCubeTexture,
				'CubeTexture.isCubeTexture should be true'
			);

		} );

	} );

} );
