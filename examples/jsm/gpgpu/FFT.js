import { StorageBufferAttribute } from 'three/webgpu';
import {
	Fn, If, instanceIndex, storage, texture, uint, int, ivec2, uvec2, uniform, float, vec2, vec4, cos, sin,
	storageTexture, textureStore, NodeAccess,
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
 * The workgroup size used for every kernel here that doesn't otherwise compute its own -- the
 * per-stage fallback butterfly stage (`buildMultiDispatchStage`) and the plain elementwise passes
 * (conjugate, `_load`, `_store`). 256 is the WebGPU spec's
 * guaranteed-minimum `maxComputeInvocationsPerWorkgroup`/`maxComputeWorkgroupSizeX`, so it's valid
 * on every conformant device without needing to query real limits (unlike `buildFusedLineStage`/
 * `buildTransposeStage`, which size themselves off the real device via `getComputeLimits` because
 * they also have to fit a shared-memory budget, not just an invocation count). It's also a whole
 * multiple of every real-world subgroup/wave width (32 on NVIDIA/AMD RDNA/Apple/Intel, 64 on AMD
 * GCN), so every subgroup stays fully packed regardless of vendor -- unlike leaving `.compute()`
 * to fall back to its own default of `[64]`, which on most hardware leaves 3 out of every 4
 * subgroups in a workgroup idle for no benefit.
 *
 * @type {number}
 */
const DEFAULT_WORKGROUP_SIZE = 256;

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
 * @returns {Function} A parameterless TSL function, already `.compute()`-d with `DEFAULT_WORKGROUP_SIZE`.
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

	} )().compute( dispatchCount, [ DEFAULT_WORKGROUP_SIZE ] );

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
 * @param {boolean} [params.conjugateInput=false] - If `true`, negate the imaginary part of every element as it's loaded, folding the inverse transform's leading conjugate pass (see `FFT2D#computeInverse`) into this stage's one-time global read instead of running it as a separate full-buffer pass beforehand.
 * @param {StorageBufferNode} readNode - The buffer this pass reads from.
 * @param {StorageBufferNode} writeNode - The buffer this pass writes to.
 * @returns {Function} A parameterless TSL function ready to `.compute( dispatchCount, [ half ] )`.
 */
