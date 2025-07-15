import DataMap from './DataMap.js';

import { Vector3 } from '../../math/Vector3.js';
import { DepthTexture } from '../../textures/DepthTexture.js';
import { DepthStencilFormat, DepthFormat, UnsignedIntType, UnsignedInt248Type, UnsignedByteType } from '../../constants.js';

const _size = /*@__PURE__*/ new Vector3();

/**
 * This module manages the textures of the renderer.
 *
 * @private
 * @augments DataMap
 */
class Textures extends DataMap {

	/**
	 * Constructs a new texture management component.
	 *
	 * @param {Renderer} renderer - The renderer.
	 * @param {Backend} backend - The renderer's backend.
	 * @param {Info} info - Renderer component for managing metrics and monitoring data.
	 */
	constructor( renderer, backend, info ) {

		super();

		/**
		 * The renderer.
		 *
		 * @type {Renderer}
		 */
		this.renderer = renderer;

		/**
		 * The backend.
		 *
		 * @type {Backend}
		 */
		this.backend = backend;

		/**
		 * Renderer component for managing metrics and monitoring data.
		 *
		 * @type {Info}
		 */
		this.info = info;

	}

	/**
	 * Updates the given render target. Based on the given render target configuration,
	 * it updates the texture states representing the attachments of the framebuffer.
	 *
	 * @param {RenderTarget} renderTarget - The render target to update.
	 * @param {number} [activeMipmapLevel=0] - The active mipmap level.
	 */
	updateRenderTarget( renderTarget, activeMipmapLevel = 0 ) {

		const renderTargetData = this.get( renderTarget );

		const sampleCount = renderTarget.samples === 0 ? 1 : renderTarget.samples;
		const depthTextureMips = renderTargetData.depthTextureMips || ( renderTargetData.depthTextureMips = {} );

		const textures = renderTarget.textures;

		const size = this.getSize( textures[ 0 ] );

		const mipWidth = size.width >> activeMipmapLevel;
		const mipHeight = size.height >> activeMipmapLevel;

		let depthTexture = renderTarget.depthTexture || depthTextureMips[ activeMipmapLevel ];
		const useDepthTexture = renderTarget.depthBuffer === true || renderTarget.stencilBuffer === true;

		let textureNeedsUpdate = false;

		if ( depthTexture === undefined && useDepthTexture ) {

			depthTexture = new DepthTexture();

			depthTexture.format = renderTarget.stencilBuffer ? DepthStencilFormat : DepthFormat;
			depthTexture.type = renderTarget.stencilBuffer ? UnsignedInt248Type : UnsignedIntType; // FloatType
			depthTexture.image.width = mipWidth;
			depthTexture.image.height = mipHeight;
			depthTexture.image.depth = size.depth;
			depthTexture.isArrayTexture = renderTarget.multiview === true && size.depth > 1;

			depthTextureMips[ activeMipmapLevel ] = depthTexture;

		}

		if ( renderTargetData.width !== size.width || size.height !== renderTargetData.height ) {

			textureNeedsUpdate = true;

			if ( depthTexture ) {

				depthTexture.needsUpdate = true;
				depthTexture.image.width = mipWidth;
				depthTexture.image.height = mipHeight;
				depthTexture.image.depth = depthTexture.isArrayTexture ? depthTexture.image.depth : 1;

			}

		}

		renderTargetData.width = size.width;
		renderTargetData.height = size.height;
		renderTargetData.textures = textures;
		renderTargetData.depthTexture = depthTexture || null;
		renderTargetData.depth = renderTarget.depthBuffer;
		renderTargetData.stencil = renderTarget.stencilBuffer;
		renderTargetData.renderTarget = renderTarget;

		if ( renderTargetData.sampleCount !== sampleCount ) {

			textureNeedsUpdate = true;

			if ( depthTexture ) {

				depthTexture.needsUpdate = true;

			}

			renderTargetData.sampleCount = sampleCount;

		}

		//


		const options = { sampleCount };

		// XR render targets require no texture updates

		if ( renderTarget.isXRRenderTarget !== true ) {

			for ( let i = 0; i < textures.length; i ++ ) {

				const texture = textures[ i ];

				if ( textureNeedsUpdate ) texture.needsUpdate = true;

				this.updateTexture( texture, options );

			}

			if ( depthTexture ) {

				this.updateTexture( depthTexture, options );

			}

		}

		// dispose handler

		if ( renderTargetData.initialized !== true ) {

			renderTargetData.initialized = true;

			// dispose

			const onDispose = () => {

				renderTarget.removeEventListener( 'dispose', onDispose );

				for ( let i = 0; i < textures.length; i ++ ) {

					this._destroyTexture( textures[ i ] );

				}

				if ( depthTexture ) {

					this._destroyTexture( depthTexture );

				}

				this.delete( renderTarget );

			};

			renderTarget.addEventListener( 'dispose', onDispose );

		}

	}

