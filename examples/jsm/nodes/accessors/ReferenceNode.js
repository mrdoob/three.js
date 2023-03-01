import Node from '../core/Node.js';
import UniformNode from '../core/UniformNode.js';
import TextureNode from '../accessors/TextureNode.js';
import { NodeUpdateType } from '../core/constants.js';

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

			node = new TextureNode( null );

		} else {

			node = new UniformNode( null, uniformType );

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
