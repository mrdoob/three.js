import { Texture } from './Texture.js';
import { CubeReflectionMapping } from '../constants.js';

/**
 * An array of cubemaps. Each entry contains six faces in +X, -X, +Y, -Y, +Z, -Z order,
 * like the images of a {@link CubeTexture}. All faces must be square and have the same size.
 * Sample a cube with `cubeTexture( texture, direction ).depth( cubeIndex )`.
 *
 * Set `needsUpdate` after assigning loaded images. Like CubeTexture, explicit
 * mipmaps are supplied as `{ images: cubemaps }` entries excluding the base level.
 * Dispose the texture before changing its dimensions or number of cubes.
 *
 * Only supported by the WebGPU backend of {@link WebGPURenderer}.
 *
 * @augments Texture
 */
class CubeArrayTexture extends Texture {

	/**
	 * @param {Array<Array<Image|DataTexture>>} [images=[]] - The cubemaps, each with six faces.
	 * @param {number} [mapping=CubeReflectionMapping] - The texture mapping.
	 * @param {number} [wrapS=ClampToEdgeWrapping] - Horizontal wrapping.
	 * @param {number} [wrapT=ClampToEdgeWrapping] - Vertical wrapping.
	 * @param {number} [magFilter=LinearFilter] - Magnification filter.
	 * @param {number} [minFilter=LinearMipmapLinearFilter] - Minification filter.
	 * @param {number} [format=RGBAFormat] - Pixel format.
	 * @param {number} [type=UnsignedByteType] - Pixel type.
	 * @param {number} [anisotropy=Texture.DEFAULT_ANISOTROPY] - Anisotropy.
	 * @param {string} [colorSpace=NoColorSpace] - Color space.
	 */
	constructor( images = [], mapping = CubeReflectionMapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace ) {

		super( images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace );
		/**
		 * This flag can be used for type testing.
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCubeArrayTexture = true;
		this.flipY = false;
		this._validateImages();

	}

	/** The cubemap images. Render-target textures instead use an allocation descriptor. @type {Array<Array<Image|DataTexture>>|Object} */
	get images() {

		return this.image;

	}

	set images( value ) {

		this._validateImages( value );
		this.image = value;

	}

	/**
	 * The number of cubemaps, not the number of GPU face layers. For a render target,
	 * its generic `depth` still counts face layers; this property converts that allocation to cubes.
	 *
	 * @type {number}
	 * @readonly
	 */
	get depth() {

		return Array.isArray( this.image ) ? this.image.length : ( this.image.depth || 0 ) / 6;

	}

	/**
	 * Validates the nested faces before allocation or upload.
	 * @private
	 * @param {Array<Array<Object>>} images - Cubemap faces.
	 * @param {boolean} ready - Require loaded faces matching this texture.
	 */
	_validateImages( images = this.images, ready = false ) {

		if ( ! Array.isArray( images ) ) throw new TypeError( 'CubeArrayTexture: Expected an array of cubemaps.' );
		let size = 0;
		for ( const cube of images ) {

			if ( ! Array.isArray( cube ) || cube.length !== 6 ) throw new TypeError( 'CubeArrayTexture: Each cubemap must contain six faces.' );
			for ( const face of cube ) {

				const image = face?.isDataTexture ? face.image : face;
				if ( ! image ) throw new TypeError( 'CubeArrayTexture: Missing cube face.' );
				const { width, height } = image;
				if ( ready && ( ! width || ! height || image.complete === false ) ) throw new Error( 'CubeArrayTexture: Cube faces must be loaded before upload.' );
				if ( width > 0 && height > 0 ) {

					if ( width !== height || ( size !== 0 && width !== size ) ) throw new Error( 'CubeArrayTexture: All cube faces must be square and have the same size.' );
					size = width;

				}

				if ( ready && face.isDataTexture && ( face.type !== this.type || face.format !== this.format || face.colorSpace !== this.colorSpace ) ) {

					throw new Error( 'CubeArrayTexture: DataTexture faces must match the array type, format and color space.' );

				}

			}

		}

	}

}

export { CubeArrayTexture };
