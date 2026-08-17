import {
	StorageInstancedBufferAttribute,
} from 'three/webgpu';
import { Fn, If, instancedArray, invocationLocalIndex, countTrailingZeros, Loop, workgroupArray, subgroupSize, workgroupBarrier, workgroupId, uint, select, invocationSubgroupIndex, dot, uvec4, vec4, float, subgroupAdd, array, subgroupShuffle, subgroupInclusiveAdd, subgroupBroadcast, subgroupIndex, storage, int } from 'three/tsl';

const divRoundUp = ( size, part_size ) => {

	return Math.floor( ( size + part_size - 1 ) / part_size );

};

const getTypeFromTypedArray = ( typedArray ) => {

	switch ( typedArray.constructor.name ) {

		case 'Float32Array': {

			return 'float';

		}

		case 'Int32Array': {

			return 'int';

		}

		case 'Uint32Array': {

			return 'uint';

		}

		default: {

			return typedArray.constructor.name.substring( 0, - 6 ).toLowerCase();

		}

	}

};

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
 * @property {ComputeNode} spineScanShortFn - A compute shader that executes the spine scan step of a reduce-then-scan prefix sum. Assigned to this.computeFunctions.spineScanFn if data size is small enough.
 * @property {ComputeNode} spineScanLongFn - A compute shader that executes the spine scan step of a reduce-then-scan prefix sum. Assigned to this.computeFunctions.spineScanFn if data size is large enough.
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
	* A reusable GPU Prefix Sum which runs the most optimal prefix sum algorithm for the target device.
	* By default, this class will run an inclusive prefix sum on the GPU. Currently, prefix sums are
	* limited to one-dimensional data buffers ('float', 'int', 'uint') and will run either a serial or a reduce/scan prefix
	* sum depending on the capabilities of the client device.
	*
	* @param {BufferAttribute|TypedArray} input - The data to sum.
	* @param {Object} [options={}] - Options that modify the reduce/scan prefix sum.
	*/
export class PrefixSum {

