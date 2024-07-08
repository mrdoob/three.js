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

	setup() {

		const { uvNode, rotationNode, centerNode } = this;

		const vector = uvNode.sub( centerNode );

		return vector.rotate( rotationNode ).add( centerNode );

	}

}

export default RotateUVNode;

export const rotateUV = nodeProxy( RotateUVNode );

addNodeElement( 'rotateUV', rotateUV );

addNodeClass( 'RotateUVNode', RotateUVNode );
