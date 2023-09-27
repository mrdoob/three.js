import TempNode from '../core/TempNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy, vec2 } from '../shadernode/ShaderNode.js';

class RotateUVNode extends TempNode {

	constructor( uvNode, rotationNode, centerNode = vec2( 0.5 ) ) {

		super( 'vec2' );

		this.uvNode = uvNode;
		this.rotationNode = rotationNode;
		this.centerNode = centerNode;

	}

	construct() {

		const { uvNode, rotationNode, centerNode } = this;

		const cosAngle = rotationNode.cos();
		const sinAngle = rotationNode.sin();

		const vector = uvNode.sub( centerNode );

		const rotatedVector = vec2( // @TODO: Maybe we can create mat2 and write something like rotationMatrix.mul( vector )?
			vec2( cosAngle, sinAngle ).dot( vector ),
			vec2( sinAngle.negate(), cosAngle ).dot( vector )
		);

		return rotatedVector.add( centerNode );

	}

}

export default RotateUVNode;

export const rotateUV = nodeProxy( RotateUVNode );

addNodeElement( 'rotateUV', rotateUV );

addNodeClass( RotateUVNode );
