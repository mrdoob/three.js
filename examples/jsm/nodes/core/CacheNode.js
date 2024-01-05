import Node, { addNodeClass } from './Node.js';
import NodeCache from './NodeCache.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

class CacheNode extends Node {

	constructor( node, cache = new NodeCache() ) {

		super();

		this.isCacheNode = true;

		this.node = node;

		this.cache = cache;
		this.caches = new Map();

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	// @TODO: solve two major caching problems of interaction of CacheNode (or specifically CondNode) with .analyze():
	// 1) don't increase dependency count of child nodes if they are placed in a cache (so that nodes wouldn't auto-temp when not required)
	// 2) do increase dependency count of child nodes if they present in both CondNode's branches and allow generating them *outside* of it

	_build( builder, ...params ) { // @TODO: similar structures occur in multiple nodes, maybe such a function could be moved to Node class?

		if ( builder.getBuildStage() === 'setup' ) super.build( builder, ...params );
		if ( builder.getBuildStage() === 'analyze' ) return super.build( builder, ...params );

		return this.node.build( builder, ...params );

	}

	build( builder, ...params ) {

		const previousCache = builder.getCache();

		if ( ! this.caches.has( previousCache ) ) this.caches.set( previousCache, this.cache.merge( previousCache ) );
		builder.setCache( this.caches.get( previousCache ) );

		const data = this._build( builder, ...params );

		builder.setCache( previousCache );

		return data;

	}

}

export default CacheNode;

export const cache = nodeProxy( CacheNode ); // @TODO: rename this to `isolate`?

addNodeElement( 'cache', cache );

addNodeClass( 'CacheNode', CacheNode );
