import Node, { addNodeClass } from './Node.js';
import { addNodeElement, nodeObject } from '../shadernode/ShaderNode.js';

class CacheNode extends Node {

	constructor( node, parent = true ) {

		super();

		this.node = node;
		this.parent = parent;

		this.isCacheNode = true;

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	build( builder, ...params ) {

		const previousCache = builder.getCache();
		const cache = builder.getCacheFromNode( this, parent );

		builder.setCache( cache );

		const data = this.node.build( builder, ...params );

		builder.setCache( previousCache );

		return data;

	}

}

export default CacheNode;

export const cache = ( node, ...params ) => nodeObject( new CacheNode( nodeObject( node ), ...params ) );

addNodeElement( 'cache', cache );

addNodeClass( 'CacheNode', CacheNode );
