import NodeMaterialDebugAnalyzer from './NodeMaterialDebugAnalyzer.js';

class NodeMaterialDebug {

	constructor( renderer ) {

		this.renderer = renderer;
		this.analyzer = new NodeMaterialDebugAnalyzer( renderer );
		this.onNodeMaterialInvalidation = null;

		this._objects = null;
		this._originalGet = null;
		this._nodes = null;
		this._pipelines = null;
		this._originalNeedsRefresh = null;
		this._originalGetForRender = null;
		this._originalGetForCompute = null;
		this._originalPipelinesGetForRender = null;
		this._originalGetRenderPipeline = null;
		this._computeBuilds = new WeakMap();
		this._computeInvalidations = new WeakMap();
		this._pendingInvalidations = new WeakMap();
		this._pipelineCreates = new WeakMap();

		this.updateRenderer();

	}

	updateRenderer() {

		const renderObjects = this.renderer._objects;
		const nodes = this.renderer._nodes;
		const pipelines = this.renderer._pipelines;
		const isWebGPU = this.renderer.backend && this.renderer.backend.isWebGPUBackend === true;

		if ( renderObjects === null || renderObjects === undefined || nodes === null || nodes === undefined ) return this;
		if ( this._objects === renderObjects && this._nodes === nodes && this._pipelines === pipelines ) return this;

		this.dispose();

		this._patchRenderObjects( renderObjects );
		this._patchNodeManager( nodes );

		if ( isWebGPU === true && pipelines !== null && pipelines !== undefined ) {

			this._patchWebGPUPipelines( pipelines );

		}

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
		const originalGetForRender = nodes.getForRender;
		const originalGetForCompute = nodes.getForCompute;
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

		nodes.getForRender = function ( renderObject, useAsync = false ) {

			const renderObjectData = this.get( renderObject );
			const previousNodeBuilderState = renderObjectData.nodeBuilderState;
			const cacheKey = previousNodeBuilderState === undefined ? this.getForRenderCacheKey( renderObject ) : null;
			const cachedNodeBuilderState = cacheKey !== null ? this.nodeBuilderCache.get( cacheKey ) : undefined;
			const nodeBuilderState = originalGetForRender.call( this, renderObject, useAsync );

			if ( previousNodeBuilderState === undefined && cachedNodeBuilderState !== undefined && nodeBuilderState === cachedNodeBuilderState ) {

				nodeMaterialDebug.reportNodeBuilderCacheHit( renderObject, cacheKey, nodeBuilderState );

			}

			if ( previousNodeBuilderState === undefined && cachedNodeBuilderState !== undefined && nodeBuilderState && typeof nodeBuilderState.then === 'function' ) {

				nodeBuilderState.then( ( resolvedNodeBuilderState ) => {

					if ( resolvedNodeBuilderState === cachedNodeBuilderState ) nodeMaterialDebug.reportNodeBuilderCacheHit( renderObject, cacheKey, resolvedNodeBuilderState );

				} );

			}

			return nodeBuilderState;

		};

		nodes.getForCompute = function ( computeNode ) {

			const computeData = this.get( computeNode );
			const previousNodeBuilderState = computeData.nodeBuilderState;
			const invalidation = nodeMaterialDebug._computeInvalidations.get( computeNode );
			const startTime = previousNodeBuilderState === undefined ? performance.now() : 0;
			const nodeBuilderState = originalGetForCompute.call( this, computeNode );

			if ( previousNodeBuilderState === undefined && nodeBuilderState !== undefined ) {

				nodeMaterialDebug.reportComputeBuild( computeNode, nodeBuilderState, invalidation, performance.now() - startTime );

			}

			return nodeBuilderState;

		};

		this._nodes = nodes;
		this._originalNeedsRefresh = originalNeedsRefresh;
		this._originalGetForRender = originalGetForRender;
		this._originalGetForCompute = originalGetForCompute;

	}

	_patchWebGPUPipelines( pipelines ) {

		const originalPipelinesGetForRender = pipelines.getForRender;
		const originalGetRenderPipeline = pipelines._getRenderPipeline;
		const nodeMaterialDebug = this;

		pipelines.getForRender = function ( renderObject, promises = null ) {

			const data = this.get( renderObject );
			const previousPipeline = data.pipeline;
			const needsUpdate = this._needsRenderUpdate( renderObject );
			const previousCacheKey = previousPipeline ? previousPipeline.cacheKey : null;
			const pipeline = originalPipelinesGetForRender.call( this, renderObject, promises );

			if ( needsUpdate === true ) {

				nodeMaterialDebug.reportPipelineUpdate( renderObject, previousPipeline, pipeline, previousCacheKey );

			}

			return pipeline;

		};

		pipelines._getRenderPipeline = function ( renderObject, stageVertex, stageFragment, cacheKey, promises ) {

			const renderCacheKey = cacheKey || this._getRenderCacheKey( renderObject, stageVertex, stageFragment );
			const hadPipeline = this.caches.has( renderCacheKey );
			const pipeline = originalGetRenderPipeline.call( this, renderObject, stageVertex, stageFragment, cacheKey, promises );

			if ( hadPipeline === false ) {

				nodeMaterialDebug.reportPipelineCreate( renderObject, pipeline, renderCacheKey );
				nodeMaterialDebug.markPipelineCreated( renderObject, pipeline );

			}

			return pipeline;

		};

		this._pipelines = pipelines;
		this._originalPipelinesGetForRender = originalPipelinesGetForRender;
		this._originalGetRenderPipeline = originalGetRenderPipeline;

	}

