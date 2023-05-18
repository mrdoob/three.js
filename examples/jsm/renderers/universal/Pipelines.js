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

		this.pipelines = new Map();
		this.programs = {
			vertex: new Map(),
			fragment: new Map(),
			compute: new Map()
		};

	}

	has( object ) {

		return this.pipelines.get( object ) !== undefined;

	}

	getForCompute( computeNode ) {

		const { backend } = this;

		let data = this.get( computeNode );

		if ( data.pipeline === undefined ) {

			// release previous cache

			this._releasePipeline( computeNode );

			// get shader

			const nodeBuilder = this.nodes.getForCompute( computeNode );

			// programmable stage

			let stageCompute = this.programs.compute.get( nodeBuilder.computeShader );

			if ( stageCompute === undefined ) {

				stageCompute = new ProgrammableStage( nodeBuilder.computeShader, 'compute' );
				this.programs.compute.set( nodeBuilder.computeShader, stageCompute );

				backend.createProgram( stageCompute );

			}

			// determine compute pipeline

			const pipeline = this._getComputePipeline( computeNode, stageCompute );

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

		let data = this.get( renderObject );

		if ( this._needsUpdate( renderObject ) ) {

			// release previous cache

			this._releasePipeline( renderObject );

			// get shader

			const nodeBuilder = this.nodes.getForRender( renderObject );

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

	remove( object ) {

		this._releasePipeline( object );

	}

	dispose() {

		super.dispose();

		this.pipelines = new Map();
		this.shaderModules = {
			vertex: new Map(),
			fragment: new Map(),
			compute: new Map()
		};

	}

	_getComputePipeline( computeNode, stageCompute ) {

		// check for existing pipeline

		const cacheKey = 'compute:' + stageCompute.id;

		let pipeline = this.pipelines.get( cacheKey );

		if ( pipeline === undefined ) {

			pipeline = new ComputePipeline( cacheKey, stageCompute );
			this.pipelines.set( cacheKey, computeNode );
			this.pipelines.set( computeNode, pipeline );

			this.backend.createComputePipeline( pipeline );

		}

		return pipeline;

	}

	_getRenderPipeline( renderObject, stageVertex, stageFragment ) {

		// check for existing pipeline

		const cacheKey = this._getRenderCacheKey( renderObject, stageVertex, stageFragment );

		let pipeline = this.pipelines.get( cacheKey );

		if ( pipeline === undefined ) {

			pipeline = new RenderPipeline( cacheKey, stageVertex, stageFragment );
			this.pipelines.set( cacheKey, pipeline );
			this.pipelines.set( pipeline, cacheKey );

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

		const data = this.get( object );

		const pipeline = data.pipeline;
		delete data.pipeline;

		this.bindings.delete( object );

		if ( pipeline && -- pipeline.usedTimes === 0 ) {

			const cacheKey = this.pipelines.get( pipeline );

			this.pipelines.delete( cacheKey );
			this.pipelines.delete( pipeline );

			if ( pipeline.isComputePipeline ) {

				this._releaseProgram( pipeline.computeProgram );

			} else {

				this._releaseProgram( pipeline.vertexProgram );
				this._releaseProgram( pipeline.fragmentProgram );

			}

		}

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
