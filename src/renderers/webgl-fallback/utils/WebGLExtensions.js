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
		 * @type {Array<String>}
		 */
		this.availableExtensions = this.gl.getSupportedExtensions();

		/**
		 * A dictionary with requested WebGL extensions.
		 * The key is the name of the extension, the value
		 * the requested extension object.
		 *
		 * @type {Object<String,Object>}
		 */
		this.extensions = {};

	}

	/**
	 * Returns the extension object for the given extension name.
	 *
	 * @param {String} name - The extension name.
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
	 * @param {String} name - The extension name.
	 * @return {Boolean} Whether the given extension is available or not.
	 */
	has( name ) {

		return this.availableExtensions.includes( name );

	}

}

export default WebGLExtensions;
