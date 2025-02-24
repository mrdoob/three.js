import TempNode from '../core/TempNode.js';
import { texture } from '../accessors/TextureNode.js';
import { textureCubeUV } from './PMREMUtils.js';
import { uniform } from '../core/UniformNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { nodeProxy, vec3 } from '../tsl/TSLBase.js';

import { Texture } from '../../textures/Texture.js';
import PMREMGenerator from '../../renderers/common/extras/PMREMGenerator.js';
import { materialEnvRotation } from '../accessors/MaterialProperties.js';

const _cache = new WeakMap();

/**
 * Generates the cubeUV size based on the given image height.
 *
 * @private
 * @param {number} imageHeight - The image height.
 * @return {{texelWidth: number,texelHeight: number, maxMip: number}} The result object.
 */
function _generateCubeUVSize( imageHeight ) {

	const maxMip = Math.log2( imageHeight ) - 2;

	const texelHeight = 1.0 / imageHeight;

	const texelWidth = 1.0 / ( 3 * Math.max( Math.pow( 2, maxMip ), 7 * 16 ) );

	return { texelWidth, texelHeight, maxMip };

}

/**
 * Generates a PMREM from the given texture.
 *
 * @private
 * @param {Texture} texture - The texture to create the PMREM for.
 * @param {Renderer} renderer - The renderer.
 * @param {PMREMGenerator} generator - The PMREM generator.
 * @return {?Texture} The PMREM.
 */
function _getPMREMFromTexture( texture, renderer, generator ) {

	const cache = _getCache( renderer );

	let cacheTexture = cache.get( texture );

	const pmremVersion = cacheTexture !== undefined ? cacheTexture.pmremVersion : - 1;

	if ( pmremVersion !== texture.pmremVersion ) {

		const image = texture.image;

		if ( texture.isCubeTexture ) {

			if ( isCubeMapReady( image ) ) {

				cacheTexture = generator.fromCubemap( texture, cacheTexture );

			} else {

				return null;

			}


		} else {

			if ( isEquirectangularMapReady( image ) ) {

				cacheTexture = generator.fromEquirectangular( texture, cacheTexture );

			} else {

				return null;

			}

		}

		cacheTexture.pmremVersion = texture.pmremVersion;

		cache.set( texture, cacheTexture );

	}

	return cacheTexture.texture;

}

/**
 * Returns a cache that stores generated PMREMs for the respective textures.
 * A cache must be maintained per renderer since PMREMs are render target textures
 * which can't be shared across render contexts.
 *
 * @private
 * @param {Renderer} renderer - The renderer.
 * @return {WeakMap<Texture, Texture>} The PMREM cache.
 */
function _getCache( renderer ) {

	let rendererCache = _cache.get( renderer );

	if ( rendererCache === undefined ) {

		rendererCache = new WeakMap();
		_cache.set( renderer, rendererCache );

	}

	return rendererCache;

}

/**
 * This node represents a PMREM which is a special type of preprocessed
 * environment map intended for PBR materials.
 *
 * ```js
 * const material = new MeshStandardNodeMaterial();
 * material.envNode = pmremTexture( envMap );
 * ```
 *
 * @augments TempNode
 */
class PMREMNode extends TempNode {

	static get type() {

		return 'PMREMNode';

	}

