import NodeMaterialDebugAnalyzer from './NodeMaterialDebugAnalyzer.js';

class NodeMaterialDebug {

	constructor( renderer ) {

		this.renderer = renderer;
		this.analyzer = new NodeMaterialDebugAnalyzer( renderer );
		this.onNodeMaterialInvalidation = null;

		this._objects = null;
		this._originalGet = null;

		this.updateRenderer();

	}

	updateRenderer() {

		const renderObjects = this.renderer._objects;

		if ( renderObjects === null || renderObjects === undefined || this._objects === renderObjects ) return this;

		this.dispose();

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

		return this;

	}

	report( renderObject ) {

		const previousCallback = this.analyzer.onNodeMaterialInvalidation;

		this.analyzer.onNodeMaterialInvalidation = ( event ) => {

			if ( typeof this.onNodeMaterialInvalidation === 'function' ) this.onNodeMaterialInvalidation( event );

		};

		this.analyzer.report( renderObject );
		this.analyzer.onNodeMaterialInvalidation = previousCallback;

	}

	dispose() {

		if ( this._objects !== null && this._originalGet !== null ) {

			this._objects.get = this._originalGet;

		}

		this._objects = null;
		this._originalGet = null;

	}

}

export default NodeMaterialDebug;
