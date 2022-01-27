import UVNode from '../accessors/UVNode.js';
import { NodeType } from '../core/constants.js';
import NodalFunctionNode from '../core/NodalFunctionNode.js';
import Node from '../core/Node.js';
import NodeFunctionInput from '../core/NodeFunctionInput.js';
import { add, floor, mod, mul, sign, temp, temp_off } from '../ShaderNode.js';


const checkerShaderNode = new NodalFunctionNode( 'checker', NodeType.Float, [ new NodeFunctionInput( 'vec2', 'uv' ) ], ( inputs ) => {

	const { uv } = inputs;
	const tmp = temp( floor, mul( uv, 2.0 ) );
	return temp_off( sign( mod( add( tmp.x, tmp.y ), 2.0 ) ) );

} );

class CheckerNode extends Node {

	constructor( uvNode = new UVNode() ) {

		super( 'float' );

		this.uvNode = uvNode;

	}

	generate( builder ) {

		return checkerShaderNode.call( { uv: this.uvNode } ).build( builder );

	}

}

export default CheckerNode;
