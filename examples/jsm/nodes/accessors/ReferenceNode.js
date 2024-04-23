import Node, { addNodeClass } from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { texture } from './TextureNode.js';
import { buffer } from './BufferNode.js';
import { nodeObject } from '../shadernode/ShaderNode.js';
import { uniforms } from './UniformsNode.js';
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

class ReferenceNode extends Node {

	constructor( property, uniformType, object = null, count = null ) {

		super();

		this.property = property;
		this.uniformType = uniformType;
		this.object = object;
		this.count = count;

		this.properties = property.split( '.' );
		this.reference = null;
		this.node = null;

		this.updateType = NodeUpdateType.OBJECT;

	}

	element( indexNode ) {

		return nodeObject( new ReferenceElementNode( this, nodeObject( indexNode ) ) );

	}

	setNodeType( uniformType ) {

		let node = null;

		if ( this.count !== null ) {

			node = buffer( null, uniformType, this.count );

		} else if ( Array.isArray( this.getValueFromReference() ) ) {

			node = uniforms( null, uniformType );

		} else if ( uniformType === 'texture' ) {

			node = texture( null );

		} else {

			node = uniform( null, uniformType );

		}

		this.node = node;

	}

	getNodeType( builder ) {

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

export default ReferenceNode;

export const reference = ( name, type, object ) => nodeObject( new ReferenceNode( name, type, object ) );
export const referenceBuffer = ( name, type, count, object ) => nodeObject( new ReferenceNode( name, type, object, count ) );

addNodeClass( 'ReferenceNode', ReferenceNode );
