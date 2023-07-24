import Node, { addNodeClass } from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { addNodeElement, nodeObject } from '../shadernode/ShaderNode.js';

class ComputeNode extends Node {

	constructor( computeNode, count, workgroupSize = [ 64 ] ) {

		super( 'void' );

		this.isComputeNode = true;

		this.computeNode = computeNode;

		this.count = count;
		this.workgroupSize = workgroupSize;
		this.dispatchCount = 0;

		this.version = 1;
		this.updateType = NodeUpdateType.OBJECT;

		this.updateDispatchCount();

	}

	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	}

	updateDispatchCount() {

		const { count, workgroupSize } = this;

		let size = workgroupSize[ 0 ];

		for ( let i = 1; i < workgroupSize.length; i ++ )
			size *= workgroupSize[ i ];

		this.dispatchCount = Math.ceil( count / size );

	}

	onInit() { }

	update( { renderer } ) {

		renderer.compute( this );

	}

	generate( builder ) {

		const { shaderStage } = builder;

		if ( shaderStage === 'compute' ) {

			const snippet = this.computeNode.build( builder, 'void' );

			if ( snippet !== '' ) {

				builder.addLineFlowCode( snippet );

			}

		}

	}

}

export default ComputeNode;

export const compute = ( node, count, workgroupSize ) => nodeObject( new ComputeNode( nodeObject( node ), count, workgroupSize ) );

addNodeElement( 'compute', compute );

addNodeClass( ComputeNode );
