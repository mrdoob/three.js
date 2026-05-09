import InputNode from './InputNode.js';

const _regNum = /float|u?int/;

/**
 * Class for representing a constant value in the shader.
 *
 * @augments InputNode
 */
class ConstNode extends InputNode {

	static get type() {

		return 'ConstNode';

	}

	/**
	 * Constructs a new input node.
	 *
	 * @param {any} value - The value of this node. Usually a JS primitive or three.js object (vector, matrix, color).
	 * @param {?string} nodeType - The node type. If no explicit type is defined, the node tries to derive the type from its value.
	 */
	constructor( value, nodeType = null ) {

		super( value, nodeType );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isConstNode = true;

	}

	/**
	 * Generates the shader string of the value with the current node builder.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The generated value as a shader string.
	 */
	generateConst( builder ) {

		return builder.generateConst( this.getNodeType( builder ), this.value );

	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );

		if ( _regNum.test( type ) && _regNum.test( output ) ) {

			return builder.generateConst( output, this.value );

		}

		return builder.format( this.generateConst( builder ), type, output );

	}

}

export default ConstNode;
