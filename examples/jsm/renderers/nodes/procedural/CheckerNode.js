import FunctionNode from '../core/FunctionNode.js';
import Node from '../core/Node.js';
import UVNode from '../accessors/UVNode.js';

import { ShaderNode, float, add, mul, floor, mod, sign } from '../ShaderNode.js';

// Three.JS Shader Language
const checkerShaderNode = ShaderNode( ( uv ) => {

	uv = mul( uv, 2.0 );

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

		return checkerShaderNode( this.uv ).build( builder, output );

	}

}

export default CheckerNode;
