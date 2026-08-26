import * as THREE from 'three/webgpu';
import { texture, storage, Fn, instanceIndex, uint, int, ivec2 } from 'three/tsl';
import { FFT2D } from '../../../../examples/jsm/gpgpu/FFT.js';
import { getSharedRenderer } from './gpu-test-utils.js';

// Naive O(N^4) 2D DFT, computed entirely on the CPU in plain JS. This is the ground-truth
// oracle the GPU Stockham FFT (`FFT2D`) is checked against below -- a direct implementation of
// the textbook double-sum definition is simple enough to trust by inspection, which is exactly
// what makes it a useful independent check on the far less obvious GPU butterfly code.
//
//   X[ky][kx] = sum_y sum_x x[y][x] * exp( -2*PI*i * ( kx*x/W + ky*y/H ) )
//
// `real`/`imag` are flat, row-major, length `width*height` arrays; returns `{ real, imag }` of
// the same shape.
function naiveDFT2D( real, imag, width, height ) {

	const outReal = new Float32Array( width * height );
	const outImag = new Float32Array( width * height );

	for ( let ky = 0; ky < height; ky ++ ) {

		for ( let kx = 0; kx < width; kx ++ ) {

			let sumRe = 0;
			let sumIm = 0;

			for ( let y = 0; y < height; y ++ ) {

				for ( let x = 0; x < width; x ++ ) {

					const angle = - 2 * Math.PI * ( ( kx * x ) / width + ( ky * y ) / height );
					const c = Math.cos( angle );
					const s = Math.sin( angle );

					const idx = y * width + x;
					const re = real[ idx ];
					const im = imag[ idx ];

					sumRe += re * c - im * s;
					sumIm += re * s + im * c;

				}

			}

			const outIdx = ky * width + kx;
			outReal[ outIdx ] = sumRe;
			outImag[ outIdx ] = sumIm;

		}

	}

	return { real: outReal, imag: outImag };

}

// Deterministic pseudo-random real-valued test image (no GPU RNG needed -- this is plain CPU
// setup data, not something under test).
function makeTestImage( width, height, seed = 1 ) {

	const data = new Float32Array( width * height );
	let s = seed;

	for ( let i = 0; i < data.length; i ++ ) {

		// A small xorshift-style PRNG -- deterministic across runs/platforms, unlike Math.random().
		s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s |= 0;
		data[ i ] = ( ( s >>> 0 ) / 0xffffffff ) * 2 - 1;

	}

	return data;

}

function maxAbsDiff( a, b ) {

	let max = 0;

	for ( let i = 0; i < a.length; i ++ ) {

		max = Math.max( max, Math.abs( a[ i ] - b[ i ] ) );

	}

	return max;

}

// Deinterleaves (real, imag) pairs (as returned by `readComplexTexture`) into separate arrays.
function deinterleave( data ) {

	const count = data.length / 2;
	const real = new Float32Array( count );
	const imag = new Float32Array( count );

	for ( let i = 0; i < count; i ++ ) {

		real[ i ] = data[ i * 2 ];
		imag[ i ] = data[ i * 2 + 1 ];

	}

	return { real, imag };

}

// Builds a float source texture holding `real`/`imag` (row-major, length `width*height`) in its
// `.rg` channels -- `FFT2D#computeForward`/`computeInverse`'s input format. A plain `DataTexture`
// is enough here: `FFT2D` only ever reads a source texture, never writes one.
function makeComplexSourceTexture( real, imag, width, height ) {

	const data = new Float32Array( width * height * 4 );

	for ( let i = 0; i < width * height; i ++ ) {

		data[ i * 4 ] = real[ i ];
		data[ i * 4 + 1 ] = imag ? imag[ i ] : 0;
		data[ i * 4 + 2 ] = 0;
		data[ i * 4 + 3 ] = 1;

	}

	const tex = new THREE.DataTexture( data, width, height, THREE.RGBAFormat, THREE.FloatType );
	tex.needsUpdate = true;

	return tex;

}

// A float `StorageTexture` with (at least) 2 channels, `FFT2D`'s destination format.
function makeComplexDestinationTexture( width, height ) {

	const tex = new THREE.StorageTexture( width, height );
	tex.type = THREE.FloatType;

	return tex;

}

