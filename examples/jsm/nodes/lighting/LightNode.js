import Node, { addNodeClass } from '../core/Node.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';
import { objectPosition } from '../accessors/Object3DNode.js';
import { cameraViewMatrix } from '../accessors/CameraNode.js';

class LightNode extends Node {

	constructor( scope = LightNode.TARGET_DIRECTION, light = null ) {

		super();

		this.scope = scope;
		this.light = light;

	}

	construct() {

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

export const lightTargetDirection = nodeProxy( LightNode, LightNode.TARGET_DIRECTION );

addNodeClass( LightNode );
