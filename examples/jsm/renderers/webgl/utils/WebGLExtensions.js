class WebGLExtensions {

	constructor( backend ) {

		this.backend = backend;

		this.gl = this.backend.gl;
		this.availableExtensions = this.gl.getSupportedExtensions();

		this.extensions = {};

	}

	get( name ) {

		let extension = this.extensions[ name ];

		if ( extension === undefined ) {

			extension = this.gl.getExtension( name );

			this.extensions[ name ] = extension;

		}

		return extension;

	}

	has( name ) {

		return this.availableExtensions.includes( name );

	}

}

export default WebGLExtensions;
