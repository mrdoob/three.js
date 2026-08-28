import { Fn, uvec2, If, instancedArray, instanceIndex, invocationLocalIndex, Loop, workgroupArray, workgroupBarrier, workgroupId, uint, select, min, max } from 'three/tsl';

const StepType = {
	NONE: 0,
	// Swap all values within the local range of workgroupSize * 2
	SWAP_LOCAL: 1,
	DISPERSE_LOCAL: 2,
	// Swap values within global data buffer.
	FLIP_GLOBAL: 3,
	DISPERSE_GLOBAL: 4,
};


/**
 * Returns the indices that will be compared in a bitonic flip operation.
 *
 * @tsl
 * @private
 * @param {Node<uint>} index - The compute thread's invocation id.
 * @param {Node<uint>} blockHeight - The height of the block within which elements are being swapped.
 * @returns {Node<uvec2>} The indices of the elements in the data buffer being compared.
 */
export const getBitonicFlipIndices = /*@__PURE__*/ Fn( ( [ index, blockHeight ] ) => {

	const blockOffset = ( index.mul( 2 ).div( blockHeight ) ).mul( blockHeight );
	const halfHeight = blockHeight.div( 2 );
	const idx = uvec2(
		index.mod( halfHeight ),
		blockHeight.sub( index.mod( halfHeight ) ).sub( 1 )
	);
	idx.x.addAssign( blockOffset );
	idx.y.addAssign( blockOffset );

	return idx;

} ).setLayout( {
	name: 'getBitonicFlipIndices',
	type: 'uvec2',
	inputs: [
		{ name: 'index', type: 'uint' },
		{ name: 'blockHeight', type: 'uint' }
	]
} );

/**
 * Returns the indices that will be compared in a bitonic sort's disperse operation.
 *
 * @tsl
 * @private
 * @param {Node<uint>} index - The compute thread's invocation id.
 * @param {Node<uint>} swapSpan - The maximum span over which elements are being swapped.
 * @returns {Node<uvec2>} The indices of the elements in the data buffer being compared.
 */
export const getBitonicDisperseIndices = /*@__PURE__*/ Fn( ( [ index, swapSpan ] ) => {

	const blockOffset = ( ( index.mul( 2 ) ).div( swapSpan ) ).mul( swapSpan );
	const halfHeight = swapSpan.div( 2 );
	const idx = uvec2(
		index.mod( halfHeight ),
		( index.mod( halfHeight ) ).add( halfHeight )
	);

	idx.x.addAssign( blockOffset );
	idx.y.addAssign( blockOffset );

	return idx;

} ).setLayout( {
	name: 'getBitonicDisperseIndices',
	type: 'uvec2',
	inputs: [
		{ name: 'index', type: 'uint' },
		{ name: 'blockHeight', type: 'uint' }
	]
} );

export class BitonicSort {

