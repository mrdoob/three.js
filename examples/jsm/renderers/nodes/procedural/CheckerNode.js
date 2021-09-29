import FunctionNode from '../core/FunctionNode.js';
import Node from '../core/Node.js';
import UVNode from '../accessors/UVNode.js';

import { tjsl, float, add, mul, floor, mod, sign, color, vec3, join } from '../TJSL.js';

// Three.JS Shader Language
const ShaderChecker = tjsl( ( uv ) => {

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

		const checkerNode = ShaderChecker( this.uv );

		return checkerNode.build( builder, output );

	}

}

export default CheckerNode;
