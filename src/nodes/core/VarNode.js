import Node from './Node.js';
import { addMethodChaining, nodeProxy } from '../tsl/TSLCore.js';
import { error } from '../../utils.js';

/**
 * Class for representing shader variables as nodes. Variables are created from
 * existing nodes like the following:
 *
 * ```js
 * const depth = sampleDepth( uvNode ).toVar( 'depth' );
 * ```
 *
 * @augments Node
 */
class VarNode extends Node {

	static get type() {

		return 'VarNode';

	}

	/**
	 * Constructs a new variable node.
	 *
	 * @param {Node} node - The node for which a variable should be created.
	 * @param {?string} [name=null] - The name of the variable in the shader.
	 * @param {boolean} [readOnly=false] - The read-only flag.
	 */
	constructor( node, name = null, readOnly = false ) {

		super();

		/**
		 * The node for which a variable should be created.
		 *
		 * @type {Node}
		 */
		this.node = node;

		/**
		 * The name of the variable in the shader. If no name is defined,
		 * the node system auto-generates one.
		 *
		 * @type {?string}
		 * @default null
		 */
		this.name = name;

		/**
		 * `VarNode` sets this property to `true` by default.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.global = true;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isVarNode = true;

		/**
		 *
		 * The read-only flag.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.readOnly = readOnly;

		/**
		 *
		 * Add this flag to the node system to indicate that this node require parents.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.parents = true;

		/**
		 * This flag is used to indicate that this node is used for intent.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.intent = false;

	}

	isCacheable( /*builder*/ ) {

		return false;

	}

	/**
	 * Sets the intent flag for this node.
	 *
	 * This flag is used to indicate that this node is used for intent
	 * and should not be built directly. Instead, it is used to indicate that
	 * the node should be treated as a variable intent.
	 *
	 * It's useful for assigning variables without needing creating a new variable node.
	 *
	 * @param {boolean} value - The value to set for the intent flag.
	 * @returns {VarNode} This node.
	 */
	setIntent( value ) {

		this.intent = value;

		return this;

	}

	/**
	 * Checks if this node is used for intent.
	 *
	 * @param {NodeBuilder} builder - The node builder.
	 * @returns {boolean} Whether this node is used for intent.
	 */
	isIntent( builder ) {

		if ( this.intent !== true ) return false;

		const data = builder.getDataFromNode( this );

		if ( data.isIntent !== undefined ) return data.isIntent;

		// The statements of a call are only known once the graph has been set up.
		if ( builder.buildStage === 'setup' ) return true;

		data.isIntent = this._isInlineable( builder, data );

		return data.isIntent;

	}

	/**
	 * Whether this intent can be inlined where it is used. A function call whose body
	 * contains statements must run in its original stack position instead, so that
	 * it is not repeated in loops and sees the state from where it was called.
	 *
	 * @private
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {Object} data - The node data.
	 * @return {boolean} Whether this intent can be inlined.
	 */
	_isInlineable( builder, data ) {

		const node = this.node;

		if ( node.isShaderCallNodeInternal !== true || node.shaderNode.getLayout() !== null ) return true;
		if ( data.stack === undefined || node.getNodeType( builder ) === 'void' ) return true;
		if ( node.hasStatements( builder ) !== true ) return true;

		// A call created outside of a stack has no original position,
		// so it can stay in the conditional block where it is used.
		if ( data.useBlocks !== undefined ) {

			return data.useBlocks.size === 1 && data.useBlocks.has( null ) === false;

		}

		return false;

	}

	/**
	 * Returns the intent flag of this node.
	 *
	 * @return {boolean} The intent flag.
	 */
	getIntent() {

		return this.intent;

	}

	getMemberType( builder, name ) {

		return this.node.getMemberType( builder, name );

	}

	getElementType( builder ) {

		return this.node.getElementType( builder );

	}

	generateNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	getArrayCount( builder ) {

		return this.node.getArrayCount( builder );

	}

	isAssign( builder ) {

		const data = builder.getDataFromNode( this );

		return data.assign;

	}

