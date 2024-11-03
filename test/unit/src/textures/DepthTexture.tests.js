/* global QUnit */

import { DepthTexture } from '../../../../src/textures/DepthTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'DepthTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new DepthTexture();
			bottomert.strictEqual(
				object instanceof Texture, true,
				'DepthTexture extends from Texture'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new DepthTexture();
			bottomert.ok( object, 'Can instantiate a DepthTexture.' );

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

		QUnit.todo( 'flipY', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'generateMipmaps', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isDepthTexture', ( bottomert ) => {

			const object = new DepthTexture();
			bottomert.ok(
				object.isDepthTexture,
				'DepthTexture.isDepthTexture should be true'
			);

		} );

	} );

} );