// Reads a complex texture's `.rg` channels back to the CPU, as interleaved `(real, imag)` pairs
// -- the GPU-side mirror of `makeComplexSourceTexture`, used to check `FFT2D`'s output.
async function readComplexTexture( renderer, sourceTexture, width, height ) {

	const count = width * height;

	const sourceNode = texture( sourceTexture );
	const readAttribute = new THREE.StorageBufferAttribute( count, 2 );
	const readWrite = storage( readAttribute, 'vec2', count );

	const kernel = Fn( () => {

		const x = instanceIndex.mod( uint( width ) );
		const y = instanceIndex.div( uint( width ) );

		readWrite.element( instanceIndex ).assign( sourceNode.load( ivec2( int( x ), int( y ) ) ).rg );

	} )().compute( count );

	renderer.compute( kernel );

	const data = new Float32Array( await renderer.getArrayBufferAsync( readWrite.value ) );

	readAttribute.dispose?.();

	return data;

}

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'FFT2D (GPGPU, WebGPU-only)', () => {

		// A single helper drives every test below: get (or skip on) the real WebGPU renderer,
		// then hand it to `run`. Matches gpuTest's own skip-if-unavailable convention (see
		// gpu-test-utils.js's declareTest), since availability can only be known after an async
		// `init()` call.
		function fftTest( name, run ) {

			QUnit.test( name, async ( assert ) => {

				const renderer = await getSharedRenderer( 'webgpu' );

				if ( renderer === null ) {

					assert.ok( true, 'SKIPPED: "webgpu" backend is not available in this environment.' );
					return;

				}

				await run( assert, renderer );

			} );

		}

		[ [ 4, 1 ], [ 8, 1 ], [ 16, 1 ] ].forEach( ( [ width, height ] ) => {

			fftTest( `1D forward FFT matches naive DFT (N=${ width })`, async ( assert, renderer ) => {

				const input = makeTestImage( width, height, width * 7 + 1 );

				const source = makeComplexSourceTexture( input, null, width, height );
				const destination = makeComplexDestinationTexture( width, height );

				const fft = new FFT2D( width, height );
				fft.computeForward( renderer, source, destination );

				const { real, imag } = deinterleave( await readComplexTexture( renderer, destination, width, height ) );
				const expected = naiveDFT2D( input, new Float32Array( width * height ), width, height );

				assert.ok( maxAbsDiff( real, expected.real ) < 1e-3, `real part within tolerance (max diff ${ maxAbsDiff( real, expected.real ) })` );
				assert.ok( maxAbsDiff( imag, expected.imag ) < 1e-3, `imag part within tolerance (max diff ${ maxAbsDiff( imag, expected.imag ) })` );

				fft.dispose();
				source.dispose();
				destination.dispose();

			} );

		} );

		[ [ 4, 4 ], [ 8, 8 ], [ 16, 8 ] ].forEach( ( [ width, height ] ) => {

			fftTest( `2D forward FFT matches naive DFT (${ width }x${ height })`, async ( assert, renderer ) => {

				const input = makeTestImage( width, height, width * 13 + height * 3 + 1 );

				const source = makeComplexSourceTexture( input, null, width, height );
				const destination = makeComplexDestinationTexture( width, height );

				const fft = new FFT2D( width, height );
				fft.computeForward( renderer, source, destination );

				const { real, imag } = deinterleave( await readComplexTexture( renderer, destination, width, height ) );
				const expected = naiveDFT2D( input, new Float32Array( width * height ), width, height );

				assert.ok( maxAbsDiff( real, expected.real ) < 1e-2, `real part within tolerance (max diff ${ maxAbsDiff( real, expected.real ) })` );
				assert.ok( maxAbsDiff( imag, expected.imag ) < 1e-2, `imag part within tolerance (max diff ${ maxAbsDiff( imag, expected.imag ) })` );

				fft.dispose();
				source.dispose();
				destination.dispose();

			} );

		} );

		[ [ 8, 8 ], [ 16, 16 ], [ 32, 16 ] ].forEach( ( [ width, height ] ) => {

			fftTest( `forward + inverse round trip reconstructs the original image (${ width }x${ height })`, async ( assert, renderer ) => {

				const input = makeTestImage( width, height, width * 101 + height * 7 + 3 );

				const source = makeComplexSourceTexture( input, null, width, height );
				const spectrum = makeComplexDestinationTexture( width, height );
				const reconstructed = makeComplexDestinationTexture( width, height );

				const fft = new FFT2D( width, height );
				fft.computeForward( renderer, source, spectrum );
				fft.computeInverse( renderer, spectrum, reconstructed );

				const { real, imag } = deinterleave( await readComplexTexture( renderer, reconstructed, width, height ) );

				const diff = maxAbsDiff( real, input );
				assert.ok( diff < 1e-3, `reconstructed real part within tolerance (max diff ${ diff })` );

				const maxImag = imag.reduce( ( m, v ) => Math.max( m, Math.abs( v ) ), 0 );
				assert.ok( maxImag < 1e-3, `reconstructed imaginary part is ~0 (max ${ maxImag })` );

				fft.dispose();
				source.dispose();
				spectrum.dispose();
				reconstructed.dispose();

			} );

		} );

		[ [ 8, 8 ], [ 16, 16 ] ].forEach( ( [ width, height ] ) => {

			// Confirms (empirically, on the GPU path itself) that a real-valued input's spectrum
			// is Hermitian-symmetric -- X[ky][kx] == conj( X[(-ky) mod H][(-kx) mod W] ) -- rather
			// than fully real. This is the property an RFFT-style optimization (computing/storing
			// only the non-redundant half) would exploit.
			fftTest( `real input produces a Hermitian-symmetric spectrum (${ width }x${ height })`, async ( assert, renderer ) => {

				const input = makeTestImage( width, height, width * 29 + height * 11 + 5 );

				const source = makeComplexSourceTexture( input, null, width, height );
				const destination = makeComplexDestinationTexture( width, height );

				const fft = new FFT2D( width, height );
				fft.computeForward( renderer, source, destination );

				const { real, imag } = deinterleave( await readComplexTexture( renderer, destination, width, height ) );

				let maxDiff = 0;

				for ( let ky = 0; ky < height; ky ++ ) {

					for ( let kx = 0; kx < width; kx ++ ) {

						const mkx = ( width - kx ) % width;
						const mky = ( height - ky ) % height;

						const a = ky * width + kx;
						const b = mky * width + mkx;

						maxDiff = Math.max( maxDiff, Math.abs( real[ a ] - real[ b ] ) );
						maxDiff = Math.max( maxDiff, Math.abs( imag[ a ] + imag[ b ] ) );

					}

				}

				assert.ok( maxDiff < 1e-3, `Hermitian symmetry holds within tolerance (max diff ${ maxDiff })` );

				fft.dispose();
				source.dispose();
				destination.dispose();

			} );

		} );

	} );

} );
