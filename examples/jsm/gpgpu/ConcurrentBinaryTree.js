import { StorageBufferAttribute } from 'three/webgpu';
import { Fn, If, Loop, atomicAnd, atomicOr, countOneBits, instanceIndex, invocationLocalIndex, select, storage, uint, uniform, workgroupArray, workgroupBarrier } from 'three/tsl';

const WORD_DEPTH = 5; // log2( 32 ), a 32-bit word holds the bits of a depth 5 subtree
const MIN_DEPTH = WORD_DEPTH + 1;
const REDUCE_WORKGROUP_DEPTH = 8; // log2( reduction workgroup size )

/**
 * A concurrent binary tree (CBT) as described in "Concurrent Binary Trees (with application to
 * longest edge bisection)" by Jonathan Dupuy (HPG 2020), used as the manager of a memory pool as in
 * "Concurrent Binary Trees for Large-Scale Game Components" by Anis Benyoub and Jonathan Dupuy
 * (HPG 2024).
 *
 * The tree tracks which blocks of a pool of `capacity` fixed-size blocks are in use: each block
 * has a bit in a bitfield, set while the block is in use, so any number of GPU threads can allocate
 * and free blocks concurrently with `atomicOr()` / `atomicAnd()`. A sum reduction tree over the
 * bitfield then counts the used blocks and finds the `n`-th used or free block with a binary
 * search, so threads can be scheduled over the used blocks, and allocations can be handed out from
 * an atomic counter.
 *
 * The bitfield has `2^depth` bits, with the bits past the capacity set, so they are never handed
 * out. The sum reduction stores counts for all depths up to `depth - 5`, the deeper levels are
 * resolved with `countOneBits()` on a single bitfield word. Total memory is `3 * 2^depth` bits.
 *
 * The TSL helper methods emit code into the current shader, so they must be called inside a `Fn()`.
 *
 * ```js
 * const cbt = new ConcurrentBinaryTree( 1024 );
 * cbt.setUsed( 1 ); // the first block is in use
 *
 * // every frame: allocate blocks with cbt.findFree() and cbt.setBit(), free them with cbt.clearBit(),
 * // then rebuild the sum reduction, after which cbt.findUsed() finds the blocks in use
 * renderer.compute( [ updateNode, ...cbt.reduceNodes ] );
 * ```
 *
 * @three_import import { ConcurrentBinaryTree } from 'three/addons/gpgpu/ConcurrentBinaryTree.js';
 */
class ConcurrentBinaryTree {

