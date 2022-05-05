import { WebGLRenderTarget } from './WebGLRenderTarget.js';
import { DataArrayTexture } from '../textures/DataArrayTexture.js';

class WebGLArrayRenderTarget extends WebGLRenderTarget {

	constructor( width, height, depth ) {

		super( width, height );

		this.depth = depth;

		this.texture = new DataArrayTexture( null, width, height, depth );

		this.texture.isRenderTargetTexture = true;

	}

}

WebGLArrayRenderTarget.prototype.isWebGLArrayRenderTarget = true;

export { WebGLArrayRenderTarget };
