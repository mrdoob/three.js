import { StorageBufferAttribute } from 'three/webgpu';
import {
	Fn, If, instanceIndex, storage, uint, int, ivec2, uvec2, uniform, float, vec2, vec4, cos, sin,
	storageTexture, textureStore, luminance, NodeAccess,
	workgroupArray, workgroupBarrier, workgroupId, invocationLocalIndex, globalId, localId
} from 'three/tsl';

/**
 * Returns `true` if `value` is a power of two.
 *
 * @param {number} value
 * @returns {boolean}
 */
function isPowerOfTwo( value ) {

	return value > 0 && ( value & ( value - 1 ) ) === 0;

}

/**
 * The WebGPU spec's *guaranteed-minimum* compute limits -- every conformant device supports at
 * least this much, so these are the values assumed when the real device's limits can't be read
 * (see `getComputeLimits`). Real hardware is usually far more generous (as of 2026, real-world
 * WebGPU device surveys put ~94-99% of devices at 4x these invocation/workgroup-size numbers and
 * 2x this storage size), which is exactly why `FFT2D` queries the actual device instead of
 * hardcoding around this floor.
 *
 * @type {{maxComputeInvocationsPerWorkgroup: number, maxComputeWorkgroupSizeX: number, maxComputeWorkgroupSizeY: number, maxComputeWorkgroupStorageSize: number}}
 */
const MINIMUM_COMPUTE_LIMITS = {
	maxComputeInvocationsPerWorkgroup: 256,
	maxComputeWorkgroupSizeX: 256,
	maxComputeWorkgroupSizeY: 256,
	maxComputeWorkgroupStorageSize: 16384
};

/**
 * Reads the real `GPUDevice.limits` behind a renderer, falling back to `MINIMUM_COMPUTE_LIMITS`
 * when they're not available (a non-WebGPU backend, or a WebGPU backend that hasn't finished
 * `renderer.init()` yet). `renderer.backend.device` is guaranteed populated as soon as
 * `renderer.init()` resolves, so this is safe to call from `computeForward`/`computeInverse`,
 * which always run after that.
 *
 * @param {Renderer} renderer
 * @returns {Object} A `GPUSupportedLimits`-shaped object (real or the guaranteed-minimum fallback).
 */
function getComputeLimits( renderer ) {

	const backend = renderer.backend;

	if ( backend.isWebGPUBackend === true && backend.device !== null ) {

		return backend.device.limits;

	}

	return MINIMUM_COMPUTE_LIMITS;

}

/**
 * Computes the longest line length (row width or column height) that `buildFusedLineStage` can
 * safely transform in a single dispatch, one workgroup per line, entirely in workgroup-shared
 * memory, given a device's real compute limits.
 *
 * A fused line of length `N` needs `half = N / 2` invocations per workgroup (bounded by both the
 * per-workgroup invocation count and the workgroup's X-dimension size -- fused dispatches here are
 * always 1D) and 2 shared `vec2` buffers of `N` elements each (`16 * N` bytes total) within the
 * workgroup storage budget. This returns the largest power of two satisfying both.
 *
 * @param {Object} limits - A `GPUSupportedLimits`-shaped object, e.g. from `getComputeLimits`.
 * @returns {number} The largest fusable line length (a power of two, `>= 2`).
 */
function computeMaxFusedLineLength( limits ) {

	const maxInvocations = Math.min( limits.maxComputeInvocationsPerWorkgroup, limits.maxComputeWorkgroupSizeX );
	const maxStorageBytes = limits.maxComputeWorkgroupStorageSize;

	let N = 2;

	while ( ( N * 2 ) / 2 <= maxInvocations && 16 * ( N * 2 ) <= maxStorageBytes ) {

		N *= 2;

	}

	return N;

}

/**
 * Computes the largest square tile edge length `buildTransposeStage` can safely use on a device
 * with the given compute limits: `tile * tile` invocations per workgroup (bounded by the
 * per-workgroup invocation count and both the X and Y workgroup-size limits, since a transpose
 * dispatch is 2D), and one shared `vec2` tile of `tile * tile` elements (`8 * tile * tile` bytes)
 * within the workgroup storage budget. Returns the largest power of two satisfying both.
 *
 * @param {Object} limits - A `GPUSupportedLimits`-shaped object, e.g. from `getComputeLimits`.
 * @returns {number} The largest safe tile edge length (a power of two, `>= 2`).
 */
function computeTransposeTileSize( limits ) {

	const maxInvocations = Math.min(
		limits.maxComputeInvocationsPerWorkgroup,
		limits.maxComputeWorkgroupSizeX,
		limits.maxComputeWorkgroupSizeY
	);
	const maxStorageBytes = limits.maxComputeWorkgroupStorageSize;

	let T = 2;

	while ( ( T * 2 ) * ( T * 2 ) <= maxInvocations && 8 * ( T * 2 ) * ( T * 2 ) <= maxStorageBytes ) {

		T *= 2;

	}

	return T;

}

