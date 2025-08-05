import DataMap from './DataMap.js';
import RenderPipeline from './RenderPipeline.js';
import ComputePipeline from './ComputePipeline.js';
import ProgrammableStage from './ProgrammableStage.js';

/**
 * This renderer module manages the pipelines of the renderer.
 *
 * @private
 * @augments DataMap
 */
class Pipelines extends DataMap {

	/**
	 * Constructs a new pipeline management component.
	 *
	 * @param {Backend} backend - The renderer's backend.
	 * @param {Nodes} nodes - Renderer component for managing nodes related logic.
	 */
	constructor( backend, nodes ) {

		super();

		/**
		 * The renderer's backend.
		 *
		 * @type {Backend}
		 */
		this.backend = backend;

		/**
		 * Renderer component for managing nodes related logic.
		 *
		 * @type {Nodes}
		 */
		this.nodes = nodes;

		/**
		 * A references to the bindings management component.
		 * This reference will be set inside the `Bindings`
		 * constructor.
		 *
		 * @type {?Bindings}
		 * @default null
		 */
		this.bindings = null;

		/**
		 * Internal cache for maintaining pipelines.
		 * The key of the map is a cache key, the value the pipeline.
		 *
		 * @type {Map<string,Pipeline>}
		 */
		this.caches = new Map();

		/**
		 * This dictionary maintains for each shader stage type (vertex,
		 * fragment and compute) the programmable stage objects which
		 * represent the actual shader code.
		 *
		 * @type {Object<string,Map>}
		 */
		this.programs = {
			vertex: new Map(),
			fragment: new Map(),
			compute: new Map()
		};

	}

	/**
	 * Returns a compute pipeline for the given compute node.
	 *
	 * @param {Node} computeNode - The compute node.
	 * @param {Array<BindGroup>} bindings - The bindings.
	 * @return {ComputePipeline} The compute pipeline.
	 */
	getForCompute( computeNode, bindings ) {

		const { backend } = this;

		const data = this.get( computeNode );

		if ( this._needsComputeUpdate( computeNode ) ) {

			const previousPipeline = data.pipeline;

			if ( previousPipeline ) {

				previousPipeline.usedTimes --;
				previousPipeline.computeProgram.usedTimes --;

			}

			// get shader

			const nodeBuilderState = this.nodes.getForCompute( computeNode );

			// programmable stage

			let stageCompute = this.programs.compute.get( nodeBuilderState.computeShader );

			if ( stageCompute === undefined ) {

				if ( previousPipeline && previousPipeline.computeProgram.usedTimes === 0 ) this._releaseProgram( previousPipeline.computeProgram );

				stageCompute = new ProgrammableStage( nodeBuilderState.computeShader, 'compute', computeNode.name, nodeBuilderState.transforms, nodeBuilderState.nodeAttributes );
				this.programs.compute.set( nodeBuilderState.computeShader, stageCompute );

				backend.createProgram( stageCompute );

			}

			// determine compute pipeline

			const cacheKey = this._getComputeCacheKey( computeNode, stageCompute );

			let pipeline = this.caches.get( cacheKey );

			if ( pipeline === undefined ) {

				if ( previousPipeline && previousPipeline.usedTimes === 0 ) this._releasePipeline( previousPipeline );

				pipeline = this._getComputePipeline( computeNode, stageCompute, cacheKey, bindings );

			}

			// keep track of all used times

			pipeline.usedTimes ++;
			stageCompute.usedTimes ++;

			//

			data.version = computeNode.version;
			data.pipeline = pipeline;

		}

		return data.pipeline;

	}

