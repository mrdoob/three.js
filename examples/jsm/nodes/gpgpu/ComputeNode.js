import Node from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';

class ComputeNode extends Node {

	constructor( computeNode, count, workgroupSize = [ 64 ] ) {

		super( 'void' );

		this.computeNode = computeNode;

		this.count = count;
		this.workgroupSize = workgroupSize;
		this.dispatchCount = 0;

		this.updateType = NodeUpdateType.Object;

		this.updateDispatchCount();

	}

	updateDispatchCount() {

		const { count, workgroupSize } = this;

		let size = workgroupSize[ 0 ];

		for ( let i = 1; i < workgroupSize.length; i ++ )
			size *= workgroupSize[ i ];

		this.dispatchCount = Math.ceil( count / size );

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
