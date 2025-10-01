import { Fn, If, instancedArray, invocationLocalIndex, countTrailingZeros, Loop, workgroupArray, subgroupSize, workgroupBarrier, workgroupId, uint, select, invocationSubgroupIndex, dot, uvec4, vec4, float, subgroupAdd, array, subgroupShuffle, subgroupInclusiveAdd, subgroupBroadcast, invocationSubgroupMetaIndex, arrayBuffer } from 'three/tsl';

const divRoundUp = ( size, part_size ) => {

	return Math.floor( ( size + part_size - 1 ) / part_size );

};

let id = 0;

/**
 * Storage buffers needed to execute a reduce-then-scan prefix sum`.
 *
 * @typedef {Object} PrefixSumStorageObjects
 * @property {StorageBufferNode} reductionBuffer - Storage data buffer holding the reduction of each workgroup from the reduce step.
 * @property {StorageBufferNode} dataBuffer - Storage data buffer holding the vectorized input data.
 * @property {StorageBufferNode} unvectorizedDataBuffer - Storage data buffer holding the unvectorized input data.
 * @property {StorageBufferNode} outputBuffer - Storage data buffer that returns the unvectorized output data of the prefix sum.
 */

/**
 * Compute functions needed to execute a reduce-then-scan prefix sum`.
 *
 * @typedef {Object} PrefixSumComputeFunctions
 * @property {ComputeNode} reduceFn - A compute shader that executes the reduce step of a reduce-then-scan prefix sum.
 * @property {ComputeNode} spineScanFn - A compute shader that executes the spine scan step of a reduce-then-scan prefix sum.
 * @property {ComputeNode} downsweepFn - A compute shader that executes the downsweep step of a reduce-then-scan prefix sum.
 */

/**
 * Utility nodes used in multiple shaders across the reduce-then-scan prefix sum`.
 *
 * @typedef {Object} PrefixSumUtilityNodes
 * @property {WorkgroupInfoNode} subgroupReductionArray - A workgroup memory buffer representing a workgroup scoped buffer that holds the result of a subgroup operation from each subgroup in a workgroup. Sized to account for minimumn WGSL subgroup size of 4.
 * @property {Node<uint>} workgroupOffset - A node representing the vec4-alligned offset at which the workgroup with index 'workgroupId.x' will begin reading vec4 elements from the data buffer.
 * @property {Node<uint>} subgroupOffset - A node representing the vec4-alligned offset from 'this.workgroupOffset' at which the subgroup with index 'subgroupMetaRank' will begin reading vec4 elements from a data buffer.
 * @property {Node<uint>} unvectorizedSubgroupOffset - A node representing the uint-alligned offset from 'this.workgroupOffset' at which the subgroup with index 'subgroupMetaRank' will begin reading uint elements from a data buffer.
 * @property {Node<uint>} subgroupSizeLog - A node that evaulates to n in 2^n = subgroupSize.
 * @property {Node<uint>} spineSize - A node that calculates the number of partial reductions in a workgroup scan, or the number of subgroups in a workgroup on the current device.
 * @property {Node<uint>} spineSizeLog - A node that evaluates to n in 2^n = spineSize.
 */


/**
	* A class that represents a prefix sum running under the reduce/scan strategy.
	* Currently limited to one-dimensional data buffers.
	*
	* @param {Renderer} renderer - A renderer with the ability to execute compute operations.
	* @param {StorageBufferNode} dataBuffer - The data buffer to sum.
	* @param {Object} [options={}] - Options that modify the reduce/scan prefix sum.
	*/
export class PrefixSum {