	/**
	 * Returns a render pipeline for the given render object.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 * @param {?Array<Promise>} [promises=null] - An array of compilation promises which is only relevant in context of `Renderer.compileAsync()`.
	 * @return {RenderPipeline} The render pipeline.
	 */
	getForRender( renderObject, promises = null ) {

		const { backend } = this;

		const data = this.get( renderObject );

		if ( this._needsRenderUpdate( renderObject ) ) {

			const previousPipeline = data.pipeline;

			if ( previousPipeline ) {

				previousPipeline.usedTimes --;
				previousPipeline.vertexProgram.usedTimes --;
				previousPipeline.fragmentProgram.usedTimes --;

			}

			// get shader

			const nodeBuilderState = renderObject.getNodeBuilderState();

			const name = renderObject.material ? renderObject.material.name : '';

			// programmable stages

			let stageVertex = this.programs.vertex.get( nodeBuilderState.vertexShader );

			if ( stageVertex === undefined ) {

				if ( previousPipeline && previousPipeline.vertexProgram.usedTimes === 0 ) this._releaseProgram( previousPipeline.vertexProgram );

				stageVertex = new ProgrammableStage( nodeBuilderState.vertexShader, 'vertex', name );
				this.programs.vertex.set( nodeBuilderState.vertexShader, stageVertex );

				backend.createProgram( stageVertex );

			}

			let stageFragment = this.programs.fragment.get( nodeBuilderState.fragmentShader );

			if ( stageFragment === undefined ) {

				if ( previousPipeline && previousPipeline.fragmentProgram.usedTimes === 0 ) this._releaseProgram( previousPipeline.fragmentProgram );

				stageFragment = new ProgrammableStage( nodeBuilderState.fragmentShader, 'fragment', name );
				this.programs.fragment.set( nodeBuilderState.fragmentShader, stageFragment );

				backend.createProgram( stageFragment );

			}

			// determine render pipeline

			const cacheKey = this._getRenderCacheKey( renderObject, stageVertex, stageFragment );

			let pipeline = this.caches.get( cacheKey );

			if ( pipeline === undefined ) {

				if ( previousPipeline && previousPipeline.usedTimes === 0 ) this._releasePipeline( previousPipeline );

				pipeline = this._getRenderPipeline( renderObject, stageVertex, stageFragment, cacheKey, promises );

			} else {

				renderObject.pipeline = pipeline;

			}

			// keep track of all used times

			pipeline.usedTimes ++;
			stageVertex.usedTimes ++;
			stageFragment.usedTimes ++;

			//

			data.pipeline = pipeline;

		}

		return data.pipeline;

	}

	/**
	 * Deletes the pipeline for the given render object.
	 *
	 * @param {RenderObject} object - The render object.
	 * @return {?Object} The deleted dictionary.
	 */
	delete( object ) {

		const pipeline = this.get( object ).pipeline;

		if ( pipeline ) {

			// pipeline

			pipeline.usedTimes --;

			if ( pipeline.usedTimes === 0 ) this._releasePipeline( pipeline );

			// programs

			if ( pipeline.isComputePipeline ) {

				pipeline.computeProgram.usedTimes --;

				if ( pipeline.computeProgram.usedTimes === 0 ) this._releaseProgram( pipeline.computeProgram );

			} else {

				pipeline.fragmentProgram.usedTimes --;
				pipeline.vertexProgram.usedTimes --;

				if ( pipeline.vertexProgram.usedTimes === 0 ) this._releaseProgram( pipeline.vertexProgram );
				if ( pipeline.fragmentProgram.usedTimes === 0 ) this._releaseProgram( pipeline.fragmentProgram );

			}

		}

		return super.delete( object );

	}

	/**
	 * Frees internal resources.
	 */
	dispose() {

		super.dispose();

		this.caches = new Map();
		this.programs = {
			vertex: new Map(),
			fragment: new Map(),
			compute: new Map()
		};

	}

	/**
	 * Updates the pipeline for the given render object.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 */
	updateForRender( renderObject ) {

		this.getForRender( renderObject );

	}

	/**
	 * Returns a compute pipeline for the given parameters.
	 *
	 * @private
	 * @param {Node} computeNode - The compute node.
	 * @param {ProgrammableStage} stageCompute - The programmable stage representing the compute shader.
	 * @param {string} cacheKey - The cache key.
	 * @param {Array<BindGroup>} bindings - The bindings.
	 * @return {ComputePipeline} The compute pipeline.
	 */
	_getComputePipeline( computeNode, stageCompute, cacheKey, bindings ) {

		// check for existing pipeline

		cacheKey = cacheKey || this._getComputeCacheKey( computeNode, stageCompute );

		let pipeline = this.caches.get( cacheKey );

		if ( pipeline === undefined ) {

			pipeline = new ComputePipeline( cacheKey, stageCompute );

			this.caches.set( cacheKey, pipeline );

			this.backend.createComputePipeline( pipeline, bindings );

		}

		return pipeline;

	}

