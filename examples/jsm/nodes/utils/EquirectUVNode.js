import TempNode from '../core/TempNode.js';
import { nodeObject, vec2, add, mul, atan2, asin, clamp, positionWorldDirection } from '../shadernode/ShaderNodeElements.js';

class EquirectUVNode extends TempNode {

	constructor( dirNode = positionWorldDirection ) {

		super( 'vec2' );

		this.dirNode = dirNode;

	}

	construct() {

		const dir = nodeObject( this.dirNode );

		const u = add( mul( atan2( dir.z, dir.x ), 1 / ( Math.PI * 2 ) ), 0.5 );
		const v = add( mul( asin( clamp( dir.y, - 1.0, 1.0 ) ), 1 / Math.PI ), 0.5 );

		return vec2( u, v );

	}

}

export default EquirectUVNode;
