import { NodeUpdateType } from './constants.js';

import { MathUtils } from 'three';

class Node {

	constructor( nodeType = null ) {

		this.nodeType = nodeType;

		this.updateType = NodeUpdateType.None;

		this.uuid = MathUtils.generateUUID();

	}

	get type() {

		return this.constructor.name;

	}

	getHash( /*builder*/ ) {

		return this.uuid;

	}

	getUpdateType( /*builder*/ ) {

		return this.updateType;

	}

	getNodeType( /*builder*/ ) {

		return this.nodeType;

	}

	update( /*frame*/ ) {

		console.warn( 'Abstract function.' );

	}

	generate( /*builder, output*/ ) {

		console.warn( 'Abstract function.' );

	}

	build( builder, output = null ) {

		const hash = this.getHash( builder );
		const sharedNode = builder.getNodeFromHash( hash );

		if ( sharedNode !== undefined && this !== sharedNode ) {

			return sharedNode.build( builder, output );

		}

		builder.addNode( this );
		builder.addStack( this );

		const isGenerateOnce = this.generate.length === 1;

		let snippet = null;

		if ( isGenerateOnce ) {

			const type = this.getNodeType( builder );
			const nodeData = builder.getDataFromNode( this );

			snippet = nodeData.snippet;

			if ( snippet === undefined ) {

				snippet = this.generate( builder ) || '';

				nodeData.snippet = snippet;

			}

			snippet = builder.format( snippet, type, output );

		} else {

			snippet = this.generate( builder, output ) || '';

		}

		builder.removeStack( this );

		return snippet;

	}

}

Node.prototype.isNode = true;

export default Node;
