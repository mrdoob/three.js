import Node from './Node.js';
import { nodeObject } from '../tsl/TSLCore.js';

/**
 * This node is used to build a sub-build in the node system.
 *
 * @augments Node
 * @param {Node} node - The node to be built in the sub-build.
 * @param {string} name - The name of the sub-build.
 * @param {?string} [nodeType=null] - The type of the node, if known.
 */
class SubBuildNode extends Node {

	static get type() {

		return 'SubBuild';

	}

	constructor( node, name, nodeType = null ) {

		super( nodeType );

		/**
		 * The node to be built in the sub-build.
		 *
		 * @type {Node}
		 */
		this.node = node;

		/**
		 * The name of the sub-build.
		 *
		 * @type {string}
		 */
		this.name = name;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSubBuildNode = true;

	}

	getNodeType( builder ) {

		if ( this.nodeType !== null ) return this.nodeType;

		builder.addSubBuild( this.name );

		const nodeType = this.node.getNodeType( builder );

		builder.removeSubBuild();

		return nodeType;

	}

	build( builder, ...params ) {

		builder.addSubBuild( this.name );

		const data = this.node.build( builder, ...params );

		builder.removeSubBuild();

		return data;

	}

}

export default SubBuildNode;

/**
 * Creates a new sub-build node.
 *
 * @tsl
 * @function
 * @param {Node} node - The node to be built in the sub-build.
 * @param {string} name - The name of the sub-build.
 * @param {?string} [type=null] - The type of the node, if known.
 * @returns {Node} A node object wrapping the SubBuildNode instance.
 */
export const subBuild = ( node, name, type = null ) => new SubBuildNode( nodeObject( node ), name, type );
