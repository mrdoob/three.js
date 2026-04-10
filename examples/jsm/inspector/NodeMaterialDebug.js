import NodeMaterialDebugAnalyzer from './NodeMaterialDebugAnalyzer.js';

class NodeMaterialDebug {

	constructor( renderer ) {

		this.renderer = renderer;
		this.analyzer = new NodeMaterialDebugAnalyzer( renderer );
		this.onNodeMaterialInvalidation = null;

		this._objects = null;
		this._originalGet = null;
		this._nodes = null;
		this._originalUpdateBefore = null;

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

		const originalUpdateBefore = nodes.updateBefore;
		const nodeMaterialDebug = this;

		nodes.updateBefore = function ( renderObject ) {

			const previousCacheKey = renderObject.getCacheKey();

			originalUpdateBefore.call( this, renderObject );

			if ( previousCacheKey !== renderObject.getCacheKey() ) {

				nodeMaterialDebug.report( renderObject );

			}

		};

		this._nodes = nodes;
		this._originalUpdateBefore = originalUpdateBefore;

	}

	report( renderObject ) {

		const previousCallback = this.analyzer.onNodeMaterialInvalidation;

		this.analyzer.onNodeMaterialInvalidation = ( event ) => {

			if ( typeof this.onNodeMaterialInvalidation === 'function' ) this.onNodeMaterialInvalidation( event );

		};

		this.analyzer.report( renderObject );
		this.analyzer.update( renderObject );
		this.analyzer.onNodeMaterialInvalidation = previousCallback;

	}

	dispose() {

		if ( this._objects !== null && this._originalGet !== null ) {

			this._objects.get = this._originalGet;

		}

		if ( this._nodes !== null && this._originalUpdateBefore !== null ) {

			this._nodes.updateBefore = this._originalUpdateBefore;

		}

		this._objects = null;
		this._originalGet = null;
		this._nodes = null;
		this._originalUpdateBefore = null;

	}

}

export default NodeMaterialDebug;
