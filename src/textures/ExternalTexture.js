import { Texture } from './Texture.js';

/**
 * Represents a texture created externally with the same renderer context.
 *
 * This may be a texture from a protected media stream, device camera feed,
 * or other data feeds like a depth sensor.
 *
 * Note that this class is only supported in {@link WebGLRenderer}, and in
 * the {@link WebGPURenderer} WebGPU backend.
 *
 * @augments Texture
 */
class ExternalTexture extends Texture {

	/**
	 * Creates a new raw texture.
	 *
	 * @param {?(WebGLTexture|GPUTexture)} [sourceTexture=null] - The external texture.
	 */
	constructor( sourceTexture = null ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isExternalTexture = true;

		this.sourceTexture = sourceTexture;

	}

	/**
	 * The external source texture.
	 *
	 * Assigning it also derives {@link Texture#image} from the source's
	 * dimensions (when available), so the texture reports a valid size to the renderer.
	 *
	 * @type {?(WebGLTexture|GPUTexture)}
	 * @default null
	 */
	get sourceTexture() {

		return this._sourceTexture;

	}

	set sourceTexture( value ) {

		this._sourceTexture = value;

		// A GPUTexture exposes its dimensions; a WebGLTexture is an opaque handle that does not.
		if ( value !== null && typeof value.width === 'number' ) {

			this.image = { width: value.width, height: value.height, depth: value.depthOrArrayLayers || 1 };

		}

	}

	copy( source ) {

		super.copy( source );

		this.sourceTexture = source.sourceTexture;

		return this;

	}

}

export { ExternalTexture };