	/**
	 * Constructs a new concurrent binary tree.
	 *
	 * @param {number} capacity - The number of blocks of the pool, at most `2^30`.
	 */
	constructor( capacity ) {

		if ( capacity < 1 || capacity > 2 ** 30 ) {

			throw new Error( 'ConcurrentBinaryTree: capacity must be in the range [ 1, 2^30 ].' );

		}

		/**
		 * The number of blocks of the pool.
		 *
		 * @type {number}
		 */
		this.capacity = capacity;

		/**
		 * The depth of the tree, its bitfield has `2^depth` bits.
		 *
		 * @type {number}
		 */
		this.depth = Math.max( Math.ceil( Math.log2( capacity ) ), MIN_DEPTH );

		/**
		 * The depth of the sum reduction, whose deepest level counts the bits of each bitfield word.
		 *
		 * @type {number}
		 */
		this.sumDepth = this.depth - WORD_DEPTH;

		const wordCount = 2 ** this.sumDepth;
		const heapCount = 2 ** ( this.sumDepth + 1 );

		/**
		 * The bitfield, one bit per block.
		 *
		 * @type {StorageBufferAttribute}
		 */
		this.bitfieldAttribute = new StorageBufferAttribute( new Uint32Array( wordCount ), 1 );

		/**
		 * The sum reduction tree as a binary heap, the root at index `1`.
		 *
		 * @type {StorageBufferAttribute}
		 */
		this.heapAttribute = new StorageBufferAttribute( new Uint32Array( heapCount ), 1 );

		/**
		 * Read access to the bitfield.
		 *
		 * @type {StorageBufferNode}
		 */
		this.bitfield = storage( this.bitfieldAttribute, 'uint' ).toReadOnly().setName( 'cbtBitfield' );

		/**
		 * Atomic access to the bitfield.
		 *
		 * @type {StorageBufferNode}
		 */
		this.bitfieldAtomic = storage( this.bitfieldAttribute, 'uint' ).toAtomic().setName( 'cbtBitfieldAtomic' );

		/**
		 * Read access to the sum reduction.
		 *
		 * @type {StorageBufferNode}
		 */
		this.heap = storage( this.heapAttribute, 'uint' ).toReadOnly().setName( 'cbtHeap' );

		/**
		 * Write access to the sum reduction, for the reduction passes.
		 *
		 * @type {StorageBufferNode}
		 */
		this.heapWrite = storage( this.heapAttribute, 'uint' ).setName( 'cbtHeapWrite' );

		// the number of bits past the capacity, a uniform so the trees of the same depth share their shaders

		this._padding = uniform( 2 ** this.depth - capacity, 'uint' );

		/**
		 * The compute nodes rebuilding the sum reduction after the bitfield changed, to be run in order.
		 *
		 * @type {Array<ComputeNode>}
		 */
		this.reduceNodes = [];

		for ( let depth = this.sumDepth; depth > 0; depth -= REDUCE_WORKGROUP_DEPTH ) {

			this.reduceNodes.push( this._createReduceNode( depth, Math.max( depth - REDUCE_WORKGROUP_DEPTH, 0 ) ) );

		}

	}

	/**
	 * Marks the first blocks as used and all others as free. The sum reduction is not updated, run
	 * the reduction nodes before searching the tree.
	 *
	 * @param {number} count - The number of used blocks.
	 */
	setUsed( count ) {

		const array = this.bitfieldAttribute.array;

		array.fill( 0 );

		const set = ( bit ) => array[ bit >>> 5 ] |= 1 << ( bit & 31 );

		for ( let bit = 0; bit < count; bit ++ ) set( bit );
		for ( let bit = this.capacity; bit < 2 ** this.depth; bit ++ ) set( bit );

		this.bitfieldAttribute.needsUpdate = true;

	}

	// TSL helpers

	/**
	 * Returns the number of used blocks.
	 *
	 * @return {Node<uint>} The number of used blocks.
	 */
	count() {

		return this.heap.element( 1 ).sub( this._padding );

	}

	/**
	 * Returns the block of the given index among the used blocks, in the order of the pool.
	 *
	 * @param {Node<uint>} index - The index, less than the number of used blocks.
	 * @return {Node<uint>} The block.
	 */
	findUsed( index ) {

		return this._find( index, true );

	}

	/**
	 * Returns the block of the given index among the free blocks, in the order of the pool.
	 *
	 * @param {Node<uint>} index - The index, less than the number of free blocks.
	 * @return {Node<uint>} The block.
	 */
	findFree( index ) {

		return this._find( index, false );

	}

	/**
	 * Marks the given block as used.
	 *
	 * @param {Node<uint>} block - The block.
	 */
	setBit( block ) {

		atomicOr( this.bitfieldAtomic.element( block.shiftRight( 5 ) ), uint( 1 ).shiftLeft( block.bitAnd( 31 ) ) );

	}

	/**
	 * Marks the given block as free.
	 *
	 * @param {Node<uint>} block - The block.
	 */
	clearBit( block ) {

		atomicAnd( this.bitfieldAtomic.element( block.shiftRight( 5 ) ), uint( 1 ).shiftLeft( block.bitAnd( 31 ) ).bitNot() );

	}