	/**
	 * A reusable GPGPU Bitonic Sort.
	 *
	 * Each compute pass executes this.count / 2 invocations that compare two data points
	 * separated by lane counts that are decreased by a power of 2. When these spans equal the
	 * workgroupSize, data can be shared within local workgroup buffers and synchronized via
	 * workgroup barriers, allowing each read/write across spans to exist within the same pass.
	 *
	 * @param {StorageBufferNode} dataBuffer - The data buffer to sort.
	 * @param {Object} [options={}] - Options that modify the bitonic sort.
	 */
	constructor( dataBuffer, options = {} ) {

		/**
		 * A reference to the StorageBufferNode holding the data that will be sorted  .
		 *
		 * @type {StorageBufferNode}
		 */
		this.dataBuffer = dataBuffer;

		/**
		 * The size of the data.
		 *
		 * @type {number}
		 */
		this.count = dataBuffer.value.count;

		/**
		 * The maximum size of each compute dispatch.
		 *
		 * @type {number}
		 */
		this.dispatchSize = this.count / 2;

		/**
		 * The workgroup size of the compute shaders executed during the sort.
		 * For practical use cases, one can typically rely on the default workgroup size.
		 * The final value is alligned with the limits of the device when the sort is first executed.
		 *
		 * @type {number}
		*/
		this.workgroupSize = options.workgroupSize ? Math.min( this.dispatchSize, options.workgroupSize ) : this.dispatchSize;

		/**
		 * A node representing a workgroup scoped buffer that holds locally sorted elements.
		 * Created when the sort is first executed, once the workgroup size has been alligned with the device.
		 *
		 * @type {?WorkgroupInfoNode}
		 * @default null
		*/
		this.localStorage = null;

		/**
		 * A node representing a storage buffer used for transferring the result of the global sort back to the original data buffer.
		 *
		 * @type {StorageBufferNode}
		*/
		this.tempBuffer = instancedArray( this.count, dataBuffer.nodeType ).setName( 'TempStorage' );

		/**
		 * A node containing the current algorithm type, the current swap span, and the highest swap span.
		 *
		 * @type {StorageBufferNode}
		*/
		this.infoStorage = instancedArray( new Uint32Array( [ 1, 2, 2 ] ), 'uint' ).setName( 'BitonicSortInfo' );

		/**
		 * The number of distinct swap operations ('flips' and 'disperses') executed in an in-place
		 * bitonic sort of the current data buffer.
		 *
		 * @type {number}
		*/
		this.swapOpCount = this._getSwapOpCount();

		/**
		 * The number of steps (i.e prepping and/or executing a swap) needed to fully execute an in-place bitonic sort of the current data buffer.
		 * Recomputed when the sort is first executed, since it depends on the device alligned workgroup size.
		 *
		 * @type {number}
		*/
		this.stepCount = this._getStepCount();

		/**
		 * The number of the buffer being read from.
		 *
		 * @type {string}
		*/
		this.readBufferName = 'Data';

		/**
		 * An object containing compute shaders that execute a 'flip' swap within a global address space on elements in the data buffer.
		 * Created when the sort is first executed, once the workgroup size has been alligned with the device.
		 *
		 * @type {?Object<string, ComputeNode>}
		 * @default null
		*/
		this.flipGlobalNodes = null;

		/**
		 * An object containing compute shaders that execute a 'disperse' swap within a global address space on elements in the data buffer.
		 *
		 * @type {?Object<string, ComputeNode>}
		 * @default null
		*/
		this.disperseGlobalNodes = null;

		/**
		 * A compute shader that executes a sequence of flip and disperse swaps within a local address space on elements in the data buffer.
		 *
		 * @type {?ComputeNode}
		 * @default null
		*/
		this.swapLocalFn = null;

		/**
		 * A compute shader that executes a sequence of disperse swaps within a local address space on elements in the data buffer.
		 *
		 * @type {?Object<string, ComputeNode>}
		 * @default null
		*/
		this.disperseLocalNodes = null;

		// Utility functions

		/**
		 * A compute shader that sets up the algorithm and the swap span for the next swap operation.
		 *
		 * @type {?ComputeNode}
		 * @default null
		*/
		this.setAlgoFn = null;

		/**
		 * A compute shader that aligns the result of the global swap operation with the current buffer.
		 *
		 * @type {?ComputeNode}
		 * @default null
		*/
		this.alignFn = null;

		/**
		 * A function that takes a renderer and either runs the bitonic sort or uses the renderer
		 * information to generate the shaders on the initial compute dispatch.
		 *
		 * @type {function(Renderer):void}
		*/
		this.compute = this._computeInitial;

		/**
		 * A function that runs a single step of the bitonic sort.
		 *
		 * @type {function(Renderer):void}
		*/
		this.computeStep = this._computeStepInitial;

		/**
		 * A compute shader that resets the algorithm and swap span information.
		 *
		 * @type {ComputeNode}
		*/
		this.resetFn = this._getResetFn();


		/**
		 * The current compute shader dispatch within the list of dispatches needed to complete the sort.
		 *
		 * @type {number}
		*/
		this.currentDispatch = 0;

		/**
		 * The number of global swap operations that must be executed before the sort
		 * can swap in local address space.
		 *
		 * @type {number}
		*/
		this.globalOpsRemaining = 0;

		/**
		 * The total number of global operations needed to sort elements within the current swap span.
		 *
		 * @type {number}
		*/
		this.globalOpsInSpan = 0;


	}

	/**
	 * Get total number of distinct swaps that occur in a bitonic sort.
	 *
	 * @private
	 * @returns {number} - The total number of distinct swaps in a bitonic sort
	 */
	_getSwapOpCount() {

		const n = Math.log2( this.count );
		return ( n * ( n + 1 ) ) / 2;

	}

