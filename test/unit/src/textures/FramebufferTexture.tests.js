/* global QUnit */

import { FramebufferTexture } from '../../../../src/textures/FramebufferTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'FramebufferTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new FramebufferTexture();
			assert.strictEqual(
				object instanceof Texture, true,
				'FramebufferTexture extends from Texture'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new FramebufferTexture();
			assert.ok( object, 'Can instantiate a FramebufferTexture.' );

		} );

		// PROPERTIES
		QUnit.todo( 'format', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'magFilter', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'minFilter', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'generateMipmaps', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'needsUpdate', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isFramebufferTexture', ( assert ) => {

			const object = new FramebufferTexture();
			assert.ok(
				object.isFramebufferTexture,
				'FramebufferTexture.isFramebufferTexture should be true'
			);

		} );

	} );

} );
