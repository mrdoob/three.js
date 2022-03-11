import TempNode from '../core/TempNode.js';
import { join, negate, cross, dot, mul, add, normalize, transformedNormalView, positionViewDirection } from '../ShaderNode.js';

class MatcapUVNode extends TempNode {

	constructor() {

		super( 'vec2' );

	}

	generate( builder ) {

		const x = join( positionViewDirection.z, 0, negate( positionViewDirection.x ) );
		const y = cross( positionViewDirection, x );

		const uv = add( mul( join( dot( x, transformedNormalView ), dot( y, transformedNormalView ) ), 0.495 ), 0.5 );

		return uv.build( builder, this.getNodeType( builder ) );

	}

}

export default MatcapUVNode;
