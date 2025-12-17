import Node from './Node.js';
import { select } from '../math/ConditionalNode.js';
import { ShaderNode, nodeProxy, getCurrentStack, setCurrentStack, nodeObject } from '../tsl/TSLBase.js';
import { error } from '../../utils.js';

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
		 * The current node being processed.
		 *
		 * @private
		 * @type {Node}
		 * @default null
		 */
		this._currentNode = null;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isStackNode = true;

	}

	getElementType( builder ) {

		return this.hasOutput ? this.outputNode.getElementType( builder ) : 'void';

	}

	getNodeType( builder ) {

		return this.hasOutput ? this.outputNode.getNodeType( builder ) : 'void';

	}

	getMemberType( builder, name ) {

		return this.hasOutput ? this.outputNode.getMemberType( builder, name ) : 'void';

	}

	/**
	 * Adds a node to this stack.
	 *
	 * @param {Node} node - The node to add.
	 * @param {number} [index=this.nodes.length] - The index where the node should be added.
	 * @return {StackNode} A reference to this stack node.
	 */
	addToStack( node, index = this.nodes.length ) {

		if ( node.isNode !== true ) {

			error( 'TSL: Invalid node added to stack.' );
			return this;

		}

		this.nodes.splice( index, 0, node );

		return this;

	}

	/**
	 * Adds a node to the stack before the current node.
	 *
	 * @param {Node} node - The node to add.
	 * @return {StackNode} A reference to this stack node.
	 */
	addToStackBefore( node ) {

		const index = this._currentNode ? this.nodes.indexOf( this._currentNode ) : 0;

		return this.addToStack( node, index );

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

		return this.addToStack( this._currentCond );

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

			error( 'TSL: Invalid parameter length. Case() requires at least two parameters.' );

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

			return this.addToStack( this._currentCond );

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

	setup( builder ) {

		const nodeProperties = builder.getNodeProperties( this );

		let index = 0;

		for ( const childNode of this.getChildren() ) {

			if ( childNode.isVarNode && childNode.isIntent( builder ) ) {

				if ( childNode.isAssign( builder ) !== true ) {

					continue;

				}

			}

			nodeProperties[ 'node' + index ++ ] = childNode;

		}

		// return a outputNode if exists or null

		return nodeProperties.outputNode || null;

	}

	get hasOutput() {

		return this.outputNode && this.outputNode.isNode;

	}

	build( builder, ...params ) {

		const previousStack = getCurrentStack();

		const buildStage = builder.buildStage;

		setCurrentStack( this );

		builder.setActiveStack( this );

		//

		const buildNode = ( node ) => {

			this._currentNode = node;

			if ( node.isVarNode && node.isIntent( builder ) ) {

				if ( node.isAssign( builder ) !== true ) {

					return;

				}

			}

			if ( buildStage === 'setup' ) {

				node.build( builder );

			} else if ( buildStage === 'analyze' ) {

				node.build( builder, this );

			} else if ( buildStage === 'generate' ) {

				const stages = builder.getDataFromNode( node, 'any' ).stages;
				const parents = stages && stages[ builder.shaderStage ];

				if ( node.isVarNode && parents && parents.length === 1 && parents[ 0 ] && parents[ 0 ].isStackNode ) {

					return; // skip var nodes that are only used in .toVarying()

				}

				node.build( builder, 'void' );

			}

		};

		//

		const nodes = [ ...this.nodes ];

		for ( const node of nodes ) {

			buildNode( node );

		}

		this._currentNode = null;

		const newNodes = this.nodes.filter( ( node ) => nodes.indexOf( node ) === - 1 );

		for ( const node of newNodes ) {

			buildNode( node );

		}

		//

		let result;

		if ( this.hasOutput ) {

			result = this.outputNode.build( builder, ...params );

		} else {

			result = super.build( builder, ...params );

		}

		setCurrentStack( previousStack );

		builder.removeActiveStack( this );

		return result;

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
