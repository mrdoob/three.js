import TempNode from '../core/TempNode.js';
import { transformedNormalView } from '../accessors/Normal.js';
import { positionViewDirection } from '../accessors/Position.js';
import { nodeImmutable, vec2, vec3 } from '../tsl/TSLBase.js';

/** @module MatcapUVNode **/

/**
 * Can be used to compute texture coordinates for projecting a
 * matcap onto a mesh. Used by {@link MeshMatcapNodeMaterial}.
 *
 * @augments TempNode
 */
class MatcapUVNode extends TempNode {

	static get type() {

		return 'MatcapUVNode';

	}

	/**
	 * Constructs a new matcap uv node.
	 */
	constructor() {

		super( 'vec2' );

	}

	setup() {

		const x = vec3( positionViewDirection.z, 0, positionViewDirection.x.negate() ).normalize();
		const y = positionViewDirection.cross( x );

		return vec2( x.dot( transformedNormalView ), y.dot( transformedNormalView ) ).mul( 0.495 ).add( 0.5 ); // 0.495 to remove artifacts caused by undersized matcap disks

	}

}

export default MatcapUVNode;

/**
 * TSL function for creating a matcap uv node.
 *
 * @function
 * @returns {MatcapUVNode}
 */
export const matcapUV = /*@__PURE__*/ nodeImmutable( MatcapUVNode );