	/**
	 * Get the number of steps it takes to execute a complete bitonic sort.
	 *
	 * @private
	 * @returns {number} The number of steps it takes to execute a complete bitonic sort.
	 */
	_getStepCount() {

		const logElements = Math.log2( this.count );
		const logSwapSpan = Math.log2( this.workgroupSize * 2 );

		const numGlobalFlips = logElements - logSwapSpan;

		// Start with 1 for initial sort over all local elements
		let numSteps = 1;
		let numGlobalDisperses = 0;

		for ( let i = 1; i <= numGlobalFlips; i ++ ) {

			// Increment by the global flip that starts each global block
			numSteps += 1;
			// Increment by number of global disperses following the global flip
			numSteps += numGlobalDisperses;
			// Increment by local disperse that occurs after all global swaps are finished
			numSteps += 1;

			// Number of global disperse increases as swapSpan increases by factor of 2
			numGlobalDisperses += 1;

		}

		return numSteps;

	}

	/**
	 * Compares and swaps two data points in the data buffer within the global address space.
	 * @param {Node<uint>} idxBefore - The index of the first data element in the data buffer.
	 * @param {Node<uint>} idxAfter - The index of the second data element in the data buffer.
	 * @param {StorageBufferNode} dataBuffer - The buffer of data to read from.
	 * @param {StorageBufferNode} tempBuffer - The buffer of data to write to.
	 * @private
	 *
	 */
	_globalCompareAndSwapTSL( idxBefore, idxAfter, dataBuffer, tempBuffer ) {

		const data1 = dataBuffer.element( idxBefore ).toVar();
		const data2 = dataBuffer.element( idxAfter ).toVar();

		tempBuffer.element( idxBefore ).assign( min( data1, data2 ) );
		tempBuffer.element( idxAfter ).assign( max( data1, data2 ) );

	}

	/**
	 * Compares and swaps two data points in the data buffer within the local address space.
	 *
	 * @private
	 * @param {Node<uint>} idxBefore - The index of the first data element in the data buffer.
	 * @param {Node<uint>} idxAfter - The index of the second data element in the data buffer
	 */
	_localCompareAndSwapTSL( idxBefore, idxAfter ) {

		const { localStorage } = this;

		const data1 = localStorage.element( idxBefore ).toVar();
		const data2 = localStorage.element( idxAfter ).toVar();

		localStorage.element( idxBefore ).assign( min( data1, data2 ) );
		localStorage.element( idxAfter ).assign( max( data1, data2 ) );

	}


	/**
	 * Create the compute shader that performs a global disperse swap on the data buffer.
	 *
	 * @private
	 * @param {StorageBufferNode} readBuffer - The data buffer to read from.
	 * @param {StorageBufferNode} writeBuffer - The data buffer to read from.
	 * @returns {ComputeNode} - A compute shader that performs a global disperse swap on the data buffer.
	 */
	_getDisperseGlobal( readBuffer, writeBuffer ) {

		const { infoStorage } = this;

		const currentSwapSpan = infoStorage.element( 1 );

		const fnDef = Fn( () => {

			const idx = getBitonicDisperseIndices( instanceIndex, currentSwapSpan );
			this._globalCompareAndSwapTSL( idx.x, idx.y, readBuffer, writeBuffer );

		} )().compute( this.dispatchSize, [ this.workgroupSize ] );

		return fnDef;

	}

	/**
	 * Create the compute shader that performs a global flip swap on the data buffer.
	 *
	 * @private
	 * @param {StorageBufferNode} readBuffer - The data buffer to read from.
	 * @param {StorageBufferNode} writeBuffer - The data buffer to read from.
	 * @returns {ComputeNode} - A compute shader that executes a global flip swap.
	 */
	_getFlipGlobal( readBuffer, writeBuffer ) {

		const { infoStorage } = this;

		const currentSwapSpan = infoStorage.element( 1 );

		const fnDef = Fn( () => {

			const idx = getBitonicFlipIndices( instanceIndex, currentSwapSpan );
			this._globalCompareAndSwapTSL( idx.x, idx.y, readBuffer, writeBuffer );

		} )().compute( this.dispatchSize, [ this.workgroupSize ] );

		return fnDef;

	}


