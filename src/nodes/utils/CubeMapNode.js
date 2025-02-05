import TempNode from '../core/TempNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { nodeProxy } from '../tsl/TSLBase.js';
import { CubeTexture } from '../../textures/CubeTexture.js';
import { cubeTexture } from '../accessors/CubeTextureNode.js';
import CubeRenderTarget from '../../renderers/common/CubeRenderTarget.js';
import { CubeReflectionMapping, CubeRefractionMapping, EquirectangularReflectionMapping, EquirectangularRefractionMapping } from '../../constants.js';

const _cache = new WeakMap();

/**
 * This node can be used to automatically convert environment maps in the
 * equirectangular format into the cube map format.
 *
 * @augments TempNode
 */
class CubeMapNode extends TempNode {

	static get type() {

		return 'CubeMapNode';

	}

	/**
	 * Constructs a new cube map node.
	 *
	 * @param {Node} envNode - The node representing the environment map.
	 */
	constructor( envNode ) {

		super( 'vec3' );

		/**
		 * The node representing the environment map.
		 *
		 * @type {Node}
		 */
		this.envNode = envNode;

		/**
		 * A reference to the internal cube texture.
		 *
		 * @private
		 * @type {CubeTexture}
		 * @default null
		 */
		this._cubeTexture = null;

		/**
		 * A reference to the internal cube texture node.
		 *
		 * @private
		 * @type {CubeTextureNode}
		 */
		this._cubeTextureNode = cubeTexture();

		const defaultTexture = new CubeTexture();
		defaultTexture.isRenderTargetTexture = true;

		/**
		 * A default cube texture that acts as a placeholder.
		 * It is used when the conversion from equirectangular to cube
		 * map has not finished yet for a given texture.
		 *
		 * @private
		 * @type {CubeTexture}
		 */
		this._defaultTexture = defaultTexture;

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.RENDER` since the node updates
		 * the texture once per render in its {@link CubeMapNode#updateBefore} method.
		 *
		 * @type {string}
		 * @default 'render'
		 */
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

/**
 * Returns true if the given equirectangular image has been fully loaded
 * and is ready for further processing.
 *
 * @private
 * @param {Image} image - The equirectangular image to check.
 * @return {boolean} Whether the image is ready or not.
 */
function isEquirectangularMapReady( image ) {

	if ( image === null || image === undefined ) return false;

	return image.height > 0;

}

/**
 * This function is executed when `dispose()` is called on the equirectangular
 * texture. In this case, the generated cube map with its render target
 * is deleted as well.
 *
 * @private
 * @param {Object} event - The event object.
 */
function onTextureDispose( event ) {

	const texture = event.target;

	texture.removeEventListener( 'dispose', onTextureDispose );

	const renderTarget = _cache.get( texture );

	if ( renderTarget !== undefined ) {

		_cache.delete( texture );

		renderTarget.dispose();

	}

}

/**
 * This function makes sure the generated cube map uses the correct
 * texture mapping that corresponds to the equirectangular original.
 *
 * @private
 * @param {Texture} texture - The cube texture.
 * @param {number} mapping - The original texture mapping.
 */
function mapTextureMapping( texture, mapping ) {

	if ( mapping === EquirectangularReflectionMapping ) {

		texture.mapping = CubeReflectionMapping;

	} else if ( mapping === EquirectangularRefractionMapping ) {

		texture.mapping = CubeRefractionMapping;

	}

}

/**
 * TSL function for creating a cube map node.
 *
 * @tsl
 * @function
 * @param {Node} envNode - The node representing the environment map.
 * @returns {CubeMapNode}
 */
export const cubeMapNode = /*@__PURE__*/ nodeProxy( CubeMapNode );