/**
 * Builds one radix-2 Stockham "autosort" FFT butterfly stage, generalized so it can process many
 * independent, *contiguous* 1D lines of a 2D buffer at once (`lineStride` = a line's length,
 * `elementStride = 1`). Used directly for the row pass, and again for the column pass after
 * `buildTransposeStage` has turned each column into a contiguous line -- see `FFT2D` for the
 * full row/transpose/column/transpose-back pipeline this is one piece of.
 *
 * The Stockham formulation ping-pongs between two buffers every stage and never needs a
 * separate bit-reversal permutation pass, at the cost of alternating which buffer holds the
 * live data after every stage -- see `FFT2D` for how the ping-pong bookkeeping is driven from
 * the CPU side.
 *
 * This is the fallback used only for lines longer than the device can fuse (see
 * `computeMaxFusedLineLength`): it dispatches once *per stage*, reading and writing the whole
 * buffer through global (VRAM) storage every time. `buildFusedLineStage` does the same math but
 * for a whole line's worth of stages in one dispatch, entirely in on-chip workgroup-shared memory,
 * and is preferred whenever a line is short enough to fit -- see `FFT2D#_ensureButterfliesBuilt`
 * for the per-axis choice between the two.
 *
 * @tsl
 * @private
 * @param {Object} params
 * @param {number} params.N - The length of each 1D line being transformed (a power of two).
 * @param {number} params.lineStride - Address increment between lines (each line's length -- `width` for a row pass, `height` for a post-transpose column pass).
 * @param {number} params.elementStride - Address increment between consecutive elements of a line. Always `1` here -- both callers only ever pass contiguous lines.
 * @param {number} params.lineCount - How many independent lines are transformed in parallel (`height` for a row pass, `width` for a post-transpose column pass).
 * @param {Node<uint>} params.pUniform - The per-stage span uniform (doubles every stage, from 1 to N/2).
 * @param {StorageBufferNode} readNode - The buffer this stage reads from.
 * @param {StorageBufferNode} writeNode - The buffer this stage writes to.
 * @returns {Function} A parameterless TSL function ready to `.compute( dispatchCount )`.
 */
function buildMultiDispatchStage( { N, lineStride, elementStride, lineCount, pUniform }, readNode, writeNode ) {

	const half = N / 2;
	const dispatchCount = half * lineCount;

	return Fn( () => {

		const t = instanceIndex;
		const line = t.div( uint( half ) );
		const tt = t.mod( uint( half ) );

		const p = pUniform;
		const hi = tt.div( p );
		const lo = tt.mod( p );

		const lineBase = line.mul( uint( lineStride ) );

		const idx1 = lineBase.add( hi.mul( p ).add( lo ).mul( uint( elementStride ) ) );
		const idx2 = idx1.add( uint( half * elementStride ) );

		const v0 = readNode.element( idx1 ).toVar( 'v0' );
		const v1 = readNode.element( idx2 ).toVar( 'v1' );

		// angle = -2*PI*lo/(2*p) = -PI*lo/p (forward transform sign convention;
		// the inverse transform is obtained by conjugating input and output around
		// this same forward kernel -- see FFT2D#computeInverse).
		const angle = float( -Math.PI ).mul( float( lo ) ).div( float( p ) );
		const c = cos( angle );
		const s = sin( angle );

		const v1r = v1.x.mul( c ).sub( v1.y.mul( s ) );
		const v1i = v1.x.mul( s ).add( v1.y.mul( c ) );

		const out0 = vec2( v0.x.add( v1r ), v0.y.add( v1i ) );
		const out1 = vec2( v0.x.sub( v1r ), v0.y.sub( v1i ) );

		const j = lineBase.add( hi.mul( p ).mul( 2 ).add( lo ).mul( uint( elementStride ) ) );
		const j2 = j.add( p.mul( uint( elementStride ) ) );

		writeNode.element( j ).assign( out0 );
		writeNode.element( j2 ).assign( out1 );

	} )().compute( dispatchCount );

}

