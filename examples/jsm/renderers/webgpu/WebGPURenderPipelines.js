import WebGPURenderPipeline from './WebGPURenderPipeline.js';
import WebGPUProgrammableStage from './WebGPUProgrammableStage.js';

class WebGPURenderPipelines {

	constructor( renderer, properties, device, glslang, sampleCount, nodes ) {

		this.renderer = renderer;
		this.properties = properties;
		this.device = device;
		this.glslang = glslang;
		this.sampleCount = sampleCount;
		this.nodes = nodes;

		this.pipelines = [];
		this.objectCache = new WeakMap();

		this.stages = {
			vertex: new Map(),
			fragment: new Map()
		};

	}

	get( object ) {

		const device = this.device;
		const glslang = this.glslang;
		const properties = this.properties;

		const material = object.material;
		const materialProperties = properties.get( material );

		const cache = this._getCache( object );

		let currentPipeline;

		if ( this._needsUpdate( object, cache ) ) {

			// get shader

			const nodeBuilder = this.nodes.get( object );

			// programmable stages

			let stageVertex = this.stages.vertex.get( nodeBuilder.vertexShader );

			if ( stageVertex === undefined ) {

				stageVertex = new WebGPUProgrammableStage( device, glslang, nodeBuilder.vertexShader, 'vertex' );
				this.stages.vertex.set( nodeBuilder.vertexShader, stageVertex );

			}

			let stageFragment = this.stages.fragment.get( nodeBuilder.fragmentShader );

			if ( stageFragment === undefined ) {

				stageFragment = new WebGPUProgrammableStage( device, glslang, nodeBuilder.fragmentShader, 'fragment' );
				this.stages.fragment.set( nodeBuilder.fragmentShader, stageFragment );

			}

			// determine render pipeline

			currentPipeline = this._acquirePipeline( stageVertex, stageFragment, object, nodeBuilder );
			cache.currentPipeline = currentPipeline;

			// keep track of all pipelines which are used by a material

			let materialPipelines = materialProperties.pipelines;

			if ( materialPipelines === undefined ) {

				materialPipelines = new Set();
				materialProperties.pipelines = materialPipelines;

			}

			if ( materialPipelines.has( currentPipeline ) === false ) {

				materialPipelines.add( currentPipeline );

				currentPipeline.usedTimes ++;
				stageVertex.usedTimes ++;
				stageFragment.usedTimes ++;

			}

			// dispose

			if ( materialProperties.disposeCallback === undefined ) {

				const disposeCallback = onMaterialDispose.bind( this );
				materialProperties.disposeCallback = disposeCallback;

				material.addEventListener( 'dispose', disposeCallback );

			}

		} else {

			currentPipeline = cache.currentPipeline;

		}

		return currentPipeline;

	}

	dispose() {

		this.pipelines = [];
		this.objectCache = new WeakMap();
		this.shaderModules = {
			vertex: new Map(),
			fragment: new Map()
		};

	}

	_acquirePipeline( stageVertex, stageFragment, object, nodeBuilder ) {

		let pipeline;
		const pipelines = this.pipelines;

		// check for existing pipeline

		const cacheKey = this._computeCacheKey( stageVertex, stageFragment, object );

		for ( let i = 0, il = pipelines.length; i < il; i ++ ) {

			const preexistingPipeline = pipelines[ i ];

			if ( preexistingPipeline.cacheKey === cacheKey ) {

				pipeline = preexistingPipeline;
				break;

			}

		}

		if ( pipeline === undefined ) {

			pipeline = new WebGPURenderPipeline( this.device, this.renderer, this.sampleCount );
			pipeline.init( cacheKey, stageVertex, stageFragment, object, nodeBuilder );

			pipelines.push( pipeline );

		}

		return pipeline;

	}

	_computeCacheKey( stageVertex, stageFragment, object ) {

		const material = object.material;
		const renderer = this.renderer;

		const parameters = [
			stageVertex.id, stageFragment.id,
			material.transparent, material.blending, material.premultipliedAlpha,
			material.blendSrc, material.blendDst, material.blendEquation,
			material.blendSrcAlpha, material.blendDstAlpha, material.blendEquationAlpha,
			material.colorWrite,
			material.depthWrite, material.depthTest, material.depthFunc,
			material.stencilWrite, material.stencilFunc,
			material.stencilFail, material.stencilZFail, material.stencilZPass,
			material.stencilFuncMask, material.stencilWriteMask,
			material.side,
			this.sampleCount,
			renderer.getCurrentEncoding(), renderer.getCurrentColorFormat(), renderer.getCurrentDepthStencilFormat()
		];

		return parameters.join();

	}

