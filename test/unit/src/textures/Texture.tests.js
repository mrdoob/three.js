import { Texture } from '../../../../src/textures/Texture.js';

import { EventDispatcher } from '../../../../src/core/EventDispatcher.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'Texture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new Texture();
			assert.strictEqual(
				object instanceof EventDispatcher, true,
				'Texture extends from EventDispatcher'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			// no params
			const object = new Texture();
			assert.ok( object, 'Can instantiate a Texture.' );

		} );

		// PUBLIC
		QUnit.test( 'isTexture', ( assert ) => {

			const object = new Texture();
			assert.ok(
				object.isTexture,
				'Texture.isTexture should be true'
			);

		} );

		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const object = new Texture();
			object.dispose();

		} );

	} );

} );
