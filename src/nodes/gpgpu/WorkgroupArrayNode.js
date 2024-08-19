import ArrayElementNode from '../utils/ArrayElementNode.js';

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

	constructor( value, bufferType, bufferCount = 0 ) {

		super( value, bufferType );

		this.bufferType = bufferType;
		this.bufferCount = bufferCount;

		this.isWorkgroupArrayNode = true;

		this.scope = 'workgroup';


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

		return new ScopedArrayElementNode( this, indexNode );

	}

	generate( builder ) {

		return builder.getScopedArray( this.name || `${this.scope}Array${this.id}`, this.scope, this.bufferType, this.bufferCount );

	}

}

export default ScopedArrayNode;
