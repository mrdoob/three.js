import Node from './Node.js';
import { nodeObject } from '../tsl/TSLCore.js';

class SubBuildNode extends Node {

	static get type() {

		return 'SubBuild';

	}

	constructor( node, name ) {

		super();

		this.node = node;

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

export const subBuild = ( node, name ) => nodeObject( new SubBuildNode( nodeObject( node ), name ) );
