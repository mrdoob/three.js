import { addNodeClass } from '../core/Node.js';
import TempNode from '../core/TempNode.js';
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

	setup( builder ) {

		const properties = builder.getNodeProperties( this );

		properties.targetNode = this.targetNode.context( { assign: true } );
		properties.sourceNode = this.sourceNode;

	}

	getNodeType( builder, output ) {

		return output !== 'void' ? this.targetNode.getNodeType( builder ) : 'void';

	}

	generate( builder, output ) {

		const { targetNode, sourceNode } = builder.getNodeProperties( this );

		const targetType = targetNode.getNodeType( builder );

		const target = targetNode.build( builder );
		const source = sourceNode.build( builder, targetType );

		const snippet = `${ target } = ${ source }`;

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
