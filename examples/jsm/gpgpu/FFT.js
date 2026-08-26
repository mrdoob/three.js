import { StorageBufferAttribute } from 'three/webgpu';
import { Fn, instanceIndex, storage, uint, uniform, float, vec2, cos, sin } from 'three/tsl';

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
 * Builds one radix-2 Stockham "autosort" FFT butterfly stage, generalized so it can process
 * many independent 1D lines of a 2D buffer at once -- a "row pass" (`lineStride = width`,
 * `elementStride = 1`) transforms every row, a "column pass" (`lineStride = 1`, `elementStride
 * = width`) transforms every column. This is the row/column decomposition of the 2D FFT: the
 * 2D transform is exactly a 1D FFT along each row followed by a 1D FFT along each column (order
 * doesn't matter).
 *
 * The Stockham formulation ping-pongs between two buffers every stage and never needs a
 * separate bit-reversal permutation pass, at the cost of alternating which buffer holds the
 * live data after every stage -- see `FFT2D` for how the ping-pong bookkeeping is driven from
 * the CPU side.
 *
 * @tsl
 * @private
 * @param {Object} params
 * @param {number} params.N - The length of each 1D line being transformed (a power of two).
 * @param {number} params.lineStride - Address increment between lines (`width` for a row pass, `1` for a column pass).
 * @param {number} params.elementStride - Address increment between consecutive elements of a line (`1` for a row pass, `width` for a column pass).
 * @param {number} params.lineCount - How many independent lines are transformed in parallel (`height` for a row pass, `width` for a column pass).
 * @param {Node<uint>} params.pUniform - The per-stage span uniform (doubles every stage, from 1 to N/2).
 * @param {StorageBufferNode} readNode - The buffer this stage reads from.
 * @param {StorageBufferNode} writeNode - The buffer this stage writes to.
 * @returns {Function} A parameterless TSL function ready to `.compute( dispatchCount )`.
 */
function buildButterflyStage( { N, lineStride, elementStride, lineCount, pUniform }, readNode, writeNode ) {

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
 * A GPU 2D complex-to-complex FFT (WebGPU only), implemented as a row/column decomposition of
 * two iterative radix-2 Stockham autosort 1D FFTs -- see `buildButterflyStage`.
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

		this._pUniform = uniform( 1, 'uint' );

		this._stagesRow = Math.log2( width );
		this._stagesCol = Math.log2( height );

		this._rowAtoB = buildButterflyStage( { N: width, lineStride: width, elementStride: 1, lineCount: height, pUniform: this._pUniform }, this.readA, this.writeB );
		this._rowBtoA = buildButterflyStage( { N: width, lineStride: width, elementStride: 1, lineCount: height, pUniform: this._pUniform }, this.readB, this.writeA );
		this._colAtoB = buildButterflyStage( { N: height, lineStride: 1, elementStride: width, lineCount: width, pUniform: this._pUniform }, this.readA, this.writeB );
		this._colBtoA = buildButterflyStage( { N: height, lineStride: 1, elementStride: width, lineCount: width, pUniform: this._pUniform }, this.readB, this.writeA );

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
	 * Runs the forward-transform butterfly stages (row pass, then column pass), ping-ponging
	 * between the two buffers. Does not itself flip any sign or apply conjugation -- both
	 * `computeForward` and `computeInverse` call this as their shared core.
	 *
	 * @private
	 * @param {Renderer} renderer
	 */
	_runButterflyPasses( renderer ) {

		for ( let s = 0; s < this._stagesRow; s ++ ) {

			this._pUniform.value = 1 << s;
			renderer.compute( this.current === 'A' ? this._rowAtoB : this._rowBtoA );
			this.current = this.current === 'A' ? 'B' : 'A';

		}

		for ( let s = 0; s < this._stagesCol; s ++ ) {

			this._pUniform.value = 1 << s;
			renderer.compute( this.current === 'A' ? this._colAtoB : this._colBtoA );
			this.current = this.current === 'A' ? 'B' : 'A';

		}

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

	}

}

export { FFT2D };
