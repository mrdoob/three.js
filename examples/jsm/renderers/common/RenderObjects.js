import DataMap from './DataMap.js';
import ChainMap from './ChainMap.js';
import RenderObject from './RenderObject.js';

class RenderObjects {

	constructor( renderer, nodes, geometries, pipelines, bindings, info ) {

		this.renderer = renderer;
		this.nodes = nodes;
		this.geometries = geometries;
		this.pipelines = pipelines;
		this.bindings = bindings;
		this.info = info;

		this.chainMaps = {};
		this.dataMap = new DataMap();

	}

	_getInstanceChainKey( object, material, lightsNode, renderContext ) {

		const geometry = object.geometry;

		return [ geometry, material, renderContext, lightsNode ];

	}

	getInstance( renderObject, passId ) {

		const { object, material, lightsNode, context } = renderObject;

		const chainArray = this._getInstanceChainKey( object, material, lightsNode, context );

		const chainMap = this.getChainMap( passId );

		//

		let renderObjectInstance = chainMap.get( chainArray );

		if ( renderObjectInstance === undefined ) {

			renderObjectInstance = renderObject;

			chainMap.set( chainArray, renderObjectInstance );

		}

		return renderObjectInstance;

	}

	get( object, material, scene, camera, lightsNode, renderContext, passId ) {

		const chainMap = this.getChainMap( passId );
		const chainArray = [ object, material, renderContext, lightsNode ];

		let renderObject = chainMap.get( chainArray );

		if ( renderObject === undefined ) {

			renderObject = this.createRenderObject( this.nodes, this.geometries, this.renderer, object, material, scene, camera, lightsNode, renderContext, passId );
			renderObject.instance = this.getInstance( renderObject, passId );

			chainMap.set( chainArray, renderObject );

		} else {

			const data = this.dataMap.get( renderObject );
			const cacheKey = renderObject.getCacheKey();

			if ( data.cacheKey !== cacheKey ) {

				renderObject.dispose();

				renderObject = this.get( object, material, scene, camera, lightsNode, renderContext, passId );

			}

		}

		return renderObject;

	}

	getChainMap( passId = 'default' ) {

		return this.chainMaps[ passId ] || ( this.chainMaps[ passId ] = new ChainMap() );

	}

	dispose() {

		this.chainMaps = {};
		this.dataMap = new DataMap();

	}

	createRenderObject( nodes, geometries, renderer, object, material, scene, camera, lightsNode, renderContext, passId ) {

		const chainMap = this.getChainMap( passId );
		const dataMap = this.dataMap;

		const renderObject = new RenderObject( nodes, geometries, renderer, object, material, scene, camera, lightsNode, renderContext );

		const data = dataMap.get( renderObject );
		data.cacheKey = renderObject.getCacheKey();

		renderObject.onDispose = () => {

			dataMap.delete( renderObject );

			this.pipelines.delete( renderObject );
			this.bindings.delete( renderObject );
			this.nodes.delete( renderObject );

			chainMap.delete( this._getInstanceChainKey( object, material, lightsNode, renderContext ) );
			chainMap.delete( renderObject.getChainArray() );

		};

		return renderObject;

	}


}

export default RenderObjects;
