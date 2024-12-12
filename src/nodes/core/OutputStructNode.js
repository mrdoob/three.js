import Node from './Node.js';
import { nodeProxy } from '../tsl/TSLBase.js';

/** @module OutputStructNode **/

/**
 * This node can be used to define multiple outputs in a shader programs.
 *
 * @augments Node
 */
class OutputStructNode extends Node {

	static get type() {

		return 'OutputStructNode';

	}

	/**
	 * Constructs a new output struct node. The constructor can be invoked with an
	 * arbitrary number of nodes representing the members.
	 *
	 * @param {...Node} members - A parameter list of nodes.
	 */
	constructor( ...members ) {

		super();

		/**
		 * An array of nodes which defines the output.
		 *
		 * @type {Array<Node>}
		 */
		this.members = members;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isOutputStructNode = true;

	}

	setup( builder ) {

		super.setup( builder );

		const members = this.members;
		const types = [];

		for ( let i = 0; i < members.length; i ++ ) {

			types.push( members[ i ].getNodeType( builder ) );

		}

		this.nodeType = builder.getStructTypeFromNode( this, types ).name;

	}

	generate( builder, output ) {

		const propertyName = builder.getOutputStructName();
		const members = this.members;

		const structPrefix = propertyName !== '' ? propertyName + '.' : '';

		for ( let i = 0; i < members.length; i ++ ) {

			const snippet = members[ i ].build( builder, output );

			builder.addLineFlowCode( `${ structPrefix }m${ i } = ${ snippet }`, this );

		}

		return propertyName;

	}

}

export default OutputStructNode;

/**
 * TSL function for creating an output struct node.
 *
 * @function
 * @param {...Node} members - A parameter list of nodes.
 * @returns {OutputStructNode}
 */
export const outputStruct = /*@__PURE__*/ nodeProxy( OutputStructNode );
