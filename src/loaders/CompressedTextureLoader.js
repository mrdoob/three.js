import { LinearFilter } from '../constants.js';
import { FileLoader } from './FileLoader.js';
import { CompressedTexture } from '../textures/CompressedTexture.js';
import { CompressedCubeTexture } from '../textures/CompressedCubeTexture.js';
import { Loader } from './Loader.js';
import { warnOnce } from '../utils.js';

/**
 * Abstract base class for loading compressed texture formats S3TC, ASTC or ETC.
 * Textures are internally loaded via {@link FileLoader}.
 *
 * Derived classes have to implement the `parse()` method which holds the parsing
 * for the respective format.
 *
 * @abstract
 * @augments Loader
 */
class CompressedTextureLoader extends Loader {

	/**
	 * Constructs a new compressed texture loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

	}

	/**
	 * Starts loading from the given URL and passes the loaded compressed texture
	 * to the `onLoad()` callback. The method also returns a new texture object which can
	 * directly be used for material creation. If you do it this way, the texture
	 * may pop up in your scene once the respective loading process is finished.
	 *
	 * The texture is created before the data are parsed, so it is always a 2D compressed
	 * texture. Loading cube maps with this method is deprecated. Use {@link CompressedTextureLoader#loadAsync}
	 * instead, which returns them as {@link CompressedCubeTexture}.
	 *
	 * @param {string|Array<string>} url - The path/URL of the file to be loaded, or the paths/URLs
	 * of the six faces of a cube map. This can also be a data URI.
	 * @param {function(CompressedTexture)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 * @return {CompressedTexture} The compressed texture.
	 */
	load( url, onLoad, onProgress, onError ) {

		const texture = new CompressedTexture();

		this._loadData( url, function ( texDatas, faces ) {

			if ( faces !== null ) {

				warnOnce( 'CompressedTextureLoader: Loading cube maps with load() has been deprecated. Use loadAsync() instead.' ); // @deprecated r187

				texture.image = faces;

			} else {

				texture.image.width = texDatas.width;
				texture.image.height = texDatas.height;
				texture.mipmaps = texDatas.mipmaps;

			}

			if ( texDatas.mipmapCount === 1 ) {

				texture.minFilter = LinearFilter;

			}

			texture.format = texDatas.format;
			texture.needsUpdate = true;

			if ( onLoad ) onLoad( texture );

		}, onProgress, onError );

		return texture;

	}

	/**
	 * Async version of {@link CompressedTextureLoader#load}. The texture is created once the
	 * data are parsed, so cube maps are returned as {@link CompressedCubeTexture}.
	 *
	 * @param {string|Array<string>} url - The path/URL of the file to be loaded, or the paths/URLs
	 * of the six faces of a cube map. This can also be a data URI.
	 * @param {onProgressCallback} [onProgress] - Executed while the loading is in progress.
	 * @return {Promise<CompressedTexture|CompressedCubeTexture>} A Promise that resolves with the loaded texture.
	 */
	loadAsync( url, onProgress ) {

		return new Promise( ( resolve, reject ) => {

			this._loadData( url, function ( texDatas, faces ) {

				resolve( createTexture( texDatas, faces ) );

			}, onProgress, reject );

		} );

	}

	/**
	 * Loads and parses the file, or the six files of a cube map, and passes the
	 * parsed data and, for a cube map, its faces to `onLoad()`.
	 *
	 * @private
	 * @param {string|Array<string>} url - The path/URL of the file, or the paths/URLs of the six faces of a cube map.
	 * @param {function(CompressedTextureLoader~TexData, ?Array<Object>)} onLoad - Executed with the parsed data (of the last face
	 * for six files) and the faces of a cube map, or `null`.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 */
	_loadData( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( this.manager );
		loader.setPriority( this.priority );
		loader.setCache( this.cache );
		loader.setPath( this.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( scope.withCredentials );

		if ( Array.isArray( url ) ) {

			// cubemap texture with one file per face

			const faces = [];

			let loaded = 0;

			for ( let i = 0, il = url.length; i < il; ++ i ) {

				loader.load( url[ i ], function ( buffer ) {

					const texDatas = scope.parse( buffer, true );

					faces[ i ] = {
						width: texDatas.width,
						height: texDatas.height,
						format: texDatas.format,
						mipmaps: texDatas.mipmaps
					};

					loaded += 1;

					if ( loaded === 6 ) onLoad( texDatas, faces );

				}, onProgress, onError );

			}

		} else {

			loader.load( url, function ( buffer ) {

				const texDatas = scope.parse( buffer, true );

				let faces = null;

				if ( texDatas.isCubemap ) {

					// compressed cubemap texture stored in a single DDS file

					faces = [];

					const faceCount = texDatas.mipmaps.length / texDatas.mipmapCount;

					for ( let f = 0; f < faceCount; f ++ ) {

						faces[ f ] = { mipmaps: [] };

						for ( let i = 0; i < texDatas.mipmapCount; i ++ ) {

							faces[ f ].mipmaps.push( texDatas.mipmaps[ f * texDatas.mipmapCount + i ] );
							faces[ f ].format = texDatas.format;
							faces[ f ].width = texDatas.width;
							faces[ f ].height = texDatas.height;

						}

					}

				}

				onLoad( texDatas, faces );

			}, onProgress, onError );

		}

	}

}

// Creates the texture for the parsed data: a compressed cube texture for the faces of a cube map.

function createTexture( texDatas, faces ) {

	let texture;

	if ( faces !== null ) {

		texture = new CompressedCubeTexture( faces, texDatas.format );

	} else {

		texture = new CompressedTexture( texDatas.mipmaps, texDatas.width, texDatas.height, texDatas.format );

	}

	if ( texDatas.mipmapCount === 1 ) {

		texture.minFilter = LinearFilter;

	}

	texture.needsUpdate = true;

	return texture;

}

/**
 * Represents the result object type of the `parse()` method.
 *
 * @typedef {Object} CompressedTextureLoader~TexData
 * @property {number} width - The width of the base mip.
 * @property {number} height - The height of the base mip.
 * @property {boolean} isCubemap - Whether the data represent a cubemap or not.
 * @property {number} mipmapCount - The mipmap count.
 * @property {Array<{data:TypedArray,width:number,height:number}>} mipmaps - An array holding the mipmaps.
 * Each entry holds the data and the dimensions for each level.
 * @property {number} format - The texture format.
 **/

export { CompressedTextureLoader };
