import { StorageBufferAttribute, MathUtils } from 'three/webgpu';
import {
	Fn, If, instanceIndex, storage, texture, uint, int, ivec2, uvec2, uniform, float, vec2, vec4, cos, sin,
	storageTexture, textureStore, NodeAccess,
	workgroupArray, workgroupBarrier, workgroupId, invocationLocalIndex, globalId, localId
} from 'three/tsl';

/**
 * Default workgroup size for elementwise/fallback kernels. 256 is the WebGPU spec's
 * guaranteed-minimum invocation/workgroup-size limit and a multiple of every real-world
 * subgroup width, so it's safe and efficient on any conformant device.
 *
 * @type {number}
 */
const DEFAULT_WORKGROUP_SIZE = 256;

/**
 * WebGPU's guaranteed-minimum compute limits, used as a fallback when a device's real limits
 * aren't available yet.
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
 * if unavailable.
 *
 * @param {Renderer} renderer
 * @returns {Object} A `GPUSupportedLimits`-shaped object.
 */
function getComputeLimits( renderer ) {

	const backend = renderer.backend;

	if ( backend.isWebGPUBackend === true && backend.device !== null ) {

		return backend.device.limits;

	}

	return MINIMUM_COMPUTE_LIMITS;

}

/**
 * Largest power-of-two line length that fits `buildFusedLineStage` within one workgroup's
 * invocation and shared-memory budget.
 *
 * @param {Object} limits - A `GPUSupportedLimits`-shaped object.
 * @returns {number}
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
 * Largest square tile edge (power of two) `buildTransposeStage` can use within one workgroup's
 * invocation and shared-memory budget.
 *
 * @param {Object} limits - A `GPUSupportedLimits`-shaped object.
 * @returns {number}
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
 * Fallback radix-2 Stockham FFT butterfly stage: one dispatch per stage, reading/writing through
 * global storage. Generalized to process many contiguous 1D lines of a 2D buffer at once. Used
 * when a line is too long to fuse into a single dispatch (see `computeMaxFusedLineLength`).
 *
 * @tsl
 * @private
 * @param {Object} params
 * @param {number} params.N - Length of each 1D line (power of two).
 * @param {number} params.lineStride - Address increment between lines.
 * @param {number} params.elementStride - Address increment between consecutive elements of a line (always `1` here).
 * @param {number} params.lineCount - Number of lines transformed in parallel.
 * @param {Node<uint>} params.pUniform - Per-stage span uniform (doubles every stage, 1..N/2).
 * @param {StorageBufferNode} readNode - Buffer to read from.
 * @param {StorageBufferNode} writeNode - Buffer to write to.
 * @returns {Function} A parameterless TSL function, `.compute()`-d with `DEFAULT_WORKGROUP_SIZE`.
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

		// Forward-transform sign convention; the inverse reuses this kernel by conjugating
		// input and output around it (see FFT2D#computeInverse).
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
 * Whole-line radix-2 Stockham FFT (every stage, one row or column) as a single dispatch, one
 * workgroup per line, entirely in workgroup-shared memory: one global read, `log2(N)` butterfly
 * stages ping-ponging between two shared buffers, one global write. Preferred over
 * `buildMultiDispatchStage` whenever a line fits (see `computeMaxFusedLineLength`). The stage
 * loop is unrolled in JS at build time, so `p` is a compile-time constant per stage.
 *
 * @tsl
 * @private
 * @param {Object} params
 * @param {number} params.N - Length of each 1D line (power of two, `<= computeMaxFusedLineLength(...)`).
 * @param {number} params.lineStride - Address increment between lines.
 * @param {number} params.elementStride - Address increment between consecutive elements of a line (always `1` here).
 * @param {number} params.lineCount - Number of lines (one workgroup each).
 * @param {boolean} [params.conjugateInput=false] - Negate the imaginary part on load, folding the inverse transform's leading conjugate pass in (see `FFT2D#computeInverse`).
 * @param {StorageBufferNode} readNode - Buffer to read from.
 * @param {StorageBufferNode} writeNode - Buffer to write to.
 * @returns {Function} A parameterless TSL function ready to `.compute( dispatchCount, [ half ] )`.
 */
function buildFusedLineStage( { N, lineStride, elementStride, lineCount, conjugateInput = false }, readNode, writeNode ) {

	const half = N / 2;
	const stages = Math.log2( N );
	const dispatchCount = lineCount * half;

	const localA = workgroupArray( 'vec2', N );
	const localB = workgroupArray( 'vec2', N );

	return Fn( () => {

		const line = workgroupId.x;
		const t = invocationLocalIndex;

		const lineBase = line.mul( uint( lineStride ) );
		const t2 = t.add( uint( half ) );

		const load = ( addr ) => {

			const v = readNode.element( addr );
			return conjugateInput ? vec2( v.x, v.y.negate() ) : v;

		};

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

			// Suffixed per stage since this loop is unrolled in JS into one shader body.
			const v0 = readBuf.element( idx1 ).toVar( `v0_${ s }` );
			const v1 = readBuf.element( idx2 ).toVar( `v1_${ s }` );

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

			workgroupBarrier();

			[ readBuf, writeBuf ] = [ writeBuf, readBuf ];

		}

		writeNode.element( lineBase.add( t.mul( uint( elementStride ) ) ) ).assign( readBuf.element( t ) );
		writeNode.element( lineBase.add( t2.mul( uint( elementStride ) ) ) ).assign( readBuf.element( t2 ) );

	} )().compute( dispatchCount, [ half ] );

}

