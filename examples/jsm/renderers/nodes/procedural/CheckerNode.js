import FunctionNode from '../core/FunctionNode.js';
import Node from '../core/Node.js';
import UVNode from '../accessors/UVNode.js';

const checker = new FunctionNode( `
float ( vec2 uv ) {

	uv *= 2.0;

	float cx = floor( uv.x );
	float cy = floor( uv.y );
	float result = mod( cx + cy, 2.0 );

	return sign( result );

}` );

class CheckerNode extends Node {

	constructor( uv = new UVNode() ) {

		super( 'float' );

		this.uv = uv;

	}

	generate( builder, output ) {

		return checker.call( { uv: this.uv } ).build( builder, output );

	}

}

export default CheckerNode;
