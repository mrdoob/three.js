import { CubeArrayTexture } from '../../../../src/textures/CubeArrayTexture.js';
import { Texture } from '../../../../src/textures/Texture.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'CubeArrayTexture', () => {

		QUnit.test( 'Extending', assert => {

			assert.ok( new CubeArrayTexture() instanceof Texture, 'Extends Texture' );

		} );

		QUnit.test( 'Instancing', assert => {

			const object = new CubeArrayTexture();
			assert.true( object.isCubeArrayTexture );
			assert.false( object.flipY );
			assert.deepEqual( object.images, [] );
			assert.strictEqual( object.depth, 0 );

		} );

	} );

} );
