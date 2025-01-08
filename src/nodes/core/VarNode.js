import Node from './Node.js';
import { addMethodChaining, nodeProxy } from '../tsl/TSLCore.js';

/** @module VarNode **/

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
	 * @param {String?} name - The name of the variable in the shader.
	 * @param {Boolean?} readOnly - The read-only flag.
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
		 * @type {String?}
		 * @default null
		 */
		this.name = name;

		/**
		 * `VarNode` sets this property to `true` by default.
		 *
		 * @type {Boolean}
		 * @default true
		 */
		this.global = true;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isVarNode = true;

		/**
		 *
		 * The read-only flag.
		 *
		 * @type {Boolean}
		 * @default false
		 */
		this.readOnly = readOnly;

	}

	getHash( builder ) {

		return this.name || super.getHash( builder );

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

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

			const type = builder.getType( nodeVar.type );

			if ( isWebGPUBackend ) {

				declarationPrefix = isDeterministic
					? `const ${ propertyName }`
					: `let ${ propertyName }`;

			} else {

				declarationPrefix = `const ${ type } ${ propertyName }`;

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
 * @function
 * @param {Node} node - The node for which a variable should be created.
 * @param {String?} name - The name of the variable in the shader.
 * @returns {VarNode}
 */
const createVar = /*@__PURE__*/ nodeProxy( VarNode );

/**
 * TSL function for creating a var node.
 *
 * @function
 * @param {Node} node - The node for which a variable should be created.
 * @param {String?} name - The name of the variable in the shader.
 * @returns {VarNode}
 */
export const Var = ( node, name = null ) => createVar( node, name ).append();

/**
 * TSL function for creating a const node.
 *
 * @function
 * @param {Node} node - The node for which a constant should be created.
 * @param {String?} name - The name of the constant in the shader.
 * @returns {VarNode}
 */
export const Const = ( node, name = null ) => createVar( node, name, true ).append();

// Method chaining

addMethodChaining( 'toVar', Var );
addMethodChaining( 'toConst', Const );

// Deprecated

/**
 * @function
 * @deprecated since r170. Use `Var( node )` or `node.toVar()` instead.
 *
 * @param {Any} node
 * @returns {VarNode}
 */
export const temp = ( node ) => { // @deprecated, r170

	console.warn( 'TSL: "temp( node )" is deprecated. Use "Var( node )" or "node.toVar()" instead.' );

	return createVar( node );

};

addMethodChaining( 'temp', temp );

