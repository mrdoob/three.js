import TempNode from '../core/TempNode.js';
import { positionWorldDirection } from '../accessors/Position.js';
import { nodeProxy, vec2 } from '../tsl/TSLBase.js';

/**
 * Can be used to compute texture coordinates for projecting an
 * equirectangular texture onto a mesh for using it as the scene's
 * background.
 *
 * ```js
 * scene.backgroundNode = texture( equirectTexture, equirectUV() );
 * ```
 *
 * @augments TempNode
 */
class EquirectUVNode extends TempNode {

	static get type() {

		return 'EquirectUVNode';

	}

	/**
	 * Constructs a new equirect uv node.
	 *
	 * @param {Node<vec3>} [dirNode=positionWorldDirection] - A direction vector for sampling which is by default `positionWorldDirection`.
	 */
	constructor( dirNode = positionWorldDirection ) {

		super( 'vec2' );

		/**
		 * A direction vector for sampling why is by default `positionWorldDirection`.
		 *
		 * @type {Node<vec3>}
		 */
		this.dirNode = dirNode;

	}

	setup() {

		const dir = this.dirNode;

		const u = dir.z.atan( dir.x ).mul( 1 / ( Math.PI * 2 ) ).add( 0.5 );
		const v = dir.y.clamp( - 1.0, 1.0 ).asin().mul( 1 / Math.PI ).add( 0.5 );

		return vec2( u, v );

	}

}

export default EquirectUVNode;

/**
 * TSL function for creating an equirect uv node.
 *
 * @tsl
 * @function
 * @param {?Node<vec3>} [dirNode=positionWorldDirection] - A direction vector for sampling which is by default `positionWorldDirection`.
 * @returns {EquirectUVNode}
 */
export const equirectUV = /*@__PURE__*/ nodeProxy( EquirectUVNode ).setParameterLength( 0, 1 );
