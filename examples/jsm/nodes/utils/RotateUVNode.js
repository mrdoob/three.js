import TempNode from '../core/TempNode.js';
import { vec2, add, sub, mul, cos, sin } from '../shadernode/ShaderNodeBaseElements.js';

class RotateUVNode extends TempNode {

	constructor( uvNode, rotationNode, centerNode = vec2( .5 ) ) {

		super( 'vec2' );

		this.uvNode = uvNode;
		this.rotationNode = rotationNode;
		this.centerNode = centerNode;

	}

	construct() {

		const { uvNode, rotationNode, centerNode } = this;

		const cosAngle = cos( rotationNode );
		const sinAngle = sin( rotationNode );

		return vec2(
			add( add( mul( cosAngle, sub( uvNode.x, centerNode.x ) ), mul( sinAngle, sub( uvNode.y, centerNode.y ) ) ), centerNode.x ),
			add( sub( mul( cosAngle, sub( uvNode.y, centerNode.y ) ), mul( sinAngle, sub( uvNode.x, centerNode.x ) ) ), centerNode.y )
		);

	}

}

export default RotateUVNode;
