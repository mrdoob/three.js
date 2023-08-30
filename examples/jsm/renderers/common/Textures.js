import DataMap from './DataMap.js';

import { Vector3, DepthTexture, DepthStencilFormat, UnsignedInt248Type, LinearFilter, NearestFilter, EquirectangularReflectionMapping, EquirectangularRefractionMapping, CubeReflectionMapping, CubeRefractionMapping } from 'three';

const _size = new Vector3();

class Textures extends DataMap {

	constructor( backend, info ) {

		super();

		this.backend = backend;
		this.info = info;

	}

	updateRenderTarget( renderTarget ) {

		const renderTargetData = this.get( renderTarget );
		const sampleCount = renderTarget.samples === 0 ? 1 : renderTarget.samples;

		let texture, textures;

		if ( renderTarget.isWebGLMultipleRenderTargets ) {

			textures = renderTarget.texture;
			texture = renderTarget.texture[ 0 ];

		} else {

			textures = [ renderTarget.texture ];
			texture = renderTarget.texture;

		}

		const size = this.getSize( texture );

		let depthTexture = renderTarget.depthTexture || renderTargetData.depthTexture;
		let textureNeedsUpdate = false;

		if ( depthTexture === undefined ) {

			depthTexture = new DepthTexture();
			depthTexture.format = DepthStencilFormat;
			depthTexture.type = UnsignedInt248Type;
			depthTexture.image.width = size.width;
			depthTexture.image.height = size.height;

		}

		if ( renderTargetData.width !== size.width || size.height !== renderTargetData.height ) {

			textureNeedsUpdate = true;
			depthTexture.needsUpdate = true;

			depthTexture.image.width = size.width;
			depthTexture.image.height = size.height;

		}

		renderTargetData.width = size.width;
		renderTargetData.height = size.height;
		renderTargetData.textures = textures;
		renderTargetData.depthTexture = depthTexture;

		if ( renderTargetData.sampleCount !== sampleCount ) {

			textureNeedsUpdate = true;
			depthTexture.needsUpdate = true;

			renderTargetData.sampleCount = sampleCount;

		}

		const options = { sampleCount };


		for ( let i = 0; i < textures.length; i ++ ) {

			const texture = textures[ i ];

			if ( textureNeedsUpdate ) texture.needsUpdate = true;

			this.updateTexture( texture, options );

		}

		this.updateTexture( depthTexture, options );

		// dispose handler

		if ( renderTargetData.initialized !== true ) {

			renderTargetData.initialized = true;

			// dispose

			const onDispose = () => {

				renderTarget.removeEventListener( 'dispose', onDispose );

				if ( textures !== undefined ) {

					for ( let i = 0; i < textures.length; i ++ ) {

						this._destroyTexture( textures[ i ] );

					}

				} else {

					this._destroyTexture( texture );

				}

				this._destroyTexture( depthTexture );

			};

			renderTarget.addEventListener( 'dispose', onDispose );

		}

	}

	updateTexture( texture, options = {} ) {

		const textureData = this.get( texture );
		if ( textureData.initialized === true && textureData.version === texture.version ) return;

		const isRenderTarget = texture.isRenderTargetTexture || texture.isDepthTexture || texture.isFramebufferTexture;
		const backend = this.backend;

		if ( isRenderTarget && textureData.initialized === true ) {

			// it's an update

			backend.destroySampler( texture );
			backend.destroyTexture( texture );

		}

		//

		const { width, height, depth } = this.getSize( texture );

		options.width = width;
		options.height = height;
		options.depth = depth;
		options.needsMipmaps = this.needsMipmaps( texture );
		options.levels = options.needsMipmaps ? this.getMipLevels( texture, width, height ) : 1;

		//

		if ( isRenderTarget || options.store === true ) {

			//if ( options.store === true ) options.levels = 1; /* no mipmaps? */

			backend.createSampler( texture );
			backend.createTexture( texture, options );

		} else {

			const needsCreate = textureData.initialized !== true;

			if ( needsCreate ) backend.createSampler( texture );

			if ( texture.version > 0 ) {

				const image = texture.image;

				if ( image === undefined ) {

					console.warn( 'THREE.Renderer: Texture marked for update but image is undefined.' );

				} else if ( image.complete === false ) {

					console.warn( 'THREE.Renderer: Texture marked for update but image is incomplete.' );

				} else {

					if ( texture.images ) {

						const images = [];

						for ( const image of texture.images ) {

							images.push( this._getUploadImage( image ) );

						}

						options.images = images;

					} else {

						options.image = this._getUploadImage( image );

					}

					if ( textureData.isDefaultTexture === undefined || textureData.isDefaultTexture === true ) {

						backend.createTexture( texture, options );

						textureData.isDefaultTexture = false;

					}

					backend.updateTexture( texture, options );

					if ( options.needsMipmaps ) backend.generateMipmaps( texture );

				}

			} else {

				// async update

				backend.createDefaultTexture( texture );

				textureData.isDefaultTexture = true;

			}

		}

		// dispose handler

		if ( textureData.initialized !== true ) {

			textureData.initialized = true;

			//

			this.info.memory.textures ++;

			// dispose

			const onDispose = () => {

				texture.removeEventListener( 'dispose', onDispose );

				this._destroyTexture( texture );

				this.info.memory.textures --;

			};

			texture.addEventListener( 'dispose', onDispose );

		}

		//

		textureData.version = texture.version;

	}

	getSize( texture, target = _size ) {

		let image = texture.images ? texture.images[ 0 ] : texture.image;

		if ( image ) {

			if ( image.image !== undefined ) image = image.image;

			target.width = image.width;
			target.height = image.height;
			target.depth = texture.isCubeTexture ? 6 : ( image.depth || 1 );

		} else {

			target.width = target.height = target.depth = 1;

		}

		return target;

	}

	getMipLevels( texture, width, height ) {

		let mipLevelCount;

		if ( texture.isCompressedTexture ) {

			mipLevelCount = texture.mipmaps.length;

		} else {

			mipLevelCount = Math.floor( Math.log2( Math.max( width, height ) ) ) + 1;

		}

		return mipLevelCount;

	}

	needsMipmaps( texture ) {

		if ( this.isEnvironmentTexture( texture ) ) return true;

		return ( texture.isCompressedTexture !== true ) /*&& ( texture.generateMipmaps === true )*/ && ( texture.minFilter !== NearestFilter ) && ( texture.minFilter !== LinearFilter );

	}

	isEnvironmentTexture( texture ) {

		const mapping = texture.mapping;

		return ( mapping === EquirectangularReflectionMapping || mapping === EquirectangularRefractionMapping ) || ( mapping === CubeReflectionMapping || mapping === CubeRefractionMapping );

	}

	_getUploadImage( image ) {

		if ( this._isHTMLImage( image ) ) {

			return this._imageToCanvas( image );

		}

		return image;

	}

	_imageToCanvas( image ) {

		const { width, height } = image;

		// eslint-disable-next-line compat/compat
		const canvas = new OffscreenCanvas( width, height );

		const context = canvas.getContext( '2d' );
		context.drawImage( image, 0, 0, width, height );

		return canvas;

	}

	_isHTMLImage( image ) {

		return ( typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement ) || ( typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement );

	}

	_destroyTexture( texture ) {

		this.backend.destroySampler( texture );
		this.backend.destroyTexture( texture );

		this.delete( texture );

	}

}

export default Textures;
