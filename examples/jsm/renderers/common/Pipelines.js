import DataMap from './DataMap.js';
import RenderPipeline from './RenderPipeline.js';
import ComputePipeline from './ComputePipeline.js';
import ProgrammableStage from './ProgrammableStage.js';

class Pipelines extends DataMap {

	constructor( backend, nodes ) {

		super();

		this.backend = backend;
		this.nodes = nodes;

		this.bindings = null; // set by the bindings

		this.caches = new Map();
		this.programs = {
			vertex: new Map(),
			fragment: new Map(),
			compute: new Map()
		};

	}

	getForCompute( computeNode ) {

		const { backend } = this;

		const data = this.get( computeNode );

		if ( data.pipeline === undefined ) {

			// release previous cache

			const previousPipeline = this._releasePipeline( computeNode );

			// get shader

			const nodeBuilder = this.nodes.getForCompute( computeNode );

			// programmable stage

			let stageCompute = this.programs.compute.get( nodeBuilder.computeShader );

			if ( stageCompute === undefined ) {

				if ( previousPipeline ) this._releaseProgram( previousPipeline.computeShader );

				stageCompute = new ProgrammableStage( nodeBuilder.computeShader, 'compute' );
				this.programs.compute.set( nodeBuilder.computeShader, stageCompute );

				backend.createProgram( stageCompute );

			}

			// determine compute pipeline

			const pipeline = this._getComputePipeline( stageCompute );

			// keep track of all used times

			pipeline.usedTimes ++;
			stageCompute.usedTimes ++;

			//

			data.pipeline = pipeline;

		}

		return data.pipeline;

	}

	getForRender( renderObject ) {

		const { backend } = this;

		const data = this.get( renderObject );

		if ( this._needsUpdate( renderObject ) ) {

			// release previous cache

			const previousPipeline = this._releasePipeline( renderObject );

			// get shader

			const nodeBuilder = this.nodes.getForRender( renderObject );

			// programmable stages

			let stageVertex = this.programs.vertex.get( nodeBuilder.vertexShader );

			if ( stageVertex === undefined ) {

				if ( previousPipeline ) this._releaseProgram( previousPipeline.vertexProgram );

				stageVertex = new ProgrammableStage( nodeBuilder.vertexShader, 'vertex' );
				this.programs.vertex.set( nodeBuilder.vertexShader, stageVertex );

				backend.createProgram( stageVertex );

			}

			let stageFragment = this.programs.fragment.get( nodeBuilder.fragmentShader );

			if ( stageFragment === undefined ) {

				if ( previousPipeline ) this._releaseProgram( previousPipeline.fragmentShader );

				stageFragment = new ProgrammableStage( nodeBuilder.fragmentShader, 'fragment' );
				this.programs.fragment.set( nodeBuilder.fragmentShader, stageFragment );

				backend.createProgram( stageFragment );

			}

			// determine render pipeline

			const pipeline = this._getRenderPipeline( renderObject, stageVertex, stageFragment );

			// keep track of all used times

			pipeline.usedTimes ++;
			stageVertex.usedTimes ++;
			stageFragment.usedTimes ++;

			//

			data.pipeline = pipeline;

		}

		return data.pipeline;

	}

	delete( object ) {

		const pipeline = this._releasePipeline( object );

		if ( pipeline && pipeline.usedTimes === 0 ) {

			if ( pipeline.isComputePipeline ) {

				this._releaseProgram( pipeline.computeProgram );

			} else {

				this._releaseProgram( pipeline.vertexProgram );
				this._releaseProgram( pipeline.fragmentProgram );

			}

		}

		super.delete( object );

	}

	dispose() {

		super.dispose();

		this.caches = new Map();
		this.programs = {
			vertex: new Map(),
			fragment: new Map(),
			compute: new Map()
		};

	}

