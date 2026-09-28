import Node from '../core/Node.js';
import { property } from '../core/PropertyNode.js';
import { addMethodChaining, nodeProxy } from '../tsl/TSLCore.js';
import { warn } from '../../utils.js';
import NodeError from '../core/NodeError.js';

/**
 * Represents a logical `if/else` statement. Can be used as an alternative
 * to the `If()`/`Else()` syntax.
 *
 * The `select()` method is called in a chaining fashion on a condition. The parameter nodes of `select()`
 * determine the outcome of the entire statement.
 *
 * ```js
 * velocity = position.greaterThanEqual( limit ).select( velocity.negate(), velocity );
 * ```
 *
 * When the condition is itself a vector (e.g. the `bvec4` produced by
 * `someVec4.greaterThanEqual( someOtherVec4 )`), `select()` resolves
 * per-component - each output lane picks independently based on its own
 * condition component, the same way WGSL's native `select()` and GLSL's
 * `mix( x, y, bvecN )` do - rather than picking one branch for the whole
 * vector. The condition and values are converted to the largest vector width,
 * with the condition converted to boolean components. Scalar values are broadcast.
 *
 * ```js
 * // per-component: each channel picks independently
 * const clamped = value.greaterThan( vec3( 1.0 ) ).select( vec3( 1.0 ), value );
 * ```
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

	isCacheable( /*builder*/ ) {

		return false;

	}

	/**
	 * This method is overwritten since the node type is inferred from the if/else
	 * nodes.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The node type.
	 */
	generateNodeType( builder ) {

		const { condNode, ifNode, elseNode } = builder.getNodeProperties( this );

		if ( ifNode === undefined ) {

			// fallback setup

			builder.flowBuildStage( this, 'setup' );

			return this.getNodeType( builder );

		}

		let type = ifNode.getNodeType( builder );

		if ( elseNode !== null ) {

			const elseType = elseNode.getNodeType( builder );

			if ( builder.getTypeLength( elseType ) > builder.getTypeLength( type ) ) {

				type = elseType;

			}

		}

		const condLength = builder.getTypeLength( condNode.getNodeType( builder ) );

		if ( condLength > 1 && ! builder.isReference( type ) && ( builder.getTypeLength( type ) === 1 || builder.isVector( builder.getVectorType( type ) ) ) ) {

			type = builder.getTypeFromLength( Math.max( condLength, builder.getTypeLength( type ) ), builder.getComponentType( type ) );

		}

		return type;

	}

	setup( builder ) {

		const { condNode, ifNode, elseNode } = this;

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

		if ( nodeData.propertyName !== undefined ) {

			return builder.format( nodeData.propertyName, type, output );

		}

		const { condNode, ifNode, elseNode } = builder.getNodeProperties( this );

		const functionNode = builder.currentFunctionNode;
		const needsOutput = output !== 'void';
		const nodeProperty = needsOutput ? property( type ).build( builder ) : '';

		nodeData.propertyName = nodeProperty;

		// A vector condition selects per-component - see getVectorSelect().
		const condType = condNode.getNodeType( builder );
		const condLength = builder.getTypeLength( condType );

		if ( condLength > 1 ) {

			const vectorType = builder.getVectorType( type );

			if ( builder.isReference( type ) || ! builder.isVector( vectorType ) ) {

				throw new NodeError( `TSL: select() with a vector condition ("${ condType }") requires scalar or vector values, received "${ type }".`, this.stackTrace );

			}

			// No "else": unselected lanes fall back to the type's zero value.
			let elseSnippet;

			if ( elseNode !== null ) {

				elseSnippet = elseNode.build( builder, type );

			} else {

				elseSnippet = builder.generateConst( type );

			}

			const boolType = builder.changeComponentType( type, 'bool' );
			const condSnippet = condNode.build( builder, boolType );
			const ifSnippet = ifNode.build( builder, type );

			const mathSnippet = builder.getVectorSelect( condSnippet, ifSnippet, elseSnippet, type );

			if ( ! needsOutput ) return '';

			builder.addFlowCode( `\n${ builder.tab }${ nodeProperty } = ${ mathSnippet };\n\n` );

			return builder.format( nodeProperty, type, output );

		}

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

		const flowBlock = builder.flowBlock;

		builder.flowBlock = { parent: flowBlock };

		let ifSnippet = ifNode.build( builder, type );

		builder.flowBlock = flowBlock;

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

			builder.flowBlock = { parent: flowBlock };

			let elseSnippet = elseNode.build( builder, type );

			builder.flowBlock = flowBlock;

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
