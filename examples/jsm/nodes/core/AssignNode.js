import TempNode from './TempNode.js';
import { addNodeClass } from './Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

class AssignNode extends TempNode {

	constructor( targetNode, sourceNode ) {

		super();

		this.targetNode = targetNode;
		this.sourceNode = sourceNode;

	}

	hasDependencies() {

		return false;

	}

	getNodeType( builder, output ) {

		return output !== 'void' ? this.targetNode.getNodeType( builder ) : 'void';

	}

	setup( builder ) {

		super.setup( builder );

		const targetNode = this.targetNode;
		const sourceNode = this.sourceNode;

		// WGSL bug workaround
		// @TODO: remove this when https://github.com/gpuweb/gpuweb/issues/737 will be fixed

		if ( builder.isWGSLNodeBuilder === true && targetNode.isSplitNode === true && targetNode.components.length > 1 ) {

			for ( const c of targetNode.components ) {

				targetNode.node[ c ] = sourceNode[ c ];

			}

		}

	}

	generate( builder, output ) {

		const targetNode = this.targetNode;
		const sourceNode = this.sourceNode;

		// WGSL bug workaround
		// @TODO: remove this when https://github.com/gpuweb/gpuweb/issues/737 will be fixed

		if ( builder.isWGSLNodeBuilder === true && targetNode.isSplitNode === true && targetNode.components.length > 1 ) {

			super.generate( builder, 'void' );

			return;

		}

		const targetType = targetNode.getNodeType( builder );

		const target = targetNode.build( builder, output === 'void' ? 'void' : null );
		const source = sourceNode.build( builder, targetType );

		const snippet = builder.formatOperation( '=', target, source );

		if ( output === 'void' ) {

			builder.addLineFlowCode( snippet );

			return;

		} else {

			const sourceType = sourceNode.getNodeType( builder );

			if ( sourceType === 'void' ) {

				builder.addLineFlowCode( snippet );

				return target;

			}

			return builder.format( snippet, targetType, output );

		}

	}

}

export default AssignNode;

export const assign = nodeProxy( AssignNode );

addNodeClass( 'AssignNode', AssignNode );

addNodeElement( 'assign', assign );