/**
 * Builds an entire 1D line's radix-2 Stockham FFT -- every stage, for one row or one column --
 * as a *single* dispatch, one workgroup per line, running entirely in on-chip workgroup-shared
 * memory. This replaces `log2(N)` separate dispatches (one per stage, each a full round trip
 * through global VRAM via `buildMultiDispatchStage`) with exactly one dispatch that does one
 * global read, all `log2(N)` butterfly stages against two shared-memory ping-pong buffers
 * (swapped in JS between stages, mirroring the CPU-side bookkeeping in
 * `FFT2D#_runButterflyPasses`), and one global write.
 *
 * Only usable when a whole line's working set -- `half = N / 2` invocations plus two `vec2`
 * shared buffers of `N` elements -- fits within a single workgroup; see `computeMaxFusedLineLength`.
 * The stage loop is unrolled in JavaScript at build time (stage count is fixed per `FFT2D`
 * instance), so `p` is a compile-time constant per stage rather than a uniform, and there is no
 * bit-reversal or extra bookkeeping beyond the shared-buffer swap.
 *
 * @tsl
 * @private
 * @param {Object} params
 * @param {number} params.N - The length of each 1D line being transformed (a power of two, `<= computeMaxFusedLineLength(...)` for the target device).
 * @param {number} params.lineStride - Address increment between lines (each line's length -- `width` for a row pass, `height` for a post-transpose column pass).
 * @param {number} params.elementStride - Address increment between consecutive elements of a line. Always `1` here -- both callers only ever pass contiguous lines.
 * @param {number} params.lineCount - How many independent lines are transformed in parallel (one workgroup each).
 * @param {StorageBufferNode} readNode - The buffer this pass reads from.
 * @param {StorageBufferNode} writeNode - The buffer this pass writes to.
 * @returns {Function} A parameterless TSL function ready to `.compute( dispatchCount, [ half ] )`.
 */
function buildFusedLineStage( { N, lineStride, elementStride, lineCount }, readNode, writeNode ) {

	const half = N / 2;
	const stages = Math.log2( N );
	const dispatchCount = lineCount * half;

	const localA = workgroupArray( 'vec2', N );
	const localB = workgroupArray( 'vec2', N );

	return Fn( () => {

		// One workgroup per line: `workgroupId.x` picks the line, `invocationLocalIndex` is this
		// invocation's position within it (0..half-1) -- the same roles `line`/`tt` play in
		// `buildMultiDispatchStage`, just addressed locally instead of via a flattened `instanceIndex`.
		const line = workgroupId.x;
		const t = invocationLocalIndex;

		const lineBase = line.mul( uint( lineStride ) );
		const t2 = t.add( uint( half ) );

		// Load the whole line into shared memory once -- everything below happens on-chip.
		localA.element( t ).assign( readNode.element( lineBase.add( t.mul( uint( elementStride ) ) ) ) );
		localA.element( t2 ).assign( readNode.element( lineBase.add( t2.mul( uint( elementStride ) ) ) ) );

		workgroupBarrier();

		let readBuf = localA;
		let writeBuf = localB;

		for ( let s = 0; s < stages; s ++ ) {

			const p = 1 << s;

			const hi = t.div( uint( p ) );
			const lo = t.mod( uint( p ) );

			const idx1 = hi.mul( uint( p ) ).add( lo );
			const idx2 = idx1.add( uint( half ) );

			const v0 = readBuf.element( idx1 ).toVar( 'v0' );
			const v1 = readBuf.element( idx2 ).toVar( 'v1' );

			// Same forward-transform kernel as `buildMultiDispatchStage` -- see its comment on
			// the angle/sign convention -- just reading/writing shared memory instead of global.
			const angle = float( -Math.PI ).mul( float( lo ) ).div( float( p ) );
			const c = cos( angle );
			const si = sin( angle );

			const v1r = v1.x.mul( c ).sub( v1.y.mul( si ) );
			const v1i = v1.x.mul( si ).add( v1.y.mul( c ) );

			const out0 = vec2( v0.x.add( v1r ), v0.y.add( v1i ) );
			const out1 = vec2( v0.x.sub( v1r ), v0.y.sub( v1i ) );

			const j = hi.mul( uint( p * 2 ) ).add( lo );
			const j2 = j.add( uint( p ) );

			writeBuf.element( j ).assign( out0 );
			writeBuf.element( j2 ).assign( out1 );

			// Every invocation in the workgroup must finish writing this stage's outputs before
			// any of them starts reading as inputs to the next stage.
			workgroupBarrier();

			[ readBuf, writeBuf ] = [ writeBuf, readBuf ];

		}

		// After the loop, `readBuf` is whichever shared buffer the last stage wrote to.
		writeNode.element( lineBase.add( t.mul( uint( elementStride ) ) ) ).assign( readBuf.element( t ) );
		writeNode.element( lineBase.add( t2.mul( uint( elementStride ) ) ) ).assign( readBuf.element( t2 ) );

	} )().compute( dispatchCount, [ half ] );

}

