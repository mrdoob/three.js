import Node from './Node.js';
import { select } from '../math/ConditionalNode.js';
import { ShaderNode, nodeProxy, getCurrentStack, setCurrentStack } from '../tsl/TSLBase.js';

/** @module StackNode **/

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
	 * @param {StackNode?} [parent=null] - The parent stack node.
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
		 * @type {Node?}
		 * @default null
		 */
		this.outputNode = null;

		/**
		 * The parent stack node.
		 *
		 * @type {StackNode}
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
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
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

	build( builder, ...params ) {

		const previousStack = getCurrentStack();

		setCurrentStack( this );

		for ( const node of this.nodes ) {

			node.build( builder, 'void' );

		}

		setCurrentStack( previousStack );

		return this.outputNode ? this.outputNode.build( builder, ...params ) : super.build( builder, ...params );

	}

	// Deprecated

	/**
	 * @function
	 * @deprecated since r168. Use {@link StackNode#Else} instead.
	 *
	 * @param  {...any} params
	 * @returns {StackNode}
	 */
	else( ...params ) { // @deprecated, r168

		console.warn( 'TSL.StackNode: .else() has been renamed to .Else().' );
		return this.Else( ...params );

	}

	/**
	 * @deprecated since r168. Use {@link StackNode#ElseIf} instead.
	 *
	 * @param  {...any} params
	 * @returns {StackNode}
	 */
	elseif( ...params ) { // @deprecated, r168

		console.warn( 'TSL.StackNode: .elseif() has been renamed to .ElseIf().' );
		return this.ElseIf( ...params );

	}

}

export default StackNode;

/**
 * TSL function for creating a stack node.
 *
 * @function
 * @param {StackNode?} [parent=null] - The parent stack node.
 * @returns {StackNode}
 */
export const stack = /*@__PURE__*/ nodeProxy( StackNode );
