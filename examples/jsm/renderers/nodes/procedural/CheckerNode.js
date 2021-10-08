import Node from '../core/Node.js';
import UVNode from '../accessors/UVNode.js';

import { ShaderNode, add, mul, floor, mod, sign } from '../ShaderNode.js';

const checkerShaderNode = new ShaderNode( ( inputs ) => {

	const uv = mul( inputs.uv, 2.0 );

	const cx = floor( uv.x );
	const cy = floor( uv.y );
	const result = mod( add( cx, cy ), 2.0 );

	return sign( result );

} );

class CheckerNode extends Node {

	constructor( uv = new UVNode() ) {

		super( 'float' );

		this.uv = uv;

	}

	generate( builder, output ) {

		return checkerShaderNode( { uv: this.uv } ).build( builder, output );

	}

}

export default CheckerNode;
