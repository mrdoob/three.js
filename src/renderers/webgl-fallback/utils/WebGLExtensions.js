/**
 * A WebGL 2 backend utility module for managing extensions.
 *
 * @private
 */
class WebGLExtensions {

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
		 * A reference to the rendering context.
		 *
		 * @type {WebGL2RenderingContext}
		 */
		this.gl = this.backend.gl;

		/**
		 * A list with all the supported WebGL extensions.
		 *
		 * @type {Array<string>}
		 */
		this.availableExtensions = this.gl.getSupportedExtensions();

		/**
		 * A dictionary with requested WebGL extensions.
		 * The key is the name of the extension, the value
		 * the requested extension object.
		 *
		 * @type {Object<string,Object>}
		 */
		this.extensions = {};

	}

	/**
	 * Returns the extension object for the given extension name.
	 *
	 * @param {string} name - The extension name.
	 * @return {Object} The extension object.
	 */
	get( name ) {

		let extension = this.extensions[ name ];

		if ( extension === undefined ) {

			extension = this.gl.getExtension( name );

			this.extensions[ name ] = extension;

		}

		return extension;

	}

	/**
	 * Returns `true` if the requested extension is available.
	 *
	 * @param {string} name - The extension name.
	 * @return {boolean} Whether the given extension is available or not.
	 */
	has( name ) {

		return this.availableExtensions.includes( name );

	}

	/**
	 * Returns a multiview extension that supports the requested sample mode.
	 *
	 * `OCULUS_multiview` is checked first since it provides the multisampled
	 * attachment path used by Meta Quest Browser. `OVR_multiview2` is used as a
	 * fallback when it exposes the required attachment method.
	 *
	 * @param {boolean} [multisampled=false] - Whether multisampled attachment support is required.
	 * @return {?Object} The multiview extension object.
	 */
	getMultiviewExtension( multisampled = false ) {

		const method = multisampled
			? 'framebufferTextureMultisampleMultiviewOVR'
			: 'framebufferTextureMultiviewOVR';

		const oculusExtension = this.get( 'OCULUS_multiview' );

		if ( oculusExtension !== null && typeof oculusExtension[ method ] === 'function' ) {

			return oculusExtension;

		}

		const ovrExtension = this.get( 'OVR_multiview2' );

		if ( ovrExtension !== null && typeof ovrExtension[ method ] === 'function' ) {

			return ovrExtension;

		}

		return null;

	}

}

export default WebGLExtensions;
