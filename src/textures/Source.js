import { ImageUtils } from '../extras/ImageUtils.js';
import { generateUUID } from '../math/MathUtils.js';
import { warn } from '../utils.js';

let _sourceId = 0;

/**
 * Represents the data source of a texture.
 *
 * The main purpose of this class is to decouple the data definition from the texture
 * definition so the same data can be used with multiple texture instances.
 */
class Source {

	/**
	 * Constructs a new video texture.
	 *
	 * @param {any} [data=null] - The data definition of a texture.
	 */
	constructor( data = null ) {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSource = true;

		/**
		 * The ID of the source.
		 *
		 * @name Source#id
		 * @type {number}
		 * @readonly
		 */
		Object.defineProperty( this, 'id', { value: _sourceId ++ } );

		/**
		 * The UUID of the source.
		 *
		 * @type {string}
		 * @readonly
		 */
		this.uuid = generateUUID();

		/**
		 * The data definition of a texture.
		 *
		 * @type {any}
		 */
		this.data = data;

		/**
		 * This property is only relevant when {@link Source#needsUpdate} is set to `true` and
		 * provides more control on how texture data should be processed. When `dataReady` is set
		 * to `false`, the engine performs the memory allocation (if necessary) but does not transfer
		 * the data into the GPU memory.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.dataReady = true;

		/**
		 * This starts at `0` and counts how many times {@link Source#needsUpdate} is set to `true`.
		 *
		 * @type {number}
		 * @readonly
		 * @default 0
		 */
		this.version = 0;

	}

	/**
	 * Returns the dimensions of the source into the given target vector.
	 *
	 * @param {(Vector2|Vector3)} target - The target object the result is written into.
	 * @return {(Vector2|Vector3)} The dimensions of the source.
	 */
	getSize( target ) {

		const data = this.data;

		if ( ( typeof HTMLVideoElement !== 'undefined' ) && ( data instanceof HTMLVideoElement ) ) {

			target.set( data.videoWidth, data.videoHeight, 0 );

		} else if ( data instanceof VideoFrame ) {

			target.set( data.displayHeight, data.displayWidth, 0 );

		} else if ( data !== null ) {

			target.set( data.width, data.height, data.depth || 0 );

		} else {

			target.set( 0, 0, 0 );

		}

		return target;

	}

	/**
	 * When the property is set to `true`, the engine allocates the memory
	 * for the texture (if necessary) and triggers the actual texture upload
	 * to the GPU next time the source is used.
	 *
	 * @type {boolean}
	 * @default false
	 * @param {boolean} value
	 */
	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	}

	/**
	 * Serializes the source into JSON.
	 *
	 * @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
	 * @return {Object} A JSON object representing the serialized source.
	 * @see {@link ObjectLoader#parse}
	 */
	toJSON( meta ) {

		const isRootObject = ( meta === undefined || typeof meta === 'string' );

		if ( ! isRootObject && meta.images[ this.uuid ] !== undefined ) {

			return meta.images[ this.uuid ];

		}

		const output = {
			uuid: this.uuid,
			url: ''
		};

		const data = this.data;

		if ( data !== null ) {

			let url;

			if ( Array.isArray( data ) ) {

				// cube texture

				url = [];

				for ( let i = 0, l = data.length; i < l; i ++ ) {

					if ( data[ i ].isDataTexture ) {

						url.push( serializeImage( data[ i ].image ) );

					} else {

						url.push( serializeImage( data[ i ] ) );

					}

				}

			} else {

				// texture

				url = serializeImage( data );

			}

			output.url = url;

		}

		if ( ! isRootObject ) {

			meta.images[ this.uuid ] = output;

		}

		return output;

	}

}

function serializeImage( image ) {

	if ( ( typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement ) ||
		( typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement ) ||
		( typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap ) ) {

		// default images

		return ImageUtils.getDataURL( image );

	} else {

		if ( image.data ) {

			// images of DataTexture

			return {
				data: Array.from( image.data ),
				width: image.width,
				height: image.height,
				type: image.data.constructor.name
			};

		} else {

			warn( 'Texture: Unable to serialize Texture.' );
			return {};

		}

	}

}

export { Source };
