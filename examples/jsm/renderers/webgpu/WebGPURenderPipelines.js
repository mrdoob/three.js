import WebGPURenderPipeline from './WebGPURenderPipeline.js';
import WebGPUProgrammableStage from './WebGPUProgrammableStage.js';

class WebGPURenderPipelines {

	constructor( device, nodes, utils ) {

		this.device = device;
		this.nodes = nodes;
		this.utils = utils;

		this.bindings = null;

		this.pipelines = [];
		this.cache = new WeakMap();

		this.stages = {
			vertex: new Map(),
			fragment: new Map()
		};

	}

	get( renderObject ) {

		const device = this.device;
		const cache = this._getCache( renderObject );

		let currentPipeline = cache.currentPipeline;

		if ( this._needsUpdate( renderObject ) ) {

			// release previous cache

			this._releasePipeline( renderObject );

			// get shader

			const nodeBuilder = this.nodes.get( renderObject );

			// programmable stages

			let stageVertex = this.stages.vertex.get( nodeBuilder.vertexShader );

			if ( stageVertex === undefined ) {

				stageVertex = new WebGPUProgrammableStage( device, nodeBuilder.vertexShader, 'vertex' );
				this.stages.vertex.set( nodeBuilder.vertexShader, stageVertex );

			}

			let stageFragment = this.stages.fragment.get( nodeBuilder.fragmentShader );

			if ( stageFragment === undefined ) {

				stageFragment = new WebGPUProgrammableStage( device, nodeBuilder.fragmentShader, 'fragment' );
				this.stages.fragment.set( nodeBuilder.fragmentShader, stageFragment );

			}

			// determine render pipeline

			currentPipeline = this._acquirePipeline( stageVertex, stageFragment, renderObject );
			cache.currentPipeline = currentPipeline;

			// keep track of all used times

			currentPipeline.usedTimes ++;
			stageVertex.usedTimes ++;
			stageFragment.usedTimes ++;

		}

		return currentPipeline;

	}

	remove( renderObject ) {

		this._releasePipeline( renderObject );

	}

	dispose() {

		this.pipelines = [];
		this.cache = new WeakMap();
		this.shaderModules = {
			vertex: new Map(),
			fragment: new Map()
		};

	}

	_acquirePipeline( stageVertex, stageFragment, renderObject ) {

		let pipeline;
		const pipelines = this.pipelines;

		// check for existing pipeline

		const cacheKey = this._computeCacheKey( stageVertex, stageFragment, renderObject );

		for ( let i = 0, il = pipelines.length; i < il; i ++ ) {

			const preexistingPipeline = pipelines[ i ];

			if ( preexistingPipeline.cacheKey === cacheKey ) {

				pipeline = preexistingPipeline;
				break;

			}

		}

		if ( pipeline === undefined ) {

			pipeline = new WebGPURenderPipeline( this.device, this.utils );
			pipeline.init( cacheKey, stageVertex, stageFragment, renderObject, this.nodes.get( renderObject ) );

			pipelines.push( pipeline );

		}

		return pipeline;

	}

	_computeCacheKey( stageVertex, stageFragment, renderObject ) {

		const { object, material } = renderObject;
		const utils = this.utils;

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
			utils.getSampleCount(),
			utils.getCurrentColorSpace(), utils.getCurrentColorFormat(), utils.getCurrentDepthStencilFormat(),
			utils.getPrimitiveTopology( object, material )
		];

		return parameters.join();

	}

	_getCache( renderObject ) {

		let cache = this.cache.get( renderObject );

		if ( cache === undefined ) {

			cache = {};
			this.cache.set( renderObject, cache );

		}

		return cache;

	}

	_releasePipeline( renderObject ) {

		const cache = this._getCache( renderObject );

		const pipeline = cache.currentPipeline;
		delete cache.currentPipeline;

		this.bindings.remove( renderObject );

		if ( pipeline && -- pipeline.usedTimes === 0 ) {

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

	_needsUpdate( renderObject ) {

		const cache = this._getCache( renderObject );
		const material = renderObject.material;

		let needsUpdate = false;

		// check pipeline state

		if ( cache.currentPipeline === undefined ) needsUpdate = true;

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

		const utils = this.utils;

		const sampleCount = utils.getSampleCount();
		const colorSpace = utils.getCurrentColorSpace();
		const colorFormat = utils.getCurrentColorFormat();
		const depthStencilFormat = utils.getCurrentDepthStencilFormat();

		if ( cache.sampleCount !== sampleCount || cache.colorSpace !== colorSpace ||
			cache.colorFormat !== colorFormat || cache.depthStencilFormat !== depthStencilFormat ) {

			cache.sampleCount = sampleCount;
			cache.colorSpace = colorSpace;
			cache.colorFormat = colorFormat;
			cache.depthStencilFormat = depthStencilFormat;

			needsUpdate = true;

		}

		return needsUpdate;

	}

}

export default WebGPURenderPipelines;
