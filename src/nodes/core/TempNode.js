import Node from './Node.js';

/**
 * This module uses cache management to create temporary variables
 * if the node is used more than once to prevent duplicate calculations.
 *
 * The class acts as a base class for many other nodes types.
 *
 * @augments Node
 */
class TempNode extends Node {

	static get type() {

		return 'TempNode';

	}

	/**
	 * Constructs a temp node.
	 *
	 * @param {String?} nodeType - The node type.
	 */
	constructor( nodeType = null ) {

		super( nodeType );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isTempNode = true;

	}

	/**
	 * Whether this node is used more than once in context of other nodes.
	 *
	 * @param {NodeBuilder} builder - The node builder.
	 * @return {Boolean} A flag that indicates if there is more than one dependency to other nodes.
	 */
	hasDependencies( builder ) {

		return builder.getDataFromNode( this ).usageCount > 1;

	}

	build( builder, output ) {

		const buildStage = builder.getBuildStage();

		if ( buildStage === 'generate' ) {

			const type = builder.getVectorType( this.getNodeType( builder, output ) );
			const nodeData = builder.getDataFromNode( this );

			if ( nodeData.propertyName !== undefined ) {

				return builder.format( nodeData.propertyName, type, output );

			} else if ( type !== 'void' && output !== 'void' && this.hasDependencies( builder ) ) {

				const snippet = super.build( builder, type );

				const nodeVar = builder.getVarFromNode( this, null, type );
				const propertyName = builder.getPropertyName( nodeVar );

				builder.addLineFlowCode( `${propertyName} = ${snippet}`, this );

				nodeData.snippet = snippet;
				nodeData.propertyName = propertyName;

				return builder.format( nodeData.propertyName, type, output );

			}

		}

		return super.build( builder, output );

	}

}

export default TempNode;
