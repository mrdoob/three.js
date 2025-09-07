import { Fn, uvec2, If, instancedArray, instanceIndex, invocationLocalIndex, Loop, workgroupArray, workgroupBarrier, workgroupId, uint, select, Switch, Return } from 'three/tsl';

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
 * @param {Node<uint>} swapSpan - The maximum span over which elements are being swapped.
 * @returns {Node<uvec2>} The indices of the elements in the data buffer being compared.
 */
export const getBitonicFlipIndices = /*@__PURE__*/ Fn( ( [ index, swapSpan ] ) => {

	const blockOffset = ( index.mul( 2 ).div( swapSpan ) ).mul( swapSpan );
	const halfHeight = swapSpan.div( 2 );
	const idx = uvec2(
		index.mod( halfHeight ),
		swapSpan.sub( index.mod( halfHeight ) ).sub( 1 )
	);
	idx.x.addAssign( blockOffset );
	idx.y.addAssign( blockOffset );

	return idx;

}, { index: 'uint', swapSpan: 'uint', return: 'uvec2' } );

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

}, { index: 'uint', swapSpan: 'uint', return: 'uvec2' } );

// TODO: Add parameters for computing a buffer larger than vec4
export class BitonicSort {

	constructor( renderer, dataBuffer, options = {} ) {

		/**
		 * A reference to the renderer.
		 *
		 * @type {Renderer}
		 */
		this.renderer = renderer;

		/**
		 * A reference to the StorageBufferNode holding the data that will be sorted  .
		 *
		 * @type {StorageBufferNode}
		 */
		this.dataBuffer = dataBuffer;

		/**
		 * The size of the data.
		 *
		 * @type {StorageBufferNode}
		 */
		this.count = dataBuffer.value.count;

		/**
		 *
		 * The dispatch size of a sort operation
		 * @type {number}
		 */

		 this.dispatchSize = this.count / 2;

		/**
		 * The workgroup size of the compute shaders executed during the sort.
		 *
		 * @type {StorageBufferNode}
		*/
		this.workgroupSize = options.workgroupSize ? Math.min( this.dispatchSize, options.workgroupSize ) : Math.min( this.dispatchSize, 64 );
		//this.sideEffectBuffers = options.sideEffectBuffers ? options.sideEffectBuffers : [];

		// Helper buffers

		/**
		 * A node representing a workgroup scoped buffer that holds locally sorted elements.
		 *
		 * @type {WorkgroupInfoNode}
		*/
		this.localStorage = workgroupArray( dataBuffer.nodeType, this.workgroupSize * 2 );

		console.log(dataBuffer)

		/**
		 * A node representing a storage buffer used for transfering the result of the global sort back to the original data buffer.
		 *
		 * @type {StorageBufferNode}
		*/
		this.tempBuffer = instancedArray( dataBuffer.value.count, dataBuffer.nodeType ).setName( 'TempStorage' );

		this.infoBuffer = new Uint32Array( [1, 2, 2]);

		/**
		 * TODO: Determine if needed.
		 *
		 * @type {StorageBufferNode}
		*/
		this.infoStorage = instancedArray( this.infoBuffer, 'uint' ).setName( 'BitonicSortInfo' );

		this.infoStorageRead = instancedArray( this.infoBuffer, 'uint' ).setName( 'BitonicSortInfoRead' ).toReadOnly();


		/**
		 * The number of distinct swap operations ('flips' and 'disperses') executed in an in-place
		 * bitonic sort of the current data buffer.
		 *
		 * @type {number}
		*/
		this.swapOpCount = this._getSwapOpCount();

		/**
		 * The number of steps (i.e prepping and/or executing a swap) needed to fully execute an in-place bitonic sort of the current data buffer.
		 *
		 * @type {number}
		*/
		this.stepCount = this._getStepCount();

		// Have to create three separate shaders since we cannot switch between
		// local and global sort in a single shader without breaking uniform control flow
		// and thus workgroupBarrier() functionality

		/**
		 * A compute shader that executes a 'flip' swap within a global address space on elements in the data buffer.
		 *
		 * @type {ComputeNode}
		*/
		this.flipGlobalFn = this._getFlipGlobal();

		/**
		 * A compute shader that executes a 'disperse' swap within a global address space on elements in the data buffer.
		 *
		 * @type {ComputeNode}
		*/
		this.disperseGlobalFn = this._getDisperseGlobal();

		/**
		 * A compute shader that executes a sequence of flip and disperse swaps within a local address space on elements in the data buffer.
		 *
		 * @type {ComputeNode}
		*/
		this.swapLocalFn = this._getSwapLocal();

		/**
		 * A compute shader that executes a sequence of disperse swaps within a local address space on elements in the data buffer.
		 *
		 * @type {ComputeNode}
		*/
		this.disperseLocalFn = this._getDisperseLocal();

		// Utility functions

		/**
		 * TODO.
		 *
		 * @type {ComputeNode}
		*/
		this.setAlgoFn = this._getSetAlgoFn();

		/**
		 * TODO
		 *
		 * @type {ComputeNode}
		*/
		this.alignFn = this._getAlignFn();


		/**
		 * TODO
		 *
		 * @type {ComputeNode}
		*/
		this.resetFn = this._getResetFn();

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

	_getSwapOpCount() {

		const n = Math.log2( this.count );
		return ( n * ( n + 1 ) ) / 2;

	}

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

	_globalCompareAndSwapTSL( idxBefore, idxAfter, dataBuffer, tempBuffer ) {

		// If the later element is less than the current element
		If( dataBuffer.element( idxAfter ).lessThan( dataBuffer.element( idxBefore ) ), () => {

			tempBuffer.element( idxBefore ).assign( dataBuffer.element( idxAfter ) );
			tempBuffer.element( idxAfter ).assign( dataBuffer.element( idxBefore ) );

		} ).Else( () => {

			// Otherwise apply the existing values to temporary storage.
			tempBuffer.element( idxBefore ).assign( dataBuffer.element( idxBefore ) );
			tempBuffer.element( idxAfter ).assign( dataBuffer.element( idxAfter ) );

		} );

	}


	_getDisperseGlobal() {

		const { infoStorage, tempBuffer, dataBuffer } = this;

		const currentSwapSpan = infoStorage.element( 1 );

		const fnDef = Fn( () => {

			const idx = getBitonicDisperseIndices( instanceIndex, currentSwapSpan );
			this._globalCompareAndSwapTSL( idx.x, idx.y, dataBuffer, tempBuffer );

		} )().compute( this.dispatchSize, [ this.workgroupSize ] );

		return fnDef;

	}

	_getFlipGlobal() {

		const { infoStorage, tempBuffer, dataBuffer } = this;

		const currentSwapSpan = infoStorage.element( 1 );

		const fnDef = Fn( () => {

			const idx = getBitonicFlipIndices( instanceIndex, currentSwapSpan );
			this._globalCompareAndSwapTSL( idx.x, idx.y, dataBuffer, tempBuffer );

		} )().compute( this.dispatchSize, [ this.workgroupSize ] );

		return fnDef;

	}

	_getSwapLocal() {

		const { localStorage, dataBuffer, workgroupSize } = this;

		const localCompareAndSwap = ( idxBefore, idxAfter ) => {

			If( localStorage.element( idxAfter ).lessThan( localStorage.element( idxBefore ) ), () => {

				const temp = localStorage.element( idxBefore ).toVar();
				localStorage.element( idxBefore ).assign( localStorage.element( idxAfter ) );
				localStorage.element( idxAfter ).assign( temp );

			} );

		};

		const fnDef = Fn( () => {

			// Get ids of indices needed to populate workgroup local buffer.
			// Use .toVar() to prevent these values from being recalculated multiple times.
			const localOffset = uint( this.workgroupSize ).mul( 2 ).mul( workgroupId.x ).toVar();

			const localID1 = invocationLocalIndex.mul( 2 );
			const localID2 = invocationLocalIndex.mul( 2 ).add( 1 );

			localStorage.element( localID1 ).assign( dataBuffer.element( localOffset.add( localID1 ) ) );
			localStorage.element( localID2 ).assign( dataBuffer.element( localOffset.add( localID2 ) ) );

			// Ensure that all local data has populated
			workgroupBarrier();

			// Perform a chunk of the sort in a single pass that operates entirely in workgroup local space
			// SWAP_LOCAL will always be first pass, so we start with known block height of 2
			const flipBlockHeight = uint( 2 );

			Loop( { start: uint( 2 ), end: uint( workgroupSize * 2 ), type: 'uint', condition: '<=', update: '<<= 1' }, () => {

				// Ensure that last dispatch block executed
				workgroupBarrier();

				const flipIdx = getBitonicFlipIndices( invocationLocalIndex, flipBlockHeight );
				localCompareAndSwap( flipIdx.x, flipIdx.y );

				const localBlockHeight = flipBlockHeight.toVar();

				Loop( { start: localBlockHeight, end: uint( 1 ), type: 'uint', condition: '>', update: '>>= 1' }, () => {

					// Ensure that last dispatch op executed
					workgroupBarrier();

					const disperseIdx = getBitonicFlipIndices( invocationLocalIndex, localBlockHeight );
					localCompareAndSwap( disperseIdx.x, disperseIdx.y );

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

	_getDisperseLocal() {

		const { infoStorageRead, localStorage, dataBuffer } = this;

		const localCompareAndSwap = ( idxBefore, idxAfter ) => {

			If( localStorage.element( idxAfter ).lessThan( localStorage.element( idxBefore ) ), () => {

				const temp = localStorage.element( idxBefore ).toVar();
				localStorage.element( idxBefore ).assign( localStorage.element( idxAfter ) );
				localStorage.element( idxAfter ).assign( temp );

			} );

		};

		const currentSwapSpan = infoStorageRead.element( 1 ).toVar();

		const fnDef = Fn( () => {

			// Get ids of indices needed to populate workgroup local buffer.
			// Use .toVar() to prevent these values from being recalculated multiple times.
			const localOffset = uint( this.workgroupSize ).mul( 2 ).mul( workgroupId.x ).toVar();

			const localID1 = invocationLocalIndex.mul( 2 );
			const localID2 = invocationLocalIndex.mul( 2 ).add( 1 );

			localStorage.element( localID1 ).assign( dataBuffer.element( localOffset.add( localID1 ) ) );
			localStorage.element( localID2 ).assign( dataBuffer.element( localOffset.add( localID2 ) ) );

			const localBlockHeight = currentSwapSpan.toVar();

			Loop( { start: localBlockHeight, end: uint( 1 ), type: 'uint', condition: '>', update: '>>= 1' }, () => {

				// Ensure that last dispatch op executed
				workgroupBarrier();

				const disperseIdx = getBitonicFlipIndices( invocationLocalIndex, localBlockHeight );
				localCompareAndSwap( disperseIdx.x, disperseIdx.y );

				localBlockHeight.divAssign( 2 );

			} );


			// Ensure that all invocations have swapped their own regions of data
			workgroupBarrier();

			// Populate output data with the results from our swaps

			dataBuffer.element( localOffset.add( localID1 ) ).assign( localStorage.element( localID1 ) );
			dataBuffer.element( localOffset.add( localID2 ) ).assign( localStorage.element( localID2 ) );


		} )().compute( this.dispatchSize, [ this.workgroupSize ] );

		return fnDef;

	}

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

	_getAlignFn() {

		const { dataBuffer, tempBuffer } = this;

		// TODO: Only do this in certain instances by ping-ponging which buffer gets sorted
		// And only aligning if numDispatches % 2 === 1
		const fnDef = Fn( () => {

			dataBuffer.element( instanceIndex ).assign( tempBuffer.element( instanceIndex ) );

		} )().compute( this.count, [ this.workgroupSize ] );

		return fnDef;

	}

	_getSetAlgoFn() {

		const fnDef = Fn( () => {

			const { infoStorage, workgroupSize, count } = this;

			const currentAlgo = infoStorage.element( 0 );
			const currentSwapSpan = infoStorage.element( 1 );
			const maxSwapSpan = infoStorage.element( 2 );

			If( currentAlgo.equal(StepType.SWAP_LOCAL), () => {

				const nextHighestSwapSpan = uint( uint(workgroupSize).mul( 4 ) );

				const outOfBoundsSwap = nextHighestSwapSpan.greaterThan( count );

				const nextAlgo = select( outOfBoundsSwap, StepType.SWAP_LOCAL, StepType.FLIP_GLOBAL );
				const nextSwapSpan = select(outOfBoundsSwap, uint(2), nextHighestSwapSpan).toVar();

				currentAlgo.assign( nextAlgo );
				currentSwapSpan.assign( nextSwapSpan );
				maxSwapSpan.assign( nextSwapSpan );

			} ).ElseIf( currentAlgo.equal(StepType.DISPERSE_LOCAL), () => {

				const nextHighestSwapSpan = maxSwapSpan.mul( 2 );

				const nextSwapSpan = select(nextHighestSwapSpan.equal(count * 2), uint(2), nextHighestSwapSpan).uniformFlow();

				currentSwapSpan.assign( nextSwapSpan );
				maxSwapSpan.assign( nextSwapSpan );

			} ).Else( () => {

				const nextSwapSpan = currentSwapSpan.div( 2 );
				currentAlgo.assign(
					select(
						nextSwapSpan.lessThanEqual( uint( workgroupSize ).mul( 2 ) ),
						StepType.DISPERSE_LOCAL,
						StepType.DISPERSE_GLOBAL
					).uniformFlow()
				);
				currentSwapSpan.assign( nextSwapSpan );

			} )

		} )().compute( 1 );

		return fnDef;

	}

	async computeStep( renderer ) {

		// Swap local only runs once
		if ( this.currentDispatch === 0 ) {

			console.log('Running Swap Local')

			await renderer.computeAsync( this.swapLocalFn );

			this.globalOpsRemaining = 1;
			this.globalOpsInSpan = 1;

		} else if ( this.globalOpsRemaining > 0 ) {

			const swapType = this.globalOpsRemaining === this.globalOpsInSpan ? 'Flip' : 'Disperse';

			console.log(`Running global ${swapType}`)

			await renderer.computeAsync( this.globalOpsRemaining === this.globalOpsInSpan ? this.flipGlobalFn : this.disperseGlobalFn );
			await renderer.computeAsync( this.alignFn );

			this.globalOpsRemaining -= 1;

		} else {

			console.log('Running local disperse')

			// Then run local disperses when we've finished all global swaps
			await renderer.computeAsync( this.disperseLocalFn );

			const nextSpanGlobalOps = this.globalOpsInSpan + 1;
			this.globalOpsInSpan = nextSpanGlobalOps;
			this.globalOpsRemaining = nextSpanGlobalOps;


		}

		// Pass the next swap span to compute storage
		await renderer.computeAsync( this.setAlgoFn );

		this.currentDispatch += 1;

		console.log( new Uint32Array( await renderer.getArrayBufferAsync( this.infoStorage.value ) ) );


		if ( this.currentDispatch === this.stepCount ) {

			this.currentDispatch = 0;
			this.globalOpsRemaining = 0;
			this.globalOpsInSpan = 0;

		}

	}


	async compute( renderer ) {

		this.globalOpsRemaining = 0;
		this.globalOpsInSpan = 0;
		this.currentDispatch = 0;

		for ( let i = 0; i < this.stepCount; i ++ ) {

			await this.computeStep( renderer );

		}

	}

}