	reportNodeBuilderCacheHit( renderObject, cacheKey, nodeBuilderState ) {

		this.dispatch( {
			stage: 'node-builder-cache',
			action: 'reused node builder cache',
			property: 'NodeManager.nodeBuilderCache',
			reason: 'matching node builder state already exists',
			previousValue: 'missing renderObject nodeBuilderState',
			value: `cache key ${ cacheKey }`,
			rebuild: false,
			needsRefresh: false,
			cacheKey,
			nodeBuilderState,
			material: renderObject.material,
			renderObject
		} );

	}

	reportPipelineUpdate( renderObject, previousPipeline, pipeline, previousCacheKey ) {

		const createdPipelines = this._pipelineCreates.get( renderObject );

		if ( createdPipelines !== undefined && createdPipelines.has( pipeline ) ) return;

		const pipelineDifference = getPipelineCacheKeyDifference( previousCacheKey, pipeline ? pipeline.cacheKey : null );

		this.dispatch( {
			stage: 'webgpu-pipeline-update',
			action: 'updated WebGPU pipeline state',
			property: pipelineDifference.property,
			reason: previousPipeline === undefined ? 'missing render pipeline' : 'backend requested render pipeline update',
			previousValue: pipelineDifference.previousValue,
			value: pipelineDifference.value,
			rebuild: false,
			needsRefresh: false,
			pipeline,
			previousPipeline,
			material: renderObject.material,
			renderObject
		} );

	}

	markPipelineCreated( renderObject, pipeline ) {

		let createdPipelines = this._pipelineCreates.get( renderObject );

		if ( createdPipelines === undefined ) {

			createdPipelines = new WeakSet();
			this._pipelineCreates.set( renderObject, createdPipelines );

		}

		createdPipelines.add( pipeline );

	}

	reportPipelineCreate( renderObject, pipeline, cacheKey ) {

		this.dispatch( {
			stage: 'webgpu-pipeline-create',
			action: 'created WebGPU render pipeline',
			property: 'pipeline layout',
			reason: 'first use of this shader and render-state combination',
			previousValue: 'not cached',
			value: getPipelineCacheKeySummary( cacheKey ),
			rebuild: false,
			needsRefresh: false,
			pipeline,
			material: renderObject.material,
			renderObject
		} );

	}

	reportComputeBuild( computeNode, nodeBuilderState, invalidation, durationMs ) {

		const computeShader = nodeBuilderState.computeShader;
		const computeLabel = computeNode.name || computeNode.type || 'ComputeNode';
		const previousBuild = invalidation !== undefined ? invalidation.previousBuild : undefined;
		const reason = invalidation !== undefined ? invalidation.reason : 'initial compute build';
		const difference = previousBuild !== undefined ? getComputeBuildDifference( previousBuild, computeShader ) : null;
		const event = {
			stage: invalidation !== undefined ? 'compute-cache' : 'compute-build',
			property: invalidation !== undefined ? invalidation.property : 'NodeManager.getForCompute',
			reason,
			rebuild: true,
			needsRefresh: true,
			compute: true,
			buildInfo: {
				durationMs,
				result: nodeBuilderState
			},
			computeNode,
			computeLabel
		};

		if ( difference !== null ) {

			event.property = difference.property;
			event.previousValue = difference.previousValue;
			event.value = difference.value;
			event.previousComputeShader = difference.previousComputeShader;
			event.computeShader = difference.computeShader;

		}

		this._computeBuilds.set( computeNode, {
			computeShader
		} );

		this.dispatch( event );

		this._computeInvalidations.delete( computeNode );

	}

	markComputeDisposed( computeNode, reason = 'computeNode.dispose() cleared cached compute state', property = 'computeNode.dispose' ) {

		this._computeInvalidations.set( computeNode, {
			property,
			reason,
			previousBuild: this._computeBuilds.get( computeNode )
		} );

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

		if ( info.material === undefined ) return;

		const pendingInvalidations = this._pendingInvalidations.get( info.material );

		if ( pendingInvalidations !== undefined ) {

			for ( const event of pendingInvalidations ) {

				event.buildInfo = info;

			}

		}

	}