/**
 * Builds a tiled matrix-transpose compute pass: reads a `rows x cols` row-major buffer and writes
 * its `cols x rows` transpose, using a workgroup-shared-memory tile so that *both* the read and
 * the write are coalesced.
 *
 * This exists to fix the column pass's naturally strided memory access: naively transforming a
 * column directly means `elementStride = width` (see the pre-transpose version of this class), so
 * consecutive invocations touch memory `width` floats apart -- a textbook uncoalesced access
 * pattern, and a much worse bandwidth bottleneck than the row pass's contiguous one. Transposing
 * first turns the column pass into a second contiguous, `buildFusedLineStage`/
 * `buildMultiDispatchStage`-shaped "row pass" over the transposed data (see `FFT2D`'s full
 * row/transpose/column/transpose-back pipeline), at the cost of the two transpose passes
 * themselves -- which this tiling keeps cheap by making even *those* fully coalesced in both
 * directions, unlike a naive read-transposed-write-plain (or read-plain-write-transposed) kernel,
 * which can only ever coalesce one side.
 *
 * The trick: each workgroup loads a `tile x tile` block from the source into a shared array
 * (contiguous, since consecutive invocations along the source's fast axis land on contiguous
 * source addresses), then writes it back out with the *local* x/y coordinates swapped -- not the
 * global ones -- which keeps the destination write contiguous too, despite every element ending
 * up at a transposed global position. `globalId`/`localId`/`workgroupId` are used directly here
 * (rather than the flattened `instanceIndex`/`invocationLocalIndex` the other stages use) because
 * the tile math is inherently 2D.
 *
 * @tsl
 * @private
 * @param {Object} params
 * @param {number} params.rows - Row count of the buffer `readNode` is read as (row-major, row length `cols`).
 * @param {number} params.cols - Column count (row length) of the buffer `readNode` is read as.
 * @param {number} params.tile - Tile edge length; the workgroup is `tile x tile` (see `computeTransposeTileSize`).
 * @param {StorageBufferNode} readNode - The buffer this pass reads from, as `rows x cols`.
 * @param {StorageBufferNode} writeNode - The buffer this pass writes to, as `cols x rows` (the transpose).
 * @returns {Function} A parameterless TSL function ready to `.compute( [ numWorkgroupsX, numWorkgroupsY ], [ tile, tile ] )`.
 */
function buildTransposeStage( { rows, cols, tile }, readNode, writeNode ) {

	const sharedTile = workgroupArray( 'vec2', tile * tile );

	const numWorkgroupsX = Math.ceil( cols / tile );
	const numWorkgroupsY = Math.ceil( rows / tile );

	const fn = Fn( () => {

		const gx = globalId.x;
		const gy = globalId.y;
		const lx = localId.x;
		const ly = localId.y;
		const wx = workgroupId.x;
		const wy = workgroupId.y;

		// Load phase: (gx, gy) in the source (rows x cols) buffer is contiguous as gx varies, so
		// this read is coalesced. `.compute()` with an explicit 2D workgroup count (see below)
		// doesn't get an automatic bounds check the way a plain numeric count does, so guard it
		// by hand -- `rows`/`cols` won't generally be exact multiples of `tile`.
		If( gx.lessThan( uint( cols ) ).and( gy.lessThan( uint( rows ) ) ), () => {

			sharedTile.element( ly.mul( uint( tile ) ).add( lx ) ).assign( readNode.element( gy.mul( uint( cols ) ).add( gx ) ) );

		} );

		workgroupBarrier();

		// Store phase: write this tile's data to its transposed position, `outY * rows + outX`,
		// with local x/y swapped relative to the load -- `outX` (built from `lx`, the fast local
		// axis) is the destination's contiguous axis, so this write is coalesced too.
		const outX = wy.mul( uint( tile ) ).add( lx );
		const outY = wx.mul( uint( tile ) ).add( ly );

		If( outX.lessThan( uint( rows ) ).and( outY.lessThan( uint( cols ) ) ), () => {

			writeNode.element( outY.mul( uint( rows ) ).add( outX ) ).assign( sharedTile.element( lx.mul( uint( tile ) ).add( ly ) ) );

		} );

	} )().compute( [ numWorkgroupsX, numWorkgroupsY ], [ tile, tile ] );

	return fn;

}

