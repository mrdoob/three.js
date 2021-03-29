import Node from '../core/Node.js';
import FloatNode from '../inputs/FloatNode.js';
import Vector2Node from '../inputs/Vector2Node.js';
import Vector3Node from '../inputs/Vector3Node.js';
import Vector4Node from '../inputs/Vector4Node.js';
import ColorNode from '../inputs/ColorNode.js';
import TextureNode from '../inputs/TextureNode.js';
import { NodeUpdateType } from '../core/constants.js';

class ReferenceNode extends Node {

	constructor( property, inputType, object = null ) {

		super();

		this.property = property;
		this.inputType = inputType;

		this.object = object;

		this.node = null;

		this.updateType = NodeUpdateType.Object;

		this.setNodeType( inputType );

	}

	setNodeType( inputType ) {

		let node = null;
		let type = inputType;

		if ( type === 'float' ) {

			node = new FloatNode();

		} else if ( type === 'vec2' ) {

			node = new Vector2Node( null );

		} else if ( type === 'vec3' ) {

			node = new Vector3Node( null );

		} else if ( type === 'vec4' ) {

			node = new Vector4Node( null );

		} else if ( type === 'color' ) {

			node = new ColorNode( null );
			type = 'vec3';

		} else if ( type === 'texture' ) {

			node = new TextureNode();
			type = 'vec4';

		}

		this.node = node;
		this.type = type;
		this.inputType = inputType;

	}

	getNodeType() {

		return this.inputType;

	}

	update( frame ) {

		const object = this.object !== null ? this.object : frame.object;
		const value = object[ this.property ];

		this.node.value = value;

	}

	generate( builder, output ) {

		return this.node.build( builder, output );

	}

}

export default ReferenceNode;