	/**
	 * Constructs a new light probe helper.
	 *
	 * @param {Renderer} renderer - A renderer with the ability to execute compute operations.
	 * @param {number[]} inputArray - The data buffer to sum.
	 * @param {'uint' | 'float'} inputArrayType - Type of input array
	 * @param {Object} [options={}] - Options that modify the behavior of the prefix sum.
	 */
	constructor( renderer, inputArray, inputArrayType, options = {} ) {

		/**
		 * A reference to the renderer.
		 *
		 * @type {Renderer}
		 */
		this.renderer = renderer;

		/**
		 * @type {PrefixSumStorageObjects}
		 */
		this.storageBuffers = {};

		/**
		 * @type {PrefixSumComputeFunctions}
		 */
		this.computeFunctions = {};


		/**
		 * @type {PrefixSumUtilityNodes}
		 */
		this.utilityNodes = {};

		this.type = inputArrayType;
		this.vecType = inputArrayType === 'uint' ? 'uvec4' : 'vec4';

		/**
		 * The size of the data.
		 *
		 * @type {number}
		 */
		this.count = inputArray.length;

		/**
		 * The number of 4-dimensional vectors needed to fully represent the data in the data buffer.
		 * Buffers where this.count % 4 !== 0 will need an additional vec4 to hold the data buffer's
		 * remaining elements.
		 *
		 * @type {number}
		 */
		this.vecCount = divRoundUp( this.count, 4 );

		while ( inputArray.length % 4 !== 0 ) {

			inputArray.push( 0 );

		}

		/**
		 * The number of 4-dimensional vectors that will be read from global storage in each invocation of the reduction/downsweep step.
		 * Defaults to 4.
		 *
		 * @type {number}
		*/
		this.workPerInvocation = options.workPerInvocation ? options.workPerInvocation : 4;

		/**
		 * The number of unvectorized values to be read from the reduction buffer in each invocation of the spine/scan step.
		 * Derived from workPerInvocation and thus defaults to 16.
		 *
		 * @type {number}
		*/
		this.unvectorizedWorkPerInvocation = this.workPerInvocation * 4;

		/**
		 * The workgroup size of the compute shaders executed during the prefix sum.
		 * If no workgroupSize is defined, the workgroupSize defaults to the minimumn between the number of elements in the
		 * data buffer and 64.
		 *
		 * @type {number}
		*/
		this.workgroupSize = options.workgroupSize ? options.workgroupSize : Math.min( this.vecCount, 64 );

		/**
		 * The maximum number of elements that will be read by an individual workgroup in the reduction step.
		 * Calculated as the number of invocations in the workgroup by the work per invocation by VEC4_SIZE
		 *
		 * @type {number}
		*/
		this.partitionSize = this.workgroupSize * this.unvectorizedWorkPerInvocation;

		/**
		 * The number of workgroups needed to properly execute the reduction and downsweepsteps.
		 * Calculated as the number of partitions within the count of elements.
		 *
		 * @type {number}
		*/
		this.numWorkgroups = divRoundUp( this.count, this.partitionSize );

		/**
		 * The number of invocations dispatched in each step of the prefix sum.
		 *
		 * @type {number}
		*/
		this.dispatchSize = this.numWorkgroups * this.workgroupSize;

		this._createStorageBuffers( inputArray, inputArrayType, this.vecType, this.numWorkgroups );
		this._createUtilityNodes();

		/**
		 * The step of the prefix sum to execute.
		 *
		 * @type {'Reduce' | 'Spine_Scan' | 'Downsweep'}
		*/
		this.currentStep = 'Reduce';


		this.computeFunctions.reduceFn = this._getReduceFn();
		this.computeFunctions.spineScanFn = this._getSpineScanFn();
		this.computeFunctions.downsweepFn = this._getDownsweepFn();

		id += 1;

	}

	_createStorageBuffers( inputArray ) {

		this.arrayBuffer = this.type === 'uint' ? Uint32Array.from( inputArray ) : Float32Array.from( inputArray );

		this.storageBuffers.unvectorizedDataBuffer = instancedArray( this.arrayBuffer, this.type ).setPBO( true ).setName( `Prefix_Sum_Input_Unvec_${id}` );
		this.storageBuffers.dataBuffer = instancedArray( this.arrayBuffer, this.vecType ).setPBO( true ).setName( `Prefix_Sum_Input_Vec_${id}` );
		this.storageBuffers.outputBuffer = instancedArray( this.arrayBuffer, this.vecType ).setName( `Prefix_Sum_Output_${id}` );
		this.storageBuffers.reductionBuffer = instancedArray( this.numWorkgroups, this.type ).setPBO( true ).setName( `Prefix_Sum_Reduction_${id}` );

	}

