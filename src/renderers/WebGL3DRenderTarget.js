import { WebGLRenderTarget } from './WebGLRenderTarget.js';
import { Data3DTexture } from '../textures/Data3DTexture.js';

class WebGL3DRenderTarget extends WebGLRenderTarget {

	constructor( width, height, depth ) {

		super( width, height );

		this.depth = depth;

		this.texture = new Data3DTexture( null, width, height, depth );

		this.texture.isRenderTargetTexture = true;

	}

}

WebGL3DRenderTarget.prototype.isWebGL3DRenderTarget = true;

export { WebGL3DRenderTarget };
