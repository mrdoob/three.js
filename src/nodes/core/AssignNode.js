import TempNode from '../core/TempNode.js';
import { addMethodChaining, nodeProxy } from '../tsl/TSLCore.js';
import { vectorComponents } from '../core/constants.js';

class AssignNode extends TempNode {

	static get type() {

		return 'AssignNode';

	}

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

	needsSplitAssign( builder ) {

		const { targetNode } = this;

		if ( builder.isAvailable( 'swizzleAssign' ) === false && targetNode.isSplitNode && targetNode.components.length > 1 ) {

			const targetLength = builder.getTypeLength( targetNode.node.getNodeType( builder ) );
			const assignDiferentVector = vectorComponents.join( '' ).slice( 0, targetLength ) !== targetNode.components;

			return assignDiferentVector;

		}

		return false;

	}

	generate( builder, output ) {

		const { targetNode, sourceNode } = this;

		const needsSplitAssign = this.needsSplitAssign( builder );

		const targetType = targetNode.getNodeType( builder );

		const target = targetNode.context( { assign: true } ).build( builder );
		const source = sourceNode.build( builder, targetType );

		const sourceType = sourceNode.getNodeType( builder );

		const nodeData = builder.getDataFromNode( this );

		//

		let snippet;

		if ( nodeData.initialized === true ) {

			if ( output !== 'void' ) {

				snippet = target;

			}

		} else if ( needsSplitAssign ) {

			const sourceVar = builder.getVarFromNode( this, null, targetType );
			const sourceProperty = builder.getPropertyName( sourceVar );

			builder.addLineFlowCode( `${ sourceProperty } = ${ source }`, this );

			const targetRoot = targetNode.node.context( { assign: true } ).build( builder );

			for ( let i = 0; i < targetNode.components.length; i ++ ) {

				const component = targetNode.components[ i ];

				builder.addLineFlowCode( `${ targetRoot }.${ component } = ${ sourceProperty }[ ${ i } ]`, this );

			}

			if ( output !== 'void' ) {

				snippet = target;

			}

		} else {

			snippet = `${ target } = ${ source }`;

			if ( output === 'void' || sourceType === 'void' ) {

				builder.addLineFlowCode( snippet, this );

				if ( output !== 'void' ) {

					snippet = target;

				}

			}

		}

		nodeData.initialized = true;

		return builder.format( snippet, targetType, output );

	}

}

export default AssignNode;

export const assign = /*@__PURE__*/ nodeProxy( AssignNode );

addMethodChaining( 'assign', assign );