/**
 * A GPU 2D complex-to-complex FFT (WebGPU only), implemented as a row/column decomposition of
 * two iterative radix-2 Stockham autosort 1D FFTs -- see `buildFusedLineStage` (used whenever a
 * row/column fits in workgroup-shared memory) and `buildMultiDispatchStage` (the fallback for
 * longer lines). Both the row and column passes run as contiguous, coalesced line transforms:
 * the column pass runs on data transposed by `buildTransposeStage` first (then transposed back
 * afterwards), rather than reading/writing the original buffer with a `width`-sized stride.
 *
 * `width` and `height` must both be powers of two.
 *
 * Data is stored as `count = width * height` complex numbers (`vec2`, `(real, imag)`), row-major,
 * across two ping-pong storage buffers. A real-valued image is transformed by writing it in with
 * a zero imaginary part -- the result is still fully complex in general (a real input's spectrum
 * has Hermitian symmetry, `X[k] == conj(X[-k])`, but is not itself real, except at the DC and, for
 * even sizes, Nyquist bins).
 *
 * The inverse transform reuses the exact same forward butterfly kernels via the standard
 * conjugation identity `ifft(x) = conj( fft( conj(x) ) ) / (width*height)`, rather than shipping a
 * second set of shaders with negated twiddle factors.
 *
 * Each `FFT2D` instance transforms a single scalar channel (see `packTexture`'s `channel` option:
 * a combined luminance value, or one raw color channel). To FFT/reconstruct a full-color image,
 * run 3 instances in lockstep -- one per color channel -- and combine their outputs yourself with
 * a small custom compute pass reading each instance's `readA`/`readB`/`current` (see
 * `examples/webgpu_fft.html` for a worked example); there's no dedicated multi-channel API here,
 * since combining 3 single-channel results into one RGBA output is a one-line `vec4(...)` away and
 * doesn't need its own abstraction.
 *
 * ```js
 * const fft = new FFT2D( 64, 64 );
 * fft.setData( renderer, realValues ); // Float32Array, length 64*64
 * await fft.computeForward( renderer );
 * const spectrum = await fft.readData( renderer ); // Float32Array, length 64*64*2, interleaved (real, imag)
 * await fft.computeInverse( renderer );
 * const reconstructed = await fft.readData( renderer );
 * ```
 *
 * @three_import import { FFT2D } from 'three/addons/gpgpu/FFT.js';
 */
class FFT2D {

	/**
	 * Constructs a new 2D FFT.
	 *
	 * @param {number} width - The width of the transform. Must be a power of two.
	 * @param {number} height - The height of the transform. Must be a power of two.
	 */
	constructor( width, height ) {

		if ( ! isPowerOfTwo( width ) || ! isPowerOfTwo( height ) ) {

			throw new Error( `FFT2D: width (${ width }) and height (${ height }) must both be powers of two.` );

		}

		/**
		 * The width of the transform.
		 *
		 * @type {number}
		 */
		this.width = width;

		/**
		 * The height of the transform.
		 *
		 * @type {number}
		 */
		this.height = height;

		/**
		 * The total number of complex elements (`width * height`).
		 *
		 * @type {number}
		 */
		this.count = width * height;

		const count = this.count;

		this._attributeA = new StorageBufferAttribute( count, 2 );
		this._attributeB = new StorageBufferAttribute( count, 2 );

		this.readA = storage( this._attributeA, 'vec2', count ).toReadOnly();
		this.writeA = storage( this._attributeA, 'vec2', count );
		this.readB = storage( this._attributeB, 'vec2', count ).toReadOnly();
		this.writeB = storage( this._attributeB, 'vec2', count );

		this._probeAttribute = new StorageBufferAttribute( 1, 2 );
		this._probeWrite = storage( this._probeAttribute, 'vec2', 1 );
		this._probeIndex = uniform( 0, 'uint' );

		this._pUniform = uniform( 1, 'uint' );

		this._stagesRow = Math.log2( width );
		this._stagesCol = Math.log2( height );

		// The row/column butterfly kernels (`_rowAtoB`, `_colAtoB`, etc.) aren't built here --
		// whether an axis can be fused (see `buildFusedLineStage`) depends on the real WebGPU
		// device's compute limits, which aren't known until `renderer.init()` has resolved. Since
		// the constructor doesn't receive a renderer, that choice -- and the kernel build itself
		// -- is deferred to `_ensureButterfliesBuilt`, called from `_runButterflyPasses` on first
		// use. See `computeMaxFusedLineLength`/`getComputeLimits`.
		this._built = false;

		this._conjugateAtoB = Fn( () => {

			const v = this.readA.element( instanceIndex ).toVar();
			this.writeB.element( instanceIndex ).assign( vec2( v.x, v.y.negate() ) );

		} )().compute( count );

		this._conjugateBtoA = Fn( () => {

			const v = this.readB.element( instanceIndex ).toVar();
			this.writeA.element( instanceIndex ).assign( vec2( v.x, v.y.negate() ) );

		} )().compute( count );

		const invCount = 1 / count;

		this._conjugateScaleAtoB = Fn( () => {

			const v = this.readA.element( instanceIndex ).toVar();
			this.writeB.element( instanceIndex ).assign( vec2( v.x.mul( invCount ), v.y.negate().mul( invCount ) ) );

		} )().compute( count );

		this._conjugateScaleBtoA = Fn( () => {

			const v = this.readB.element( instanceIndex ).toVar();
			this.writeA.element( instanceIndex ).assign( vec2( v.x.mul( invCount ), v.y.negate().mul( invCount ) ) );

		} )().compute( count );

		/**
		 * Which of the two ping-pong buffers ('A' or 'B') currently holds the live data.
		 *
		 * @type {'A'|'B'}
		 */
		this.current = 'A';

	}