	flushPendingInvalidations( info ) {

		if ( info.material === undefined ) return;

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

		if ( this._nodes !== null && this._originalGetForCompute !== null ) {

			this._nodes.getForCompute = this._originalGetForCompute;

		}

		if ( this._nodes !== null && this._originalGetForRender !== null ) {

			this._nodes.getForRender = this._originalGetForRender;

		}

		if ( this._pipelines !== null && this._originalPipelinesGetForRender !== null ) {

			this._pipelines.getForRender = this._originalPipelinesGetForRender;

		}

		if ( this._pipelines !== null && this._originalGetRenderPipeline !== null ) {

			this._pipelines._getRenderPipeline = this._originalGetRenderPipeline;

		}

		this._objects = null;
		this._originalGet = null;
		this._nodes = null;
		this._pipelines = null;
		this._originalNeedsRefresh = null;
		this._originalGetForRender = null;
		this._originalGetForCompute = null;
		this._originalPipelinesGetForRender = null;
		this._originalGetRenderPipeline = null;
		this._computeBuilds = new WeakMap();
		this._computeInvalidations = new WeakMap();
		this._pendingInvalidations = new WeakMap();
		this._pipelineCreates = new WeakMap();

	}

}

function getComputeBuildDifference( previousBuild, computeShader ) {

	if ( previousBuild.computeShader !== computeShader ) {

		return {
			property: 'computeShader',
			previousValue: 'previous compute shader',
			value: 'changed compute shader',
			previousComputeShader: previousBuild.computeShader,
			computeShader
		};

	}

	return null;

}

const WEBGPU_PIPELINE_CACHE_KEY_PROPERTIES = [
	'material.transparent',
	'material.blending',
	'material.premultipliedAlpha',
	'material.blendSrc',
	'material.blendDst',
	'material.blendEquation',
	'material.blendSrcAlpha',
	'material.blendDstAlpha',
	'material.blendEquationAlpha',
	'material.colorWrite',
	'material.depthWrite',
	'material.depthTest',
	'material.depthFunc',
	'material.stencilWrite',
	'material.stencilFunc',
	'material.stencilFail',
	'material.stencilZFail',
	'material.stencilZPass',
	'material.stencilFuncMask',
	'material.stencilWriteMask',
	'material.side',
	'object.frontFaceCW',
	'renderContext.sampleCount',
	'renderContext.colorSpace',
	'renderContext.colorFormat',
	'renderContext.depthStencilFormat',
	'geometry.primitiveTopology',
	'geometry.cacheKey',
	'clippingContext.cacheKey'
];

function getPipelineCacheKeyDifference( previousCacheKey, cacheKey ) {

	if ( previousCacheKey === null || previousCacheKey === undefined ) {

		return {
			property: 'WebGPU render pipeline',
			previousValue: 'none',
			value: getPipelineCacheKeySummary( cacheKey )
		};

	}

	if ( cacheKey === null || cacheKey === undefined ) {

		return {
			property: 'WebGPU render pipeline',
			previousValue: getPipelineCacheKeySummary( previousCacheKey ),
			value: 'none'
		};

	}

	const previousValues = getBackendPipelineCacheKeyValues( previousCacheKey );
	const values = getBackendPipelineCacheKeyValues( cacheKey );
	const length = Math.max( previousValues.length, values.length );

	for ( let i = 0; i < length; i ++ ) {

		if ( previousValues[ i ] !== values[ i ] ) {

			return {
				property: WEBGPU_PIPELINE_CACHE_KEY_PROPERTIES[ i ] || `WebGPU render pipeline cache segment ${ i }`,
				previousValue: previousValues[ i ] || 'undefined',
				value: values[ i ] || 'undefined'
			};

		}

	}

	return {
		property: 'WebGPU render pipeline',
		previousValue: 'same cache key',
		value: getPipelineCacheKeySummary( cacheKey )
	};

}

function getPipelineCacheKeySummary( cacheKey ) {

	if ( cacheKey === null || cacheKey === undefined ) return 'none';

	const values = getBackendPipelineCacheKeyValues( cacheKey );
	const colorSpace = values[ 23 ] || 'unknown color space';
	const colorFormat = values[ 24 ] || 'unknown color format';
	const depthStencilFormat = values[ 25 ] || 'unknown depth format';
	const primitiveTopology = values[ 26 ] || 'unknown topology';
	const geometryCacheKey = getGeometryPipelineCacheKeySummary( values.slice( 27, - 1 ) );
	const clippingContextCacheKey = values[ values.length - 1 ] || 'unknown clipping';

	return `${ colorSpace}, ${ colorFormat}/${ depthStencilFormat}, ${ primitiveTopology}, geometry:${ geometryCacheKey }, clipping:${ clippingContextCacheKey }`;

}

function getGeometryPipelineCacheKeySummary( values ) {

	if ( values.length === 0 ) return 'unknown geometry';

	const attributes = [];
	let index = 0;

	while ( index < values.length ) {

		const name = values[ index ++ ];
		const size = values[ index ++ ];

		if ( name === '' || name === undefined ) continue;

		attributes.push( size !== '' && size !== undefined ? `${ name }:${ size }` : name );

	}

	return attributes.length > 0 ? attributes.join( ', ' ) : 'unknown geometry';

}

function getBackendPipelineCacheKeyValues( cacheKey ) {

	const values = String( cacheKey ).split( ',' );

	if ( values.length > WEBGPU_PIPELINE_CACHE_KEY_PROPERTIES.length ) return values.slice( 2 );

	return values;

}

export default NodeMaterialDebug;
