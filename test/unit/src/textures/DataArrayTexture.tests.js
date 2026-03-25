import { DataArrayTexture } from '../../../../src/textures/DataArrayTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'DataArrayTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new DataArrayTexture();
			assert.strictEqual(
				object instanceof Texture, true,
				'DataArrayTexture extends from Texture'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new DataArrayTexture();
			assert.ok( object, 'Can instantiate a DataArrayTexture.' );

		} );

		// PUBLIC
		QUnit.test( 'isDataArrayTexture', ( assert ) => {

			const object = new DataArrayTexture();
			assert.ok(
				object.isDataArrayTexture,
				'DataArrayTexture.isDataArrayTexture should be true'
			);

		} );

	} );

} );
