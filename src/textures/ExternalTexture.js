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
		 * The external source texture.
		 *
		 * @type {?(WebGLTexture|GPUTexture)}
		 * @default null
		 */
		this.sourceTexture = sourceTexture;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isExternalTexture = true;

	}

	copy( source ) {

		super.copy( source );

		this.sourceTexture = source.sourceTexture;

		return this;

	}

}

export { ExternalTexture };
