import Node, { addNodeClass } from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { texture } from './TextureNode.js';
import { nodeObject } from '../shadernode/ShaderNode.js';
import { uniforms } from './UniformsNode.js';

class ReferenceNode extends Node {

	constructor( property, uniformType, object = null, indexNode = null ) {

		super();

		this.property = property;
		this.indexNode = indexNode;

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

	setNodeType( uniformType ) {

		let node = null;

		if ( uniformType === 'texture' ) {

			node = texture( null );

		} else if ( this.indexNode !== null ) {

			node = uniforms( null, uniformType ).element( this.indexNode );

		} else {

			node = uniform( uniformType );

		}

		this.node = node;

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	update( /*frame*/ ) {

		const value = this.reference[ this.property ];

		if ( this.indexNode !== null ) {

			this.node.node.array = value;

		} else {

			this.node.value = value;

		}


	}

	setup( builder ) {

		if ( this.indexNode !== null ) {

			this.node.node.array = ( this.object !== null ? this.object : builder.object )[ this.property ];

		}

		return this.node;

	}

}

export default ReferenceNode;

export const reference = ( name, type, object ) => nodeObject( new ReferenceNode( name, type, object ) );
export const referenceIndex = ( name, index, type, object ) => nodeObject( new ReferenceNode( name, type, object, index ) );

addNodeClass( 'ReferenceNode', ReferenceNode );
