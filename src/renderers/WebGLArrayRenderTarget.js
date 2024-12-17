import { WebGLRenderTarget } from './WebGLRenderTarget.js';
import { DataArrayTexture } from '../textures/DataArrayTexture.js';

class WebGLArrayRenderTarget extends WebGLRenderTarget {

	constructor( width = 1, height = 1, depth = 1, options = {} ) {

		super( width, height, options );

		this.isWebGLArrayRenderTarget = true;

		this.depth = depth;

		this.texture = new DataArrayTexture( null, width, height, depth );

		this.textures = this.textures.map( () => this.texture );

		this.texture.isRenderTargetTexture = true;

	}

}

export { WebGLArrayRenderTarget };