	_createUtilityNodes() {

		this.utilityNodes.subgroupReductionArray = workgroupArray( this.type, Math.ceil( this.workgroupSize / 4 ) );
		this.utilityNodes.workgroupOffset = workgroupId.x.mul( uint( this.workgroupSize ).mul( this.workPerInvocation ) ).toVar( 'workgroupOffset' );
		this.utilityNodes.subgroupOffset = invocationSubgroupMetaIndex.mul( subgroupSize ).mul( this.workPerInvocation ).toVar( 'subgroupOffset' );
		this.utilityNodes.unvectorizedSubgroupOffset = invocationSubgroupMetaIndex.mul( subgroupSize ).mul( this.unvectorizedWorkPerInvocation ).toVar( 'unvectorizedSubgroupOffset' );
		this.utilityNodes.subgroupSizeLog = countTrailingZeros( subgroupSize ).toVar( 'subgroupSizeLog' );
		this.utilityNodes.spineSize = uint( this.workgroupSize ).shiftRight( this.utilityNodes.subgroupSizeLog ).toVar( 'spineSize' );
		this.utilityNodes.spineSizeLog = countTrailingZeros( this.utilityNodes.spineSize ).toVar( 'spineSizeLog' );

	}

	_getSubgroupAlignedSize() {

		const { spineSizeLog, subgroupSizeLog } = this.utilityNodes;

		// Align size to powers of subgroupSize
		const squaredSubgroupLog = ( spineSizeLog.add( subgroupSizeLog ).sub( 1 ) );
		squaredSubgroupLog.divAssign( subgroupSizeLog );
		squaredSubgroupLog.mulAssign( subgroupSizeLog );
		const subgroupAlignedSize = ( uint( 1 ).shiftLeft( squaredSubgroupLog ) ).toVar( 'subgroupAlignedSize' );

		return subgroupAlignedSize;

	}


	// NOTE: subgroupSizeLog needs to be defined in this._getSubgroupAlignedSize before this block can execute
	_subgroupAlignedSizeBlock( subgroupAlignedSize, subgroupAllignedBlockCallback ) {

		// In cases where the number of subgroups in a workgroup is greater than the subgroup size itself,
		// we need to iterate over the array again to capture all the data in the workgroup array buffer
		// In many cases this loop will only run once
		Loop( { start: subgroupSize, end: subgroupAlignedSize, condition: '<=', name: 'j', type: 'uint', update: '<<= subgroupSizeLog' }, ( { j } ) => {

			subgroupAllignedBlockCallback( j );

		} );

	}

	_getSpineAlignedSize() {

		const { numWorkgroups, partitionSize } = this;

		const SPINE_PARTITION_SIZE = uint( partitionSize ).toVar( 'spinePartitionSize' );

		const spineAlignedSize = ( SPINE_PARTITION_SIZE.add( numWorkgroups ).sub( 1 ) ).toVar( 'spineAlignedSize' );
		spineAlignedSize.divAssign( SPINE_PARTITION_SIZE );
		spineAlignedSize.mulAssign( SPINE_PARTITION_SIZE );

		return spineAlignedSize;

	}

	_getSpineAlignedBlock( spineAlignedSize, spineAlignedBlockCallback ) {

		// Allignment in cases where num elements is (SPINE_PARTITION_SIZE * SPINE_PARTITION_SIZE) + 1
		Loop( { start: 0, end: spineAlignedSize, condition: '<', name: 'j', type: 'uint', update: '+= spinePartitionSize' }, ( { j } ) => {

			spineAlignedBlockCallback( j );

		} );

	}

	_workPerInvocationBlock( workgroupCallback, lastWorkgroupCallback ) {

		const { numWorkgroups, workPerInvocation } = this;

		// Each thread will accumulate values from across 'workPerInvocation' subgroups
		If( workgroupId.x.lessThan( uint( numWorkgroups ).sub( 1 ) ), () => {

			Loop( {
				start: uint( 0 ),
				end: workPerInvocation,
				type: 'uint',
				condition: '<',
				name: 'currentSubgroupInBlock'
			}, ( { currentSubgroupInBlock } ) => {

				workgroupCallback( currentSubgroupInBlock );

			} );

		} );

		// Ensure that the last workgroup does not access out of bounds indices
		If( workgroupId.x.equal( uint( numWorkgroups ).sub( 1 ) ), () => {

			Loop( {
				start: uint( 0 ),
				end: workPerInvocation,
				type: 'uint',
				condition: '<',
				name: 'currentSubgroupInBlock'
			}, ( { currentSubgroupInBlock } ) => {

				lastWorkgroupCallback( currentSubgroupInBlock );

			} );

		} );

	}

