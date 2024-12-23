import { RenderTarget } from './RenderTarget.js';
import { DataArrayTexture } from '../textures/DataArrayTexture.js';

class RenderTargetArray extends RenderTarget {

	constructor( width = 1, height = 1, depth = 1, options = {} ) {

		super( width, height, options );

		this.isRenderTargetArray = true;

		this.depth = depth;

		this.texture = new DataArrayTexture( null, width, height, depth );

		this.texture.isRenderTargetTexture = true;

	}

}

export { RenderTargetArray };
