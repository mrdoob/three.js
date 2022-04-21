import Node from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';

class ComputeNode extends Node {

	constructor( dispatchCount, workgroupSize = [ 64 ] ) {

		super( 'void' );

		this.updateType = NodeUpdateType.Object;

		this.dispatchCount = dispatchCount;
		this.workgroupSize = workgroupSize;

		this.computeNode = null;

	}

	update( { renderer } ) {

		renderer.compute( this );

	}

	generate( builder ) {

		const { shaderStage } = builder;

		if ( shaderStage === 'compute' ) {

			const snippet = this.computeNode.build( builder, 'void' );

			if ( snippet !== '' ) {

				builder.addFlowCode( snippet );

			}

		}

	}

}

ComputeNode.prototype.isComputeNode = true;

export default ComputeNode;