	/**
	 * Create the compute shader that performs the reduce operation.
	 *
	 * @private
	 * @returns {ComputeNode} - A compute shader that executes a full local swap.
	 */
	_getReduceFn() {

		const { reductionBuffer, dataBuffer } = this.storageBuffers;
		const { vecCount } = this;
		const { subgroupSizeLog, subgroupReductionArray, subgroupOffset, workgroupOffset, spineSize } = this.utilityNodes;

		const fnDef = Fn( () => {

			// Each subgroup block scans across 4 subgroups. So when we move into a new subgroup,
			// align that subgroups' accesses to the next 4 subgroups
			const threadSubgroupOffset = subgroupOffset.add( invocationSubgroupIndex ).toVar( 'threadSubgroupOffset' );

			const startThreadBase = threadSubgroupOffset.add( workgroupOffset ).toVar( 'startThreadBase' );

			const startThread = startThreadBase.toVar( 'startThread' );

			let subgroupReduction;

			if ( this.type === 'uint' ) {

				subgroupReduction = uint( 0 );

			} else {

				subgroupReduction = float( 0 );

			}

			this._workPerInvocationBlock( () => {

				// Get vectorized element from input array
				const val = dataBuffer.element( startThread );


				// Sum values within vec4 together by using result of dot product
				if ( this.vecType === 'uvec4' ) {

					subgroupReduction.addAssign( dot( uvec4( 1 ), val ) );

				} else {

					subgroupReduction.addAssign( dot( vec4( 1 ), val ) );

				}

				// Increment so thread will scan value in next subgroup
				startThread.addAssign( subgroupSize );


			}, () => {

				let val;
				if ( this.vecType === 'uvec4' ) {

					// Ensure index is less than number of available vectors in inputBuffer
					val = select( startThread.lessThan( uint( vecCount ) ), dataBuffer.element( startThread ), uvec4( 0 ) ).uniformFlow();

					subgroupReduction.addAssign( dot( val, uvec4( 1 ) ) );

				} else {

					// Ensure index is less than number of available vectors in inputBuffer
					val = select( startThread.lessThan( uint( vecCount ) ), dataBuffer.element( startThread ), vec4( 0 ) ).uniformFlow();

					subgroupReduction.addAssign( dot( val, vec4( 1 ) ) );


				}

				startThread.addAssign( subgroupSize );

			} );

			subgroupReduction.assign( subgroupAdd( subgroupReduction ) );

			// Assuming that each element in the input buffer is 1, we generally expect each invocation's subgroupReduction
			// value to be ELEMENTS_PER_VEC4 * workPerInvocation * subgroupSize

			// Delegate one thread per subgroup to assign each subgroup's reduction to the workgroup array
			If( invocationSubgroupIndex.equal( uint( 0 ) ), () => {

				subgroupReductionArray.element( invocationSubgroupMetaIndex ).assign( subgroupReduction );

			} );

			// Ensure that each workgroup has populated the perSubgroupReductionArray with data
			// from each of it's subgroups
			workgroupBarrier();

			// WORKGROUP LEVEL REDUCE

			const subgroupAlignedSize = this._getSubgroupAlignedSize();

			// aligned size 2 * 4

			const offset = uint( 0 );

			// In cases where the number of subgroups in a workgroup is greater than the subgroup size itself,
			// we need to iterate over the array again to capture all the data in the workgroup array buffer
			// In many cases this loop will only run once
			this._subgroupAlignedSizeBlock( subgroupAlignedSize, () => {

				const subgroupIndex = ( ( invocationLocalIndex.add( 1 ) ).shiftLeft( offset ) ).sub( 1 );

				const isValidSubgroupIndex = subgroupIndex.lessThan( spineSize ).toVar( 'isValidSubgroupIndex' );

				// Reduce values within the local workgroup memory.
				// Set toVar to ensure subgroupAdd executes before (not within) the if statement.
				const t = subgroupAdd(
					select(
						isValidSubgroupIndex,
						subgroupReductionArray.element( subgroupIndex ),
						0
					).uniformFlow()
				).toVar( 't' );

				// Can assign back to workgroupArray since all
				// subgroup threads work in lockstop for subgroupAdd
				If( isValidSubgroupIndex, () => {

					subgroupReductionArray.element( subgroupIndex ).assign( t );

				} );

				// Ensure all threads have completed work

				workgroupBarrier();

				offset.addAssign( subgroupSizeLog );

			} );

			// Assign single thread from workgroup to assign workgroup reduction
			If( invocationLocalIndex.equal( uint( 0 ) ), () => {

				const reducedWorkgroupSum = subgroupReductionArray.element( uint( spineSize ).sub( 1 ) );

				// TODO: Comment out in prod
				// dataBuffer.element( workgroupId.x ).assign( reducedWorkgroupSum );

				reductionBuffer.element( workgroupId.x ).assign( reducedWorkgroupSum );

			} );

		} )().compute( this.dispatchSize, [ this.workgroupSize ] );

		return fnDef;

	}