	/**
	 * @param {BufferAttribute|TypedArray} input - The data to sum. A typed array is copied into a new
	 * storage attribute, zero padded so that its length is a multiple of four. A buffer attribute is used
	 * directly and must therefore already hold n % 4 == 0 elements.
	 * @param {Object} [options={}] - Options that modify the behavior of the prefix sum.
	 * @param {BufferAttribute} [options.outputAttribute] - The attribute the prefix sum is written into.
	 * Defaults to a new attribute matching the size and type of the input.
	 * @param {boolean} [options.isInclusive=true] - A flag determining whether to execute an exclusive prefix sum instead of the default inclusive prefix sum.
	 * @param {number} [options.workPerInvocation=4] - The number of vec4 elements read per invocation.
	 * @param {number} [options.workgroupSize=64] - The workgroup size of the compute shaders.
	 * @param {number} [options.minSubgroupSize=4] - The smallest subgroup size the generated shaders have to stay correct for. Defaults to the WGSL minimum of 4.
	 */
	constructor( input, options = {} ) {

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

		// Accepting an attribute rather than a typed array lets a caller hand over a buffer it
		// already binds elsewhere (e.g. CountingSort's histogram) so that this class can build its own
		// vec4 view of it. A vec4 storage node cannot be derived from an existing scalar storage node.

		/**
		 * The attribute holding the data to sum.
		 *
		 * @type {BufferAttribute}
		 */
		this.inputAttribute = ( input.isBufferAttribute === true )
			? input
			: new StorageInstancedBufferAttribute( input, 1 );

		console.log( this.inputAttribute );

		/**
		 * The attribute the prefix sum is written into.
		 *
		 * @type {BufferAttribute}
		 */
		this.outputAttribute = ( options.outputAttribute !== undefined )
			? options.outputAttribute
			: new StorageInstancedBufferAttribute( new this.inputAttribute.array.constructor( this.inputAttribute.array.length ), 1 );

		/**
		 * The type of each individual data element.
		 *
		 * @type {number}
		 */
		this.type = getTypeFromTypedArray( this.inputAttribute.array );

		this.vecType = 'vec4';

		if ( this.type === 'int' ) {

			this.vecType = 'ivec4';

		} else if ( this.type === 'uint' ) {

			this.vecType = 'uvec4';

		}

		/**
		 * The size of the data.
		 *
		 * @type {number}
		 */
		this.count = this.inputAttribute.array.length;

		/**
		 * A flag designating whether the module will execute an exclusive or inclusive prefix sum.
		 *
		 * @type {number}
		 */
		this.isInclusive = options.isInclusive !== undefined ? options.isInclusive : true;

		/**
		 * The number of 4-dimensional vectors needed to fully represent the data in the data buffer.
		 * Buffers where this.count % 4 !== 0 will need an additional vec4 to hold the data buffer's
		 * remaining elements.
		 *
		 * @type {number}
		 */
		this.vecCount = divRoundUp( this.count, 4 );

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
		this.workgroupSize = options.workgroupSize !== undefined ? options.workgroupSize : 64;

		/**
		 * The minimumn subgroup size the generated shaders have to stay correct for. Defaults to the
		 * WGSL minimum of 4 and is refined once a renderer is available in `_handleSubgroupInfo`.
		 *
		 * @type {number}
		*/
		this.minSubgroupSize = options.minSubgroupSize !== undefined ? options.minSubgroupSize : 4;

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

		this._createStorageBuffers();
		this._createUtilityNodes();

		/**
		 * The step of the prefix sum to execute.
		 *
		 * @type {'Reduce' | 'Spine_Scan' | 'Downsweep'}
		*/
		this.currentStep = 'Reduce';

		// Subgroup capable functions
		this.computeFunctions.reduceFn = this._getReduceFn();
		this.computeFunctions.spineScanShortFn = this._getSpineScanShortFn();
		this.computeFunctions.spineScanLongFn = this._getSpineScanLongFn();
		this.computeFunctions.downsweepFn = this._getDownsweepFn();
		// Single invocation prefix sum (default)
		this.computeFunctions.singleThreadPrefixFn = this._getSingleThreadPrefixFn();

		/**
		 * A function that takes a renderer and either runs a prefix sum or uses the renderer
		 * information to determine which prefix sum to run.
		 *
		 * @type {function(Renderer):void}
		*/
		this.compute = this._computeInitial;

	}

	_createStorageBuffers() {

		const { inputAttribute, outputAttribute } = this;

		this.storageBuffers.dataBuffer = storage( inputAttribute, this.vecType, this.vecCount ).setName( `Prefix_Sum_Input_Vec_${id}` );
		this.storageBuffers.unvectorizedDataBuffer = storage( inputAttribute, this.type, inputAttribute.array.length ).setName( `Prefix_Sum_Input_Unvec_${id}` );

		this.storageBuffers.outputBuffer = storage( outputAttribute, this.vecType, this.vecCount ).setName( `Prefix_Sum_Output_Vec_${id}` );
		this.storageBuffers.unvectorizedOutputBuffer = storage( outputAttribute, this.type, outputAttribute.array.length ).setName( `Prefix_Sum_Output_Unvec_${id}` );

		this.storageBuffers.reductionBuffer = instancedArray( this.numWorkgroups, this.type ).setPBO( true ).setName( `Prefix_Sum_Reduction_${id}` );

	}

