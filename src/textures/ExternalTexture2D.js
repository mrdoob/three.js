// A External 2d texture is a 2d texture that's created out of three.js.
// We have no control over it's type, format, parameters, etc...,
// and can only use it as a shader uniform.

class ExternalTexture2D {

	constructor() {

		this.webglTexture = null;

	}

}

ExternalTexture2D.prototype.isExternalTexture2D = true;

export { ExternalTexture2D };
