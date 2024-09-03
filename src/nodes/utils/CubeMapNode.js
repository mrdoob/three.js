import TempNode from '../core/TempNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { nodeProxy } from '../tsl/TSLBase.js';
import { CubeTexture } from '../../textures/CubeTexture.js';
import { cubeTexture } from '../accessors/CubeTextureNode.js';
import CubeRenderTarget from '../../renderers/common/CubeRenderTarget.js';
import { CubeReflectionMapping, CubeRefractionMapping, EquirectangularReflectionMapping, EquirectangularRefractionMapping } from '../../constants.js';

const _cache = new WeakMap();

class CubeMapNode extends TempNode {

	static get type() {

		return 'CubeMapNode';

	}

	constructor( envNode ) {

		super( 'vec3' );

		this.envNode = envNode;

		this._cubeTexture = null;
		this._cubeTextureNode = cubeTexture();

		const defaultTexture = new CubeTexture();
		defaultTexture.isRenderTargetTexture = true;

		this._defaultTexture = defaultTexture;

		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	updateBefore( frame ) {

		const { renderer, material } = frame;

		const envNode = this.envNode;

		if ( envNode.isTextureNode || envNode.isMaterialReferenceNode ) {

			const texture = ( envNode.isTextureNode ) ? envNode.value : material[ envNode.property ];

			if ( texture && texture.isTexture ) {

				const mapping = texture.mapping;

				if ( mapping === EquirectangularReflectionMapping || mapping === EquirectangularRefractionMapping ) {

					// check for converted cubemap map

					if ( _cache.has( texture ) ) {

						const cubeMap = _cache.get( texture );

						mapTextureMapping( cubeMap, texture.mapping );
						this._cubeTexture = cubeMap;

					} else {

						// create cube map from equirectangular map

						const image = texture.image;

						if ( isEquirectangularMapReady( image ) ) {

							const renderTarget = new CubeRenderTarget( image.height );
							renderTarget.fromEquirectangularTexture( renderer, texture );

							mapTextureMapping( renderTarget.texture, texture.mapping );
							this._cubeTexture = renderTarget.texture;

							_cache.set( texture, renderTarget.texture );

							texture.addEventListener( 'dispose', onTextureDispose );

						} else {

							// default cube texture as fallback when equirectangular texture is not yet loaded

							this._cubeTexture = this._defaultTexture;

						}

					}

					//

					this._cubeTextureNode.value = this._cubeTexture;

				} else {

					// envNode already refers to a cube map

					this._cubeTextureNode = this.envNode;

				}

			}

		}

	}

	setup( builder ) {

		this.updateBefore( builder );

		return this._cubeTextureNode;

	}

}

export default CubeMapNode;

function isEquirectangularMapReady( image ) {

	if ( image === null || image === undefined ) return false;

	return image.height > 0;

}

function onTextureDispose( event ) {

	const texture = event.target;

	texture.removeEventListener( 'dispose', onTextureDispose );

	const renderTarget = _cache.get( texture );

	if ( renderTarget !== undefined ) {

		_cache.delete( texture );

		renderTarget.dispose();

	}

}

function mapTextureMapping( texture, mapping ) {

	if ( mapping === EquirectangularReflectionMapping ) {

		texture.mapping = CubeReflectionMapping;

	} else if ( mapping === EquirectangularRefractionMapping ) {

		texture.mapping = CubeRefractionMapping;

	}

}

export const cubeMapNode = /*@__PURE__*/ nodeProxy( CubeMapNode );
