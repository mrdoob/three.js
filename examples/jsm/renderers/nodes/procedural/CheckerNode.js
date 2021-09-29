import FunctionNode from '../core/FunctionNode.js';
import Node from '../core/Node.js';
import UVNode from '../accessors/UVNode.js';

import { tjsl, float, add, mul, floor, mod, sign } from '../TJSL.js';

// Three.JS Shader Language
const checkerShaderNode = tjsl( ( uv ) => {

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

		const checkerNode = checkerShaderNode( this.uv );

		return checkerNode.build( builder, output );

	}

}

export default CheckerNode;
