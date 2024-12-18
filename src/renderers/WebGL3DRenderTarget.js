import { RenderTarget3D } from '../core/RenderTarget3D.js';

class WebGL3DRenderTarget extends RenderTarget3D {

	constructor( width = 1, height = 1, depth = 1, options = {} ) {

		super( width, height, depth, options );

		this.isWebGL3DRenderTarget = true;

	}

}

export { WebGL3DRenderTarget };