	/**
	 * Writes complex data into whichever buffer currently holds the live data (see `current`).
	 * Intended to be called before the first `computeForward`/`computeInverse` -- subsequent
	 * passes read/write via compute shaders and don't sync back to this array automatically.
	 *
	 * @param {Float32Array} real - Real values, length `count`.
	 * @param {Float32Array} [imag] - Imaginary values, length `count`. Defaults to all zero.
	 */
	setData( real, imag = null ) {

		const attribute = this.current === 'A' ? this._attributeA : this._attributeB;
		const array = attribute.array;

		for ( let i = 0; i < this.count; i ++ ) {

			array[ i * 2 ] = real[ i ];
			array[ i * 2 + 1 ] = imag ? imag[ i ] : 0;

		}

		attribute.needsUpdate = true;

	}

	/**
	 * Runs one axis's pass (row or column): a single dispatch if that axis was built fused (see
	 * the constructor's `_rowFused`/`_colFused`), or one dispatch per stage -- re-pointing
	 * `_pUniform` each time -- if it fell back to the per-stage, global-memory version.
	 *
	 * @private
	 * @param {Renderer} renderer
	 * @param {boolean} fused
	 * @param {number} stages
	 * @param {Function} atoB
	 * @param {Function} btoA
	 */
	_runAxisPass( renderer, fused, stages, atoB, btoA ) {

		if ( fused ) {

			renderer.compute( this.current === 'A' ? atoB : btoA );
			this.current = this.current === 'A' ? 'B' : 'A';

			return;

		}

		for ( let s = 0; s < stages; s ++ ) {

			this._pUniform.value = 1 << s;
			renderer.compute( this.current === 'A' ? atoB : btoA );
			this.current = this.current === 'A' ? 'B' : 'A';

		}

	}

	/**
	 * Builds the row/transpose/column/transpose-back kernels on first use, choosing --
	 * independently per axis -- between `buildFusedLineStage` and `buildMultiDispatchStage` based
	 * on the real device's compute limits (see `getComputeLimits`, `computeMaxFusedLineLength`,
	 * `computeTransposeTileSize`). Deferred out of the constructor because those limits aren't
	 * known until `renderer.init()` has resolved, and the constructor doesn't take a renderer. A
	 * no-op after the first call.
	 *
	 * @private
	 * @param {Renderer} renderer
	 */
	_ensureButterfliesBuilt( renderer ) {

		if ( this._built ) return;

		this._built = true;

		const { width, height } = this;

		const limits = getComputeLimits( renderer );
		const maxFusedLineLength = computeMaxFusedLineLength( limits );
		const tile = computeTransposeTileSize( limits );

		// Row and column axes are chosen independently since `width` and `height` can straddle
		// the cutoff differently (e.g. a 2048x512 image fuses its column passes but not its row
		// passes).
		this._rowFused = width <= maxFusedLineLength;
		this._colFused = height <= maxFusedLineLength;

		const buildRow = this._rowFused ? buildFusedLineStage : buildMultiDispatchStage;
		const buildCol = this._colFused ? buildFusedLineStage : buildMultiDispatchStage;

		this._rowAtoB = buildRow( { N: width, lineStride: width, elementStride: 1, lineCount: height, pUniform: this._pUniform }, this.readA, this.writeB );
		this._rowBtoA = buildRow( { N: width, lineStride: width, elementStride: 1, lineCount: height, pUniform: this._pUniform }, this.readB, this.writeA );

		// Transpose so the column pass -- like the row pass -- runs against contiguous
		// (`elementStride = 1`) addresses instead of a `width`-sized stride; see
		// `buildTransposeStage`. After this, the buffer is laid out as `width` lines of length
		// `height` each (row-major with row length `height`), i.e. `lineStride: height`.
		this._transposeFwdAtoB = buildTransposeStage( { rows: height, cols: width, tile }, this.readA, this.writeB );
		this._transposeFwdBtoA = buildTransposeStage( { rows: height, cols: width, tile }, this.readB, this.writeA );

		this._colAtoB = buildCol( { N: height, lineStride: height, elementStride: 1, lineCount: width, pUniform: this._pUniform }, this.readA, this.writeB );
		this._colBtoA = buildCol( { N: height, lineStride: height, elementStride: 1, lineCount: width, pUniform: this._pUniform }, this.readB, this.writeA );

		// Transpose back to the original `height` lines of length `width` layout, so every other
		// method (`readData`, `unpackSpectrum`, `packTexture`, ...) sees the same row-major
		// `address = y * width + x` convention as before this optimization.
		this._transposeBackAtoB = buildTransposeStage( { rows: width, cols: height, tile }, this.readA, this.writeB );
		this._transposeBackBtoA = buildTransposeStage( { rows: width, cols: height, tile }, this.readB, this.writeA );

	}