	/**
	 * Returns a render pipeline for the given parameters.
	 *
	 * @private
	 * @param {RenderObject} renderObject - The render object.
	 * @param {ProgrammableStage} stageVertex - The programmable stage representing the vertex shader.
	 * @param {ProgrammableStage} stageFragment - The programmable stage representing the fragment shader.
	 * @param {string} cacheKey - The cache key.
	 * @param {?Array<Promise>} promises - An array of compilation promises which is only relevant in context of `Renderer.compileAsync()`.
	 * @return {ComputePipeline} The compute pipeline.
	 */
	_getRenderPipeline( renderObject, stageVertex, stageFragment, cacheKey, promises ) {

		// check for existing pipeline

		cacheKey = cacheKey || this._getRenderCacheKey( renderObject, stageVertex, stageFragment );

		let pipeline = this.caches.get( cacheKey );

		if ( pipeline === undefined ) {

			pipeline = new RenderPipeline( cacheKey, stageVertex, stageFragment );

			this.caches.set( cacheKey, pipeline );

			renderObject.pipeline = pipeline;

			// The `promises` array is `null` by default and only set to an empty array when
			// `Renderer.compileAsync()` is used. The next call actually fills the array with
			// pending promises that resolve when the render pipelines are ready for rendering.

			this.backend.createRenderPipeline( renderObject, promises );

		}

		return pipeline;

	}

	/**
	 * Computes a cache key representing a compute pipeline.
	 *
	 * @private
	 * @param {Node} computeNode - The compute node.
	 * @param {ProgrammableStage} stageCompute - The programmable stage representing the compute shader.
	 * @return {string} The cache key.
	 */
	_getComputeCacheKey( computeNode, stageCompute ) {

		return computeNode.id + ',' + stageCompute.id;

	}

	/**
	 * Computes a cache key representing a render pipeline.
	 *
	 * @private
	 * @param {RenderObject} renderObject - The render object.
	 * @param {ProgrammableStage} stageVertex - The programmable stage representing the vertex shader.
	 * @param {ProgrammableStage} stageFragment - The programmable stage representing the fragment shader.
	 * @return {string} The cache key.
	 */
	_getRenderCacheKey( renderObject, stageVertex, stageFragment ) {

		return stageVertex.id + ',' + stageFragment.id + ',' + this.backend.getRenderCacheKey( renderObject );

	}

	/**
	 * Releases the given pipeline.
	 *
	 * @private
	 * @param {Pipeline} pipeline - The pipeline to release.
	 */
	_releasePipeline( pipeline ) {

		this.caches.delete( pipeline.cacheKey );

	}

	/**
	 * Releases the shader program.
	 *
	 * @private
	 * @param {Object} program - The shader program to release.
	 */
	_releaseProgram( program ) {

		const code = program.code;
		const stage = program.stage;

		this.programs[ stage ].delete( code );

	}

	/**
	 * Returns `true` if the compute pipeline for the given compute node requires an update.
	 *
	 * @private
	 * @param {Node} computeNode - The compute node.
	 * @return {boolean} Whether the compute pipeline for the given compute node requires an update or not.
	 */
	_needsComputeUpdate( computeNode ) {

		const data = this.get( computeNode );

		return data.pipeline === undefined || data.version !== computeNode.version;

	}

	/**
	 * Returns `true` if the render pipeline for the given render object requires an update.
	 *
	 * @private
	 * @param {RenderObject} renderObject - The render object.
	 * @return {boolean} Whether the render object for the given render object requires an update or not.
	 */
	_needsRenderUpdate( renderObject ) {

		const data = this.get( renderObject );

		return data.pipeline === undefined || this.backend.needsRenderUpdate( renderObject );

	}

}

export default Pipelines;
