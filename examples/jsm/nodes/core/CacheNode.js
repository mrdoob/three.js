import Node, { addNodeClass } from './Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

class CacheNode extends Node {

	constructor( node ) {

		super();

		this.isCacheNode = true;

		this.node = node;

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	build( builder, ...params ) {

		const previousCache = builder.getCache();
		const cache = builder.getCacheFromNode( this );

		builder.setCache( cache );

		const data = this.node.build( builder, ...params );

		builder.setCache( previousCache );

		return data;

	}

}

export default CacheNode;

export const cache = nodeProxy( CacheNode );

addNodeElement( 'cache', cache );

addNodeClass( 'CacheNode', CacheNode );
