import { LinearFilter, LinearMipmapLinearFilter, ClampToEdgeWrapping } from '../constants.js';
import { FileLoader } from './FileLoader.js';
import { DataTexture } from '../textures/DataTexture.js';
import { Loader } from './Loader.js';

/**
 * Abstract base class for loading binary texture formats RGBE, EXR or TGA.
 * Textures are internally loaded via {@link FileLoader}.
 *
 * Derived classes have to implement the `parse()` method which holds the parsing
 * for the respective format.
 *
 * @abstract
 * @augments Loader
 */
class DataTextureLoader extends Loader {

	/**
	 * Constructs a new data texture loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

	}

	/**
	 * Starts loading from the given URL and passes the loaded data texture
	 * to the `onLoad()` callback. The method also returns a new texture object which can
	 * directly be used for material creation. If you do it this way, the texture
	 * may pop up in your scene once the respective loading process is finished.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function(DataTexture)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 * @return {DataTexture} The data texture.
	 */
	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const texture = new DataTexture();

		const loader = new FileLoader( this.manager );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( this.requestHeader );
		loader.setPath( this.path );
		loader.setWithCredentials( scope.withCredentials );
		loader.load( url, function ( buffer ) {

			let texData;

			try {

				texData = scope.parse( buffer );

			} catch ( error ) {

				if ( onError !== undefined ) {

					onError( error );

				} else {

					console.error( error );
					return;

				}

			}

			if ( texData.image !== undefined ) {

				texture.image = texData.image;

			} else if ( texData.data !== undefined ) {

				texture.image.width = texData.width;
				texture.image.height = texData.height;
				texture.image.data = texData.data;

			}

			texture.wrapS = texData.wrapS !== undefined ? texData.wrapS : ClampToEdgeWrapping;
			texture.wrapT = texData.wrapT !== undefined ? texData.wrapT : ClampToEdgeWrapping;

			texture.magFilter = texData.magFilter !== undefined ? texData.magFilter : LinearFilter;
			texture.minFilter = texData.minFilter !== undefined ? texData.minFilter : LinearFilter;

			texture.anisotropy = texData.anisotropy !== undefined ? texData.anisotropy : 1;

			if ( texData.colorSpace !== undefined ) {

				texture.colorSpace = texData.colorSpace;

			}

			if ( texData.flipY !== undefined ) {

				texture.flipY = texData.flipY;

			}

			if ( texData.format !== undefined ) {

				texture.format = texData.format;

			}

			if ( texData.type !== undefined ) {

				texture.type = texData.type;

			}

			if ( texData.mipmaps !== undefined ) {

				texture.mipmaps = texData.mipmaps;
				texture.minFilter = LinearMipmapLinearFilter; // presumably...

			}

			if ( texData.mipmapCount === 1 ) {

				texture.minFilter = LinearFilter;

			}

			if ( texData.generateMipmaps !== undefined ) {

				texture.generateMipmaps = texData.generateMipmaps;

			}

			texture.needsUpdate = true;

			if ( onLoad ) onLoad( texture, texData );

		}, onProgress, onError );


		return texture;

	}

}

/**
 * Represents the result object type of the `parse()` method.
 *
 * @typedef {Object} DataTextureLoader~TexData
 * @property {Object} [image] - An object holding width, height and the texture data.
 * @property {number} [width] - The width of the base mip.
 * @property {number} [height] - The width of the base mip.
 * @property {TypedArray} [data] - The texture data.
 * @property {number} [format] - The texture format.
 * @property {number} [type] - The texture type.
 * @property {boolean} [flipY] - If set to `true`, the texture is flipped along the vertical axis when uploaded to the GPU.
 * @property {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
 * @property {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
 * @property {number} [anisotropy=1] - The anisotropy value.
 * @property {boolean} [generateMipmaps] - Whether to generate mipmaps or not.
 * @property {string} [colorSpace] - The color space.
 * @property {number} [magFilter] - The mag filter.
 * @property {number} [minFilter] - The min filter.
 * @property {Array<Object>} [mipmaps] - The mipmaps.
 **/

export { DataTextureLoader };
