import { WebGLRenderTarget } from 'three';

// @TODO: Consider rename WebGLRenderTarget to just RenderTarget

class RenderTarget extends WebGLRenderTarget {

	constructor( width, height, options = {} ) {

		super( width, height, options );

	}

}

export default RenderTarget;