	/**
	 * Runs the forward-transform butterfly stages -- row pass, transpose, column pass, transpose
	 * back -- ping-ponging between the two buffers throughout (see `buildTransposeStage` for why
	 * the transposes are there). Does not itself flip any sign or apply conjugation -- both
	 * `computeForward` and `computeInverse` call this as their shared core.
	 *
	 * @private
	 * @param {Renderer} renderer
	 */
	_runButterflyPasses( renderer ) {

		this._ensureButterfliesBuilt( renderer );

		this._runAxisPass( renderer, this._rowFused, this._stagesRow, this._rowAtoB, this._rowBtoA );

		renderer.compute( this.current === 'A' ? this._transposeFwdAtoB : this._transposeFwdBtoA );
		this.current = this.current === 'A' ? 'B' : 'A';

		this._runAxisPass( renderer, this._colFused, this._stagesCol, this._colAtoB, this._colBtoA );

		renderer.compute( this.current === 'A' ? this._transposeBackAtoB : this._transposeBackBtoA );
		this.current = this.current === 'A' ? 'B' : 'A';

	}

	/**
	 * Computes the forward 2D FFT of whichever buffer currently holds the live data (see
	 * `current`, `setData`). Leaves the result in `current` (which may have flipped to the other
	 * buffer).
	 *
	 * @param {Renderer} renderer
	 */
	computeForward( renderer ) {

		this._runButterflyPasses( renderer );

	}

	/**
	 * Computes the inverse 2D FFT of whichever buffer currently holds the live data, via
	 * `ifft(x) = conj( fft( conj(x) ) ) / count` -- reuses the forward butterfly kernels rather
	 * than shipping a second set of shaders with negated twiddle factors.
	 *
	 * @param {Renderer} renderer
	 */
	computeInverse( renderer ) {

		renderer.compute( this.current === 'A' ? this._conjugateAtoB : this._conjugateBtoA );
		this.current = this.current === 'A' ? 'B' : 'A';

		this._runButterflyPasses( renderer );

		renderer.compute( this.current === 'A' ? this._conjugateScaleAtoB : this._conjugateScaleBtoA );
		this.current = this.current === 'A' ? 'B' : 'A';

	}

	/**
	 * Writes one scalar channel of a loaded image into whichever buffer currently holds the live
	 * data (with a zero imaginary part), entirely on the GPU -- no CPU readback of the image is
	 * involved. The texture is sampled with an exact (unfiltered) texel fetch, so it must be
	 * exactly `width` by `height` in size.
	 *
	 * The compute kernels are built once per distinct `(textureNode, channel)` pair and cached, so
	 * calling this repeatedly with the same arguments (e.g. once per frame) is cheap.
	 *
	 * @param {Renderer} renderer
	 * @param {TextureNode} textureNode - A `texture( someLoadedTexture )` TSL node.
	 * @param {'luminance'|'r'|'g'|'b'} [channel='luminance'] - Which scalar to extract per texel. `'luminance'` combines all 3 color channels; `'r'`/`'g'`/`'b'` extract a single color channel, e.g. for running one `FFT2D` instance per channel to reconstruct in full color (see the class-level comment above).
	 */
	packTexture( renderer, textureNode, channel = 'luminance' ) {

		if ( this._packSource !== textureNode || this._packChannel !== channel ) {

			this._packSource = textureNode;
			this._packChannel = channel;

			const width = this.width;

			const build = ( writeNode ) => Fn( () => {

				const x = instanceIndex.mod( uint( width ) );
				const y = instanceIndex.div( uint( width ) );

				const texel = textureNode.load( ivec2( int( x ), int( y ) ) );
				const value = channel === 'luminance' ? luminance( texel.rgb ) : texel[ channel ];

				writeNode.element( instanceIndex ).assign( vec2( value, 0 ) );

			} )().compute( this.count );

			this._packToA = build( this.writeA );
			this._packToB = build( this.writeB );

		}

		renderer.compute( this.current === 'A' ? this._packToA : this._packToB );

	}

