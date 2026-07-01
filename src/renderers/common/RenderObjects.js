import ChainMap from './ChainMap.js';
import RenderObject from './RenderObject.js';
import { captureDrawState, drawStateEquals } from './AsyncCompilation.js';
import { isTransparent, needsDoublePass } from './RenderList.js';

const _chainKeys = [];

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
	 * @param {NodeManager} nodes - Renderer component for managing nodes related logic.
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
		 * @type {NodeManager}
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
		 * @type {Object<string,ChainMap>}
		 */
		this.chainMaps = {};

		/**
		 * Per-material compiled classification snapshots, used by async
		 * compilation mode to classify render lists from the compiled truth.
		 *
		 * @private
		 * @type {WeakMap<Material,{transparent:boolean,doublePass:boolean}>}
		 */
		this._classifications = new WeakMap();

	}

	/**
	 * Updates the compiled classification snapshot for the given material
	 * from its live state. Called only at promotion — a top-level safe
	 * point, outside the renderer's temporary pass-related `material.side`
	 * mutations — so the captured values are always the application's.
	 *
	 * @param {Material} material - The material.
	 */
	updateClassification( material ) {

		let classification = this._classifications.get( material );

		if ( classification === undefined ) {

			classification = { transparent: false, doublePass: false };

			this._classifications.set( material, classification );

		}

		classification.transparent = isTransparent( material );
		classification.doublePass = needsDoublePass( material );

	}

	/**
	 * Returns the compiled classification snapshot for the given material,
	 * or `null` when no replacement has ever been promoted for it (new
	 * materials classify live; their draws are skipped until ready).
	 *
	 * @param {Material} material - The material.
	 * @return {?{transparent:boolean,doublePass:boolean}} The classification snapshot.
	 */
	getClassification( material ) {

		const classification = this._classifications.get( material );

		return classification !== undefined ? classification : null;

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
	 * @param {string} [passId] - An optional ID for identifying the pass.
	 * @return {RenderObject} The render object.
	 */
	get( object, material, scene, camera, lightsNode, renderContext, clippingContext, passId ) {

		const chainMap = this.getChainMap( passId );

		// set chain keys

		_chainKeys[ 0 ] = object;
		_chainKeys[ 1 ] = material;
		_chainKeys[ 2 ] = renderContext;
		_chainKeys[ 3 ] = lightsNode;

		//

		let renderObject = chainMap.get( _chainKeys );

		if ( renderObject === undefined ) {

			renderObject = this.createRenderObject( this.nodes, this.geometries, this.renderer, object, material, scene, camera, lightsNode, renderContext, clippingContext, passId );

			chainMap.set( _chainKeys, renderObject );

			if ( this.renderer._asyncCompilation === true && this.renderer._compilation._updating === false ) {

				// new drawables compile in the background and are skipped
				// until ready; the snapshot is captured here — during
				// traversal — when pass-dependent state is resolved.
				// drawables of nested renders issued from inside a driver
				// slice (e.g. PMREM generation) compile classically instead —
				// their output is sampled and cached immediately.

				renderObject.drawState = captureDrawState( material );

				this.renderer._compilation.request( renderObject, passId );

			}

		} else {

			// update references

			renderObject.camera = camera;

			//

			renderObject.updateClipping( clippingContext );

			let geometryChanged = false;

			if ( renderObject.needsGeometryUpdate ) {

				geometryChanged = true;

				renderObject.setGeometry( object.geometry );

			}

			if ( renderObject.version !== material.version || renderObject.needsUpdate ) {

				if ( this.renderer._asyncCompilation === true && this.renderer._compilation._updating === false && this.pipelines.isReady( renderObject ) === true && geometryChanged === false ) {

					// async mode: a structural change requests a background
					// replacement; the render object keeps its identity and
					// keeps drawing its compiled state until promotion.
					// keep-last across a vertex-layout change would draw
					// invalid buffers, so geometry changes take the classic
					// dispose path below instead.

					const cacheKey = renderObject.getCacheKey();

					if ( renderObject.initialCacheKey !== cacheKey ) {

						this.requestPending( renderObject, cacheKey, false, passId );

					}

					renderObject.version = material.version;

				} else if ( renderObject.initialCacheKey !== renderObject.getCacheKey() ) {

					renderObject.dispose();

					renderObject = this.get( object, material, scene, camera, lightsNode, renderContext, clippingContext, passId );

				} else {

					renderObject.version = material.version;

				}

			}

		}

		// reset chain array

		_chainKeys[ 0 ] = null;
		_chainKeys[ 1 ] = null;
		_chainKeys[ 2 ] = null;
		_chainKeys[ 3 ] = null;

		//

		return renderObject;

	}

	/**
	 * Requests a background replacement for the given structural cache key.
	 *
	 * The render object keeps drawing its compiled state until the
	 * replacement promotes at a top-level safe point. The requested-state
	 * keys are updated eagerly so unchanged frames perform no further key
	 * computation while the replacement compiles.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 * @param {number} cacheKey - The structural cache key to build.
	 * @param {boolean} [force=false] - Whether to request a replacement even when
	 * the cache key is unchanged. Used for pipeline-only state changes that do not
	 * affect the node cache key (e.g. blend mode values).
	 * @param {string} [passId] - An optional ID for identifying the pass.
	 */
	requestPending( renderObject, cacheKey, force = false, passId ) {

		const driver = this.renderer._compilation;
		const material = renderObject.material;

		// eager key sync: unchanged frames perform no key computation while
		// the replacement compiles; `NodeManager` tracks the key the active
		// state is actually cached under separately

		renderObject.initialCacheKey = cacheKey;
		renderObject.initialNodesCacheKey = renderObject.getDynamicCacheKey();

		const drawState = captureDrawState( material );

		const pending = renderObject.pending;

		if ( pending !== null ) {

			if ( pending.initialCacheKey === cacheKey && ( force === false || drawStateEquals( pending.drawState, drawState ) ) ) {

				// the in-flight replacement already covers this state

				return;

			}

			renderObject.pending = null;

			pending.dispose();

		}

		// reverted to the compiled state before the replacement finished

		if ( this.nodes.get( renderObject ).cacheKey === cacheKey && ( force === false || drawStateEquals( renderObject.drawState, drawState ) ) ) {

			return;

		}

		if ( driver.isFailed( cacheKey ) === true ) return; // known-broken key — keep last

		const newPending = this.createRenderObject( this.nodes, this.geometries, this.renderer, renderObject.object, material, renderObject.scene, renderObject.camera, renderObject.lightsNode, renderObject.context, renderObject.clippingContext, passId );

		newPending.drawState = drawState;

		renderObject.pending = newPending;

		driver.request( renderObject, passId );

	}

	/**
	 * Promotes the given replacement render object. Called only from the
	 * driver's promotion queue at a top-level safe point, while no pass or
	 * encoder is active: the chain map entry is swapped atomically and the
	 * replaced render object releases its resources through the classic
	 * dispose path.
	 *
	 * @param {RenderObject} renderObject - The render object being replaced.
	 * @param {RenderObject} pending - The compiled replacement.
	 * @param {string} [passId] - An optional ID for identifying the pass.
	 * @return {boolean} Whether the replacement was promoted or not.
	 */
	promote( renderObject, pending, passId ) {

		if ( renderObject.pending !== pending || renderObject.disposed === true ) return false;

		renderObject.pending = null;

		this.getChainMap( passId ).set( pending.getChainArray(), pending );

		// classification follows the compiled truth from the next render
		// list on — captured here, at the safe point, outside the renderer's
		// temporary pass-related side mutations

		this.updateClassification( pending.material );

		// bundles encoding the replaced object must re-record

		if ( renderObject.bundle !== null ) renderObject.bundle.needsUpdate = true;

		renderObject.dispose();

		return true;

	}

	/**
	 * Returns a chain map for the given pass ID.
	 *
	 * @param {string} [passId='default'] - The pass ID.
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
	 * @param {NodeManager} nodes - Renderer component for managing nodes related logic.
	 * @param {Geometries} geometries - Renderer component for managing geometries.
	 * @param {Renderer} renderer - The renderer.
	 * @param {Object3D} object - The 3D object.
	 * @param {Material} material - The object's material.
	 * @param {Scene} scene - The scene the 3D object belongs to.
	 * @param {Camera} camera - The camera the object should be rendered with.
	 * @param {LightsNode} lightsNode - The lights node.
	 * @param {RenderContext} renderContext - The render context.
	 * @param {ClippingContext} clippingContext - The clipping context.
	 * @param {string} [passId] - An optional ID for identifying the pass.
	 * @return {RenderObject} The render object.
	 */
	createRenderObject( nodes, geometries, renderer, object, material, scene, camera, lightsNode, renderContext, clippingContext, passId ) {

		const chainMap = this.getChainMap( passId );

		const renderObject = new RenderObject( nodes, geometries, renderer, object, material, scene, camera, lightsNode, renderContext, clippingContext );

		renderObject.onDispose = () => {

			this.pipelines.delete( renderObject );
			this.bindings.deleteForRender( renderObject );
			this.nodes.delete( renderObject );

			const pending = renderObject.pending;

			if ( pending !== null ) {

				renderObject.pending = null;

				pending.dispose();

			}

			// a pending replacement shares its chain array with the render
			// object it replaces — only remove the entry this render object
			// actually occupies

			const chainArray = renderObject.getChainArray();

			if ( chainMap.get( chainArray ) === renderObject ) chainMap.delete( chainArray );

		};

		return renderObject;

	}


}

export default RenderObjects;