	/**
	 * Create the compute shader that performs a complete local swap on the data buffer.
	 *
	 * @private
	 * @returns {ComputeNode} - A compute shader that executes a full local swap.
	 */
	_getSwapLocal() {

		const { localStorage, dataBuffer, workgroupSize } = this;

		const fnDef = Fn( () => {

			// Get ids of indices needed to populate workgroup local buffer.
			// Use .toVar() to prevent these values from being recalculated multiple times.
			const localOffset = uint( workgroupSize ).mul( 2 ).mul( workgroupId.x ).toVar();

			const localID1 = invocationLocalIndex.mul( 2 );
			const localID2 = invocationLocalIndex.mul( 2 ).add( 1 );

			localStorage.element( localID1 ).assign( dataBuffer.element( localOffset.add( localID1 ) ) );
			localStorage.element( localID2 ).assign( dataBuffer.element( localOffset.add( localID2 ) ) );

			// Ensure that all local data has been populated
			workgroupBarrier();

			// Perform a chunk of the sort in a single pass that operates entirely in workgroup local space
			// SWAP_LOCAL will always be first pass, so we start with known block height of 2
			const flipBlockHeight = uint( 2 );

			Loop( { start: uint( 2 ), end: uint( workgroupSize * 2 ), type: 'uint', condition: '<=', update: '<<= 1' }, () => {

				// Ensure that last dispatch block executed
				workgroupBarrier();

				const flipIdx = getBitonicFlipIndices( invocationLocalIndex, flipBlockHeight );

				this._localCompareAndSwapTSL( flipIdx.x, flipIdx.y );

				const localBlockHeight = flipBlockHeight.div( 2 );

				Loop( { start: localBlockHeight, end: uint( 1 ), type: 'uint', condition: '>', update: '>>= 1' }, () => {

					// Ensure that last dispatch op executed
					workgroupBarrier();

					const disperseIdx = getBitonicDisperseIndices( invocationLocalIndex, localBlockHeight );
					this._localCompareAndSwapTSL( disperseIdx.x, disperseIdx.y );

					localBlockHeight.divAssign( 2 );

				} );

				// flipBlockHeight *= 2;
				flipBlockHeight.shiftLeftAssign( 1 );

			} );

			// Ensure that all invocations have swapped their own regions of data
			workgroupBarrier();

			dataBuffer.element( localOffset.add( localID1 ) ).assign( localStorage.element( localID1 ) );
			dataBuffer.element( localOffset.add( localID2 ) ).assign( localStorage.element( localID2 ) );

		} )().compute( this.dispatchSize, [ this.workgroupSize ] );

		return fnDef;

	}

	/**
	 * Create the compute shader that performs a local disperse swap on the data buffer.
	 *
	 * @private
	 * @param {StorageBufferNode} readWriteBuffer - The data buffer to read from and write to.
	 * @returns {ComputeNode} - A compute shader that executes a local disperse swap.
	 */
	_getDisperseLocal( readWriteBuffer ) {

		const { localStorage, workgroupSize } = this;

		const fnDef = Fn( () => {

			// Get ids of indices needed to populate workgroup local buffer.
			// Use .toVar() to prevent these values from being recalculated multiple times.
			const localOffset = uint( workgroupSize ).mul( 2 ).mul( workgroupId.x ).toVar();

			const localID1 = invocationLocalIndex.mul( 2 );
			const localID2 = invocationLocalIndex.mul( 2 ).add( 1 );

			localStorage.element( localID1 ).assign( readWriteBuffer.element( localOffset.add( localID1 ) ) );
			localStorage.element( localID2 ).assign( readWriteBuffer.element( localOffset.add( localID2 ) ) );

			// Ensure that all local data has been populated
			workgroupBarrier();

			const localBlockHeight = uint( workgroupSize * 2 );

			Loop( { start: localBlockHeight, end: uint( 1 ), type: 'uint', condition: '>', update: '>>= 1' }, () => {

				// Ensure that last dispatch op executed
				workgroupBarrier();

				const disperseIdx = getBitonicDisperseIndices( invocationLocalIndex, localBlockHeight );
				this._localCompareAndSwapTSL( disperseIdx.x, disperseIdx.y );

				localBlockHeight.divAssign( 2 );

			} );

			// Ensure that all invocations have swapped their own regions of data
			workgroupBarrier();

			readWriteBuffer.element( localOffset.add( localID1 ) ).assign( localStorage.element( localID1 ) );
			readWriteBuffer.element( localOffset.add( localID2 ) ).assign( localStorage.element( localID2 ) );

		} )().compute( this.dispatchSize, [ this.workgroupSize ] );

		return fnDef;

	}

