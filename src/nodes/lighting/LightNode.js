import Node, { registerNode } from '../core/Node.js';
import { nodeProxy } from '../tsl/TSLBase.js';
import { objectPosition } from '../accessors/Object3DNode.js';
import { cameraViewMatrix } from '../accessors/Camera.js';

class LightNode extends Node {

	constructor( scope = LightNode.TARGET_DIRECTION, light = null ) {

		super();

		this.scope = scope;
		this.light = light;

	}

	setup() {

		const { scope, light } = this;

		let output = null;

		if ( scope === LightNode.TARGET_DIRECTION ) {

			output = cameraViewMatrix.transformDirection( objectPosition( light ).sub( objectPosition( light.target ) ) );

		}

		return output;

	}

	serialize( data ) {

		super.serialize( data );

		data.scope = this.scope;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.scope = data.scope;

	}

}

LightNode.TARGET_DIRECTION = 'targetDirection';

export default LightNode;

LightNode.type = /*@__PURE__*/ registerNode( 'Light', LightNode );

export const lightTargetDirection = /*@__PURE__*/ nodeProxy( LightNode, LightNode.TARGET_DIRECTION );
