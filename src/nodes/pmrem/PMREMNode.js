import TempNode from '../core/TempNode.js';
import { cubeTexture } from '../accessors/CubeTextureNode.js';
import { roughnessToMip } from './PMREMUtils.js';
import { uniform } from '../core/UniformNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { nodeProxy } from '../tsl/TSLBase.js';

import { CubeTexture } from '../../textures/CubeTexture.js';
import PMREMGenerator from '../../renderers/common/extras/PMREMGenerator.js';
import { materialEnvRotation } from '../accessors/MaterialProperties.js';

const _cache = new WeakMap();

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

	let renderTarget = cache.get( texture );

	const pmremVersion = renderTarget !== undefined ? renderTarget.texture.pmremVersion : - 1;

	if ( pmremVersion !== texture.pmremVersion ) {

		const image = texture.image;

		if ( texture.isCubeTexture ) {

			if ( isCubeMapReady( image ) ) {

				renderTarget = generator.fromCubemap( texture, renderTarget );

			} else {

				return null;

			}


		} else {

			if ( isEquirectangularMapReady( image ) ) {

				renderTarget = generator.fromEquirectangular( texture, renderTarget );

			} else {

				return null;

			}

		}

		renderTarget.texture.pmremVersion = texture.pmremVersion;

		// add dispose event listener for new PMREMs

		if ( cache.has( texture ) === false ) {

			const onDispose = () => {

				texture.removeEventListener( 'dispose', onDispose );

				const pmrem = cache.get( texture );

				if ( pmrem !== undefined ) {

					pmrem.dispose();
					cache.delete( texture );

				}

			};

			texture.addEventListener( 'dispose', onDispose );

		}

		//

		cache.set( texture, renderTarget );

	}

	return renderTarget.texture;

}

/**
 * Returns a cache that stores generated PMREMs for the respective textures.
 * A cache must be maintained per renderer since PMREMs are render target textures
 * which can't be shared across render contexts.
 *
 * @private
 * @param {Renderer} renderer - The renderer.
 * @return {WeakMap<Texture, CubeRenderTarget>} The PMREM cache.
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
	 * Constructs a new PMREM node.
	 *
	 * @param {Texture} value - The input texture.
	 * @param {Node<vec3>} [uvNode=null] - The uv node.
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
		 * @type {Node<vec3>}
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

		const defaultTexture = new CubeTexture();
		defaultTexture.isRenderTargetTexture = true;

		/**
		 * The texture node holding the generated PMREM.
		 *
		 * @private
		 * @type {CubeTextureNode}
		 */
		this._texture = cubeTexture( defaultTexture );

		/**
		 * A uniform representing the last mip level of the PMREM.
		 *
		 * @private
		 * @type {UniformNode<float>}
		 */
		this._maxLod = uniform( 0 );

		/**
		 * A uniform representing the width of the sharpest mip level of the PMREM.
		 *
		 * @private
		 * @type {UniformNode<float>}
		 */
		this._size = uniform( 0 );

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

		this._texture.value = texture;
		this._maxLod.value = texture.mipmaps.length - 1;
		this._size.value = texture.mipmaps[ 0 ].width;

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

			uvNode = builder.context.getUV( this, builder );

		}

		//

		let levelNode = this.levelNode;

		if ( levelNode === null && builder.context.getTextureLevel ) {

			levelNode = builder.context.getTextureLevel( this );

		}

		//

		return this._texture.sample( materialEnvRotation.mul( uvNode ) ).level( roughnessToMip( levelNode, this._maxLod, this._size ) ).rgb;

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
 * @param {?Array<(Image|Object)>} [image] - The cube map image.
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
 * @param {?Node<vec3>} [uvNode=null] - The uv node.
 * @param {?Node<float>} [levelNode=null] - The level node.
 * @returns {PMREMNode}
 */
export const pmremTexture = /*@__PURE__*/ nodeProxy( PMREMNode ).setParameterLength( 1, 3 );
