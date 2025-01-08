import InputNode from './InputNode.js';

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
	 * @param {Any} value - The value of this node. Usually a JS primitive or three.js object (vector, matrix, color).
	 * @param {String?} nodeType - The node type. If no explicit type is defined, the node tries to derive the type from its value.
	 */
	constructor( value, nodeType = null ) {

		super( value, nodeType );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isConstNode = true;

	}

	/**
	 * Generates the shader string of the value with the current node builder.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {String} The generated value as a shader string.
	 */
	generateConst( builder ) {

		return builder.generateConst( this.getNodeType( builder ), this.value );

	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );

		return builder.format( this.generateConst( builder ), type, output );

	}

}

export default ConstNode;
