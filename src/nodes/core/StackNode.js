import Node from './Node.js';
import StackTrace from '../core/StackTrace.js';
import { select } from '../math/ConditionalNode.js';
import { ShaderNode, nodeProxy, getCurrentStack, setCurrentStack, nodeObject } from '../tsl/TSLBase.js';
import { error } from '../../utils.js';

/**
 * Whether the given node is assignable but has not been assigned. It is just
 * an expression, which is generated where it is used instead of in the stack.
 *
 * @private
 * @param {NodeBuilder} builder - The current node builder.
 * @param {Node} node - The node to check.
 * @return {boolean} Whether the assignable node can be generated as an expression.
 */
const isAssignableExpression = ( builder, node ) => {

	if ( node.assignable !== true ) return false;

	const data = builder.getDataFromNode( node );

	return data.forceDeclaration !== true && data.assign !== true;

};

/**
 * Whether the given node of a stack is dead code, see {@link Node#isDeadCode}. A node that calls a function
 * which is not pure is kept, since the function can assign values which are read, see {@link StackNode#isPure}.
 *
 * @private
 * @param {NodeBuilder} builder - The current node builder.
 * @param {Node} node - The node to check.
 * @return {boolean} Whether the node is dead code.
 */
const isDeadNode = ( builder, node ) => builder.getNodeProperties( node ).callsFunction !== true && node.isDeadCode( builder );

/**
 * Whether the dead code of the given stack is removed in the analyze stage. A value can be read in the next iteration
 * of a loop before it is assigned, so the outermost loop body analyzes its nodes until no node is added, but the nodes
 * of the blocks in it, e.g. the branches of an `If()`, are all analyzed, since they are not analyzed again.
 *
 * @private
 * @param {NodeBuilder} builder - The current node builder.
 * @param {StackNode} parentStack - The active stack where the stack is built.
 * @return {boolean} Whether the dead code of the stack is removed.
 */
