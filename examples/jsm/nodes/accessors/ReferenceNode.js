import Node, { addNodeClass } from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { texture } from './TextureNode.js';
import { nodeObject, getConstNodeType } from '../shadernode/ShaderNode.js';

class ReferenceNode extends Node {

	constructor( property, uniformType, object = null ) {

		super();

		this.property = property;

		this.uniformType = uniformType;

		this.object = object;

		this.node = null;

		this.updateType = NodeUpdateType.OBJECT;

		this.setNodeType( uniformType );

	}

	setNodeType( uniformType ) {

		let node = null;

		if ( uniformType === 'texture' ) {

			node = texture( null );

		} else {

			node = uniform( uniformType );

		}

		this.node = node;

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	update( frame ) {

		const object = this.object !== null ? this.object : frame.object;
		const property = this.property;

		this.node.value = object[ property ];

	}

	construct( /*builder*/ ) {

		return this.node;

	}

}

export default ReferenceNode;

export const reference = ( name, nodeOrType, object ) => nodeObject( new ReferenceNode( name, getConstNodeType( nodeOrType ), object ) );

addNodeClass( ReferenceNode );