	_createUtilityNodes() {

		this.utilityNodes.subgroupReductionArray = workgroupArray( this.type, Math.ceil( this.workgroupSize / 4 ) );
		this.utilityNodes.workgroupOffset = workgroupId.x.mul( uint( this.workgroupSize ).mul( this.workPerInvocation ) ).toVar( 'workgroupOffset' );
		this.utilityNodes.subgroupOffset = subgroupIndex.mul( subgroupSize ).mul( this.workPerInvocation ).toVar( 'subgroupOffset' );
		this.utilityNodes.unvectorizedSubgroupOffset = subgroupIndex.mul( subgroupSize ).mul( this.unvectorizedWorkPerInvocation ).toVar( 'unvectorizedSubgroupOffset' );
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
		// In many subgroupSize/workgroupSize combinations, this loop with only run once
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

	_getSingleThreadPrefixFn() {

		const { unvectorizedDataBuffer, unvectorizedOutputBuffer } = this.storageBuffers;
		const { count, isInclusive } = this;

		const fnDef = Fn( () => {

			const sum = this._getZeroNode().toVar( 'sum' );

			Loop( { start: 0, end: count, type: 'uint', name: 'i', condition: '<' }, ( { i } ) => {

				const value = unvectorizedDataBuffer.element( i );

				if ( isInclusive ) {

					sum.addAssign( value );

				}

				unvectorizedOutputBuffer.element( i ).assign( sum );

				if ( ! isInclusive ) {

					sum.addAssign( value );

				}

			} );

		} )().compute( 1 ).setName( 'SingleThreadPrefix' );

		return fnDef;

	}

	_getZeroNode() {

		switch ( this.type ) {

			case 'float': {

				return float( 0 );

			}

			case 'int': {

				return int( 0 );

			}

			case 'uint': {

				return uint( 0 );

			}

		}

	}

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

				subgroupReductionArray.element( subgroupIndex ).assign( subgroupReduction );

			} );

			// Ensure that each workgroup has populated the perSubgroupReductionArray with data
			// from each of it's subgroups
			workgroupBarrier();

			const subgroupAlignedSize = this._getSubgroupAlignedSize();

			const offset = uint( 0 );

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

		} )().compute( this.dispatchSize, [ this.workgroupSize ] ).setName( 'PrefixSumReduce' );

		return fnDef;

	}

	_maskLowerBits( inputNode, maskNode ) {

		return ( inputNode.shiftRight( maskNode ) ).shiftLeft( maskNode );

	}

	_getSpineScanShortFn() {

		const { reductionBuffer } = this.storageBuffers;

		const fnDef = Fn( () => {

			reductionBuffer.element( invocationSubgroupIndex ).assign( subgroupInclusiveAdd( reductionBuffer.element( invocationSubgroupIndex ) ) );

		} )().compute( this.numWorkgroups, [ this.workgroupSize ] ).setName( 'PrefixSumSpineScanShort' );

		return fnDef;

	}

	_getSpineScanLongFn() {

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

				If( invocationSubgroupIndex.equal( subgroupSize.sub( 1 ) ), () => {

					subgroupReductionArray.element( subgroupIndex ).assign( prev );

				} );

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
					subgroupIndex.notEqual( 0 ),
					subgroupReductionArray.element( subgroupIndex.sub( 1 ) ),
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

		} )().compute( this.numWorkgroups, [ this.workgroupSize ] ).setName( 'PrefixSumSpineScanLong' );

		return fnDef;

	}

	_getDownsweepFn() {

		const { dataBuffer, reductionBuffer, unvectorizedOutputBuffer } = this.storageBuffers;
		const { subgroupOffset, workgroupOffset, subgroupReductionArray, subgroupSizeLog, spineSize } = this.utilityNodes;

		const { workPerInvocation, vecCount, isInclusive } = this;

		const outputIndexOffset = isInclusive ? 0 : 1;

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

				// Vector read by lane 0 does not get changed since it is already prefix summed
				// within context of its subgroup, so we don't want to add greatest value for it.
				// The purpose of shuffling to all lanes of the subgroup including lane 0 is simply
				// to have the greatest value accessible for the broadcast from lane 0.

				if ( this.vecType === 'uvec4' ) {

					addEle = prev.add( select( isNotInvocationSubgroupIndex0, prevAccGreatestValue, uvec4( 0 ) ).uniformFlow() );

				} else {

					addEle = prev.add( select( isNotInvocationSubgroupIndex0, prevAccGreatestValue, vec4( 0 ) ).uniformFlow() );

				}

				tScan.element( currentSubgroupInBlock ).addAssign( addEle );

				// Broadcast value of invocationSubgroupIndex 0 ( which is usually largest value ) to prev
				prev.addAssign( subgroupBroadcast( prevAccGreatestValue, uint( 0 ) ) );

			} );

			If( invocationSubgroupIndex.equal( uint( 0 ) ), () => {

				subgroupReductionArray.element( subgroupIndex ).assign( prev );

			} );

			workgroupBarrier();

			const offset0 = uint( 0 ).toVar();
			const offset1 = uint( 0 ).toVar();

			const subgroupAlignedSize = this._getSubgroupAlignedSize();

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

				offset1.addAssign( subgroupSizeLog );

			} );

			workgroupBarrier();

			const spineScanWorkgroupReduction = select(
				workgroupId.x.notEqual( uint( 0 ) ),
				reductionBuffer.element( workgroupId.x.sub( 1 ) ),
				uint( 0 )
			).uniformFlow();

			const downsweepSubgroupReduction = select(
				subgroupIndex.notEqual( 0 ),
				subgroupReductionArray.element( subgroupIndex.sub( 1 ) ),
				uint( 0 )
			).uniformFlow();

			prev.assign( spineScanWorkgroupReduction.add( downsweepSubgroupReduction ) );

			// LAST BLOCK

			startThread.assign( startThreadBase );

			// The sweep value is written one component at a time into an unvectorized view of
			// the output buffer
			const writeSweepValue = ( currentSubgroupInBlock ) => {

				const outputIndex = startThread.mul( 4 ).add( uint( outputIndexOffset ) ).toVar();
				const outputValueToWrite = tScan.element( currentSubgroupInBlock ).add( prev ).toVar();

				unvectorizedOutputBuffer.element( outputIndex ).assign( outputValueToWrite.x );
				unvectorizedOutputBuffer.element( outputIndex.add( 1 ) ).assign( outputValueToWrite.y );
				unvectorizedOutputBuffer.element( outputIndex.add( 2 ) ).assign( outputValueToWrite.z );
				unvectorizedOutputBuffer.element( outputIndex.add( 3 ) ).assign( outputValueToWrite.w );

				startThread.addAssign( subgroupSize );

			};

			this._workPerInvocationBlock( writeSweepValue, ( currentSubgroupInBlock ) => {

				If( startThread.lessThan( uint( vecCount ) ), () => {

					writeSweepValue( currentSubgroupInBlock );

				} );

			} );

			// If there is an output offset, append additional code to the downsweep
			// shader ensuring invocation 0 zeros out all data in the range [0-outputIndexOffset]
			if ( outputIndexOffset > 0 ) {

				workgroupBarrier();

				If( workgroupId.x.equal( uint( 0 ) ).and( invocationLocalIndex.equal( uint( 0 ) ) ), () => {

					Loop( { start: 0, end: outputIndexOffset, type: 'uint', condition: '<', name: 'x' }, ( { x } ) => {

						unvectorizedOutputBuffer.element( x ).assign( this._getZeroNode() );

					} );

				} );

			}

		} )().compute( this.dispatchSize, [ this.workgroupSize ] ).setName( 'PrefixSumDownsweep' );

		return fnDef;

	}

	_handleSubgroupInfo( renderer ) {

		const device = renderer.backend.device;

		if ( device !== undefined && device.adapterInfo && device.adapterInfo.subgroupMinSize ) {

			this.minSubgroupSize = device.adapterInfo.subgroupMinSize;

		} else {

			return false;

		}

		if ( this.numWorkgroups <= this.minSubgroupSize ) {

			this.computeFunctions.spineScanFn = this.computeFunctions.spineScanShortFn;
			return true;

		}

		this.computeFunctions.spineScanFn = this.computeFunctions.spineScanLongFn;
		return true;

	}

	_computeInitial( renderer ) {

		if ( renderer.hasFeature( 'subgroups' ) ) {

			const hasParsedSubgroupInfo = this._handleSubgroupInfo( renderer );
			if ( hasParsedSubgroupInfo ) {

				this._computeWithSubgroups( renderer );
				this.compute = this._computeWithSubgroups;
				return;

			}

		}

		this._computeWithSingleInvocation( renderer );
		this.compute = this._computeWithSingleInvocation;

	}

	_computeWithSingleInvocation( renderer ) {

		renderer.compute( this.computeFunctions.singleThreadPrefixFn );

	}

	_computeWithSubgroups( renderer ) {

		renderer.compute( this.computeFunctions.reduceFn );
		renderer.compute( this.computeFunctions.spineScanFn );
		renderer.compute( this.computeFunctions.downsweepFn );

	}

}
