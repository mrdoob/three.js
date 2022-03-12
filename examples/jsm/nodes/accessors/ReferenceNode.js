import Node from '../core/Node.js';
import UniformNode from '../core/UniformNode.js';
import { NodeUpdateType } from '../core/constants.js';

class ReferenceNode extends Node {

	constructor( property, uniformType, object = null ) {

		super();

		this.property = property;

		this.uniformType = uniformType;

		this.object = object;

		this.node = null;

		this.updateType = NodeUpdateType.Object;

		this.setNodeType( uniformType );

	}

	setNodeType( uniformType ) {

		this.node = new UniformNode( null, uniformType );
		this.nodeType = uniformType;

		if ( uniformType === 'color' ) {

			this.nodeType = 'vec3';

		} else if ( uniformType === 'texture' ) {

			this.nodeType = 'vec4';

		}

	}

	getNodeType() {

		return this.uniformType;

	}

	update( frame ) {

		const object = this.object !== null ? this.object : frame.object;
		const value = object[ this.property ];

		this.node.value = value;

	}

	generate( builder ) {

		return this.node.build( builder, this.getNodeType( builder ) );

	}

}

export default ReferenceNode;
