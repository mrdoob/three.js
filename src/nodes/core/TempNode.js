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
	 * @param {?string} nodeType - The node type.
	 */
	constructor( nodeType = null ) {

		super( nodeType );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isTempNode = true;

	}

	/**
	 * Whether this node is used more than once in context of other nodes.
	 *
	 * @param {NodeBuilder} builder - The node builder.
	 * @return {boolean} A flag that indicates if there is more than one dependency to other nodes.
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

				// This node was already assigned to a temp variable on an
				// earlier reference. That assignment was flowed into whatever
				// code-block was active *then* -- if this reference is from a
				// different block (e.g. a sibling `If`/`Else` branch that
				// doesn't share an ancestor with the original one), the
				// variable is never actually assigned along this branch's
				// control path, so it silently reads its default-initialized
				// value instead of the intended result. `addFlowCodeHierarchy`
				// re-flows the assignment into this block when needed -- see
				// its own doc comment ("create their variables locally if the
				// Node is only used inside one of these conditionals"). The
				// plain (non-Temp) caching path in Node.build() already does
				// this on every cache hit; this mirrors that here so
				// TempNode's own propertyName-cache fast path gets the same
				// safety net.
				if ( builder.context.nodeBlock !== undefined ) {

					builder.addFlowCodeHierarchy( this, builder.context.nodeBlock );

				}

				return builder.format( nodeData.propertyName, type, output );

			} else if ( type !== 'void' && output !== 'void' && this.hasDependencies( builder ) ) {

				const snippet = super.build( builder, type );

				const nodeVar = builder.getVarFromNode( this, null, type );
				const propertyName = builder.getPropertyName( nodeVar );

				builder.addLineFlowCode( `${ propertyName } = ${ snippet }`, this );

				nodeData.snippet = snippet;
				nodeData.propertyName = propertyName;

				return builder.format( nodeData.propertyName, type, output );

			}

		}

		return super.build( builder, output );

	}

}

export default TempNode;