	/**
	 * Executes a downsweep operation on the data buffer.
	 *
	 * @param {Node<number>} inputNode - The input node.
	 * @param {Node<number> | number} maskNode - The number of bits to mask.
	 * @return {Node<uint>}
	 */
	_maskLowerBits( inputNode, maskNode ) {

		return ( inputNode.shiftRight( maskNode ) ).shiftLeft( maskNode );

	}


	/**
	 * Create the compute shader that performs the spine scan operation.
	 *
	 * @private
	 * @returns {ComputeNode} - A compute shader that executes a full local swap.
	 */
	_getSpineScanFn() {

		const { reductionBuffer } = this.storageBuffers;
		const { subgroupReductionArray, unvectorizedSubgroupOffset, spineSize, subgroupSizeLog } = this.utilityNodes;
		const { unvectorizedWorkPerInvocation } = this;

		const fnDef = Fn( () => {

			const subgroupAlignedSize = this._getSubgroupAlignedSize();
			const spineAlignedSize = this._getSpineAlignedSize();

			const t_scan = array( 'uint', 16 ).toVar();
			const previousReduction = uint( 0 ).toVar( 'previousReduction' );

			const s_offset = unvectorizedSubgroupOffset.add( invocationSubgroupIndex ).toVar( 's_offset' );

			this._getSpineAlignedBlock( spineAlignedSize, ( devOffset ) => {

				const reducedWorkgroupIndex = s_offset.add( devOffset );

				Loop( {
					start: uint( 0 ),
					end: uint( unvectorizedWorkPerInvocation ),
					type: 'uint',
					condition: '<',
					name: 'k'
				}, ( { k } ) => {

					// The reduction buffer holds a collection of reductions from within
					// each indice's respective workgroup, so ensure that we only access
					// valid workgroup indices

					If( reducedWorkgroupIndex.lessThan( this.numWorkgroups ), () => {

						t_scan.element( k ).assign( reductionBuffer.element( reducedWorkgroupIndex ) );

					} );

					reducedWorkgroupIndex.addAssign( subgroupSize );

				} );

				const prev = uint( 0 ).toVar( 'prev' );
				Loop( {
					start: uint( 0 ),
					end: uint( unvectorizedWorkPerInvocation ),
					type: 'uint',
					condition: '<',
					update: '+= 1u',
					name: 'k'
				}, ( { k } ) => {

					const tScanElement = t_scan.element( k );

					tScanElement.assign( subgroupInclusiveAdd( tScanElement ).add( prev ) );
					prev.assign( subgroupShuffle( tScanElement, subgroupSize.sub( 1 ) ) );

				} );

				if ( invocationSubgroupIndex.equal( subgroupSize.sub( 1 ) ) ) {

					subgroupReductionArray.element( invocationSubgroupMetaIndex ).assign( prev );

				}

				workgroupBarrier();

				const offset0 = uint( 0 ).toVar();
				const offset1 = uint( 0 ).toVar();

				this._subgroupAlignedSizeBlock( subgroupAlignedSize, ( j ) => {

					const isValidSubgroupIndex = j.notEqual( subgroupSize );
					const isValidSubgroupInt = select( isValidSubgroupIndex, uint( 1 ), uint( 0 ) ).uniformFlow();

					const i0 = ( invocationLocalIndex.add( offset0 ) ).shiftLeft( offset1 ).sub( isValidSubgroupInt );
					const pred0 = i0.lessThan( spineSize );

					// Need to cast toVar() here otherwise subgroupInclusiveAdd gets inlined within a non-uniform block
					const t0 = subgroupInclusiveAdd( select( pred0, subgroupReductionArray.element( i0 ), uint( 0 ) ).uniformFlow() ).toVar();

					If( pred0, () => {

						subgroupReductionArray.element( i0 ).assign( t0 );

					} );

					If( isValidSubgroupIndex, () => {

						const rShift = j.shiftRight( subgroupSizeLog );
						const i1 = invocationLocalIndex.add( rShift );

						const weirdValue = i1.bitAnd( j.sub( 1 ) );

						If( weirdValue.greaterThanEqual( rShift ), () => {

							const pred1 = i1.lessThan( spineSize );

							const t1 = select( pred1, subgroupReductionArray.element( this._maskLowerBits( i1, offset1 ).sub( 1 ) ), 0 ).uniformFlow();

							If(
								pred1.and(
									( i1.add( 1 ).bitAnd( rShift.sub( 1 ) ) ).notEqual( 0 )
								), () => {

									subgroupReductionArray.element( i1 ).addAssign( t1 );

								} );


						} );


					} ).Else( () => {

						offset0.addAssign( 1 );

					} );

					offset1.addAssign( subgroupSizeLog );

				} );

				workgroupBarrier();

				const lastSubgroupReduction = select(
					invocationSubgroupMetaIndex.notEqual( 0 ),
					subgroupReductionArray.element( invocationSubgroupMetaIndex.sub( 1 ) ),
					uint( 0 )
				).uniformFlow();

				const newPrev = lastSubgroupReduction.add( previousReduction );

				const i = s_offset.add( devOffset );

				Loop( {
					start: uint( 0 ),
					end: uint( unvectorizedWorkPerInvocation ),
					type: 'uint',
					condition: '<',
					name: 'k'
				}, ( { k } ) => {

					If( i.lessThan( this.numWorkgroups ), () => {

						reductionBuffer.element( i ).assign( t_scan.element( k ).add( newPrev ) );

					} );

					i.addAssign( subgroupSize );


				} );

				previousReduction.addAssign( subgroupBroadcast( subgroupReductionArray.element( subgroupAlignedSize.sub( 1 ) ), 0 ) );
				workgroupBarrier();

			} );

		} )().compute( this.numWorkgroups, [ this.workgroupSize ] );

		console.log( fnDef );

		return fnDef;

	}

