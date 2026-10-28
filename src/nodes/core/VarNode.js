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
		 * Whether this node can be generated as an expression until it is assigned.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.assignable = false;

	}

	isCacheable( /*builder*/ ) {

		return false;

	}

	/**
	 * Sets the assignable flag for this node.
	 *
	 * An assignable node is generated as an expression until it is assigned,
	 * at which point it is declared as a variable.
	 *
	 * @param {boolean} value - The value to set for the assignable flag.
	 * @returns {VarNode} This node.
	 */
	setAssignable( value ) {

		this.assignable = value;

		return this;

	}

	/**
	 * Returns the assignable flag of this node.
	 *
	 * @return {boolean} The assignable flag.
	 */
	getAssignable() {

		return this.assignable;

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

	_declaresAssignable() {

		return false;

	}

	_isFunctionScope() {

		// see `generate()`, a read-only or local variable is declared where it is generated
		return this.readOnly === false && this.assignable === false;

	}

	build( builder, output = null ) {

		this._setupInspector( builder );

		const refNode = this.getShared( builder );

		if ( this !== refNode ) {

			return refNode.build( builder, output );

		}

		const data = builder.getDataFromNode( this );

		this._updateAssignable( builder, data, this.node );

		// An assignable node that is not assigned is just its value.
		if ( this.assignable && data.forceDeclaration !== true && data.assign !== true ) {

			return this.node.build( builder, output );

		}

		return super.build( builder, output );

	}

	generate( builder ) {

		const { node, name, readOnly } = this;

		const nodeType = this.getNodeType( builder );

		if ( nodeType == 'void' ) {

			if ( this.isAssignable( builder ) !== true ) {

				error( 'TSL: ".toVar()" can not be used with void type.', this.stackTrace );

			}

			const snippet = node.build( builder );

			return snippet;

		}

		const vectorType = builder.getVectorType( nodeType );
		const snippet = node.build( builder, vectorType );

		const nodeVar = builder.getVarFromNode( this, name, vectorType, undefined, readOnly, this.assignable );

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

// Method chaining

addMethodChaining( 'toVar', Var );
addMethodChaining( 'toConst', Const );
