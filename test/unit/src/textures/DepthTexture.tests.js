import { DepthTexture } from '../../../../src/textures/DepthTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'DepthTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new DepthTexture();
			assert.strictEqual(
				object instanceof Texture, true,
				'DepthTexture extends from Texture'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new DepthTexture();
			assert.ok( object, 'Can instantiate a DepthTexture.' );

		} );

		// PUBLIC
		QUnit.test( 'isDepthTexture', ( assert ) => {

			const object = new DepthTexture();
			assert.ok(
				object.isDepthTexture,
				'DepthTexture.isDepthTexture should be true'
			);

		} );

	} );

} );