	_getDownsweepFn() {

		const { dataBuffer, reductionBuffer, outputBuffer } = this.storageBuffers;
		const { vecType } = this;
		const { subgroupOffset, workgroupOffset, subgroupReductionArray, subgroupSizeLog, spineSize } = this.utilityNodes;

		const { workPerInvocation, vecCount } = this;

		const fnDef = Fn( () => {

			const threadSubgroupOffset = subgroupOffset.add( invocationSubgroupIndex );

			const startThreadBase = threadSubgroupOffset.add( workgroupOffset );

			const startThread = startThreadBase.toVar();

			const vec4FilledWithZeroArray = [];

			for ( let i = 0; i < workPerInvocation; i ++ ) {

				vec4FilledWithZeroArray.push( uvec4( 0 ) );

			}

			const tScan = array( vec4FilledWithZeroArray ).toVar();

			// Prefix Sum elements within individual vec4 elements

			this._workPerInvocationBlock( ( currentSubgroupInBlock ) => {

				const scanIn = dataBuffer.element( startThread );
				const currentTScanElement = tScan.element( currentSubgroupInBlock );

				console.log( currentTScanElement );

				currentTScanElement.assign( scanIn );

				currentTScanElement.y.addAssign( currentTScanElement.x );
				currentTScanElement.z.addAssign( currentTScanElement.y );
				currentTScanElement.w.addAssign( currentTScanElement.z );

				startThread.addAssign( subgroupSize );

			}, ( currentSubgroupInBlock ) => {

				If( startThread.lessThan( uint( vecCount ) ), () => {

					const scanIn = dataBuffer.element( startThread );
					const currentTScanElement = tScan.element( currentSubgroupInBlock );

					currentTScanElement.assign( scanIn );

					currentTScanElement.y.addAssign( currentTScanElement.x );
					currentTScanElement.z.addAssign( currentTScanElement.y );
					currentTScanElement.w.addAssign( currentTScanElement.z );

					startThread.addAssign( subgroupSize );

				} );

			} );

			// Each thread now has prefix sums of the elements in 'workPerInvocation' vec4s

			const prev = uint( 0 ).toVar();

			const laneMask = subgroupSize.sub( 1 ).toVar( 'laneMask' );
			const clockwiseShift = ( invocationSubgroupIndex.add( laneMask ) ).bitAnd( laneMask ).toVar( 'clockwiseShift' );

			Loop( {
				start: uint( 0 ),
				end: uint( workPerInvocation ),
				type: 'uint',
				condition: '<',
				name: 'currentSubgroupInBlock'
			}, ( { currentSubgroupInBlock } ) => {


				// previous greatest accumulated value
				const prevAccGreatestValue = subgroupShuffle(

					// Get the largest element within each vector (always w since prefix sum)
					// Then add together with the same element in each lane of the subgroup.
					// Assume all values in data buffer are 1 and subgroupSize is 4
					// Subgroup 0, 1, 2, 3 values -> 4
					// Invocation 0 value after inclusiveAdd 4
					// Invocation 1 value after inclusiveAdd 8
					// Invocation 2 value after inclusiveAdd 12
					// Invocation 3 value after inclusiveAdd 16

					subgroupInclusiveAdd( tScan.element( currentSubgroupInBlock ).w ),

					// Shuffle each value between lanes in the subgroup counterClockWise
					// Effectively a looping subgroupShuffleDown
					// Inv 0 gets inv 3 value 16
					// Invocation 1 gets inv 0 value 4
					// Invocation 2 gets inv 1 value 8
					// Invocation 3 gets inv 2 value 12

					clockwiseShift
				).toVar( 'prevAccGreatestValue' );

				const isNotInvocationSubgroupIndex0 = invocationSubgroupIndex.notEqual( uint( 0 ) );

				let addEle;

				// Vector read by lane 0 does not get changed by since it is already prefix summed
				// within context of its subgroup, so we don't want to add greatest value for it.
				// The purpose of shuffling to all lanes of the subgroup including lane 0 is simply
				// to have the greatest value accessible for the broadcast from lane 0.

				if ( this.vecType === 'uvec4' ) {

					addEle = prev.add( select( isNotInvocationSubgroupIndex0, prevAccGreatestValue, uvec4( 0 ) ).uniformFlow() );

				} else {

					addEle = prev.add( select( isNotInvocationSubgroupIndex0, prevAccGreatestValue, vec4( 0 ) ).uniformFlow() );

				}

				tScan.element( currentSubgroupInBlock ).addAssign( addEle );

				// Broadcast value of invocationSubgroupIndex 0 (which is usually largest value ) to prev
				prev.addAssign( subgroupBroadcast( prevAccGreatestValue, uint( 0 ) ) );

			} );

			If( invocationSubgroupIndex.equal( uint( 0 ) ), () => {

				subgroupReductionArray.element( invocationSubgroupMetaIndex ).assign( prev );

			} );

			workgroupBarrier();


			const offset0 = uint( 0 ).toVar();
			const offset1 = uint( 0 ).toVar();


			const subgroupAlignedSize = this._getSubgroupAlignedSize();

			// In cases where the number of subgroups in a workgroup is greater than the subgroup size itself,
			// we need to iterate over the array again to capture all the data in the workgroup array buffer
			this._subgroupAlignedSizeBlock( subgroupAlignedSize, ( j ) => {

				const i0 = (
					( invocationLocalIndex.add( offset0 ) ).shiftLeft( offset1 )
				).sub( offset0 );

				const pred0 = i0.lessThan( spineSize );

				const t0 = subgroupInclusiveAdd(
					select( pred0, subgroupReductionArray.element( i0 ), uint( 0 ) ).uniformFlow()
				).toVar();

				If( pred0, () => {

					subgroupReductionArray.element( i0 ).assign( t0 );

				} );

				workgroupBarrier();

				If( j.notEqual( subgroupSize ), () => {

					const rShift = j.shiftRight( subgroupSizeLog );
					const i1 = invocationLocalIndex.add( rShift );
					If( ( i1.bitAnd( j.sub( 1 ) ) ).greaterThanEqual( rShift ), () => {

						const pred1 = i1.lessThan( spineSize );
						const t1 = select(
							pred1,
							subgroupReductionArray.element( this._maskLowerBits( i1, offset1 ).sub( 1 ) ),
							uint( 0 )
						).uniformFlow();

						If(
							pred1.and(
								( i1.add( 1 ) ).bitAnd( rShift.sub( 1 ) ).notEqual( uint( 0 ) ) )
							, () => {

								subgroupReductionArray.element( i1 ).addAssign( t1 );

							}
						);

					} );

				} ).Else( () => {

					offset0.addAssign( 1 );

				} );

				offset1.addAssign( subgroupSize );

			} );

			workgroupBarrier();

			const spineScanWorkgroupReduction = select(
				workgroupId.x.notEqual( uint( 0 ) ),
				reductionBuffer.element( workgroupId.x.sub( 1 ) ),
				uint( 0 )
			).uniformFlow();

			const downsweepSubgroupReduction = select(
				invocationSubgroupMetaIndex.notEqual( 0 ),
				subgroupReductionArray.element( invocationSubgroupMetaIndex.sub( 1 ) ),
				uint( 0 )
			).uniformFlow();

			prev.assign( spineScanWorkgroupReduction.add( downsweepSubgroupReduction ) );

			// LAST BLOCK

			startThread.assign( startThreadBase );

			this._workPerInvocationBlock( ( currentSubgroupInBlock ) => {

				const sweepValue = tScan.element( currentSubgroupInBlock ).add( prev );
				outputBuffer.element( startThread ).assign( sweepValue );
				startThread.addAssign( subgroupSize );

			}, ( currentSubgroupInBlock ) => {

				If( startThread.lessThan( uint( vecCount ) ), () => {

					const sweepValue = tScan.element( currentSubgroupInBlock ).add( prev );
					outputBuffer.element( startThread ).assign( sweepValue );
					startThread.addAssign( subgroupSize );

				} );

			} );

		} )().compute( this.dispatchSize, [ this.workgroupSize ] );

		return fnDef;

	}


