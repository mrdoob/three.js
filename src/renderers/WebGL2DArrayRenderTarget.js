import { WebGLRenderTarget } from './WebGLRenderTarget.js';
import { DataTexture2DArray } from '../textures/DataTexture2DArray.js';

class WebGL2DArrayRenderTarget extends WebGLRenderTarget {

	constructor( width, height, depth, options = {} ) {

		super( width, height, options );

		this.depth = depth;

		this.texture = new DataTexture2DArray( null, width, height, depth );

		if ( options.format !== undefined ) this.texture.format = options.format;
		if ( options.type !== undefined ) this.texture.type = options.type;
		if ( options.mapping !== undefined ) this.texture.mapping = options.mapping;
		if ( options.wrapS !== undefined ) this.texture.wrapS = options.wrapS;
		if ( options.wrapT !== undefined ) this.texture.wrapT = options.wrapT;
		if ( options.wrapR !== undefined ) this.texture.wrapR = options.wrapR;
		if ( options.magFilter !== undefined ) this.texture.magFilter = options.magFilter;
		if ( options.minFilter !== undefined ) this.texture.minFilter = options.minFilter;
		if ( options.anisotropy !== undefined ) this.texture.anisotropy = options.anisotropy;
		if ( options.encoding !== undefined ) this.texture.encoding = options.encoding;

		this.texture.isRenderTargetTexture = true;

	}

}

WebGL2DArrayRenderTarget.prototype.isWebGL2DArrayRenderTarget = true;

export { WebGL2DArrayRenderTarget };
