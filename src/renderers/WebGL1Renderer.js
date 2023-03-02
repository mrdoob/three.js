import { WebGLRenderer } from './WebGLRenderer.js';

class WebGL1Renderer extends WebGLRenderer {

	constructor( parameters = {} ) {

		super( { ...parameters, isWebGL1Renderer: true } );

	}

}

export { WebGL1Renderer };
