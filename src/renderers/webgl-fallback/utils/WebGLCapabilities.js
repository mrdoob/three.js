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
		 * @type {Number?}
		 * @default null
		 */
		this.maxAnisotropy = null;

	}

	/**
	 * Returns the maximum anisotropy texture filtering value. This value
	 * depends on the device and is reported by the `EXT_texture_filter_anisotropic`
	 * WebGL extension.
	 *
	 * @return {Number} The maximum anisotropy texture filtering value.
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

}

export default WebGLCapabilities;