	/**
	 * Create the compute shader that resets the sort's algorithm information.
	 *
	 * @private
	 * @returns {ComputeNode} - A compute shader that resets the bitonic sort's algorithm information.
	 */
	_getResetFn() {

		const fnDef = Fn( () => {

			const { infoStorage } = this;

			const currentAlgo = infoStorage.element( 0 );
			const currentSwapSpan = infoStorage.element( 1 );
			const maxSwapSpan = infoStorage.element( 2 );

			currentAlgo.assign( StepType.SWAP_LOCAL );
			currentSwapSpan.assign( 2 );
			maxSwapSpan.assign( 2 );

		} )().compute( 1 );

		return fnDef;

	}

	/**
	 * Create the compute shader that copies the state of the last global swap to the data buffer.
	 *
	 * @private
	 * @returns {ComputeNode} - A compute shader that copies the state of the last global swap to the data buffer.
	 */
	_getAlignFn() {

		const { dataBuffer, tempBuffer } = this;

		// TODO: Only do this in certain instances by ping-ponging which buffer gets sorted
		// And only aligning if numDispatches % 2 === 1
		const fnDef = Fn( () => {

			dataBuffer.element( instanceIndex ).assign( tempBuffer.element( instanceIndex ) );

		} )().compute( this.count, [ this.workgroupSize ] );

		return fnDef;

	}

	/**
	 * Create the compute shader that sets the bitonic sort algorithm's information.
	 *
	 * @private
	 * @returns {ComputeNode} - A compute shader that sets the bitonic sort algorithm's information.
	 */
	_getSetAlgoFn() {

		const fnDef = Fn( () => {

			const { infoStorage, workgroupSize } = this;

			const currentAlgo = infoStorage.element( 0 );
			const currentSwapSpan = infoStorage.element( 1 );
			const maxSwapSpan = infoStorage.element( 2 );

			If( currentAlgo.equal( StepType.SWAP_LOCAL ), () => {

				const nextHighestSwapSpan = uint( workgroupSize * 4 );

				currentAlgo.assign( StepType.FLIP_GLOBAL );
				currentSwapSpan.assign( nextHighestSwapSpan );
				maxSwapSpan.assign( nextHighestSwapSpan );

			} ).ElseIf( currentAlgo.equal( StepType.DISPERSE_LOCAL ), () => {

				currentAlgo.assign( StepType.FLIP_GLOBAL );

				const nextHighestSwapSpan = maxSwapSpan.mul( 2 );

				currentSwapSpan.assign( nextHighestSwapSpan );
				maxSwapSpan.assign( nextHighestSwapSpan );

			} ).Else( () => {

				const nextSwapSpan = currentSwapSpan.div( 2 );
				currentAlgo.assign(
					select(
						nextSwapSpan.lessThanEqual( uint( workgroupSize * 2 ) ),
						StepType.DISPERSE_LOCAL,
						StepType.DISPERSE_GLOBAL
					).uniformFlow()
				);
				currentSwapSpan.assign( nextSwapSpan );

			} );

		} )().compute( 1 );

		return fnDef;

	}	/**
	 * Aligns the workgroup size with the limits of the current device, then creates
	 * the workgroup storage and compute shaders that depend on it.
	 *
	 * @private
	 * @param {Renderer} renderer - The current scene's renderer.
	 */
	_generateComputeShaders( renderer ) {

		const { maxComputeInvocationsPerWorkgroup, maxComputeWorkgroupSizeX } = renderer.backend.computeLimits;

		// A one dimensional workgroup is bound by the total number of invocations per
		// workgroup as well as by the size of the workgroup's x dimension.

		const maxWorkgroupSize = Math.min( maxComputeInvocationsPerWorkgroup, maxComputeWorkgroupSizeX );

		if ( this.workgroupSize > maxWorkgroupSize ) {

			// Swap spans are powers of two, so the workgroup size has to be one as well.

			this.workgroupSize = 2 ** Math.floor( Math.log2( maxWorkgroupSize ) );

		}

		// Only create the state that depends on the workgroup size once it has been alligned with the device

		this.localStorage = workgroupArray( this.dataBuffer.nodeType, this.workgroupSize * 2 );
		this.stepCount = this._getStepCount();

		this.flipGlobalNodes = {
			'Data': this._getFlipGlobal( this.dataBuffer, this.tempBuffer ),
			'Temp': this._getFlipGlobal( this.tempBuffer, this.dataBuffer )
		};

		this.disperseGlobalNodes = {
			'Data': this._getDisperseGlobal( this.dataBuffer, this.tempBuffer ),
			'Temp': this._getDisperseGlobal( this.tempBuffer, this.dataBuffer )
		};

		this.swapLocalFn = this._getSwapLocal();

		this.disperseLocalNodes = {
			'Data': this._getDisperseLocal( this.dataBuffer ),
			'Temp': this._getDisperseLocal( this.tempBuffer ),
		};

		this.setAlgoFn = this._getSetAlgoFn();
		this.alignFn = this._getAlignFn();

		// Reset compute function to default behavior

		this.compute = this._compute;
		this.computeStep = this._computeStep;

	}

