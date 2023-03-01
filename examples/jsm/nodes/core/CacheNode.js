import Node from './Node.js';
import NodeCache from './NodeCache.js';

class CacheNode extends Node {

	constructor( node, cache = new NodeCache() ) {

		super();

		this.isCacheNode = true;

		this.node = node;
		this.cache = cache;

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	build( builder, ...params ) {

		const previousCache = builder.getCache();

		builder.setCache( this.cache );

		const data = this.node.build( builder, ...params );

		builder.setCache( previousCache );

		return data;

	}

}

export default CacheNode;