const removesDeadCode = ( builder, parentStack ) => {

	const block = builder.context.nodeBlock;

	if ( block === undefined ) return true;

	// the body of the outermost loop

	return block.parent === null && parentStack !== undefined && block.stack === parentStack && block.node === parentStack._currentNode;

};

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
		 * Stores additional data for nodes that are added to the stack.
		 *
		 * @private
		 * @type {Map<Node, {delta: number}>}
		 */
		this._nodeDataLibrary = new Map();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isStackNode = true;

	}

	isCacheable( /*builder*/ ) {

		return false;

	}

	getElementType( builder ) {

		return this.outputNode ? this.outputNode.getElementType( builder ) : 'void';

	}

	generateNodeType( builder ) {

		return this.outputNode ? this.outputNode.getNodeType( builder ) : 'void';

	}

	getMemberType( builder, name ) {

		return this.outputNode ? this.outputNode.getMemberType( builder, name ) : 'void';

	}

	/**
	 * Adds a node to this stack.
	 *
	 * @param {Node} node - The node to add.
	 * @param {number} [index=-1] - The index of the node. If not specified, the node will be added to the end of the stack.
	 * @return {StackNode} A reference to this stack node.
	 */
	addToStack( node, index = - 1 ) {

		if ( node.isNode !== true ) {

			error( 'TSL: Invalid node added to stack.', new StackTrace() );
			return this;

		}


		if ( index === - 1 ) {

			if ( this._currentNode ) {

				let nodeData = this._nodeDataLibrary.get( this._currentNode );

				if ( nodeData === undefined ) {

					nodeData = {
						delta: 0
					};

					this._nodeDataLibrary.set( this._currentNode, nodeData );

				}

				nodeData.delta ++;

				index = this.nodes.indexOf( this._currentNode ) + nodeData.delta;

			} else {

				index = this.nodes.length;

			}

		}

		this.nodes.splice( index, 0, node );

		return this;

	}

	/**
	 * Adds a node to the stack before the given node, by default the current node.
	 *
	 * @param {Node} node - The node to add.
	 * @param {?Node} [beforeNode=this._currentNode] - The node of the stack that the node is added before.
	 * @return {StackNode} A reference to this stack node.
	 */
	addToStackBefore( node, beforeNode = this._currentNode ) {

		const index = beforeNode ? this.nodes.indexOf( beforeNode ) : 0;

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

			error( 'TSL: Invalid parameter length. Case() requires at least two parameters.', new StackTrace() );

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

			if ( isAssignableExpression( builder, childNode ) ) continue;

			nodeProperties[ 'node' + index ++ ] = childNode;

		}

		// return a outputNode if exists or null

		return nodeProperties.outputNode || null;

	}

	/**
	 * Whether the nodes of this stack only declare variables and compute values, e.g. the body of a function
	 * which does not assign a value or call a function that is not pure.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {boolean} Whether the stack is pure.
	 */
	isPure( builder ) {

		return this.nodes.every( ( node ) => ( node.isVarNode === true || isAssignableExpression( builder, node ) ) && builder.getNodeProperties( node ).callsFunction !== true );

	}

	isDeadCode( builder ) {

		// e.g. the branch of an `If()` that only assigns values which are never read

		return ! this.outputNode && this.nodes.every( ( node ) => isAssignableExpression( builder, node ) || isDeadNode( builder, node ) );

	}

	analyze( builder ) {

		// the nodes of the stack are analyzed by build(), so the dead code is not analyzed

		builder.increaseUsage( this );

	}

	build( builder, ...params ) {

		this._setupInspector( builder );

		const previousStack = getCurrentStack();
		const parentStack = builder.getActiveStack();

		const buildStage = builder.buildStage;

		setCurrentStack( this );

		builder.setActiveStack( this );

		// the statements are not part of an assignment to the output of the stack

		const isContextAssign = builder.isContextAssign();

		let result;

		if ( buildStage === 'analyze' ) {

			// the output is analyzed before the nodes, so the reads of a value are counted before its assignments

			if ( this.outputNode ) this.outputNode.build( builder, ...params );

			const previousContext = isContextAssign ? builder.addContext( { assign: false } ) : null;

			this._analyzeNodes( builder, removesDeadCode( builder, parentStack ) );

			if ( previousContext !== null ) builder.setContext( previousContext );

		} else {

			const previousContext = isContextAssign ? builder.addContext( { assign: false } ) : null;

			for ( let i = 0; i < this.nodes.length; i ++ ) {

				const node = this.nodes[ i ];

				if ( isAssignableExpression( builder, node ) ) continue;

				if ( buildStage === 'setup' ) {

					this._buildNode( builder, node );

				} else if ( buildStage === 'generate' ) {

					if ( isDeadNode( builder, node ) ) continue;

					const stages = builder.getDataFromNode( node, 'any' ).stages;
					const parents = stages && stages[ builder.shaderStage ];

					if ( node.isVarNode && parents && parents.length === 1 && parents[ 0 ] && parents[ 0 ].isStackNode ) {

						continue; // skip var nodes that are only used in .toVarying()

					}

					this._buildNode( builder, node, 'void' );

				}

			}

			if ( previousContext !== null ) builder.setContext( previousContext );

			if ( this.outputNode ) {

				const buildResult = this.outputNode.build( builder, ...params );

				if ( buildStage !== 'generate' || this.outputNode.getNodeType( builder ) !== 'void' ) {

					result = buildResult;

				}

			}

		}

		if ( ! this.outputNode ) {

			result = super.build( builder, ...params );

		}

		setCurrentStack( previousStack );

		builder.removeActiveStack( this );

		return result;

	}

	/**
	 * Analyzes the nodes in reverse order, so the reads of a value are counted before its
	 * assignments and the dead code is not analyzed, see {@link Node#isDeadCode}. The nodes
	 * are analyzed again until no node is added, e.g. a value read in a loop before it is assigned.
	 *
	 * @private
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {boolean} removeDeadCode - Whether the dead code is not analyzed.
	 */
	_analyzeNodes( builder, removeDeadCode ) {

		const analyzedNodes = new Set();

		let analyzed = true;

		while ( analyzed === true ) {

			analyzed = false;

			for ( let i = this.nodes.length - 1; i >= 0; i -- ) {

				const node = this.nodes[ i ];

				if ( analyzedNodes.has( node ) || isAssignableExpression( builder, node ) || ( removeDeadCode && isDeadNode( builder, node ) ) ) continue;

				analyzedNodes.add( node );
				analyzed = true;

				this._buildNode( builder, node, this );

			}

		}

	}

	/**
	 * Builds a node of the stack as the current node, so the nodes added
	 * to the stack during its build are added after it.
	 *
	 * @private
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {Node} node - The node to build.
	 * @param {?(string|Node)} [output] - The output of the build.
	 */
	_buildNode( builder, node, output ) {

		const previousNode = this._currentNode;

		this._currentNode = node;

		node.build( builder, output );

		this._currentNode = previousNode;

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
