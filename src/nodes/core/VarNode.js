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
	 * @param {String?} readOnly - The read-only flag.
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
		 * @type {String}
		 * @default 'var'
		 */
		this.readOnly = readOnly;

	}


	toReadOnly() {

		this.readOnly = true;

		return this;

	}

	getHash( builder ) {

		return this.name || super.getHash( builder );

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	generate( builder ) {

		const { node, name, readOnly } = this;

		// TODO: Is it enough to detect if a node is a constant and never reassigned?
		const isWebGPUBackend = builder.renderer.backend.isWebGPUBackend === true;
		const isConst = ( node.type === 'MathNode' || node.type === 'ConvertNode' || node.type === 'ConstNode' ) && readOnly === true;
		const isReadOnly = readOnly === true;

		const read = isWebGPUBackend ? readOnly : isConst && isReadOnly;

		const nodeVar = builder.getVarFromNode( this, name, builder.getVectorType( this.getNodeType( builder ) ), undefined, read );

		const propertyName = builder.getPropertyName( nodeVar );

		const snippet = node.build( builder, nodeVar.type );



		if ( isReadOnly && ( isConst || isWebGPUBackend ) ) {


			const type = builder.getType( nodeVar.type );
			let declaration = `const ${type} ${propertyName}`;

			if ( isWebGPUBackend ) {

				declaration = isConst ? `const ${propertyName}: ${type}` : `let ${propertyName}`;

			}

			builder.addLineFlowCode( `${declaration} = ${snippet}`, this );

		} else {

			builder.addLineFlowCode( `${propertyName} = ${snippet}`, this );

		}

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

addMethodChaining( 'toConst', ( ...params ) => createVar( ...params ).append().toReadOnly() );

// Deprecated

export const temp = ( node ) => { // @deprecated, r170

	console.warn( 'TSL: "temp" is deprecated. Use ".toVar()" instead.' );

	return createVar( node );

};

addMethodChaining( 'temp', temp );