	/**
	 * Constructs a new function overloading node.
	 *
	 * @param {Texture} value - The input texture.
	 * @param {Node<vec2>} [uvNode=null] - The uv node.
	 * @param {Node<float>} [levelNode=null] - The level node.
	 */
	constructor( value, uvNode = null, levelNode = null ) {

		super( 'vec3' );

		/**
		 * Reference to the input texture.
		 *
		 * @private
		 * @type {Texture}
		 */
		this._value = value;

		/**
		 * Reference to the generated PMREM.
		 *
		 * @private
		 * @type {Texture | null}
		 * @default null
		 */
		this._pmrem = null;

		/**
		 *  The uv node.
		 *
		 * @type {Node<vec2>}
		 */
		this.uvNode = uvNode;

		/**
		 *  The level node.
		 *
		 * @type {Node<float>}
		 */
		this.levelNode = levelNode;

		/**
		 * Reference to a PMREM generator.
		 *
		 * @private
		 * @type {?PMREMGenerator}
		 * @default null
		 */
		this._generator = null;

		const defaultTexture = new Texture();
		defaultTexture.isRenderTargetTexture = true;

		/**
		 * The texture node holding the generated PMREM.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._texture = texture( defaultTexture );

		/**
		 * A uniform representing the PMREM's width.
		 *
		 * @private
		 * @type {UniformNode<float>}
		 */
		this._width = uniform( 0 );

		/**
		 * A uniform representing the PMREM's height.
		 *
		 * @private
		 * @type {UniformNode<float>}
		 */
		this._height = uniform( 0 );

		/**
		 * A uniform representing the PMREM's max Mip.
		 *
		 * @private
		 * @type {UniformNode<float>}
		 */
		this._maxMip = uniform( 0 );

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.RENDER`.
		 *
		 * @type {string}
		 * @default 'render'
		 */
		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	set value( value ) {

		this._value = value;
		this._pmrem = null;

	}

	/**
	 * The node's texture value.
	 *
	 * @type {Texture}
	 */
	get value() {

		return this._value;

	}

	/**
	 * Uses the given PMREM texture to update internal values.
	 *
	 * @param {Texture} texture - The PMREM texture.
	 */
	updateFromTexture( texture ) {

		const cubeUVSize = _generateCubeUVSize( texture.image.height );

		this._texture.value = texture;
		this._width.value = cubeUVSize.texelWidth;
		this._height.value = cubeUVSize.texelHeight;
		this._maxMip.value = cubeUVSize.maxMip;

	}

	updateBefore( frame ) {

		let pmrem = this._pmrem;

		const pmremVersion = pmrem ? pmrem.pmremVersion : - 1;
		const texture = this._value;

		if ( pmremVersion !== texture.pmremVersion ) {

			if ( texture.isPMREMTexture === true ) {

				pmrem = texture;

			} else {

				pmrem = _getPMREMFromTexture( texture, frame.renderer, this._generator );

			}

			if ( pmrem !== null ) {

				this._pmrem = pmrem;

				this.updateFromTexture( pmrem );

			}

		}

	}

	setup( builder ) {

		if ( this._generator === null ) {

			this._generator = new PMREMGenerator( builder.renderer );

		}

		this.updateBefore( builder );

		//

		let uvNode = this.uvNode;

		if ( uvNode === null && builder.context.getUV ) {

			uvNode = builder.context.getUV( this );

		}

		//

		uvNode = materialEnvRotation.mul( vec3( uvNode.x, uvNode.y.negate(), uvNode.z ) );

		//

		let levelNode = this.levelNode;

		if ( levelNode === null && builder.context.getTextureLevel ) {

			levelNode = builder.context.getTextureLevel( this );

		}

		//

		return textureCubeUV( this._texture, uvNode, levelNode, this._width, this._height, this._maxMip );

	}

	dispose() {

		super.dispose();

		if ( this._generator !== null ) this._generator.dispose();

	}

}

export default PMREMNode;

/**
 * Returns `true` if the given cube map image has been fully loaded.
 *
 * @private
 * @param {Array<(Image|Object)>} image - The cube map image.
 * @return {boolean} Whether the given cube map is ready or not.
 */
function isCubeMapReady( image ) {

	if ( image === null || image === undefined ) return false;

	let count = 0;
	const length = 6;

	for ( let i = 0; i < length; i ++ ) {

		if ( image[ i ] !== undefined ) count ++;

	}

	return count === length;


}

/**
 * Returns `true` if the given equirectangular image has been fully loaded.
 *
 * @private
 * @param {(Image|Object)} image - The equirectangular image.
 * @return {boolean} Whether the given cube map is ready or not.
 */
function isEquirectangularMapReady( image ) {

	if ( image === null || image === undefined ) return false;

	return image.height > 0;

}

/**
 * TSL function for creating a PMREM node.
 *
 * @tsl
 * @function
 * @param {Texture} value - The input texture.
 * @param {Node<vec2>} [uvNode=null] - The uv node.
 * @param {Node<float>} [levelNode=null] - The level node.
 * @returns {PMREMNode}
 */
export const pmremTexture = /*@__PURE__*/ nodeProxy( PMREMNode );
