import { CompressedTextureLoader } from '../../../../src/loaders/CompressedTextureLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';
import { RGBAFormat, RGB_S3TC_DXT1_Format } from '../../../../src/constants.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'CompressedTextureLoader', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new CompressedTextureLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'CompressedTextureLoader extends from Loader'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new CompressedTextureLoader();
			assert.ok( object, 'Can instantiate a CompressedTextureLoader.' );

		} );

		// PUBLIC
		QUnit.test( 'loadAsync', async ( assert ) => {

			class TestLoader extends CompressedTextureLoader {

				parse() {

					return this.texDatas;

				}

			}

			const url = 'data:application/octet-stream;base64,AA==';
			const mipmap = { data: new Uint8Array( 16 ), width: 2, height: 2 };
			const faces = new Array( 6 ).fill( mipmap );
			const loader = new TestLoader();

			loader.texDatas = { width: 2, height: 2, isCubemap: false, mipmapCount: 1, mipmaps: [ mipmap ], format: RGB_S3TC_DXT1_Format };
			let texture = await loader.loadAsync( url );
			assert.ok( texture.isCompressedTexture === true && texture.isCubeTexture !== true, 'Compressed data resolve as CompressedTexture.' );

			loader.texDatas = { width: 2, height: 2, isCubemap: false, mipmapCount: 1, mipmaps: [ mipmap ], format: RGBAFormat };
			texture = await loader.loadAsync( url );
			assert.ok( texture.isCompressedTexture === true && texture.format === RGBAFormat, 'Uncompressed data resolve as CompressedTexture.' );

			loader.texDatas = { width: 2, height: 2, isCubemap: true, mipmapCount: 1, mipmaps: faces, format: RGB_S3TC_DXT1_Format };
			texture = await loader.loadAsync( url );
			assert.ok( texture.isCompressedCubeTexture === true && texture.image.length === 6, 'A cube map in one file resolves as CompressedCubeTexture with six faces.' );

			loader.texDatas = { width: 2, height: 2, isCubemap: true, mipmapCount: 1, mipmaps: faces, format: RGBAFormat };
			texture = await loader.loadAsync( url );
			assert.ok( texture.isCompressedCubeTexture === true && texture.format === RGBAFormat, 'An uncompressed cube map resolves as CompressedCubeTexture.' );

			loader.texDatas = { width: 2, height: 2, isCubemap: false, mipmapCount: 1, mipmaps: [ mipmap ], format: RGB_S3TC_DXT1_Format };
			texture = await loader.loadAsync( new Array( 6 ).fill( url ) );
			assert.ok( texture.isCompressedCubeTexture === true && texture.image.length === 6, 'A cube map in six files resolves as CompressedCubeTexture with six faces.' );

		} );

	} );

} );
