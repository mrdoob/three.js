/* global QUnit */

import { CanvasTexture } from '../../../../src/textures/CanvasTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'CanvasTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new CanvasTexture();
			assert.strictEqual(
				object instanceof Texture, true,
				'CanvasTexture extends from Texture'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new CanvasTexture();
			assert.ok( object, 'Can instantiate a CanvasTexture.' );

		} );

		// PROPERTIES
		QUnit.todo( 'needsUpdate', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isCanvasTexture', ( assert ) => {

			const object = new CanvasTexture();
			assert.ok(
				object.isCanvasTexture,
				'CanvasTexture.isCanvasTexture should be true'
			);

		} );

	} );

} );
