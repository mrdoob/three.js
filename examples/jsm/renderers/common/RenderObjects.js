import DataMap from './DataMap.js';
import ChainMap from './ChainMap.js';
import RenderObject from './RenderObject.js';

class RenderObjects extends ChainMap {

	constructor( renderer, nodes, geometries, pipelines, info ) {

		super();

		this.renderer = renderer;
		this.nodes = nodes;
		this.geometries = geometries;
		this.pipelines = pipelines;
		this.info = info;

		this.dataMap = new DataMap();

	}

	get( object, material, scene, camera, lightsNode ) {

		const chainArray = [ object, material, scene, camera, lightsNode ];

		let renderObject = super.get( chainArray );

		if ( renderObject === undefined ) {

			renderObject = this.createRenderObject( this.nodes, this.geometries, this.renderer, object, material, scene, camera, lightsNode );

			this.set( chainArray, renderObject );

		} else {

			const data = this.dataMap.get( renderObject );
			const cacheKey = renderObject.getCacheKey();

			if ( data.cacheKey !== cacheKey ) {

				renderObject.dispose();

				renderObject = this.get( object, material, scene, camera, lightsNode );

			}

		}

		return renderObject;

	}

	dispose() {

		super.dispose();

		this.dataMap.clear();

	}

	createRenderObject( nodes, geometries, renderer, object, material, scene, camera, lightsNode ) {

		const renderObject = new RenderObject( nodes, geometries, renderer, object, material, scene, camera, lightsNode );

		const data = this.dataMap.get( renderObject );
		data.cacheKey = renderObject.getCacheKey();

		renderObject.onDispose = () => {

			this.dataMap.delete( renderObject );

			this.pipelines.delete( renderObject );
			this.nodes.delete( renderObject );

			this.delete( renderObject.getChainArray() );

		};

		return renderObject;

	}


}

export default RenderObjects;