function buildFusedLineStage( { N, lineStride, elementStride, lineCount, conjugateInput = false }, readNode, writeNode ) {

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

		const load = ( addr ) => {

			const v = readNode.element( addr );
			return conjugateInput ? vec2( v.x, v.y.negate() ) : v;

		};

		// Load the whole line into shared memory once -- everything below happens on-chip.
		localA.element( t ).assign( load( lineBase.add( t.mul( uint( elementStride ) ) ) ) );
		localA.element( t2 ).assign( load( lineBase.add( t2.mul( uint( elementStride ) ) ) ) );

		workgroupBarrier();

		let readBuf = localA;
		let writeBuf = localB;

		for ( let s = 0; s < stages; s ++ ) {

			const p = 1 << s;

			const hi = t.div( uint( p ) );
			const lo = t.mod( uint( p ) );

			const idx1 = hi.mul( uint( p ) ).add( lo );
			const idx2 = idx1.add( uint( half ) );

			// Named uniquely per stage (`v0_0`, `v0_1`, ...) rather than reusing `'v0'`/`'v1'`: this
			// loop is unrolled in JS, so every stage's `.toVar()` call declares a variable in the
			// *same* generated shader function body -- a repeated name would still be handled
			// correctly (TSL renames the later declarations to disambiguate), just noisily.
			const v0 = readBuf.element( idx1 ).toVar( `v0_${ s }` );
			const v1 = readBuf.element( idx2 ).toVar( `v1_${ s }` );

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
 * When this is the *last* stage of an inverse transform (the transpose-back that restores the
 * original row-major layout -- see `FFT2D`'s pipeline), `conjugateScaleOutput` folds the inverse
 * transform's trailing conjugate-and-scale pass (see `FFT2D#computeInverse`) directly into this
 * stage's one-time global write, instead of running it as a separate full-buffer pass afterward.
 * This is always available here (unlike the leading conjugate, folded into the row pass only when
 * that axis is fused -- see `buildFusedLineStage`) because the transpose stages are always a
 * single dispatch, never split per-stage the way `buildMultiDispatchStage` splits a fallback axis.
 *
 * @param {Object} params
 * @param {number} params.rows - Row count of the buffer `readNode` is read as (row-major, row length `cols`).
 * @param {number} params.cols - Column count (row length) of the buffer `readNode` is read as.
 * @param {number} params.tile - Tile edge length; the workgroup is `tile x tile` (see `computeTransposeTileSize`).
 * @param {boolean} [params.conjugateScaleOutput=false] - If `true`, negate the imaginary part and scale both components by `invCount` as each element is written.
 * @param {number} [params.invCount=1] - `1 / (width * height)`, used only when `conjugateScaleOutput` is `true`.
 * @param {StorageBufferNode} readNode - The buffer this pass reads from, as `rows x cols`.
 * @param {StorageBufferNode} writeNode - The buffer this pass writes to, as `cols x rows` (the transpose).
 * @returns {Function} A parameterless TSL function ready to `.compute( [ numWorkgroupsX, numWorkgroupsY ], [ tile, tile ] )`.
 */
function buildTransposeStage( { rows, cols, tile, conjugateScaleOutput = false, invCount = 1 }, readNode, writeNode ) {

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

			const v = sharedTile.element( lx.mul( uint( tile ) ).add( ly ) ).toVar();
			const out = conjugateScaleOutput ? vec2( v.x.mul( invCount ), v.y.negate().mul( invCount ) ) : v;

			writeNode.element( outY.mul( uint( rows ) ).add( outX ) ).assign( out );

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
 * The public surface is deliberately narrow: `computeForward`/`computeInverse` each take a
 * source and a destination float texture and do exactly one thing -- read `width * height`
 * complex numbers (the `.rg` channels, `(real, imag)`) out of `sourceTexture`, transform them,
 * and write the result into `destinationTexture`'s `.rg` channels (any other channels present,
 * e.g. `.ba` on an RGBA texture, are written as `(0, 1)`). Both textures must be exactly `width`
 * by `height`, and `destinationTexture` must be a `StorageTexture` (it's written via
 * `textureStore`). A real-valued image is transformed by packing it into a texture with a zero
 * `.g` channel first -- the result is still fully complex in general (a real input's spectrum has
 * Hermitian symmetry, `X[k] == conj(X[-k])`, but is not itself real, except at the DC and, for
 * even sizes, Nyquist bins).
 *
 * The inverse transform reuses the exact same forward butterfly kernels via the standard
 * conjugation identity `ifft(x) = conj( fft( conj(x) ) ) / (width*height)`, rather than shipping a
 * second set of shaders with negated twiddle factors.
 *
 * Internally the data still moves through two ping-pong `StorageBufferAttribute`s between the
 * texture read and the texture write -- that's what makes the row/column/transpose butterfly
 * passes fast (coalesced storage-buffer access, not per-texel texture fetches) -- but none of
 * that is part of the public contract; it's an implementation detail that could change without
 * affecting callers.
 *
 * Anything beyond "transform these complex numbers" -- packing a color channel or luminance value
 * into a complex source texture, rendering a spectrum/reconstruction as a displayable grayscale
 * image, reading back a single bin -- is intentionally left out of this class. Those are one-line
 * TSL compute passes of their own with no shared state, and are kept as plain helper functions
 * next to their call site (see `examples/webgpu_fft.html` for worked versions of all three). Each
 * `FFT2D` instance also only ever transforms a single complex channel; to FFT/reconstruct a
 * full-color image, run 3 instances in lockstep -- one per color channel -- and combine their
 * output textures yourself with a small custom compute pass, again as done in that example.
 *
 * ```js
 * const fft = new FFT2D( 64, 64 );
 * // sourceTexture/spectrumTexture/reconstructedTexture: StorageTexture, 64x64, float, >= 2 channels.
 * await fft.computeForward( renderer, sourceTexture, spectrumTexture );
 * await fft.computeInverse( renderer, spectrumTexture, reconstructedTexture );
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

		this._readA = storage( this._attributeA, 'vec2', count ).toReadOnly();
		this._writeA = storage( this._attributeA, 'vec2', count );
		this._readB = storage( this._attributeB, 'vec2', count ).toReadOnly();
		this._writeB = storage( this._attributeB, 'vec2', count );

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

		// The inverse transform's *leading* conjugate is only ever run standalone here when the
		// row axis falls back to `buildMultiDispatchStage` (its per-stage kernel is reused across
		// every stage via `_pUniform`, so there's no single "first read" location to fold the
		// conjugate into the way there is for a fused row axis -- see `_ensureButterfliesBuilt`'s
		// `_rowConjAtoB`/`_rowConjBtoA`). The trailing conjugate-and-scale never needs a standalone
		// pass at all: the transpose-back stage is always a single dispatch (see
		// `buildTransposeStage`'s `conjugateScaleOutput`), so it's always folded in.
		this._conjugateAtoB = Fn( () => {

			const v = this._readA.element( instanceIndex ).toVar();
			this._writeB.element( instanceIndex ).assign( vec2( v.x, v.y.negate() ) );

		} )().compute( count, [ DEFAULT_WORKGROUP_SIZE ] );

		this._conjugateBtoA = Fn( () => {

			const v = this._readB.element( instanceIndex ).toVar();
			this._writeA.element( instanceIndex ).assign( vec2( v.x, v.y.negate() ) );

		} )().compute( count, [ DEFAULT_WORKGROUP_SIZE ] );

		// Which of the two ping-pong buffers ('A' or 'B') currently holds the live data --
		// purely an implementation detail of the texture-in/texture-out pipeline below, not part
		// of the public contract.
		this._current = 'A';

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

			renderer.compute( this._current === 'A' ? atoB : btoA );
			this._current = this._current === 'A' ? 'B' : 'A';

			return;

		}

		for ( let s = 0; s < stages; s ++ ) {

			this._pUniform.value = 1 << s;
			renderer.compute( this._current === 'A' ? atoB : btoA );
			this._current = this._current === 'A' ? 'B' : 'A';

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

		const { width, height, count } = this;
		const invCount = 1 / count;

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

		this._rowAtoB = buildRow( { N: width, lineStride: width, elementStride: 1, lineCount: height, pUniform: this._pUniform }, this._readA, this._writeB );
		this._rowBtoA = buildRow( { N: width, lineStride: width, elementStride: 1, lineCount: height, pUniform: this._pUniform }, this._readB, this._writeA );

		// A second copy of the row pass, used only during `computeInverse`, with the leading
		// conjugate folded into its one-time load (see `buildFusedLineStage`'s `conjugateInput`)
		// instead of running as a separate full-buffer pass first. Only worth building when the
		// row axis is fused: `buildMultiDispatchStage`'s kernel is reused across every stage via
		// `_pUniform`, so there's no single "first read" to fold into without a second, stage-0-only
		// kernel variant -- not worth the extra complexity for what both `FFT2D`'s docs and this
		// optimization's own motivation call a small, non-dominant saving. The standalone
		// `_conjugateAtoB`/`_conjugateBtoA` pass handles that (rarer, large-line) case instead.
		if ( this._rowFused ) {

			this._rowConjAtoB = buildFusedLineStage( { N: width, lineStride: width, elementStride: 1, lineCount: height, conjugateInput: true }, this._readA, this._writeB );
			this._rowConjBtoA = buildFusedLineStage( { N: width, lineStride: width, elementStride: 1, lineCount: height, conjugateInput: true }, this._readB, this._writeA );

		}

		// Transpose so the column pass -- like the row pass -- runs against contiguous
		// (`elementStride = 1`) addresses instead of a `width`-sized stride; see
		// `buildTransposeStage`. After this, the buffer is laid out as `width` lines of length
		// `height` each (row-major with row length `height`), i.e. `lineStride: height`.
		this._transposeFwdAtoB = buildTransposeStage( { rows: height, cols: width, tile }, this._readA, this._writeB );
		this._transposeFwdBtoA = buildTransposeStage( { rows: height, cols: width, tile }, this._readB, this._writeA );

		this._colAtoB = buildCol( { N: height, lineStride: height, elementStride: 1, lineCount: width, pUniform: this._pUniform }, this._readA, this._writeB );
		this._colBtoA = buildCol( { N: height, lineStride: height, elementStride: 1, lineCount: width, pUniform: this._pUniform }, this._readB, this._writeA );

		// Transpose back to the original `height` lines of length `width` layout, so `_store`
		// sees the same row-major `address = y * width + x` convention as before this
		// optimization. This stage is always a
		// single dispatch regardless of whether the column axis is fused, so -- unlike the leading
		// conjugate above -- the trailing conjugate-and-scale (see `computeInverse`) is *always*
		// folded into its one-time write (`conjugateScaleOutput`) rather than ever needing a
		// separate pass.
		this._transposeBackAtoB = buildTransposeStage( { rows: width, cols: height, tile }, this._readA, this._writeB );
		this._transposeBackBtoA = buildTransposeStage( { rows: width, cols: height, tile }, this._readB, this._writeA );

		this._transposeBackConjScaleAtoB = buildTransposeStage( { rows: width, cols: height, tile, conjugateScaleOutput: true, invCount }, this._readA, this._writeB );
		this._transposeBackConjScaleBtoA = buildTransposeStage( { rows: width, cols: height, tile, conjugateScaleOutput: true, invCount }, this._readB, this._writeA );

	}

	/**
	 * Runs the butterfly stages -- row pass, transpose, column pass, transpose back -- ping-ponging
	 * between the two buffers throughout (see `buildTransposeStage` for why the transposes are
	 * there). Both `computeForward` and `computeInverse` call this as their shared core; `inverse`
	 * selects the row-pass and transpose-back kernel variants that fold the inverse transform's
	 * leading conjugate / trailing conjugate-and-scale into this pipeline's existing reads and
	 * writes -- see `computeInverse` and the `conjugateInput`/`conjugateScaleOutput` options on
	 * `buildFusedLineStage`/`buildTransposeStage` -- instead of running them as separate passes.
	 *
	 * @private
	 * @param {Renderer} renderer
	 * @param {boolean} [inverse=false]
	 */
	_runButterflyPasses( renderer, inverse = false ) {

		this._ensureButterfliesBuilt( renderer );

		// The leading conjugate only folds into the row pass when that axis is fused (see
		// `_ensureButterfliesBuilt`'s `_rowConjAtoB`/`_rowConjBtoA`); otherwise `computeInverse`
		// has already run it as a standalone pass, and the row pass here runs unmodified.
		const foldLeadingConjugate = inverse && this._rowFused;
		const rowAtoB = foldLeadingConjugate ? this._rowConjAtoB : this._rowAtoB;
		const rowBtoA = foldLeadingConjugate ? this._rowConjBtoA : this._rowBtoA;

		this._runAxisPass( renderer, this._rowFused, this._stagesRow, rowAtoB, rowBtoA );

		renderer.compute( this._current === 'A' ? this._transposeFwdAtoB : this._transposeFwdBtoA );
		this._current = this._current === 'A' ? 'B' : 'A';

		this._runAxisPass( renderer, this._colFused, this._stagesCol, this._colAtoB, this._colBtoA );

		// The trailing conjugate-and-scale always folds into the transpose-back write -- that
		// stage is always a single dispatch, so there's no fused/fallback split to worry about.
		const transposeBackAtoB = inverse ? this._transposeBackConjScaleAtoB : this._transposeBackAtoB;
		const transposeBackBtoA = inverse ? this._transposeBackConjScaleBtoA : this._transposeBackBtoA;

		renderer.compute( this._current === 'A' ? transposeBackAtoB : transposeBackBtoA );
		this._current = this._current === 'A' ? 'B' : 'A';

	}

	/**
	 * Reads `sourceTexture`'s `.rg` channels into whichever ping-pong buffer currently holds
	 * the live data (see `_current`), entirely on the GPU -- no CPU readback is involved. The
	 * texture is sampled with an exact (unfiltered) texel fetch, so it must be exactly `width`
	 * by `height` in size.
	 *
	 * The compute kernels are built once per distinct `sourceTexture` and cached, so calling this
	 * repeatedly with the same texture (e.g. once per frame) is cheap.
	 *
	 * @private
	 * @param {Renderer} renderer
	 * @param {Texture} sourceTexture - A float texture, `width` by `height`, with at least 2 channels.
	 */
	_load( renderer, sourceTexture ) {

		if ( this._loadSource !== sourceTexture ) {

			this._loadSource = sourceTexture;

			const width = this.width;
			const sourceNode = texture( sourceTexture );

			const build = ( writeNode ) => Fn( () => {

				const x = instanceIndex.mod( uint( width ) );
				const y = instanceIndex.div( uint( width ) );

				writeNode.element( instanceIndex ).assign( sourceNode.load( ivec2( int( x ), int( y ) ) ).rg );

			} )().compute( this.count, [ DEFAULT_WORKGROUP_SIZE ] );

			this._loadToA = build( this._writeA );
			this._loadToB = build( this._writeB );

		}

		renderer.compute( this._current === 'A' ? this._loadToA : this._loadToB );

	}

	/**
	 * Writes whichever ping-pong buffer currently holds the live data into `destinationTexture`'s
	 * `.rg` channels, leaving any other channels (e.g. `.ba` on an RGBA texture) as `(0, 1)`.
	 *
	 * The compute kernels are built once per distinct `destinationTexture` and cached.
	 *
	 * @private
	 * @param {Renderer} renderer
	 * @param {StorageTexture} destinationTexture - Must be exactly `width` by `height` in size.
	 */
	_store( renderer, destinationTexture ) {

		if ( this._storeTarget !== destinationTexture ) {

			this._storeTarget = destinationTexture;

			const { width, count } = this;
			const writeTex = storageTexture( destinationTexture ).setAccess( NodeAccess.WRITE_ONLY );

			const build = ( readNode ) => Fn( () => {

				const x = instanceIndex.mod( uint( width ) );
				const y = instanceIndex.div( uint( width ) );

				const v = readNode.element( instanceIndex );

				textureStore( writeTex, uvec2( x, y ), vec4( v.x, v.y, 0, 1 ) );

			} )().compute( count, [ DEFAULT_WORKGROUP_SIZE ] );

			this._storeFromA = build( this._readA );
			this._storeFromB = build( this._readB );

		}

		renderer.compute( this._current === 'A' ? this._storeFromA : this._storeFromB );

	}

	/**
	 * Computes the forward 2D FFT: reads `sourceTexture`'s `.rg` channels as `width * height`
	 * complex numbers, transforms them, and writes the result into `destinationTexture`'s `.rg`
	 * channels.
	 *
	 * @param {Renderer} renderer
	 * @param {Texture} sourceTexture - A float texture, `width` by `height`, with at least 2 channels.
	 * @param {StorageTexture} destinationTexture - A float `StorageTexture`, `width` by `height`, with at least 2 channels.
	 */
	computeForward( renderer, sourceTexture, destinationTexture ) {

		this._load( renderer, sourceTexture );
		this._runButterflyPasses( renderer );
		this._store( renderer, destinationTexture );

	}

	/**
	 * Computes the inverse 2D FFT, via `ifft(x) = conj( fft( conj(x) ) ) / count` -- reuses the
	 * forward butterfly kernels rather than shipping a second set of shaders with negated twiddle
	 * factors. The leading conjugate and trailing conjugate-and-scale are folded directly into the
	 * butterfly pipeline's existing reads and writes wherever possible (see `_runButterflyPasses`)
	 * rather than run as extra full-buffer passes; the only case that still needs a standalone
	 * leading-conjugate pass is a row axis too long to fuse (see `_ensureButterfliesBuilt`), which
	 * is why that decision has to be made (`_ensureButterfliesBuilt`) before choosing whether to
	 * run it here.
	 *
	 * @param {Renderer} renderer
	 * @param {Texture} sourceTexture - A float texture, `width` by `height`, with at least 2 channels (typically a spectrum produced by `computeForward`).
	 * @param {StorageTexture} destinationTexture - A float `StorageTexture`, `width` by `height`, with at least 2 channels.
	 */
	computeInverse( renderer, sourceTexture, destinationTexture ) {

		this._ensureButterfliesBuilt( renderer );

		this._load( renderer, sourceTexture );

		if ( ! this._rowFused ) {

			renderer.compute( this._current === 'A' ? this._conjugateAtoB : this._conjugateBtoA );
			this._current = this._current === 'A' ? 'B' : 'A';

		}

		this._runButterflyPasses( renderer, true );

		this._store( renderer, destinationTexture );

	}

	/**
	 * Frees the GPU buffers backing this transform.
	 */
	dispose() {

		this._attributeA.dispose?.();
		this._attributeB.dispose?.();

	}

}

export { FFT2D };
