import ChainMap from './ChainMap.js';
import RenderObject from './RenderObject.js';

const _chainArray = [];

/**
 * This module manages the render objects of the renderer.
 *
 * @private
 */
class RenderObjects {

	/**
	 * Constructs a new render object management component.
	 *
	 * @param {Renderer} renderer - The renderer.
	 * @param {Nodes} nodes - Renderer component for managing nodes related logic.
	 * @param {Geometries} geometries - Renderer component for managing geometries.
	 * @param {Pipelines} pipelines - Renderer component for managing pipelines.
	 * @param {Bindings} bindings - Renderer component for managing bindings.
	 * @param {Info} info - Renderer component for managing metrics and monitoring data.
	 */
	constructor( renderer, nodes, geometries, pipelines, bindings, info ) {

		/**
		 * The renderer.
		 *
		 * @type {Renderer}
		 */
		this.renderer = renderer;

		/**
		 * Renderer component for managing nodes related logic.
		 *
		 * @type {Nodes}
		 */
		this.nodes = nodes;

		/**
		 * Renderer component for managing geometries.
		 *
		 * @type {Geometries}
		 */
		this.geometries = geometries;

		/**
		 * Renderer component for managing pipelines.
		 *
		 * @type {Pipelines}
		 */
		this.pipelines = pipelines;

		/**
		 * Renderer component for managing bindings.
		 *
		 * @type {Bindings}
		 */
		this.bindings = bindings;

		/**
		 * Renderer component for managing metrics and monitoring data.
		 *
		 * @type {Info}
		 */
		this.info = info;

		/**
		 * A dictionary that manages render contexts in chain maps
		 * for each pass ID.
		 *
		 * @type {Object<String,ChainMap>}
		 */
		this.chainMaps = {};

	}

	/**
	 * Returns a render object for the given object and state data.
	 *
	 * @param {Object3D} object - The 3D object.
	 * @param {Material} material - The 3D object's material.
	 * @param {Scene} scene - The scene the 3D object belongs to.
	 * @param {Camera} camera - The camera the 3D object should be rendered with.
	 * @param {LightsNode} lightsNode - The lights node.
	 * @param {RenderContext} renderContext - The render context.
	 * @param {ClippingContext} clippingContext - The clipping context.
	 * @param {String?} passId - An optional ID for identifying the pass.
	 * @return {RenderObject} The render object.
	 */
	get( object, material, scene, camera, lightsNode, renderContext, clippingContext, passId ) {

		const chainMap = this.getChainMap( passId );

		// reuse chainArray
		_chainArray[ 0 ] = object;
		_chainArray[ 1 ] = material;
		_chainArray[ 2 ] = renderContext;
		_chainArray[ 3 ] = lightsNode;

		let renderObject = chainMap.get( _chainArray );

		if ( renderObject === undefined ) {

			renderObject = this.createRenderObject( this.nodes, this.geometries, this.renderer, object, material, scene, camera, lightsNode, renderContext, clippingContext, passId );

			chainMap.set( _chainArray, renderObject );

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

	/**
	 * Returns a chain map for the given pass ID.
	 *
	 * @param {String} [passId='default'] - The pass ID.
	 * @return {ChainMap} The chain map.
	 */
	getChainMap( passId = 'default' ) {

		return this.chainMaps[ passId ] || ( this.chainMaps[ passId ] = new ChainMap() );

	}

	/**
	 * Frees internal resources.
	 */
	dispose() {

		this.chainMaps = {};

	}

	/**
	 * Factory method for creating render objects with the given list of parameters.
	 *
	 * @param {Nodes} nodes - Renderer component for managing nodes related logic.
	 * @param {Geometries} geometries - Renderer component for managing geometries.
	 * @param {Renderer} renderer - The renderer.
	 * @param {Object3D} object - The 3D object.
	 * @param {Material} material - The object's material.
	 * @param {Scene} scene - The scene the 3D object belongs to.
	 * @param {Camera} camera - The camera the object should be rendered with.
	 * @param {LightsNode} lightsNode - The lights node.
	 * @param {RenderContext} renderContext - The render context.
	 * @param {ClippingContext} clippingContext - The clipping context.
	 * @param {String?} passId - An optional ID for identifying the pass.
	 * @return {RenderObject} The render object.
	 */
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