	/**
	 * Executes a step of the bitonic sort operation.
	 *
	 * @param {Renderer} renderer - The current scene's renderer.
	 */
	_computeStep( renderer ) {

		// Swap local only runs once
		if ( this.currentDispatch === 0 ) {

			renderer.compute( this.swapLocalFn );

			this.globalOpsRemaining = 1;
			this.globalOpsInSpan = 1;

		} else if ( this.globalOpsRemaining > 0 ) {

			const swapType = this.globalOpsRemaining === this.globalOpsInSpan ? 'Flip' : 'Disperse';

			renderer.compute( swapType === 'Flip' ? this.flipGlobalNodes[ this.readBufferName ] : this.disperseGlobalNodes[ this.readBufferName ] );

			if ( this.readBufferName === 'Data' ) {

				this.readBufferName = 'Temp';

			} else {

				this.readBufferName = 'Data';

			}

			this.globalOpsRemaining -= 1;

		} else {

			// Then run local disperses when we've finished all global swaps
			renderer.compute( this.disperseLocalNodes[ this.readBufferName ] );

			const nextSpanGlobalOps = this.globalOpsInSpan + 1;
			this.globalOpsInSpan = nextSpanGlobalOps;
			this.globalOpsRemaining = nextSpanGlobalOps;

		}


		this.currentDispatch += 1;

		if ( this.currentDispatch === this.stepCount ) {

			// If our last swap addressed only addressed the temp buffer, then re-align it with the data buffer
			// to fulfill the requirement of an in-place sort.
			if ( this.readBufferName === 'Temp' ) {

				renderer.compute( this.alignFn );
				this.readBufferName = 'Data';

			}

			// Just reset the algorithm information
			renderer.compute( this.resetFn );

			this.currentDispatch = 0;
			this.globalOpsRemaining = 0;
			this.globalOpsInSpan = 0;

		} else {

			// Otherwise, determine what next swap span is
			renderer.compute( this.setAlgoFn );

		}

	}

	/**
	 * Executes a complete bitonic sort on the data buffer.
	 *
	 * @param {Renderer} renderer - The current scene's renderer.
	 */
	_compute( renderer ) {

		this.globalOpsRemaining = 0;
		this.globalOpsInSpan = 0;
		this.currentDispatch = 0;

		for ( let i = 0; i < this.stepCount; i ++ ) {

			this._computeStep( renderer );

		}

	}

	/**
	 * Resolves our compute data with the current backend device then runs compute.
	 *
	 * @param {Renderer} renderer - The current scene's renderer.
	 */
	_computeInitial( renderer ) {

		// Generates shaders and sets compute to default
		this._generateComputeShaders( renderer );
		this.compute( renderer );

	}

	/**
	 * Resolves our compute data with the current backend device then runs computeStep.
	 *
	 * @param {Renderer} renderer - The current scene's renderer.
	 */
	_computeStepInitial( renderer ) {

		this._generateComputeShaders( renderer );
		this.computeStep( renderer );

	}

}