	build( ...params ) {

		const builder = params[ 0 ];

		const refNode = this.getShared( builder );

		if ( this !== refNode ) {

			return refNode.build( ...params );

		}

		if ( builder.buildStage === 'setup' ) {

			const data = builder.getDataFromNode( this );
			const { nodeLoop, nodeBlock } = builder.context;

			if ( data.stack === undefined && ( nodeLoop || nodeBlock ) ) {

				const baseStack = builder.getBaseStack();

				if ( this.node.isShaderCallNodeInternal && this.node.shaderNode.getLayout() === null ) {

					// Keep the call before its first use, in case it has to run in the stack.
					baseStack.addToStackBefore( this );

				} else {

					baseStack.addToStack( this );

				}

				data.stack = baseStack;
				data.useBlocks = new Set();

			}

			if ( data.useBlocks !== undefined && data.isIntent === undefined ) {

				data.useBlocks.add( nodeLoop ? null : ( nodeBlock || null ) );

			}

		}

		if ( this.isIntent( builder ) ) {

			if ( this.isAssign( builder ) !== true ) {

				return this.node.build( ...params );

			}

		}

		return super.build( ...params );

	}

	generate( builder ) {

		const { node, name, readOnly } = this;

		const nodeType = this.getNodeType( builder );

		if ( nodeType == 'void' ) {

			if ( this.isIntent( builder ) !== true ) {

				error( 'TSL: ".toVar()" can not be used with void type.', this.stackTrace );

			}

			const snippet = node.build( builder );

			return snippet;

		}

		const vectorType = builder.getVectorType( nodeType );
		const snippet = node.build( builder, vectorType );

		if ( this.intent === true && this.isAssign( builder ) !== true ) {

			// A function call that returns one of its own variables doesn't need a copy.
			const variable = this._getCallVariable( builder );

			if ( variable !== null && builder.getVectorType( variable.getNodeType( builder ) ) === vectorType ) return snippet;

		}

		const nodeVar = builder.getVarFromNode( this, name, vectorType, undefined, readOnly, this.intent );

		const propertyName = builder.getPropertyName( nodeVar );

		let declarationPrefix = propertyName;

		if ( nodeVar.readOnly ) {

			const count = node.getArrayCount( builder );

			declarationPrefix = builder.isDeterministic( node )
				? builder.generateConstStatement( nodeVar.type, propertyName, count )
				: builder.generateLetStatement( nodeVar.type, propertyName, count );

		} else if ( nodeVar.local ) {

			declarationPrefix = builder.generateVarStatement( nodeVar.type, propertyName, nodeVar.count );

		}

		builder.addLineFlowCode( `${ declarationPrefix } = ${ snippet }`, this );

		return propertyName;

	}

	/**
	 * Returns the variable returned by the wrapped function call, if it was declared
	 * in the body of that call. Only the call can write to it, so it can be shared.
	 *
	 * @private
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {?VarNode} The variable or `null`.
	 */
	_getCallVariable( builder ) {

		if ( this.node.isShaderCallNodeInternal !== true ) return null;

		const stack = this.node.getOutputNode( builder );
		const outputNode = stack.outputNode;

		if ( outputNode && outputNode.isVarNode === true && outputNode.intent !== true && builder.getDataFromNode( outputNode ).stack === stack ) {

			return outputNode;

		}

		return null;

	}

}

export default VarNode;

/**
 * TSL function for creating a var node.
 *
 * @tsl
 * @function
 * @param {Node} node - The node for which a variable should be created.
 * @param {?string} name - The name of the variable in the shader.
 * @returns {VarNode}
 */
const createVar = /*@__PURE__*/ nodeProxy( VarNode );

/**
 * TSL function for creating a var node.
 *
 * @tsl
 * @function
 * @param {Node} node - The node for which a variable should be created.
 * @param {?string} name - The name of the variable in the shader.
 * @returns {VarNode}
 */
export const Var = ( node, name = null ) => createVar( node, name ).toStack();

/**
 * TSL function for creating a const node.
 *
 * @tsl
 * @function
 * @param {Node} node - The node for which a constant should be created.
 * @param {?string} name - The name of the constant in the shader.
 * @returns {VarNode}
 */
export const Const = ( node, name = null ) => createVar( node, name, true ).toStack();

//
//

/**
 * TSL function for creating a var intent node.
 *
 * @tsl
 * @function
 * @param {Node} node - The node for which a variable should be created.
 * @returns {VarNode}
 */
export const VarIntent = ( node ) => {

	return createVar( node ).setIntent( true ).toStack();

};

// Method chaining

addMethodChaining( 'toVar', Var );
addMethodChaining( 'toConst', Const );
addMethodChaining( 'toVarIntent', VarIntent );
