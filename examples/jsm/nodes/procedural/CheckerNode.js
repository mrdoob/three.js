import TempNode from '../core/TempNode.js';
import { uv } from '../accessors/UVNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, ShaderNode, nodeProxy } from '../shadernode/ShaderNode.js';

const checkerShaderNode = new ShaderNode( ( inputs ) => {

	const uv = inputs.uv.mul( 2.0 );

	const cx = uv.x.floor();
	const cy = uv.y.floor();
	const result = cx.add( cy ).mod( 2.0 );

	return result.sign();

} );

class CheckerNode extends TempNode {

	constructor( uvNode = uv() ) {

		super( 'float' );

		this.uvNode = uvNode;

	}

	generate( builder ) {

		return checkerShaderNode.call( { uv: this.uvNode } ).build( builder );

	}

}

export default CheckerNode;

export const checker = nodeProxy( CheckerNode );

addNodeElement( 'checker', checker );

addNodeClass( CheckerNode );
