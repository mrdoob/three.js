import Node from './Node.js';
import { addMethodChaining, getCurrentStack, nodeProxy } from '../tsl/TSLCore.js';

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

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	getArrayCount( builder ) {

		return this.node.getArrayCount( builder );

	}

	build( ...params ) {

		if ( this.intent === true ) {

			const builder = params[ 0 ];
			const properties = builder.getNodeProperties( this );

			if ( properties.assign !== true ) {

				return this.node.build( ...params );

			}

		}

		return super.build( ...params );

	}

	generate( builder ) {

		const { node, name, readOnly } = this;
		const { renderer } = builder;

		const isWebGPUBackend = renderer.backend.isWebGPUBackend === true;

		let isDeterministic = false;
		let shouldTreatAsReadOnly = false;

		if ( readOnly ) {

			isDeterministic = builder.isDeterministic( node );

			shouldTreatAsReadOnly = isWebGPUBackend ? readOnly : isDeterministic;

		}

		const vectorType = builder.getVectorType( this.getNodeType( builder ) );
		const snippet = node.build( builder, vectorType );

		const nodeVar = builder.getVarFromNode( this, name, vectorType, undefined, shouldTreatAsReadOnly );

		const propertyName = builder.getPropertyName( nodeVar );

		let declarationPrefix = propertyName;

		if ( shouldTreatAsReadOnly ) {

			if ( isWebGPUBackend ) {

				declarationPrefix = isDeterministic
					? `const ${ propertyName }`
					: `let ${ propertyName }`;

			} else {

				const count = node.getArrayCount( builder );

				declarationPrefix = `const ${ builder.getVar( nodeVar.type, propertyName, count ) }`;

			}

		}

		builder.addLineFlowCode( `${ declarationPrefix } = ${ snippet }`, this );

		return propertyName;

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
 * @param {?string} name - The name of the variable in the shader.
 * @returns {VarNode}
 */
export const VarIntent = ( node ) => {

	if ( getCurrentStack() === null ) {

		return node;

	}

	return createVar( node ).setIntent( true ).toStack();

};

// Method chaining

addMethodChaining( 'toVar', Var );
addMethodChaining( 'toConst', Const );
addMethodChaining( 'toVarIntent', VarIntent );

// Deprecated

/**
 * @tsl
 * @function
 * @deprecated since r170. Use `Var( node )` or `node.toVar()` instead.
 *
 * @param {any} node
 * @returns {VarNode}
 */
export const temp = ( node ) => { // @deprecated, r170

	console.warn( 'TSL: "temp( node )" is deprecated. Use "Var( node )" or "node.toVar()" instead.' );

	return createVar( node );

};

addMethodChaining( 'temp', temp );