	/**
	 * Renders whichever buffer currently holds the live data into `storageTexture` as a
	 * grayscale log-magnitude spectrum, quadrant-shifted so the DC (zero-frequency) bin lands at
	 * the texture's center -- the conventional way to display a 2D spectrum. Intended to be
	 * called right after `computeForward`.
	 *
	 * The log scale is normalized by `maxMagnitude` so the display uses the full `[0, 1]`
	 * grayscale range with no manual tuning: for a non-negative-real input (e.g. an image's
	 * luminance, always >= 0), the DC bin (index 0 before this method's quadrant shift) is
	 * *guaranteed* -- by the triangle inequality applied to the DFT sum -- to have the largest
	 * magnitude of any bin, so passing that bin's magnitude (see `readData`) as `maxMagnitude`
	 * always saturates to exactly 1 at the DC peak and never clips anywhere else.
	 *
	 * The compute kernels are built once per distinct `storageTexture` and cached.
	 *
	 * @param {Renderer} renderer
	 * @param {StorageTexture} target - Must be exactly `width` by `height` in size.
	 * @param {number} maxMagnitude - The magnitude to normalize the log scale against (typically the DC bin's magnitude -- see above).
	 */
	unpackSpectrum( renderer, target, maxMagnitude ) {

		if ( this._spectrumTarget !== target ) {

			this._spectrumTarget = target;
			this._spectrumLogNorm = uniform( 1 );

			const { width, height, count } = this;
			const halfW = width >> 1;
			const halfH = height >> 1;

			const writeTex = storageTexture( target ).setAccess( NodeAccess.WRITE_ONLY );

			const build = ( readNode ) => Fn( () => {

				const x = instanceIndex.mod( uint( width ) );
				const y = instanceIndex.div( uint( width ) );

				// Quadrant shift: read from the bin that, after wrap-around, is `width/2,
				// height/2` away -- this moves the DC bin (index 0,0) to the texture center.
				const sx = x.add( uint( halfW ) ).mod( uint( width ) );
				const sy = y.add( uint( halfH ) ).mod( uint( height ) );
				const srcIndex = sy.mul( uint( width ) ).add( sx );

				const v = readNode.element( srcIndex ).toVar();
				const magnitude = v.length();
				const value = magnitude.add( 1 ).log().div( this._spectrumLogNorm ).clamp( 0, 1 );

				textureStore( writeTex, uvec2( x, y ), vec4( value, value, value, 1 ) );

			} )().compute( count );

			this._spectrumFromA = build( this.readA );
			this._spectrumFromB = build( this.readB );

		}

		this._spectrumLogNorm.value = Math.log( 1 + maxMagnitude );

		renderer.compute( this.current === 'A' ? this._spectrumFromA : this._spectrumFromB );

	}

	/**
	 * Renders whichever buffer currently holds the live data into `storageTexture` as a grayscale
	 * spatial-domain image (its real part, clamped to `[0, 1]`). Intended to be called right after
	 * `computeInverse`.
	 *
	 * The compute kernels are built once per distinct `storageTexture` and cached.
	 *
	 * @param {Renderer} renderer
	 * @param {StorageTexture} target - Must be exactly `width` by `height` in size.
	 */
	unpackImage( renderer, target ) {

		if ( this._imageTarget !== target ) {

			this._imageTarget = target;

			const { width, count } = this;
			const writeTex = storageTexture( target ).setAccess( NodeAccess.WRITE_ONLY );

			const build = ( readNode ) => Fn( () => {

				const x = instanceIndex.mod( uint( width ) );
				const y = instanceIndex.div( uint( width ) );

				const value = readNode.element( instanceIndex ).x.clamp( 0, 1 );

				textureStore( writeTex, uvec2( x, y ), vec4( value, value, value, 1 ) );

			} )().compute( count );

			this._imageFromA = build( this.readA );
			this._imageFromB = build( this.readB );

		}

		renderer.compute( this.current === 'A' ? this._imageFromA : this._imageFromB );

	}

	/**
	 * Reads back a single complex bin from whichever buffer currently holds the live data, without
	 * transferring the whole (potentially large) buffer -- useful e.g. for reading just the DC
	 * bin (`index = 0`) to normalize a spectrum visualization (see `unpackSpectrum`).
	 *
	 * @param {Renderer} renderer
	 * @param {number} [index=0] - The linear (`y * width + x`) index of the bin to read.
	 * @returns {Promise<{real: number, imag: number}>}
	 */
	async readBin( renderer, index = 0 ) {

		if ( this._probeFromA === undefined ) {

			const build = ( readNode ) => Fn( () => {

				this._probeWrite.element( 0 ).assign( readNode.element( this._probeIndex ) );

			} )().compute( 1 );

			this._probeFromA = build( this.readA );
			this._probeFromB = build( this.readB );

		}

		this._probeIndex.value = index;

		renderer.compute( this.current === 'A' ? this._probeFromA : this._probeFromB );

		const data = new Float32Array( await renderer.getArrayBufferAsync( this._probeWrite.value ) );

		return { real: data[ 0 ], imag: data[ 1 ] };

	}

	/**
	 * Reads back whichever buffer currently holds the live data.
	 *
	 * @param {Renderer} renderer
	 * @returns {Promise<Float32Array>} Interleaved `(real, imag)` pairs, length `count * 2`.
	 */
	async readData( renderer ) {

		const node = this.current === 'A' ? this.writeA : this.writeB;

		return new Float32Array( await renderer.getArrayBufferAsync( node.value ) );

	}

	/**
	 * Frees the GPU buffers backing this transform.
	 */
	dispose() {

		this._attributeA.dispose?.();
		this._attributeB.dispose?.();
		this._probeAttribute.dispose?.();

	}

}

export { FFT2D };
