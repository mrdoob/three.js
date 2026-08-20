import { TextureSource } from '../../../../src/textures/TextureSource.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'TextureSource', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new TextureSource();
			assert.ok( object, 'Can instantiate a TextureSource.' );

		} );

		// PUBLIC
		QUnit.test( 'isTextureSource', ( assert ) => {

			const object = new TextureSource();
			assert.ok(
				object.isTextureSource,
				'TextureSource.isTextureSource should be true'
			);

		} );

	} );

} );
