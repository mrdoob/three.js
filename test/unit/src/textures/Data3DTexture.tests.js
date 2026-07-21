import { Data3DTexture } from '../../../../src/textures/Data3DTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';
import { RepeatWrapping } from '../../../../src/constants.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'Data3DTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new Data3DTexture();
			assert.strictEqual(
				object instanceof Texture, true,
				'Data3DTexture extends from Texture'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Data3DTexture();
			assert.ok( object, 'Can instantiate a Data3DTexture.' );

		} );

		// PUBLIC
		QUnit.test( 'isData3DTexture', ( assert ) => {

			const object = new Data3DTexture();
			assert.ok(
				object.isData3DTexture,
				'Data3DTexture.isData3DTexture should be true'
			);

		} );

		// SERIALIZATION
		QUnit.test( 'wrapR survives clone and toJSON', ( assert ) => {

			const texture = new Data3DTexture();
			texture.wrapR = RepeatWrapping;

			assert.equal( texture.clone().wrapR, RepeatWrapping, 'clone keeps wrapR' );

			const json = texture.toJSON( { images: {}, textures: {} } );
			assert.equal( json.wrap[ 2 ], RepeatWrapping, 'toJSON writes wrapR' );

		} );

	} );

} );
