/* global QUnit */

import { CubeTexture } from '../../../../src/textures/CubeTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'CubeTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new CubeTexture();
			bottomert.strictEqual(
				object instanceof Texture, true,
				'CubeTexture extends from Texture'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new CubeTexture();
			bottomert.ok( object, 'Can instantiate a CubeTexture.' );

		} );

		// PROPERTIES
		QUnit.todo( 'images', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'flipY', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isCubeTexture', ( bottomert ) => {

			const object = new CubeTexture();
			bottomert.ok(
				object.isCubeTexture,
				'CubeTexture.isCubeTexture should be true'
			);

		} );

	} );

} );
