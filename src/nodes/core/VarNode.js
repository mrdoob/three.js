import Node from './Node.js';
import { addMethodChaining, nodeProxy } from '../tsl/TSLCore.js';
import { error, warnOnce } from '../../utils.js';

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

	_declaresIntent() {

		return false;

	}

	build( builder, output = null ) {

		const refNode = this.getShared( builder );

		if ( this !== refNode ) {

			return refNode.build( builder, output );

		}

		const data = builder.getDataFromNode( this );

		this._updateIntent( builder, data, this.node );

		// An intent that is not assigned is just its value.
		if ( this.intent && data.forceDeclaration !== true && data.assign !== true ) {

			return this.node.build( builder, output );

		}

		return super.build( builder, output );

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
 * @deprecated since r187. Use {@link Node#toIntent} instead.
 * @param {Node} node - The node for which a variable should be created.
 * @returns {VarNode}
 */
export const VarIntent = ( node ) => { // @deprecated r187

	warnOnce( 'TSL: "VarIntent()" and ".toVarIntent()" have been deprecated. Use ".toIntent()" instead.' );

	return createVar( node ).setIntent( true ).toStack();

};

// Method chaining

addMethodChaining( 'toVar', Var );
addMethodChaining( 'toConst', Const );
addMethodChaining( 'toVarIntent', VarIntent );
