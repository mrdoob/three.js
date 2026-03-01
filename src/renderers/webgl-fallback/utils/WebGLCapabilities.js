/**
 * A WebGL 2 backend utility module for managing the device's capabilities.
 *
 * @private
 */
class WebGLCapabilities {

	/**
	 * Constructs a new utility object.
	 *
	 * @param {WebGLBackend} backend - The WebGL 2 backend.
	 */
	constructor( backend ) {

		/**
		 * A reference to the WebGL 2 backend.
		 *
		 * @type {WebGLBackend}
		 */
		this.backend = backend;

		/**
		 * This value holds the cached max anisotropy value.
		 *
		 * @type {?number}
		 * @default null
		 */
		this.maxAnisotropy = null;

		/**
		 * This value holds the cached max uniform block size value.
		 *
		 * @type {?number}
		 * @default null
		 */
		this.maxUniformBlockSize = null;

	}

	/**
	 * Returns the maximum anisotropy texture filtering value. This value
	 * depends on the device and is reported by the `EXT_texture_filter_anisotropic`
	 * WebGL extension.
	 *
	 * @return {number} The maximum anisotropy texture filtering value.
	 */
	getMaxAnisotropy() {

		if ( this.maxAnisotropy !== null ) return this.maxAnisotropy;

		const gl = this.backend.gl;
		const extensions = this.backend.extensions;

		if ( extensions.has( 'EXT_texture_filter_anisotropic' ) === true ) {

			const extension = extensions.get( 'EXT_texture_filter_anisotropic' );

			this.maxAnisotropy = gl.getParameter( extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT );

		} else {

			this.maxAnisotropy = 0;

		}

		return this.maxAnisotropy;

	}

	/**
	 * Returns the maximum number of bytes available for uniform buffers.
	 *
	 * @return {number} The maximum number of bytes available for uniform buffers.
	 */
	getUniformBufferLimit() {

		if ( this.maxUniformBlockSize !== null ) return this.maxUniformBlockSize;

		const gl = this.backend.gl;

		this.maxUniformBlockSize = gl.getParameter( gl.MAX_UNIFORM_BLOCK_SIZE );

		return this.maxUniformBlockSize;

	}

}

export default WebGLCapabilities;
