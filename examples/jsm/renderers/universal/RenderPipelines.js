import RenderPipeline from './RenderPipeline.js';
import ProgrammableStage from './ProgrammableStage.js';

class RenderPipelines {

	constructor( backend, device, nodes, utils ) {

		this.backend = backend;
		this.device = device;
		this.nodes = nodes;
		this.utils = utils;

		this.bindings = null;

		this.pipelines = [];
		this.cache = new WeakMap();

		this.programs = {
			vertex: new Map(),
			fragment: new Map()
		};

	}

	get( renderObject ) {

		const { backend, device } = this;
		const cache = this._getCache( renderObject );

		let currentPipeline = cache.currentPipeline;

		if ( this._needsUpdate( renderObject ) ) {

			// release previous cache

			this._releasePipeline( renderObject );

			// get shader

			const nodeBuilder = this.nodes.get( renderObject );

			// programmable stages

			let stageVertex = this.programs.vertex.get( nodeBuilder.vertexShader );

			if ( stageVertex === undefined ) {

				stageVertex = new ProgrammableStage( nodeBuilder.vertexShader, 'vertex' );
				this.programs.vertex.set( nodeBuilder.vertexShader, stageVertex );

				backend.createProgram( stageVertex );

			}

			let stageFragment = this.programs.fragment.get( nodeBuilder.fragmentShader );

			if ( stageFragment === undefined ) {

				stageFragment = new ProgrammableStage( nodeBuilder.fragmentShader, 'fragment' );
				this.programs.fragment.set( nodeBuilder.fragmentShader, stageFragment );

				backend.createProgram( stageFragment );

			}

			// determine render pipeline

			currentPipeline = this._acquirePipeline( renderObject, stageVertex, stageFragment );
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

	_acquirePipeline( renderObject, stageVertex, stageFragment ) {

		let pipeline;
		const pipelines = this.pipelines;

		// check for existing pipeline

		const cacheKey = this._computeCacheKey( renderObject, stageVertex, stageFragment );

		for ( let i = 0, il = pipelines.length; i < il; i ++ ) {

			const preexistingPipeline = pipelines[ i ];

			if ( preexistingPipeline.cacheKey === cacheKey ) {

				pipeline = preexistingPipeline;
				break;

			}

		}

		if ( pipeline === undefined ) {

			pipeline = new RenderPipeline( cacheKey, stageVertex, stageFragment );
			pipelines.push( pipeline );

			renderObject.pipeline = pipeline;

			this.backend.createPipeline( renderObject );

		}

		return pipeline;

	}

	_computeCacheKey( renderObject, stageVertex, stageFragment ) {

		const { material } = renderObject;

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
			this.backend.getCacheKey( renderObject )
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

			this._releaseProgram( pipeline.stageVertex );
			this._releaseProgram( pipeline.stageFragment );

		}

	}

	_releaseProgram( stage ) {

		if ( -- stage.usedTimes === 0 ) {

			const code = stage.code;
			const stage = stage.stage;

			this.programs[ stage ].delete( code );

		}

	}

	_needsUpdate( renderObject ) {

		const cache = this._getCache( renderObject );
		const material = renderObject.material;

		let needsUpdate = this.backend.needsUpdate( renderObject );

		// check pipeline state

		if ( cache.currentPipeline === undefined ) needsUpdate = true;

		// check material state

		if ( needsUpdate === true ||
			cache.material !== material || cache.materialVersion !== material.version ||
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

		return needsUpdate;

	}

}

export default RenderPipelines;
