import ArrayElementNode from '../utils/ArrayElementNode.js';
import { nodeObject } from '../tsl/TSLCore.js';
import Node from '../core/Node.js';

class WorkgroupInfoElementNode extends ArrayElementNode {

	constructor( workgroupInfoNode, indexNode ) {

		super( workgroupInfoNode, indexNode );

		this.isWorkgroupInfoElementNode = true;

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


class WorkgroupInfoNode extends Node {

	constructor( scope, bufferType, bufferCount = 0 ) {

		super( bufferType );

		this.bufferType = bufferType;
		this.bufferCount = bufferCount;

		this.isWorkgroupInfoNode = true;

		this.scope = scope;

	}

	label( name ) {

		this.name = name;

		return this;

	}

	getHash() {

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

		return nodeObject( new WorkgroupInfoElementNode( this, indexNode ) );

	}

	generate( builder ) {

		return builder.getScopedArray( this.name || `${this.scope}Array_${this.id}`, this.scope.toLowerCase(), this.bufferType, this.bufferCount );

	}

}

export default WorkgroupInfoNode;

export const workgroupArray = ( type, count ) => nodeObject( new WorkgroupInfoNode( 'Workgroup', type, count ) );