	_getComputePipeline( stageCompute ) {

		// check for existing pipeline

		const cacheKey = 'compute:' + stageCompute.id;

		let pipeline = this.caches.get( cacheKey );

		if ( pipeline === undefined ) {

			pipeline = new ComputePipeline( cacheKey, stageCompute );

			this.caches.set( cacheKey, pipeline );

			this.backend.createComputePipeline( pipeline );

		}

		return pipeline;

	}

	_getRenderPipeline( renderObject, stageVertex, stageFragment ) {

		// check for existing pipeline

		const cacheKey = this._getRenderCacheKey( renderObject, stageVertex, stageFragment );

		let pipeline = this.caches.get( cacheKey );

		if ( pipeline === undefined ) {

			pipeline = new RenderPipeline( cacheKey, stageVertex, stageFragment );

			this.caches.set( cacheKey, pipeline );

			renderObject.pipeline = pipeline;

			this.backend.createRenderPipeline( renderObject );

		} else {

			// assign a shared pipeline to renderObject

			renderObject.pipeline = pipeline;

		}

		return pipeline;

	}

	_getRenderCacheKey( renderObject, stageVertex, stageFragment ) {

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

	_releasePipeline( object ) {

		const pipeline = this.get( object ).pipeline;

		//this.bindings.delete( object );

		if ( pipeline && -- pipeline.usedTimes === 0 ) {

			this.caches.delete( pipeline.cacheKey );

		}

		return pipeline;

	}

	_releaseProgram( program ) {

		if ( -- program.usedTimes === 0 ) {

			const code = program.code;
			const stage = program.stage;

			this.programs[ stage ].delete( code );

		}

	}

	_needsUpdate( renderObject ) {

		const data = this.get( renderObject );
		const material = renderObject.material;

		let needsUpdate = this.backend.needsUpdate( renderObject );

		// check material state

		if ( data.material !== material || data.materialVersion !== material.version ||
			data.transparent !== material.transparent || data.blending !== material.blending || data.premultipliedAlpha !== material.premultipliedAlpha ||
			data.blendSrc !== material.blendSrc || data.blendDst !== material.blendDst || data.blendEquation !== material.blendEquation ||
			data.blendSrcAlpha !== material.blendSrcAlpha || data.blendDstAlpha !== material.blendDstAlpha || data.blendEquationAlpha !== material.blendEquationAlpha ||
			data.colorWrite !== material.colorWrite ||
			data.depthWrite !== material.depthWrite || data.depthTest !== material.depthTest || data.depthFunc !== material.depthFunc ||
			data.stencilWrite !== material.stencilWrite || data.stencilFunc !== material.stencilFunc ||
			data.stencilFail !== material.stencilFail || data.stencilZFail !== material.stencilZFail || data.stencilZPass !== material.stencilZPass ||
			data.stencilFuncMask !== material.stencilFuncMask || data.stencilWriteMask !== material.stencilWriteMask ||
			data.side !== material.side
		) {

			data.material = material; data.materialVersion = material.version;
			data.transparent = material.transparent; data.blending = material.blending; data.premultipliedAlpha = material.premultipliedAlpha;
			data.blendSrc = material.blendSrc; data.blendDst = material.blendDst; data.blendEquation = material.blendEquation;
			data.blendSrcAlpha = material.blendSrcAlpha; data.blendDstAlpha = material.blendDstAlpha; data.blendEquationAlpha = material.blendEquationAlpha;
			data.colorWrite = material.colorWrite;
			data.depthWrite = material.depthWrite; data.depthTest = material.depthTest; data.depthFunc = material.depthFunc;
			data.stencilWrite = material.stencilWrite; data.stencilFunc = material.stencilFunc;
			data.stencilFail = material.stencilFail; data.stencilZFail = material.stencilZFail; data.stencilZPass = material.stencilZPass;
			data.stencilFuncMask = material.stencilFuncMask; data.stencilWriteMask = material.stencilWriteMask;
			data.side = material.side;

			needsUpdate = true;

		}

		return needsUpdate || data.pipeline !== undefined;

	}

}

export default Pipelines;
