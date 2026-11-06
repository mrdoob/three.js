import { assert, describe, test } from 'vitest';

import { VideoTexture } from '../../../../src/textures/VideoTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

describe( 'Textures', () => {

	describe( 'VideoTexture', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const videoDocumentElement = {};
			const object = new VideoTexture( videoDocumentElement );
			assert.strictEqual(
				object instanceof Texture, true,
				'VideoTexture extends from Texture'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const videoDocumentElement = {};
			const object = new VideoTexture( videoDocumentElement );
			assert.ok( object, 'Can instantiate a VideoTexture.' );

		} );

		// PUBLIC STUFF
		test( 'isVideoTexture', () => {

			const videoDocumentElement = {};
			const object = new VideoTexture( videoDocumentElement );
			assert.ok(
				object.isVideoTexture,
				'VideoTexture.isVideoTexture should be true'
			);

		} );

	} );

} );