	/**
	 * Updates the given texture. Depending on the texture state, this method
	 * triggers the upload of texture data to the GPU memory. If the texture data are
	 * not yet ready for the upload, it uses default texture data for as a placeholder.
	 *
	 * @param {Texture} texture - The texture to update.
	 * @param {Object} [options={}] - The options.
	 */
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

		if ( texture.isFramebufferTexture ) {

			const renderTarget = this.renderer.getRenderTarget();

			if ( renderTarget ) {

				texture.type = renderTarget.texture.type;

			} else {

				texture.type = UnsignedByteType;

			}

		}

		//

		const { width, height, depth } = this.getSize( texture );

		options.width = width;
		options.height = height;
		options.depth = depth;
		options.needsMipmaps = this.needsMipmaps( texture );
		options.levels = options.needsMipmaps ? this.getMipLevels( texture, width, height ) : 1;

		//

		if ( isRenderTarget || texture.isStorageTexture === true ) {

			backend.createSampler( texture );
			backend.createTexture( texture, options );

			textureData.generation = texture.version;

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

							images.push( image );

						}

						options.images = images;

					} else {

						options.image = image;

					}

					if ( textureData.isDefaultTexture === undefined || textureData.isDefaultTexture === true ) {

						backend.createTexture( texture, options );

						textureData.isDefaultTexture = false;
						textureData.generation = texture.version;

					}

					if ( texture.source.dataReady === true ) backend.updateTexture( texture, options );

					if ( options.needsMipmaps && texture.mipmaps.length === 0 ) backend.generateMipmaps( texture );

				}

			} else {

				// async update

				backend.createDefaultTexture( texture );

				textureData.isDefaultTexture = true;
				textureData.generation = texture.version;

			}

		}

		// dispose handler

		if ( textureData.initialized !== true ) {

			textureData.initialized = true;
			textureData.generation = texture.version;

			//

			this.info.memory.textures ++;

			// dispose

			const onDispose = () => {

				texture.removeEventListener( 'dispose', onDispose );

				this._destroyTexture( texture );

			};

			texture.addEventListener( 'dispose', onDispose );

		}

		//

		textureData.version = texture.version;

	}

	/**
	 * Computes the size of the given texture and writes the result
	 * into the target vector. This vector is also returned by the
	 * method.
	 *
	 * If no texture data are available for the compute yet, the method
	 * returns default size values.
	 *
	 * @param {Texture} texture - The texture to compute the size for.
	 * @param {Vector3} target - The target vector.
	 * @return {Vector3} The target vector.
	 */
	getSize( texture, target = _size ) {

		let image = texture.images ? texture.images[ 0 ] : texture.image;

		if ( image ) {

			if ( image.image !== undefined ) image = image.image;

			if ( image instanceof HTMLVideoElement ) {

				target.width = image.videoWidth || 1;
				target.height = image.videoHeight || 1;
				target.depth = 1;

			} else if ( image instanceof VideoFrame ) {

				target.width = image.displayWidth || 1;
				target.height = image.displayHeight || 1;
				target.depth = 1;

			} else {

				target.width = image.width || 1;
				target.height = image.height || 1;
				target.depth = texture.isCubeTexture ? 6 : ( image.depth || 1 );

			}

		} else {

			target.width = target.height = target.depth = 1;

		}

		return target;

	}

	/**
	 * Computes the number of mipmap levels for the given texture.
	 *
	 * @param {Texture} texture - The texture.
	 * @param {number} width - The texture's width.
	 * @param {number} height - The texture's height.
	 * @return {number} The number of mipmap levels.
	 */
	getMipLevels( texture, width, height ) {

		let mipLevelCount;

		if ( texture.isCompressedTexture ) {

			if ( texture.mipmaps ) {

				mipLevelCount = texture.mipmaps.length;

			} else {

				mipLevelCount = 1;

			}

		} else {

			mipLevelCount = Math.floor( Math.log2( Math.max( width, height ) ) ) + 1;

		}

		return mipLevelCount;

	}

	/**
	 * Returns `true` if the given texture requires mipmaps.
	 *
	 * @param {Texture} texture - The texture.
	 * @return {boolean} Whether mipmaps are required or not.
	 */
	needsMipmaps( texture ) {

		return texture.isCompressedTexture === true || texture.generateMipmaps;

	}

	/**
	 * Frees internal resource when the given texture isn't
	 * required anymore.
	 *
	 * @param {Texture} texture - The texture to destroy.
	 */
	_destroyTexture( texture ) {

		if ( this.has( texture ) === true ) {

			this.backend.destroySampler( texture );
			this.backend.destroyTexture( texture );

			this.delete( texture );

			this.info.memory.textures --;

		}

	}

}

export default Textures;
