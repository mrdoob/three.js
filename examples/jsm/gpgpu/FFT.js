import { StorageBufferAttribute } from 'three/webgpu';
import {
	Fn, instanceIndex, storage, uint, int, ivec2, uvec2, uniform, float, vec2, vec4, cos, sin,
	storageTexture, textureStore, luminance, NodeAccess
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
