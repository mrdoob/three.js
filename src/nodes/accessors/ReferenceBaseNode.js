import Node, { registerNode } from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { nodeObject } from '../tsl/TSLCore.js';
import ArrayElementNode from '../utils/ArrayElementNode.js';

class ReferenceElementNode extends ArrayElementNode {

	constructor( referenceNode, indexNode ) {

		super( referenceNode, indexNode );

		this.referenceNode = referenceNode;

		this.isReferenceElementNode = true;

	}

	getNodeType() {

		return this.referenceNode.uniformType;

	}

	generate( builder ) {

		const snippet = super.generate( builder );
		const arrayType = this.referenceNode.getNodeType();
		const elementType = this.getNodeType();

		return builder.format( snippet, arrayType, elementType );

	}

}

class ReferenceBaseNode extends Node {

	constructor( property, uniformType, object = null, count = null ) {

		super();

		this.property = property;
		this.uniformType = uniformType;
		this.object = object;
		this.count = count;

		this.properties = property.split( '.' );
		this.reference = object;
		this.node = null;

		this.updateType = NodeUpdateType.OBJECT;

	}

	element( indexNode ) {

		return nodeObject( new ReferenceElementNode( this, nodeObject( indexNode ) ) );

	}

	setNodeType( uniformType ) {

		this.node = uniform( null, uniformType ).getSelf();

	}

	getNodeType( builder ) {

		if ( this.node === null ) {

			this.updateValue();

		}

		return this.node.getNodeType( builder );

	}

	getValueFromReference( object = this.reference ) {

		const { properties } = this;

		let value = object[ properties[ 0 ] ];

		for ( let i = 1; i < properties.length; i ++ ) {

			value = value[ properties[ i ] ];

		}

		return value;

	}

	updateReference( state ) {

		this.reference = this.object !== null ? this.object : state.object;

		return this.reference;

	}

	setup() {

		this.updateValue();

		return this.node;

	}

	update( /*frame*/ ) {

		this.updateValue();

	}

	updateValue() {

		if ( this.node === null ) this.setNodeType( this.uniformType );

		const value = this.getValueFromReference();

		if ( Array.isArray( value ) ) {

			this.node.array = value;

		} else {

			this.node.value = value;

		}

	}

}

export default ReferenceBaseNode;

ReferenceBaseNode.type = /*@__PURE__*/ registerNode( 'ReferenceBase', ReferenceBaseNode );

export const reference = ( name, type, object ) => nodeObject( new ReferenceBaseNode( name, type, object ) );
export const referenceBuffer = ( name, type, count, object ) => nodeObject( new ReferenceBaseNode( name, type, object, count ) );
