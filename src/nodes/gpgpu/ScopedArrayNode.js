import ArrayElementNode from '../utils/ArrayElementNode.js';
import { nodeObject, addNodeElement } from '../shadernode/ShaderNode.js';
import Node, { addNodeClass } from '../core/Node.js';

class ScopedArrayElementNode extends ArrayElementNode {

	constructor( scopedArrayNode, indexNode ) {

		super( scopedArrayNode, indexNode );

		this.isScopedArrayElementNode = true;

	}

	generate( builder, output ) {

		let snippet;

		const isAssignContext = builder.context.assign;
		snippet = super.generate( builder );

		if ( isAssignContext !== true ) {

			const type = this.getNodeType( builder );

			snippet = builder.format( snippet, type, output );

		}

		// TODO: Possibly activate clip distance index on index access rather than from clipping context

		return snippet;

	}

}


class ScopedArrayNode extends Node {

	constructor( scope, bufferType, bufferCount = 0 ) {

		super( bufferType );

		this.bufferType = bufferType;
		this.bufferCount = bufferCount;

		this.isScopedArrayNode = true;

		this.scope = scope;

	}

	label( name ) {

		this.name = name;

		return this;

	}

	getHash( builder ) {

		return this.uuid;

	}

	setScope( scope ) {

		this.scope = scope;

		return this;

	}

	getInputType( /*builder*/ ) {

		return `${this.scope}Array`;

	}

	element( indexNode ) {

		return nodeObject( new ScopedArrayElementNode( this, indexNode ) );

	}

	generate( builder ) {

		return builder.getScopedArray( this.name || `${this.scope}Array_${this.id}`, this.scope.toLowerCase(), this.bufferType, this.bufferCount );

	}

}

export default ScopedArrayNode;

export const workgroupArray = ( type, count ) => nodeObject( new ScopedArrayNode( 'Workgroup', type, count ) );
export const privateArray = ( type, count ) => nodeObject( new ScopedArrayNode( 'Private', type, count ) );

addNodeClass( 'ScopedArrayNode', ScopedArrayNode );

