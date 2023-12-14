import Node, { addNodeClass } from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { texture } from './TextureNode.js';
import { nodeObject } from '../shadernode/ShaderNode.js';

class ReferenceNode extends Node {

	constructor( property, uniformType, object = null ) {

		super();

		this.property = property;
		this.index = null;

		this.uniformType = uniformType;

		this.object = object;
		this.reference = null;

		this.node = null;

		this.updateType = NodeUpdateType.OBJECT;

		this.setNodeType( uniformType );

	}

	updateReference( frame ) {

		this.reference = this.object !== null ? this.object : frame.object;

		return this.reference;

	}

	setIndex( index ) {

		this.index = index;

		return this;

	}

	getIndex() {

		return this.index;

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

	update( /*frame*/ ) {

		let value = this.reference[ this.property ];

		if ( this.index !== null ) {

			value = value[ this.index ];

		}

		this.node.value = value;

	}

	setup( /*builder*/ ) {

		return this.node;

	}

}

export default ReferenceNode;

export const reference = ( name, type, object ) => nodeObject( new ReferenceNode( name, type, object ) );
export const referenceIndex = ( name, index, type, object ) => nodeObject( new ReferenceNode( name, type, object ).setIndex( index ) );

addNodeClass( 'ReferenceNode', ReferenceNode );
