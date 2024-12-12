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
	 */
	constructor( node, name = null ) {

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

	}

	getHash( builder ) {

		return this.name || super.getHash( builder );

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	generate( builder ) {

		const { node, name } = this;

		const nodeVar = builder.getVarFromNode( this, name, builder.getVectorType( this.getNodeType( builder ) ) );

		const propertyName = builder.getPropertyName( nodeVar );

		const snippet = node.build( builder, nodeVar.type );

		builder.addLineFlowCode( `${propertyName} = ${snippet}`, this );

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

addMethodChaining( 'toVar', ( ...params ) => createVar( ...params ).append() );

// Deprecated

export const temp = ( node ) => { // @deprecated, r170

	console.warn( 'TSL: "temp" is deprecated. Use ".toVar()" instead.' );

	return createVar( node );

};

addMethodChaining( 'temp', temp );

