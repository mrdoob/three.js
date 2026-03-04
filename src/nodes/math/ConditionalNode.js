import Node from '../core/Node.js';
import { property } from '../core/PropertyNode.js';
import { addMethodChaining, nodeProxy } from '../tsl/TSLCore.js';
import { warn } from '../../utils.js';

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
	 * @param {?Node} [elseNode=null] - The node that is evaluate when the condition ends up `false`.
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
		 * @type {?Node}
		 * @default null
		 */
		this.elseNode = elseNode;

	}

	/**
	 * This method is overwritten since the node type is inferred from the if/else
	 * nodes.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The node type.
	 */
	getNodeType( builder ) {

		const { ifNode, elseNode } = builder.getNodeProperties( this );

		if ( ifNode === undefined ) {

			// fallback setup

			builder.flowBuildStage( this, 'setup' );

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

		const condNode = this.condNode;
		const ifNode = this.ifNode.isolate();
		const elseNode = this.elseNode ? this.elseNode.isolate() : null;

		//

		const currentNodeBlock = builder.context.nodeBlock;

		builder.getDataFromNode( ifNode ).parentNodeBlock = currentNodeBlock;
		if ( elseNode !== null ) builder.getDataFromNode( elseNode ).parentNodeBlock = currentNodeBlock;

		//

		const isUniformFlow = builder.context.uniformFlow;

		const properties = builder.getNodeProperties( this );
		properties.condNode = condNode;
		properties.ifNode = isUniformFlow ? ifNode : ifNode.context( { nodeBlock: ifNode } );
		properties.elseNode = elseNode ? ( isUniformFlow ? elseNode : elseNode.context( { nodeBlock: elseNode } ) ) : null;

	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );

		const nodeData = builder.getDataFromNode( this );

		if ( nodeData.nodeProperty !== undefined ) {

			return nodeData.nodeProperty;

		}

		const { condNode, ifNode, elseNode } = builder.getNodeProperties( this );

		const functionNode = builder.currentFunctionNode;
		const needsOutput = output !== 'void';
		const nodeProperty = needsOutput ? property( type ).build( builder ) : '';

		nodeData.nodeProperty = nodeProperty;

		const nodeSnippet = condNode.build( builder, 'bool' );
		const isUniformFlow = builder.context.uniformFlow;

		if ( isUniformFlow && elseNode !== null ) {

			const ifSnippet = ifNode.build( builder, type );
			const elseSnippet = elseNode.build( builder, type );

			const mathSnippet = builder.getTernary( nodeSnippet, ifSnippet, elseSnippet );

			// TODO: If node property already exists return something else

			return builder.format( mathSnippet, type, output );

		}

		builder.addFlowCode( `\n${ builder.tab }if ( ${ nodeSnippet } ) {\n\n` ).addFlowTab();

		let ifSnippet = ifNode.build( builder, type );

		if ( ifSnippet ) {

			if ( needsOutput ) {

				ifSnippet = nodeProperty + ' = ' + ifSnippet + ';';

			} else {

				ifSnippet = 'return ' + ifSnippet + ';';

				if ( functionNode === null ) {

					warn( 'TSL: Return statement used in an inline \'Fn()\'. Define a layout struct to allow return values.', this.stackTrace );

					ifSnippet = '// ' + ifSnippet;

				}

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

					if ( functionNode === null ) {

						warn( 'TSL: Return statement used in an inline \'Fn()\'. Define a layout struct to allow return values.', this.stackTrace );

						elseSnippet = '// ' + elseSnippet;

					}

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
 * @tsl
 * @function
 * @param {Node} condNode - The node that defines the condition.
 * @param {Node} ifNode - The node that is evaluate when the condition ends up `true`.
 * @param {?Node} [elseNode=null] - The node that is evaluate when the condition ends up `false`.
 * @returns {ConditionalNode}
 */
export const select = /*@__PURE__*/ nodeProxy( ConditionalNode ).setParameterLength( 2, 3 );

addMethodChaining( 'select', select );
