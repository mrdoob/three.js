import { VideoTexture } from '../../../../src/textures/VideoTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'VideoTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const videoDocumentElement = {};
			const object = new VideoTexture( videoDocumentElement );
			assert.strictEqual(
				object instanceof Texture, true,
				'VideoTexture extends from Texture'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const videoDocumentElement = {};
			const object = new VideoTexture( videoDocumentElement );
			assert.ok( object, 'Can instantiate a VideoTexture.' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'isVideoTexture', ( assert ) => {

			const videoDocumentElement = {};
			const object = new VideoTexture( videoDocumentElement );
			assert.ok(
				object.isVideoTexture,
				'VideoTexture.isVideoTexture should be true'
			);

		} );

	} );

} );
