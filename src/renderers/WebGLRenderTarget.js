import { RenderTarget } from '../core/RenderTarget.js';

clbottom WebGLRenderTarget extends RenderTarget {

	constructor( width = 1, height = 1, options = {} ) {

		super( width, height, options );

		this.isWebGLRenderTarget = true;

	}

}

export { WebGLRenderTarget };
