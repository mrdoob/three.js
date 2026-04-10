import NodeMaterialDebugAnalyzer from './NodeMaterialDebugAnalyzer.js';

class NodeMaterialDebug {

	constructor( renderer ) {

		this.renderer = renderer;
		this.analyzer = new NodeMaterialDebugAnalyzer( renderer );
		this.onNodeMaterialInvalidation = null;

		this._objects = null;
		this._originalGet = null;
		this._nodes = null;
		this._originalNeedsRefresh = null;
		this._pendingInvalidations = new WeakMap();

		this.updateRenderer();

	}

	updateRenderer() {

		const renderObjects = this.renderer._objects;
		const nodes = this.renderer._nodes;

		if ( renderObjects === null || renderObjects === undefined || nodes === null || nodes === undefined ) return this;
		if ( this._objects === renderObjects && this._nodes === nodes ) return this;

		this.dispose();

		this._patchRenderObjects( renderObjects );
		this._patchNodeManager( nodes );

		return this;

	}

	_patchRenderObjects( renderObjects ) {

		const originalGet = renderObjects.get;
		const nodeMaterialDebug = this;

		renderObjects.get = function ( object, material, scene, camera, lightsNode, renderContext, clippingContext, passId ) {

			const chainMap = this.getChainMap( passId );
			const previousRenderObject = chainMap.get( [ object, material, renderContext, lightsNode ] );

			if ( previousRenderObject !== undefined ) {

				previousRenderObject.camera = camera;
				previousRenderObject.updateClipping( clippingContext );

				if ( previousRenderObject.needsGeometryUpdate ) previousRenderObject.setGeometry( object.geometry );

				if ( ( previousRenderObject.version !== material.version || previousRenderObject.needsUpdate ) && previousRenderObject.initialCacheKey !== previousRenderObject.getCacheKey() ) {

					nodeMaterialDebug.report( previousRenderObject );

				}

			}

			const renderObject = originalGet.call( this, object, material, scene, camera, lightsNode, renderContext, clippingContext, passId );

			nodeMaterialDebug.analyzer.update( renderObject );

			return renderObject;

		};

		this._objects = renderObjects;
		this._originalGet = originalGet;

	}

	_patchNodeManager( nodes ) {

		const originalNeedsRefresh = nodes.needsRefresh;
		const nodeMaterialDebug = this;

		nodes.needsRefresh = function ( renderObject ) {

			const previousCacheKey = renderObject.getCacheKey();
			const needsRefresh = originalNeedsRefresh.call( this, renderObject );
			const cacheKey = renderObject.getCacheKey();

			if ( needsRefresh === true && previousCacheKey !== cacheKey ) {

				nodeMaterialDebug.reportRefresh( renderObject, previousCacheKey, cacheKey );

			}

			return needsRefresh;

		};

		this._nodes = nodes;
		this._originalNeedsRefresh = originalNeedsRefresh;

	}

	reportRefresh( renderObject, previousCacheKey, cacheKey ) {

		const previousCallback = this.analyzer.onNodeMaterialInvalidation;
		let dispatched = false;

		this.analyzer.onNodeMaterialInvalidation = ( event ) => {

			dispatched = true;
			event.stage = event.stage || 'node-refresh';
			event.needsRefresh = true;
			event.refreshCacheKeyPrevious = String( previousCacheKey );
			event.refreshCacheKey = String( cacheKey );
			this.dispatch( event );

		};

		this.analyzer.report( renderObject );
		this.analyzer.update( renderObject );
		this.analyzer.onNodeMaterialInvalidation = previousCallback;

		if ( dispatched === true ) return;

		this.dispatch( {
			stage: 'node-refresh',
			property: 'NodeMaterialObserver.needsRefresh',
			previousValue: String( previousCacheKey ),
			value: String( cacheKey ),
			refreshCacheKeyPrevious: String( previousCacheKey ),
			refreshCacheKey: String( cacheKey ),
			currentDebugData: typeof this.analyzer.getCurrentDebugData === 'function' ? this.analyzer.getCurrentDebugData( renderObject ) : null,
			rebuild: false,
			needsRefresh: true,
			material: renderObject.material,
			renderObject
		} );

	}

	report( renderObject ) {

		const previousCallback = this.analyzer.onNodeMaterialInvalidation;

		this.analyzer.onNodeMaterialInvalidation = ( event ) => this.dispatch( event );

		this.analyzer.report( renderObject );
		this.analyzer.update( renderObject );
		this.analyzer.onNodeMaterialInvalidation = previousCallback;

	}

	updatePendingBuildInfo( info ) {

		const pendingInvalidations = this._pendingInvalidations.get( info.material );

		if ( pendingInvalidations !== undefined ) {

			for ( const event of pendingInvalidations ) {

				event.buildInfo = info;

			}

		}

	}

	flushPendingInvalidations( info ) {

		const material = info.material;
		const pendingInvalidations = this._pendingInvalidations.get( material );

		if ( pendingInvalidations !== undefined ) {

			this._pendingInvalidations.delete( material );

			for ( const event of pendingInvalidations ) {

				event.buildInfo = info;
				this.dispatch( event );

			}

		}

	}

	dispatch( event ) {

		if ( event.rebuild === true && event.material && event.buildInfo === undefined ) {

			let pendingInvalidations = this._pendingInvalidations.get( event.material );

			if ( pendingInvalidations === undefined ) {

				pendingInvalidations = [];
				this._pendingInvalidations.set( event.material, pendingInvalidations );

			}

			pendingInvalidations.push( event );

			return;

		}

		if ( typeof this.onNodeMaterialInvalidation === 'function' ) this.onNodeMaterialInvalidation( event );

	}

	dispose() {

		if ( this._objects !== null && this._originalGet !== null ) {

			this._objects.get = this._originalGet;

		}

		if ( this._nodes !== null && this._originalNeedsRefresh !== null ) {

			this._nodes.needsRefresh = this._originalNeedsRefresh;

		}

		this._objects = null;
		this._originalGet = null;
		this._nodes = null;
		this._originalNeedsRefresh = null;
		this._pendingInvalidations = new WeakMap();

	}

}

export default NodeMaterialDebug;
