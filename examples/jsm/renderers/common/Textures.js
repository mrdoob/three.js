import DataMap from './DataMap.js';
import { DepthTexture, DepthStencilFormat, UnsignedInt248Type } from 'three';

class Textures extends DataMap {

	constructor( backend, info ) {

		super();

		this.backend = backend;
		this.info = info;

	}

	updateRenderTarget( renderTarget ) {

		const renderTargetData = this.get( renderTarget );

		const texture = renderTarget.texture;

		let depthTexture = renderTarget.depthTexture || renderTargetData.depthTexture;

		if ( depthTexture === undefined ) {

			depthTexture = new DepthTexture();
			depthTexture.format = DepthStencilFormat;
			depthTexture.type = UnsignedInt248Type;
			depthTexture.image.width = texture.image.width;
			depthTexture.image.height = texture.image.height;

		}

		if ( renderTargetData.width !== texture.image.width || texture.image.height !== renderTargetData.height ) {

			texture.needsUpdate = true;
			depthTexture.needsUpdate = true;

			depthTexture.image.width = texture.image.width;
			depthTexture.image.height = texture.image.height;

		}

		renderTargetData.width = texture.image.width;
		renderTargetData.height = texture.image.height;
		renderTargetData.texture = texture;
		renderTargetData.depthTexture = depthTexture;

		this.updateTexture( texture );
		this.updateTexture( depthTexture );

		// dispose handler

		if ( renderTargetData.initialized !== true ) {

			renderTargetData.initialized = true;

			// dispose

			const onDispose = () => {

				renderTarget.removeEventListener( 'dispose', onDispose );

				this._destroyTexture( texture );
				this._destroyTexture( depthTexture );

			};

			renderTarget.addEventListener( 'dispose', onDispose );

		}

	}

	updateTexture( texture ) {

		const textureData = this.get( texture );
		if ( textureData.initialized === true && textureData.version === texture.version ) return;

		const isRenderTexture = texture.isRenderTargetTexture || texture.isDepthTexture || texture.isFramebufferTexture;
		const backend = this.backend;

		if ( isRenderTexture && textureData.initialized === true ) {

			// it's an update

			backend.destroySampler( texture );
			backend.destroyTexture( texture );

		}

		//

		if ( isRenderTexture ) {

			backend.createSampler( texture );
			backend.createTexture( texture );

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

					if ( textureData.isDefaultTexture === undefined || textureData.isDefaultTexture === true ) {

						backend.createTexture( texture );

						textureData.isDefaultTexture = false;

					}

					backend.updateTexture( texture );

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

	_destroyTexture( texture ) {

		this.backend.destroySampler( texture );
		this.backend.destroyTexture( texture );

		this.delete( texture );

	}

}

export default Textures;
