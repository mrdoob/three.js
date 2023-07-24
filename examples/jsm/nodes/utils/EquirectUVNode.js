import TempNode from '../core/TempNode.js';
import { positionWorldDirection } from '../accessors/PositionNode.js';
import { nodeProxy, vec2 } from '../shadernode/ShaderNode.js';
import { addNodeClass } from '../core/Node.js';

class EquirectUVNode extends TempNode {

	constructor( dirNode = positionWorldDirection ) {

		super( 'vec2' );

		this.dirNode = dirNode;

	}

	construct() {

		const dir = this.dirNode;

		const u = dir.z.atan2( dir.x ).mul( 1 / ( Math.PI * 2 ) ).add( 0.5 );
		const v = dir.y.negate().clamp( - 1.0, 1.0 ).asin().mul( 1 / Math.PI ).add( 0.5 ); // @TODO: The use of negate() here could be an NDC issue.

		return vec2( u, v );

	}

}

export default EquirectUVNode;

export const equirectUV = nodeProxy( EquirectUVNode );

addNodeClass( EquirectUVNode );
