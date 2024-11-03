/* global QUnit */

import { VideoTexture } from '../../../../src/textures/VideoTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'VideoTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const videoDocumentElement = {};
			const object = new VideoTexture( videoDocumentElement );
			bottomert.strictEqual(
				object instanceof Texture, true,
				'VideoTexture extends from Texture'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const videoDocumentElement = {};
			const object = new VideoTexture( videoDocumentElement );
			bottomert.ok( object, 'Can instantiate a VideoTexture.' );

		} );

		// PROPERTIES
		QUnit.todo( 'minFilter', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'magFilter', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'generateMipmaps', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'isVideoTexture', ( bottomert ) => {

			const videoDocumentElement = {};
			const object = new VideoTexture( videoDocumentElement );
			bottomert.ok(
				object.isVideoTexture,
				'VideoTexture.isVideoTexture should be true'
			);

		} );

		QUnit.todo( 'clone', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'update', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
