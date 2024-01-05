let id = 0;

class NodeCache {

	constructor( builder ) {

		this.id = id ++;
		this.nodesData = new Map();
		this.builder = builder;

	}

	getNodeData( node ) {

		let data = this.nodesData.get( node.getHash( this.builder ) );

		if ( data === undefined ) {

			data = {};
			this.nodesData.set( node.getHash( this.builder ), data );

		}

		return data;

	}

	setNodeData( node, data ) {

		this.nodesData.set( node.getHash( this.builder ), data );

	}

	merge( cache ) { // @TODO: a simpler way for this would be to just have two caches (global and local; look-ups first happen in first and then in second), the second one of which could be changed while the first one couldn't. but this would prevent creating nested caches

		const newCache = new NodeCache();

		newCache.builder = this.builder || cache.builder;

		newCache.nodesData = new Map( [ ...this.nodesData, ...cache.nodesData ] );

		for ( let [ key, value ] of newCache.nodesData ) {

			value = { ...value };

			for ( const shaderStage of Object.keys( value ) ) {

				value[ shaderStage ] = { ...value[ shaderStage ] };
				if ( value[ shaderStage ].properties ) value[ shaderStage ].properties = { ...value[ shaderStage ].properties };

			}

			newCache.nodesData.set( key, value );

		}

		return newCache;

	}

}

export default NodeCache;
