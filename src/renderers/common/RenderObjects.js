import ChainMap from './ChainMap.js';
import RenderObject from './RenderObject.js';

const chainArray = [];

class RenderObjects {

	constructor( renderer, nodes, geometries, pipelines, bindings, info ) {

		this.renderer = renderer;
		this.nodes = nodes;
		this.geometries = geometries;
		this.pipelines = pipelines;
		this.bindings = bindings;
		this.info = info;

		this.chainMaps = {};

	}

	get( object, material, scene, camera, lightsNode, renderContext, clippingContext, passId ) {

		const chainMap = this.getChainMap( passId );

		// reuse chainArray
		chainArray[ 0 ] = object;
		chainArray[ 1 ] = material;
		chainArray[ 2 ] = renderContext;
		chainArray[ 3 ] = lightsNode;

		let renderObject = chainMap.get( chainArray );

		if ( renderObject === undefined ) {

			renderObject = this.createRenderObject( this.nodes, this.geometries, this.renderer, object, material, scene, camera, lightsNode, renderContext, clippingContext, passId );

			chainMap.set( chainArray, renderObject );

		} else {

			renderObject.updateClipping( clippingContext );

			if ( renderObject.needsGeometryUpdate ) {

				renderObject.setGeometry( object.geometry );

			}

			if ( renderObject.version !== material.version || renderObject.needsUpdate ) {

				if ( renderObject.initialCacheKey !== renderObject.getCacheKey() ) {

					renderObject.dispose();

					renderObject = this.get( object, material, scene, camera, lightsNode, renderContext, clippingContext, passId );

				} else {

					renderObject.version = material.version;

				}

			}

		}

		return renderObject;

	}

	getChainMap( passId = 'default' ) {

		return this.chainMaps[ passId ] || ( this.chainMaps[ passId ] = new ChainMap() );

	}

	dispose() {

		this.chainMaps = {};

	}

	createRenderObject( nodes, geometries, renderer, object, material, scene, camera, lightsNode, renderContext, clippingContext, passId ) {

		const chainMap = this.getChainMap( passId );

		const renderObject = new RenderObject( nodes, geometries, renderer, object, material, scene, camera, lightsNode, renderContext, clippingContext );

		renderObject.onDispose = () => {

			this.pipelines.delete( renderObject );
			this.bindings.delete( renderObject );
			this.nodes.delete( renderObject );

			chainMap.delete( renderObject.getChainArray() );

		};

		return renderObject;

	}


}

export default RenderObjects;
