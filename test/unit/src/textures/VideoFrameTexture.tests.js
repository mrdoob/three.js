
import { VideoFrameTexture } from '../../../../src/textures/VideoFrameTexture.js';
import { VideoTexture } from '../../../../src/textures/VideoTexture.js';
import { Texture } from '../../../../src/textures/Texture.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'VideoFrameTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new VideoFrameTexture();
			assert.strictEqual(
				object instanceof VideoTexture, true,
				'VideoFrameTexture extends from VideoTexture'
			);
			assert.strictEqual(
				object instanceof Texture, true,
				'VideoFrameTexture extends from Texture'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new VideoFrameTexture();
			assert.ok( object, 'Can instantiate a VideoFrameTexture.' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'isVideoFrameTexture', ( assert ) => {

			const object = new VideoFrameTexture();
			assert.ok(
				object.isVideoFrameTexture,
				'VideoFrameTexture.isVideoFrameTexture should be true'
			);

		} );

		QUnit.test( 'update', ( assert ) => {

			const object = new VideoFrameTexture();
			// should not throw
			object.update();
			assert.ok( true, 'update() executes without error' );

		} );

		QUnit.test( 'clone', ( assert ) => {

			const object = new VideoFrameTexture();
			const cloned = object.clone();

			assert.ok( cloned instanceof VideoFrameTexture, 'Cloned object is instance of VideoFrameTexture' );
			assert.notEqual( object, cloned, 'Cloned object is a new instance' );
			assert.strictEqual( cloned.isVideoFrameTexture, true, 'Cloned object has isVideoFrameTexture flag' );

		} );

		QUnit.test( 'setFrame', ( assert ) => {

			const object = new VideoFrameTexture();
			const frame = {};

			object.setFrame( frame );

			assert.strictEqual( object.image, frame, 'image property is set to the frame' );
			assert.strictEqual( object.version, 1, 'version should be incremented' );

		} );

	} );

} );
