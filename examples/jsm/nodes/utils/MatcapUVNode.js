import TempNode from '../core/TempNode.js';
import { transformedNormalView } from '../accessors/NormalNode.js';
import { positionViewDirection } from '../accessors/PositionNode.js';
import { nodeImmutable, vec2, vec3 } from '../shadernode/ShaderNode.js';
import { addNodeClass } from '../core/Node.js';

class MatcapUVNode extends TempNode {

	constructor() {

		super( 'vec2' );

	}

	construct() {

		const x = vec3( positionViewDirection.z, 0, positionViewDirection.x.negate() ).normalize();
		const y = positionViewDirection.cross( x );

		return vec2( x.dot( transformedNormalView ), y.dot( transformedNormalView ) ).mul( 0.495 ).add( 0.5 );

	}

}

export default MatcapUVNode;

export const matcapUV = nodeImmutable( MatcapUVNode );

addNodeClass( MatcapUVNode );
