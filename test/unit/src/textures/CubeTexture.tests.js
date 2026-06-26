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