	/**
	 * Descends the sum reduction to the bit of the given index among the set or the clear bits: at
	 * each node, the index goes to the left child if it holds more such bits, else to the right with
	 * their number subtracted.
	 *
	 * @private
	 * @param {Node<uint>} index - The index.
	 * @param {boolean} used - Whether to count set bits, else clear bits.
	 * @return {Node<uint>} The bit.
	 */
	_find( index, used ) {

		const id = uint( 1 ).toVar();
		const remainder = uint( index ).toVar();
		const width = uint( 2 ** ( this.depth - 1 ) ).toVar(); // the number of bits under a child

		Loop( this.sumDepth, () => {

			const leftUsed = this.heap.element( id.mul( 2 ) );
			const left = ( used ? leftUsed : width.sub( leftUsed ) ).toVar();
			const right = remainder.greaterThanEqual( left );

			remainder.subAssign( select( right, left, uint( 0 ) ) );
			id.assign( id.mul( 2 ).add( select( right, uint( 1 ), uint( 0 ) ) ) );
			width.shiftRightAssign( 1 );

		} );

		// within the word

		const word = this.bitfield.element( id.sub( 2 ** this.sumDepth ) ).toVar();
		const bits = used ? word : word.bitNot();
		const offset = uint( 0 ).toVar();
		const half = uint( 16 ).toVar();

		Loop( WORD_DEPTH, () => {

			const left = countOneBits( bits.shiftRight( offset ).bitAnd( uint( 1 ).shiftLeft( half ).sub( 1 ) ) ).toVar();
			const right = remainder.greaterThanEqual( left );

			remainder.subAssign( select( right, left, uint( 0 ) ) );
			offset.addAssign( select( right, half, uint( 0 ) ) );
			half.shiftRightAssign( 1 );

		} );

		return id.sub( 2 ** this.sumDepth ).shiftLeft( WORD_DEPTH ).add( offset );

	}

	/**
	 * Creates a compute node reducing the sum tree from the given depth up to the given depth, one
	 * workgroup per subtree. The first pass counts the bits of the bitfield words.
	 *
	 * @private
	 * @param {number} startDepth - The deepest level, whose values are read.
	 * @param {number} endDepth - The shallowest level written.
	 * @return {ComputeNode} The compute node.
	 */
	_createReduceNode( startDepth, endDepth ) {

		const workgroupSize = 2 ** REDUCE_WORKGROUP_DEPTH;
		const nodeCount = 2 ** startDepth;

		// named, so the trees of the same depth share their shaders

		const shared = workgroupArray( 'uint', workgroupSize ).setName( 'cbtReduceShared' );

		const fn = Fn( () => {

			const index = instanceIndex;
			const localIndex = invocationLocalIndex;
			const value = uint( 0 ).toVar();

			If( index.lessThan( nodeCount ), () => {

				if ( startDepth === this.sumDepth ) {

					value.assign( countOneBits( this.bitfield.element( index ) ) );
					this.heapWrite.element( index.add( nodeCount ) ).assign( value );

				} else {

					value.assign( this.heapWrite.element( index.add( nodeCount ) ) );

				}

			} );

			shared.element( localIndex ).assign( value );

			workgroupBarrier();

			for ( let level = 1; level <= startDepth - endDepth; level ++ ) {

				const stride = 2 ** level;

				If( index.lessThan( nodeCount ).and( localIndex.bitAnd( stride - 1 ).equal( 0 ) ), () => {

					const sum = shared.element( localIndex ).add( shared.element( localIndex.add( stride / 2 ) ) ).toVar();

					shared.element( localIndex ).assign( sum );
					this.heapWrite.element( index.shiftRight( level ).add( 2 ** ( startDepth - level ) ) ).assign( sum );

				} );

				workgroupBarrier();

			}

		} );

		return fn().compute( Math.max( nodeCount, workgroupSize ), [ workgroupSize ] ).setName( 'cbtReduce' + startDepth );

	}

	/**
	 * Frees the GPU-related resources allocated by this instance.
	 */
	dispose() {

		for ( const node of this.reduceNodes ) node.dispose();

		this.bitfieldAttribute.dispose();
		this.heapAttribute.dispose();

	}

}

export { ConcurrentBinaryTree };
