import TempNode from '../core/TempNode.js';
import { addMethodChaining, nodeProxy } from '../tsl/TSLCore.js';
import { vectorComponents } from '../core/constants.js';

/**
 * These node represents an assign operation. Meaning a node is assigned
 * to another node.
 *
 * @augments TempNode
 */
class AssignNode extends TempNode {

	static get type() {

		return 'AssignNode';

	}

	/**
	 * Constructs a new assign node.
	 *
	 * @param {Node} targetNode - The target node.
	 * @param {Node} sourceNode - The source type.
	 */
	constructor( targetNode, sourceNode ) {

		super();

		/**
		 * The target node.
		 *
		 * @type {Node}
		 */
		this.targetNode = targetNode;

		/**
		 * The source node.
		 *
		 * @type {Node}
		 */
		this.sourceNode = sourceNode;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isAssignNode = true;

	}

	/**
	 * Whether this node is used more than once in context of other nodes. This method
	 * is overwritten since it always returns `false` (assigns are unique).
	 *
	 * @return {boolean} A flag that indicates if there is more than one dependency to other nodes. Always `false`.
	 */
	hasDependencies() {

		return false;

	}

	getNodeType( builder, output ) {

		return output !== 'void' ? this.targetNode.getNodeType( builder ) : 'void';

	}

	/**
	 * Whether a split is required when assigning source to target. This can happen when the component length of
	 * target and source data type does not match.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {boolean} Whether a split is required when assigning source to target.
	 */
	needsSplitAssign( builder ) {

		const { targetNode } = this;

		if ( builder.isAvailable( 'swizzleAssign' ) === false && targetNode.isSplitNode && targetNode.components.length > 1 ) {

			const targetLength = builder.getTypeLength( targetNode.node.getNodeType( builder ) );
			const assignDifferentVector = vectorComponents.join( '' ).slice( 0, targetLength ) !== targetNode.components;

			return assignDifferentVector;

		}

		return false;

	}

	setup( builder ) {

		const { targetNode, sourceNode } = this;

		const properties = builder.getNodeProperties( this );
		properties.sourceNode = sourceNode;
		properties.targetNode = targetNode.context( { assign: true } );

	}

	generate( builder, output ) {

		const { targetNode, sourceNode } = builder.getNodeProperties( this );

		const needsSplitAssign = this.needsSplitAssign( builder );

		const targetType = targetNode.getNodeType( builder );

		const target = targetNode.build( builder );
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

			const splitNode = targetNode.node;
			const splitTargetNode = splitNode.node.context( { assign: true } );

			const targetRoot = splitTargetNode.build( builder );

			for ( let i = 0; i < splitNode.components.length; i ++ ) {

				const component = splitNode.components[ i ];

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

/**
 * TSL function for creating an assign node.
 *
 * @tsl
 * @function
 * @param {Node} targetNode - The target node.
 * @param {Node} sourceNode - The source type.
 * @returns {AssignNode}
 */
export const assign = /*@__PURE__*/ nodeProxy( AssignNode ).setParameterLength( 2 );

addMethodChaining( 'assign', assign );
