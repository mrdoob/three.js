import { WebGLRenderer } from './WebGLRenderer.js';

class WebGL1Renderer extends WebGLRenderer {

	constructor( parameters ) {

		super( parameters );

		Object.defineProperty( this, 'isWebGL1Renderer', { value: true } );

	}

}

export { WebGL1Renderer };
