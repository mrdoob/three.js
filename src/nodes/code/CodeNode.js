import Node from '../core/Node.js';
import { nodeProxy } from '../tsl/TSLBase.js';

/**
 * This class represents native code sections. It is the base
 * class for modules like {@link FunctionNode} which allows to implement
 * functions with native shader languages.
 *
 * @augments Node
 */
class CodeNode extends Node {

	static get type() {

		return 'CodeNode';

	}

	/**
	 * Constructs a new code node.
	 *
	 * @param {string} [code=''] - The native code.
	 * @param {Array<Node>} [includes=[]] - An array of includes.
	 * @param {('js'|'wgsl'|'glsl')} [language=''] - The used language.
	 */
	constructor( code = '', includes = [], language = '' ) {

		super( 'code' );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCodeNode = true;

		/**
		 * The native code.
		 *
		 * @type {string}
		 * @default ''
		 */
		this.code = code;

		/**
		 * An array of includes
		 *
		 * @type {Array<Node>}
		 * @default []
		 */
		this.includes = includes;

		/**
		 * The used language.
		 *
		 * @type {('js'|'wgsl'|'glsl')}
		 * @default ''
		 */
		this.language = language;

	}

	/**
	 * The method is overwritten so it always returns `true`.
	 *
	 * @return {boolean} Whether this node is global or not.
	 */
	isGlobal() {

		return true;

	}

	/**
	 * Sets the includes of this code node.
	 *
	 * @param {Array<Node>} includes - The includes to set.
	 * @return {CodeNode} A reference to this node.
	 */
	setIncludes( includes ) {

		this.includes = includes;

		return this;

	}

	/**
	 * Returns the includes of this code node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {Array<Node>} The includes.
	 */
	getIncludes( /*builder*/ ) {

		return this.includes;

	}

	generate( builder ) {

		const includes = this.getIncludes( builder );

		for ( const include of includes ) {

			include.build( builder );

		}

		const nodeCode = builder.getCodeFromNode( this, this.getNodeType( builder ) );
		nodeCode.code = this.code;

		return nodeCode.code;

	}

	serialize( data ) {

		super.serialize( data );

		data.code = this.code;
		data.language = this.language;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.code = data.code;
		this.language = data.language;

	}

}

export default CodeNode;

/**
 * TSL function for creating a code node.
 *
 * @tsl
 * @function
 * @param {string} [code=''] - The native code.
 * @param {Array<Node>} [includes=[]] - An array of includes.
 * @param {('js'|'wgsl'|'glsl')} [language=''] - The used language.
 * @returns {CodeNode}
 */
export const code = /*@__PURE__*/ nodeProxy( CodeNode );

/**
 * TSL function for creating a JS code node.
 *
 * @tsl
 * @function
 * @param {string} src - The native code.
 * @param {Array<Node>} includes - An array of includes.
 * @returns {CodeNode}
 */
export const js = ( src, includes ) => code( src, includes, 'js' );

/**
 * TSL function for creating a WGSL code node.
 *
 * @tsl
 * @function
 * @param {string} src - The native code.
 * @param {Array<Node>} includes - An array of includes.
 * @returns {CodeNode}
 */
export const wgsl = ( src, includes ) => code( src, includes, 'wgsl' );

/**
 * TSL function for creating a GLSL code node.
 *
 * @tsl
 * @function
 * @param {string} src - The native code.
 * @param {Array<Node>} includes - An array of includes.
 * @returns {CodeNode}
 */
export const glsl = ( src, includes ) => code( src, includes, 'glsl' );
