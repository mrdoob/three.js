import DataMap from './DataMap.js';
import ChainMap from './ChainMap.js';
import RenderObject from './RenderObject.js';

class RenderObjects {

	constructor( renderer, nodes, geometries, pipelines, info ) {

		this.renderer = renderer;
		this.nodes = nodes;
		this.geometries = geometries;
		this.pipelines = pipelines;
		this.info = info;

		this.chainMaps = {};
		this.dataMaps = {};

	}

	get( object, material, scene, camera, lightsNode, namespace ) {

		const chainMap = this.getChainMap( namespace );
		const chainArray = [ object, material, scene, camera, lightsNode ];

		let renderObject = chainMap.get( chainArray );

		if ( renderObject === undefined ) {

			renderObject = this.createRenderObject( this.nodes, this.geometries, this.renderer, object, material, scene, camera, lightsNode, namespace );

			chainMap.set( chainArray, renderObject );

		} else {

			const data = this.getDataMap( namespace ).get( renderObject );
			const cacheKey = renderObject.getCacheKey();

			if ( data.cacheKey !== cacheKey ) {

				renderObject.dispose();

				renderObject = this.get( object, material, scene, camera, lightsNode );

			}

		}

		return renderObject;

	}

	getChainMap( namespace = 'default' ) {

		return this.chainMaps[ namespace ] || ( this.chainMaps[ namespace ] = new ChainMap() );

	}

	getDataMap( namespace = 'default' ) {

		return this.dataMaps[ namespace ] || ( this.dataMaps[ namespace ] = new DataMap() );

	}

	dispose() {

		this.chainMaps = {};
		this.dataMaps = {};

	}

	createRenderObject( nodes, geometries, renderer, object, material, scene, camera, lightsNode, namespace ) {

		const chainMap = this.getChainMap( namespace );
		const dataMap = this.getDataMap( namespace );
		const renderObject = new RenderObject( nodes, geometries, renderer, object, material, scene, camera, lightsNode );

		const data = dataMap.get( renderObject );
		data.cacheKey = renderObject.getCacheKey();

		renderObject.onDispose = () => {

			dataMap.delete( renderObject );

			this.pipelines.delete( renderObject );
			this.nodes.delete( renderObject );

			chainMap.delete( renderObject.getChainArray() );

		};

		return renderObject;

	}


}

export default RenderObjects;