	/**
	 * Executes an intermediate reduction operation on the data buffer.
	 *
	 * @param {Renderer} renderer - The current scene's renderer.
	 */
	async computeReduce() {

		this.renderer.compute( this.computeFunctions.reduceFn );

	}

	/**
	 * Executes a spine scan operation on the data buffer.
	 *
	 * @param {Renderer} renderer - The current scene's renderer.
	 */
	async computeSpineScan() {

		this.renderer.compute( this.computeFunctions.spineScanFn );

	}

	/**
	 * Executes a downsweep operation on the data buffer.
	 *
	 * @param {Renderer} renderer - The current scene's renderer.
	 */
	async computeDownsweep() {

		this.renderer.compute( this.computeFunctions.downsweepFn );

	}

	/**
	 * Executes the next subsequent compute step of a prefix sum.
	 *
	 * @param {Renderer} renderer - A renderer with the ability to execute compute operations.
	 */
	async computeStep() {

		switch ( this.currentStep ) {

			case 'Reduce': {

				await this.computeReduce();
				this.currentStep = 'Spine_Scan';
				break;

			}

			case 'Spine_Scan': {

				await this.computeSpineScan();
				this.currenTstep = 'Downsweep';
				break;

			}

			case 'Downsweep': {

				await this.computeDownsweep();
				this.currentStep = 'Reduce';
				break;

			}

		}

	}

	/**
	 * Executes a complete prefix sum on the data buffer.
	 *
	 * @param {Renderer} renderer - The current scene's renderer.
	 */
	async compute() {

		await this.computeStep( this.currentStep );
		await this.computeStep( this.currentStep );
		await this.computeStep( this.currentStep );

	}

}