/**
 * Tiled matrix-transpose compute pass: reads a `rows x cols` row-major buffer and writes its
 * `cols x rows` transpose, using a shared-memory tile so both the read and the write are
 * coalesced. Used so the column pass, like the row pass, transforms contiguous addresses instead
 * of a strided (`elementStride = width`) one.
 *
 * @tsl
 * @private
 * @param {Object} params
 * @param {number} params.rows - Row count of `readNode`, read as row-major with row length `cols`.
 * @param {number} params.cols - Column count (row length) of `readNode`.
 * @param {number} params.tile - Tile edge length; the workgroup is `tile x tile` (see `computeTransposeTileSize`).
 * @param {boolean} [params.conjugateScaleOutput=false] - Negate the imaginary part and scale both components by `invCount` on write, folding the inverse transform's trailing conjugate-and-scale pass in.
 * @param {number} [params.invCount=1] - `1 / (width * height)`, used only when `conjugateScaleOutput` is `true`.
 * @param {StorageBufferNode} readNode - Buffer to read from, as `rows x cols`.
 * @param {StorageBufferNode} writeNode - Buffer to write to, as `cols x rows`.
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

		// `rows`/`cols` aren't generally exact multiples of `tile`, so bounds-check by hand.
		If( gx.lessThan( uint( cols ) ).and( gy.lessThan( uint( rows ) ) ), () => {

			sharedTile.element( ly.mul( uint( tile ) ).add( lx ) ).assign( readNode.element( gy.mul( uint( cols ) ).add( gx ) ) );

		} );

		workgroupBarrier();

		// Local x/y swapped (not global) so the write, like the read, stays coalesced.
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
 * two iterative radix-2 Stockham autosort 1D FFTs. Both passes run as contiguous, coalesced
 * line transforms: the column pass runs on data transposed by `buildTransposeStage` first, then
 * transposed back afterwards, rather than reading/writing with a strided access pattern. Each
 * line is fused into a single shared-memory dispatch when it fits the device's limits, falling
 * back to a per-stage, global-memory dispatch otherwise (see `buildFusedLineStage` /
 * `buildMultiDispatchStage`).
 *
 * `width` and `height` must both be powers of two.
 *
 * `computeForward`/`computeInverse` each take a source and a destination float texture: read
 * `width * height` complex numbers (`.rg` = `(real, imag)`) out of `sourceTexture`, transform
 * them, and write the result into `destinationTexture`'s `.rg` (other channels, e.g. `.ba` on
 * RGBA, are written as `(0, 1)`). Both textures must be exactly `width` by `height`, and
 * `destinationTexture` must be a `StorageTexture`. A real-valued image is transformed by packing
 * it into a texture with a zero `.g` channel first.
 *
 * The inverse transform reuses the forward butterfly kernels via the standard conjugation
 * identity `ifft(x) = conj( fft( conj(x) ) ) / (width*height)`, rather than shipping a second set
 * of shaders with negated twiddle factors.
 *
 * Anything beyond "transform these complex numbers" -- packing a color channel into a complex
 * source texture, rendering a spectrum/reconstruction as a displayable image, reading back a
 * single bin -- is left to the caller; see `examples/webgpu_fft.html` for worked examples,
 * including running one `FFT2D` instance per color channel for a full-color image.
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

		if ( ! MathUtils.isPowerOfTwo( width ) || ! MathUtils.isPowerOfTwo( height ) ) {

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

		// Butterfly kernels are built lazily in `_ensureButterfliesBuilt` since the fused/
		// fallback choice needs the real device's compute limits, not known until `renderer.init()`.
		this._built = false;

		this._conjugateAtoB = Fn( () => {

			const v = this._readA.element( instanceIndex ).toVar();
			this._writeB.element( instanceIndex ).assign( vec2( v.x, v.y.negate() ) );

		} )().compute( count, [ DEFAULT_WORKGROUP_SIZE ] );

		this._conjugateBtoA = Fn( () => {

			const v = this._readB.element( instanceIndex ).toVar();
			this._writeA.element( instanceIndex ).assign( vec2( v.x, v.y.negate() ) );

		} )().compute( count, [ DEFAULT_WORKGROUP_SIZE ] );

		this._current = 'A';

	}

	/**
	 * Runs one axis's pass: a single dispatch if fused, otherwise one dispatch per stage.
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
	 * Builds the row/transpose/column/transpose-back kernels on first use, choosing -- per axis
	 * -- between `buildFusedLineStage` and `buildMultiDispatchStage` based on the real device's
	 * compute limits. Deferred out of the constructor since the constructor doesn't take a
	 * renderer. No-op after the first call.
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

		this._rowFused = width <= maxFusedLineLength;
		this._colFused = height <= maxFusedLineLength;

		const buildRow = this._rowFused ? buildFusedLineStage : buildMultiDispatchStage;
		const buildCol = this._colFused ? buildFusedLineStage : buildMultiDispatchStage;

		this._rowAtoB = buildRow( { N: width, lineStride: width, elementStride: 1, lineCount: height, pUniform: this._pUniform }, this._readA, this._writeB );
		this._rowBtoA = buildRow( { N: width, lineStride: width, elementStride: 1, lineCount: height, pUniform: this._pUniform }, this._readB, this._writeA );

		// Only worth building a conjugate-input row variant when the row axis is fused; the
		// fallback path's kernel is reused across stages via `_pUniform`, so a standalone
		// `_conjugateAtoB`/`_conjugateBtoA` pass handles that case instead.
		if ( this._rowFused ) {

			this._rowConjAtoB = buildFusedLineStage( { N: width, lineStride: width, elementStride: 1, lineCount: height, conjugateInput: true }, this._readA, this._writeB );
			this._rowConjBtoA = buildFusedLineStage( { N: width, lineStride: width, elementStride: 1, lineCount: height, conjugateInput: true }, this._readB, this._writeA );

		}

		// After this, the buffer is `width` lines of length `height` (row-major, row length `height`).
		this._transposeFwdAtoB = buildTransposeStage( { rows: height, cols: width, tile }, this._readA, this._writeB );
		this._transposeFwdBtoA = buildTransposeStage( { rows: height, cols: width, tile }, this._readB, this._writeA );

		this._colAtoB = buildCol( { N: height, lineStride: height, elementStride: 1, lineCount: width, pUniform: this._pUniform }, this._readA, this._writeB );
		this._colBtoA = buildCol( { N: height, lineStride: height, elementStride: 1, lineCount: width, pUniform: this._pUniform }, this._readB, this._writeA );

		// Transpose back to the original `height` lines of length `width` layout. This stage is
		// always a single dispatch, so the trailing conjugate-and-scale always folds into it.
		this._transposeBackAtoB = buildTransposeStage( { rows: width, cols: height, tile }, this._readA, this._writeB );
		this._transposeBackBtoA = buildTransposeStage( { rows: width, cols: height, tile }, this._readB, this._writeA );

		this._transposeBackConjScaleAtoB = buildTransposeStage( { rows: width, cols: height, tile, conjugateScaleOutput: true, invCount }, this._readA, this._writeB );
		this._transposeBackConjScaleBtoA = buildTransposeStage( { rows: width, cols: height, tile, conjugateScaleOutput: true, invCount }, this._readB, this._writeA );

	}

	/**
	 * Runs the butterfly stages -- row pass, transpose, column pass, transpose back -- ping-ponging
	 * between the two buffers throughout. Both `computeForward` and `computeInverse` call this as
	 * their shared core; `inverse` selects the kernel variants that fold the inverse transform's
	 * leading/trailing conjugate (and, for the trailing one, scale) into the existing passes.
	 *
	 * @private
	 * @param {Renderer} renderer
	 * @param {boolean} [inverse=false]
	 */
	_runButterflyPasses( renderer, inverse = false ) {

		this._ensureButterfliesBuilt( renderer );

		// The leading conjugate only folds into the row pass when it's fused; otherwise
		// `computeInverse` has already run it as a standalone pass.
		const foldLeadingConjugate = inverse && this._rowFused;
		const rowAtoB = foldLeadingConjugate ? this._rowConjAtoB : this._rowAtoB;
		const rowBtoA = foldLeadingConjugate ? this._rowConjBtoA : this._rowBtoA;

		this._runAxisPass( renderer, this._rowFused, this._stagesRow, rowAtoB, rowBtoA );

		renderer.compute( this._current === 'A' ? this._transposeFwdAtoB : this._transposeFwdBtoA );
		this._current = this._current === 'A' ? 'B' : 'A';

		this._runAxisPass( renderer, this._colFused, this._stagesCol, this._colAtoB, this._colBtoA );

		const transposeBackAtoB = inverse ? this._transposeBackConjScaleAtoB : this._transposeBackAtoB;
		const transposeBackBtoA = inverse ? this._transposeBackConjScaleBtoA : this._transposeBackBtoA;

		renderer.compute( this._current === 'A' ? transposeBackAtoB : transposeBackBtoA );
		this._current = this._current === 'A' ? 'B' : 'A';

	}

	/**
	 * Reads `sourceTexture`'s `.rg` channels into whichever ping-pong buffer currently holds the
	 * live data, entirely on the GPU. The texture is sampled with an exact texel fetch, so it
	 * must be exactly `width` by `height`.
	 *
	 * Compute kernels are built once per distinct `sourceTexture` and cached.
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
	 * `.rg` channels, leaving other channels as `(0, 1)`.
	 *
	 * Compute kernels are built once per distinct `destinationTexture` and cached.
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
	 * factors.
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
