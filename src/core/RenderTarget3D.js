import { RenderTarget } from './RenderTarget.js';
import { Data3DTexture } from '../textures/Data3DTexture.js';

class RenderTarget3D extends RenderTarget {

	constructor( width = 1, height = 1, depth = 1, options = {} ) {

		super( width, height, options );

		this.isRenderTarget3D = true;

		this.depth = depth;

		this.texture = new Data3DTexture( null, width, height, depth );

		this.texture.isRenderTargetTexture = true;

	}

}

export { RenderTarget3D };
