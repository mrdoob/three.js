import Node from '../core/Node.js';
import { assign, element, instanceIndex } from '../shadernode/ShaderNodeElements.js';
import { NodeUpdateType } from '../core/constants.js';

class ComputeNode extends Node {

	constructor( dispatchCount, workgroupSize = [ 64 ] ) {

		super( 'void' );

		this.updateType = NodeUpdateType.Object;

		this.dispatchCount = dispatchCount;
		this.workgroupSize = workgroupSize;

		this.assigns = [];

	}

	getMainStorageBufferNode() {

		const assigns = this.assigns;

		return assigns[ assigns.length - 1 ].storageBufferNode;

	}

	assign( storageBufferNode, sourceNode ) {

		this.assigns.push( { storageBufferNode, sourceNode } );

		return this;

	}

	update( { renderer } ) {

		renderer.compute( this );

	}

	generate( builder ) {

		const { renderer, shaderStage } = builder;

		if ( shaderStage === 'compute' ) {

			for ( const { storageBufferNode, sourceNode } of this.assigns ) {

				assign( element( storageBufferNode, instanceIndex ), sourceNode ).build( builder );

			}

		}

	}

}

ComputeNode.prototype.isComputeNode = true;

export default ComputeNode;
