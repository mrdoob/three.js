import { WebGLRenderTarget } from './WebGLRenderTarget.js';

class WebGLMultiRenderTarget extends WebGLRenderTarget {

	constructor( width, height, count, options ) {

		super( width, height, options );

		this.textures = [];

		for ( let i = 0; i < count; i ++ ) {

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

	setCount( count ) {

		if ( this.textures.length !== count ) {

			this.dispose();

			if ( count > this.textures.length ) {

				for ( let i = this.textures.length; i < count; i ++ ) {

					this.textures[ i ] = this.texture.clone();

				}

			} else {

				this.textures.length = count;

			}

		}

		return this;

	}

}

WebGLMultiRenderTarget.prototype.isWebGLMultiRenderTarget = true;

export { WebGLMultiRenderTarget };
