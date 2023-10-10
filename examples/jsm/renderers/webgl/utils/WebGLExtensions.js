class WebGLExtensions {

	constructor( backend ) {

		this.backend = backend;

		this.gl = this.backend.gl;
		this.availableExtensions = this.gl.getSupportedExtensions();

	}

	get( name ) {

		return this.gl.getExtension( name );

	}

	has( name ) {

		return this.availableExtensions.includes( name );

	}

}

export default WebGLExtensions;
