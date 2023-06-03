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

			renderObject = new RenderObject( this.nodes, this.geometries, this.renderer, object, material, scene, camera, lightsNode );

			this._initRenderObject( renderObject );

			this.set( chainArray, renderObject );

		} else {

			const data = this.dataMap.get( renderObject );
			const cacheKey = renderObject.getCacheKey();

			if ( data.cacheKey !== cacheKey ) {

				data.cacheKey = cacheKey;

				this.pipelines.delete( renderObject );
				this.nodes.delete( renderObject );

			}

		}

		return renderObject;

	}

	dispose() {

		super.dispose();

		this.dataMap.clear();

	}

	_initRenderObject( renderObject ) {

		const data = this.dataMap.get( renderObject );

		if ( data.initialized !== true ) {

			data.initialized = true;
			data.cacheKey = renderObject.getCacheKey();

			const onDispose = () => {

				renderObject.material.removeEventListener( 'dispose', onDispose );

				this.pipelines.delete( renderObject );
				this.nodes.delete( renderObject );

				this.delete( renderObject.getChainArray() );

			};

			renderObject.material.addEventListener( 'dispose', onDispose );

		}

	}


}

export default RenderObjects;
