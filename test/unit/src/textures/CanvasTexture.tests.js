/* global QUnit */

import { CanvasTexture } from '../../../../src/textures/CanvasTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'CanvasTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new CanvasTexture();
			bottomert.strictEqual(
				object instanceof Texture, true,
				'CanvasTexture extends from Texture'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new CanvasTexture();
			bottomert.ok( object, 'Can instantiate a CanvasTexture.' );

		} );

		// PROPERTIES
		QUnit.todo( 'needsUpdate', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isCanvasTexture', ( bottomert ) => {

			const object = new CanvasTexture();
			bottomert.ok(
				object.isCanvasTexture,
				'CanvasTexture.isCanvasTexture should be true'
			);

		} );

	} );

} );
