import { WebGLRenderTarget } from './WebGLRenderTarget.js';

class WebGLMultiRenderTarget extends WebGLRenderTarget {

	constructor( width, height, numAttachments, options ) {

		super( width, height, options );

		this.textures = [];

		for ( let i = 0; i < numAttachments; i ++ ) {

			this.textures[ i ] = this.texture.clone();

		}

	}

	copy( source ) {

		super.copy.call( this, source );

		this.textures.length = 0;

		for ( let i = 0, il = source.textures.length; i < il; i ++ ) {

			this.textures[ i ] = source.textures[ i ].clone();

		}

		return this;

	}

	setNumAttachments( num ) {

		if ( this.textures.length !== num ) {

			this.dispose();

			if ( num > this.textures.length ) {

				for ( let i = this.textures.length; i < num; i ++ ) {

					this.textures[ i ] = this.texture.clone();

				}

			} else {

				this.textures.length = num;

			}

		}

		return this;

	}

}

WebGLMultiRenderTarget.prototype.isWebGLMultiRenderTarget = true;

export { WebGLMultiRenderTarget };