	_getCache( object ) {

		let cache = this.objectCache.get( object );

		if ( cache === undefined ) {

			cache = {};
			this.objectCache.set( object, cache );

		}

		return cache;

	}

	_releasePipeline( pipeline ) {

		if ( -- pipeline.usedTimes === 0 ) {

			const pipelines = this.pipelines;

			const i = pipelines.indexOf( pipeline );
			pipelines[ i ] = pipelines[ pipelines.length - 1 ];
			pipelines.pop();

			this._releaseStage( pipeline.stageVertex );
			this._releaseStage( pipeline.stageFragment );

		}

	}

	_releaseStage( stage ) {

		if ( -- stage.usedTimes === 0 ) {

			const code = stage.code;
			const type = stage.type;

			this.stages[ type ].delete( code );

		}

	}

	_needsUpdate( object, cache ) {

		const material = object.material;

		let needsUpdate = false;

		// check material state

		if ( cache.material !== material || cache.materialVersion !== material.version ||
			cache.transparent !== material.transparent || cache.blending !== material.blending || cache.premultipliedAlpha !== material.premultipliedAlpha ||
			cache.blendSrc !== material.blendSrc || cache.blendDst !== material.blendDst || cache.blendEquation !== material.blendEquation ||
			cache.blendSrcAlpha !== material.blendSrcAlpha || cache.blendDstAlpha !== material.blendDstAlpha || cache.blendEquationAlpha !== material.blendEquationAlpha ||
			cache.colorWrite !== material.colorWrite ||
			cache.depthWrite !== material.depthWrite || cache.depthTest !== material.depthTest || cache.depthFunc !== material.depthFunc ||
			cache.stencilWrite !== material.stencilWrite || cache.stencilFunc !== material.stencilFunc ||
			cache.stencilFail !== material.stencilFail || cache.stencilZFail !== material.stencilZFail || cache.stencilZPass !== material.stencilZPass ||
			cache.stencilFuncMask !== material.stencilFuncMask || cache.stencilWriteMask !== material.stencilWriteMask ||
			cache.side !== material.side
		) {

			cache.material = material; cache.materialVersion = material.version;
			cache.transparent = material.transparent; cache.blending = material.blending; cache.premultipliedAlpha = material.premultipliedAlpha;
			cache.blendSrc = material.blendSrc; cache.blendDst = material.blendDst; cache.blendEquation = material.blendEquation;
			cache.blendSrcAlpha = material.blendSrcAlpha; cache.blendDstAlpha = material.blendDstAlpha; cache.blendEquationAlpha = material.blendEquationAlpha;
			cache.colorWrite = material.colorWrite;
			cache.depthWrite = material.depthWrite; cache.depthTest = material.depthTest; cache.depthFunc = material.depthFunc;
			cache.stencilWrite = material.stencilWrite; cache.stencilFunc = material.stencilFunc;
			cache.stencilFail = material.stencilFail; cache.stencilZFail = material.stencilZFail; cache.stencilZPass = material.stencilZPass;
			cache.stencilFuncMask = material.stencilFuncMask; cache.stencilWriteMask = material.stencilWriteMask;
			cache.side = material.side;

			needsUpdate = true;

		}

		// check renderer state

		const renderer = this.renderer;

		const encoding = renderer.getCurrentEncoding();
		const colorFormat = renderer.getCurrentColorFormat();
		const depthStencilFormat = renderer.getCurrentDepthStencilFormat();

		if ( cache.sampleCount !== this.sampleCount || cache.encoding !== encoding ||
			cache.colorFormat !== colorFormat || cache.depthStencilFormat !== depthStencilFormat ) {

			cache.sampleCount = this.sampleCount;
			cache.encoding = encoding;
			cache.colorFormat = colorFormat;
			cache.depthStencilFormat = depthStencilFormat;

			needsUpdate = true;

		}

		return needsUpdate;

	}

}

function onMaterialDispose( event ) {

	const properties = this.properties;

	const material = event.target;
	const materialProperties = properties.get( material );

	material.removeEventListener( 'dispose', materialProperties.disposeCallback );

	properties.remove( material );

	// remove references to pipelines

	const pipelines = materialProperties.pipelines;

	if ( pipelines !== undefined ) {

		for ( const pipeline of pipelines ) {

			this._releasePipeline( pipeline );

		}

	}

}

export default WebGPURenderPipelines;
