
import { CompressedCubeTexture } from '../../../../src/textures/CompressedCubeTexture.js';
import { CompressedTexture } from '../../../../src/textures/CompressedTexture.js';
import { CubeReflectionMapping } from '../../../../src/constants.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'CompressedCubeTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const images = [ { width: 100, height: 100 } ];
			const object = new CompressedCubeTexture( images );
			assert.strictEqual(
				object instanceof CompressedTexture, true,
				'CompressedCubeTexture extends from CompressedTexture'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const images = [ { width: 100, height: 100 } ];
			const object = new CompressedCubeTexture( images );
			assert.ok( object, 'Can instantiate a CompressedCubeTexture.' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'isCompressedCubeTexture', ( assert ) => {

			const images = [ { width: 100, height: 100 } ];
			const object = new CompressedCubeTexture( images );
			assert.ok(
				object.isCompressedCubeTexture,
				'CompressedCubeTexture.isCompressedCubeTexture should be true'
			);

		} );

		QUnit.test( 'isCubeTexture', ( assert ) => {

			const images = [ { width: 100, height: 100 } ];
			const object = new CompressedCubeTexture( images );
			assert.ok(
				object.isCubeTexture,
				'CompressedCubeTexture.isCubeTexture should be true'
			);

		} );

		QUnit.test( 'parameters', ( assert ) => {

			const images = [ { width: 100, height: 100 } ];
			const format = 1001;
			const type = 1002;

			const object = new CompressedCubeTexture( images, format, type );

			assert.strictEqual( object.image, images, 'Check images' );
			assert.strictEqual( object.format, format, 'Check format' );
			assert.strictEqual( object.type, type, 'Check type' );
			assert.strictEqual( object.mapping, CubeReflectionMapping, 'Check mapping' );

		} );

	} );

} );
