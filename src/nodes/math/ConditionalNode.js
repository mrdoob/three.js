import Node from '../core/Node.js';
import { property } from '../core/PropertyNode.js';
import { addMethodChaining, nodeProxy } from '../tsl/TSLCore.js';

/** @module ConditionalNode **/

/**
 * Represents a logical `if/else` statement. Can be used as an alternative
 * to the `If()`/`Else()` syntax.
 *
 * The corresponding TSL `select()` looks like so:
 * ```js
 * velocity = position.greaterThanEqual( limit ).select( velocity.negate(), velocity );
 * ```
 * The `select()` method is called in a chaining fashion on a condition. The parameter nodes of `select()`
 * determine the outcome of the entire statement.
 *
 * @augments Node
 */
class ConditionalNode extends Node {

	static get type() {

		return 'ConditionalNode';

	}

	/**
	 * Constructs a new conditional node.
	 *
	 * @param {Node} condNode - The node that defines the condition.
	 * @param {Node} ifNode - The node that is evaluate when the condition ends up `true`.
	 * @param {Node?} [elseNode=null] - The node that is evaluate when the condition ends up `false`.
	 */
	constructor( condNode, ifNode, elseNode = null ) {

		super();

		/**
		 * The node that defines the condition.
		 *
		 * @type {Node}
		 */
		this.condNode = condNode;

		/**
		 * The node that is evaluate when the condition ends up `true`.
		 *
		 * @type {Node}
		 */
		this.ifNode = ifNode;

		/**
		 * The node that is evaluate when the condition ends up `false`.
		 *
		 * @type {Node?}
		 * @default null
		 */
		this.elseNode = elseNode;

	}

	/**
	 * This method is overwritten since the node type is inferred from the if/else
	 * nodes.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {String} The node type.
	 */
	getNodeType( builder ) {

		const { ifNode, elseNode } = builder.getNodeProperties( this );

		if ( ifNode === undefined ) {

			// fallback setup

			this.setup( builder );

			return this.getNodeType( builder );

		}

		const ifType = ifNode.getNodeType( builder );

		if ( elseNode !== null ) {

			const elseType = elseNode.getNodeType( builder );

			if ( builder.getTypeLength( elseType ) > builder.getTypeLength( ifType ) ) {

				return elseType;

			}

		}

		return ifType;

	}

	setup( builder ) {

		const condNode = this.condNode.cache();
		const ifNode = this.ifNode.cache();
		const elseNode = this.elseNode ? this.elseNode.cache() : null;

		//

		const currentNodeBlock = builder.context.nodeBlock;

		builder.getDataFromNode( ifNode ).parentNodeBlock = currentNodeBlock;
		if ( elseNode !== null ) builder.getDataFromNode( elseNode ).parentNodeBlock = currentNodeBlock;

		//

		const properties = builder.getNodeProperties( this );
		properties.condNode = condNode;
		properties.ifNode = ifNode.context( { nodeBlock: ifNode } );
		properties.elseNode = elseNode ? elseNode.context( { nodeBlock: elseNode } ) : null;

	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );

		const nodeData = builder.getDataFromNode( this );

		if ( nodeData.nodeProperty !== undefined ) {

			return nodeData.nodeProperty;

		}

		const { condNode, ifNode, elseNode } = builder.getNodeProperties( this );

		const needsOutput = output !== 'void';
		const nodeProperty = needsOutput ? property( type ).build( builder ) : '';

		nodeData.nodeProperty = nodeProperty;

		const nodeSnippet = condNode.build( builder, 'bool' );

		builder.addFlowCode( `\n${ builder.tab }if ( ${ nodeSnippet } ) {\n\n` ).addFlowTab();

		let ifSnippet = ifNode.build( builder, type );

		if ( ifSnippet ) {

			if ( needsOutput ) {

				ifSnippet = nodeProperty + ' = ' + ifSnippet + ';';

			} else {

				ifSnippet = 'return ' + ifSnippet + ';';

			}

		}

		builder.removeFlowTab().addFlowCode( builder.tab + '\t' + ifSnippet + '\n\n' + builder.tab + '}' );

		if ( elseNode !== null ) {

			builder.addFlowCode( ' else {\n\n' ).addFlowTab();

			let elseSnippet = elseNode.build( builder, type );

			if ( elseSnippet ) {

				if ( needsOutput ) {

					elseSnippet = nodeProperty + ' = ' + elseSnippet + ';';

				} else {

					elseSnippet = 'return ' + elseSnippet + ';';

				}

			}

			builder.removeFlowTab().addFlowCode( builder.tab + '\t' + elseSnippet + '\n\n' + builder.tab + '}\n\n' );

		} else {

			builder.addFlowCode( '\n\n' );

		}

		return builder.format( nodeProperty, type, output );

	}

}

export default ConditionalNode;

/**
 * TSL function for creating a conditional node.
 *
 * @function
 * @param {Node} condNode - The node that defines the condition.
 * @param {Node} ifNode - The node that is evaluate when the condition ends up `true`.
 * @param {Node?} [elseNode=null] - The node that is evaluate when the condition ends up `false`.
 * @returns {ConditionalNode}
 */
export const select = /*@__PURE__*/ nodeProxy( ConditionalNode );

addMethodChaining( 'select', select );

// Deprecated

/**
 * @function
 * @deprecated since r168. Use {@link select} instead.
 *
 * @param  {...any} params
 * @returns {ConditionalNode}
 */
export const cond = ( ...params ) => { // @deprecated, r168

	console.warn( 'TSL.ConditionalNode: cond() has been renamed to select().' );
	return select( ...params );

};

addMethodChaining( 'cond', cond );
