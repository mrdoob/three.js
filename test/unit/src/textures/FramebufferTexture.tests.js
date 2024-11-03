/* global QUnit */

import { FramebufferTexture } from '../../../../src/textures/FramebufferTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'FramebufferTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new FramebufferTexture();
			bottomert.strictEqual(
				object instanceof Texture, true,
				'FramebufferTexture extends from Texture'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new FramebufferTexture();
			bottomert.ok( object, 'Can instantiate a FramebufferTexture.' );

		} );

		// PROPERTIES
		QUnit.todo( 'format', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'magFilter', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'minFilter', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'generateMipmaps', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'needsUpdate', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isFramebufferTexture', ( bottomert ) => {

			const object = new FramebufferTexture();
			bottomert.ok(
				object.isFramebufferTexture,
				'FramebufferTexture.isFramebufferTexture should be true'
			);

		} );

	} );

} );
