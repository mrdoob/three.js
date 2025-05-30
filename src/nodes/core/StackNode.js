import Node from './Node.js';
import { select } from '../math/ConditionalNode.js';
import { ShaderNode, nodeProxy, getCurrentStack, setCurrentStack, nodeObject } from '../tsl/TSLBase.js';

/**
 * Stack is a helper for Nodes that need to produce stack-based code instead of continuous flow.
 * They are usually needed in cases like `If`, `Else`.
 *
 * @augments Node
 */
class StackNode extends Node {

	static get type() {

		return 'StackNode';

	}

	/**
	 * Constructs a new stack node.
	 *
	 * @param {?StackNode} [parent=null] - The parent stack node.
	 */
	constructor( parent = null ) {

		super();

		/**
		 * List of nodes.
		 *
		 * @type {Array<Node>}
		 */
		this.nodes = [];

		/**
		 * The output node.
		 *
		 * @type {?Node}
		 * @default null
		 */
		this.outputNode = null;

		/**
		 * The parent stack node.
		 *
		 * @type {?StackNode}
		 * @default null
		 */
		this.parent = parent;

		/**
		 * The current conditional node.
		 *
		 * @private
		 * @type {ConditionalNode}
		 * @default null
		 */
		this._currentCond = null;

		/**
		 * The expression node. Only
		 * relevant for Switch/Case.
		 *
		 * @private
		 * @type {Node}
		 * @default null
		 */
		this._expressionNode = null;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isStackNode = true;

	}

	getNodeType( builder ) {

		return this.outputNode ? this.outputNode.getNodeType( builder ) : 'void';

	}

	getMemberType( builder, name ) {

		return this.outputNode ? this.outputNode.getMemberType( builder, name ) : 'void';

	}

	/**
	 * Adds a node to this stack.
	 *
	 * @param {Node} node - The node to add.
	 * @return {StackNode} A reference to this stack node.
	 */
	add( node ) {

		this.nodes.push( node );

		return this;

	}

	/**
	 * Represent an `if` statement in TSL.
	 *
	 * @param {Node} boolNode - Represents the condition.
	 * @param {Function} method - TSL code which is executed if the condition evaluates to `true`.
	 * @return {StackNode} A reference to this stack node.
	 */
	If( boolNode, method ) {

		const methodNode = new ShaderNode( method );
		this._currentCond = select( boolNode, methodNode );

		return this.add( this._currentCond );

	}

	/**
	 * Represent an `elseif` statement in TSL.
	 *
	 * @param {Node} boolNode - Represents the condition.
	 * @param {Function} method - TSL code which is executed if the condition evaluates to `true`.
	 * @return {StackNode} A reference to this stack node.
	 */
	ElseIf( boolNode, method ) {

		const methodNode = new ShaderNode( method );
		const ifNode = select( boolNode, methodNode );

		this._currentCond.elseNode = ifNode;
		this._currentCond = ifNode;

		return this;

	}

	/**
	 * Represent an `else` statement in TSL.
	 *
	 * @param {Function} method - TSL code which is executed in the `else` case.
	 * @return {StackNode} A reference to this stack node.
	 */
	Else( method ) {

		this._currentCond.elseNode = new ShaderNode( method );

		return this;

	}

	/**
	 * Represents a `switch` statement in TSL.
	 *
	 * @param {any} expression - Represents the expression.
	 * @param {Function} method - TSL code which is executed if the condition evaluates to `true`.
	 * @return {StackNode} A reference to this stack node.
	 */
	Switch( expression ) {

		this._expressionNode = nodeObject( expression );

		return this;

	}

	/**
	 * Represents a `case` statement in TSL. The TSL version accepts an arbitrary numbers of values.
	 * The last parameter must be the callback method that should be executed in the `true` case.
	 *
	 * @param {...any} params - The values of the `Case()` statement as well as the callback method.
	 * @return {StackNode} A reference to this stack node.
	 */
	Case( ...params ) {

		const caseNodes = [];

		// extract case nodes from the parameter list

		if ( params.length >= 2 ) {

			for ( let i = 0; i < params.length - 1; i ++ ) {

				caseNodes.push( this._expressionNode.equal( nodeObject( params[ i ] ) ) );

			}

		} else {

			throw new Error( 'TSL: Invalid parameter length. Case() requires at least two parameters.' );

		}

		// extract method

		const method = params[ params.length - 1 ];
		const methodNode = new ShaderNode( method );

		// chain multiple cases when using Case( 1, 2, 3, () => {} )

		let caseNode = caseNodes[ 0 ];

		for ( let i = 1; i < caseNodes.length; i ++ ) {

			caseNode = caseNode.or( caseNodes[ i ] );

		}

		// build condition

		const condNode = select( caseNode, methodNode );

		if ( this._currentCond === null ) {

			this._currentCond = condNode;

			return this.add( this._currentCond );

		} else {

			this._currentCond.elseNode = condNode;
			this._currentCond = condNode;

			return this;

		}

	}

	/**
	 * Represents the default code block of a Switch/Case statement.
	 *
	 * @param {Function} method - TSL code which is executed in the `else` case.
	 * @return {StackNode} A reference to this stack node.
	 */
	Default( method ) {

		this.Else( method );

		return this;

	}

	build( builder, ...params ) {

		const previousStack = getCurrentStack();

		setCurrentStack( this );

		const buildStage = builder.buildStage;

		for ( const node of this.nodes ) {

			if ( buildStage === 'setup' ) {

				node.build( builder );

			} else if ( buildStage === 'analyze' ) {

				node.build( builder, this );

			} else if ( buildStage === 'generate' ) {

				const stages = builder.getDataFromNode( node, 'any' ).stages;
				const parents = stages && stages[ builder.shaderStage ];

				if ( node.isVarNode && parents && parents.length === 1 && parents[ 0 ] && parents[ 0 ].isStackNode ) {

					continue; // skip var nodes that are only used in .toVarying()

				}

				node.build( builder, 'void' );

			}

		}

		setCurrentStack( previousStack );

		return this.outputNode ? this.outputNode.build( builder, ...params ) : super.build( builder, ...params );

	}

	// Deprecated

	/**
	 * @function
	 * @deprecated since r168. Use {@link StackNode#Else} instead.
	 *
	 * @param {...any} params
	 * @returns {StackNode}
	 */
	else( ...params ) { // @deprecated, r168

		console.warn( 'THREE.TSL: .else() has been renamed to .Else().' );
		return this.Else( ...params );

	}

	/**
	 * @deprecated since r168. Use {@link StackNode#ElseIf} instead.
	 *
	 * @param {...any} params
	 * @returns {StackNode}
	 */
	elseif( ...params ) { // @deprecated, r168

		console.warn( 'THREE.TSL: .elseif() has been renamed to .ElseIf().' );
		return this.ElseIf( ...params );

	}

}

export default StackNode;

/**
 * TSL function for creating a stack node.
 *
 * @tsl
 * @function
 * @param {?StackNode} [parent=null] - The parent stack node.
 * @returns {StackNode}
 */
export const stack = /*@__PURE__*/ nodeProxy( StackNode ).setParameterLength( 0, 1 );
