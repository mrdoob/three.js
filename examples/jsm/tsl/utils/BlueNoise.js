import { DataTexture, FloatType, NearestFilter, RedFormat, RepeatWrapping, RGBAFormat, RGFormat, UnsignedByteType } from 'three';
import { cos, float, Fn, fract, If, int, ivec2, mat2, PI, sin, texture, textureLoad, vec2, vec4 } from 'three/tsl';

/**
 * Tile dimension of the procedurally-generated blue-noise texture shared by all screen-space passes.
 *
 * @type {number}
 */
export const BLUE_NOISE_TEXTURE_SIZE = 64;


/**
 * Generates tileable blue-noise dither arrays via Ulichney's void-and-cluster method.
 *
 * The algorithm builds a per-pixel rank in `[0, size² − 1]` that, when interpreted as a
 * threshold map, has a flat spectrum at low frequencies (no clustering) and concentrated
 * energy at high frequencies — the defining property of blue noise.
 *
 * ```js
 * const generator = new BlueNoiseGenerator();
 * generator.size = 64;
 * const { data, maxValue } = generator.generate();
 * ```
 *
 * Reference: [Robert Ulichney, "The void-and-cluster method for dither array generation" (1993)](http://cv.ulichney.com/papers/1993-void-cluster.pdf).
 *
 * @three_import import { BlueNoiseGenerator } from 'three/addons/tsl/utils/BlueNoise.js';
 */
class BlueNoiseGenerator {

	/**
	 * Constructs a new blue-noise generator with default parameters.
	 */
	constructor() {

		/**
		 * Output dimension. The generated dither array is `size × size` and tiles seamlessly.
		 *
		 * @type {number}
		 * @default 64
		 */
		this.size = 64;

		/**
		 * Standard deviation (in pixels) of the Gaussian energy filter used to score
		 * voids and clusters. Smaller σ → higher-frequency / sharper blue noise; larger
		 * σ → smoother. Ulichney recommends `1.5`.
		 *
		 * @type {number}
		 * @default 1.5
		 */
		this.sigma = 1.5;

		/**
		 * Fraction of pixels seeded as 1s in the initial random pattern. The
		 * void-and-cluster step equilibrates this into the Initial Binary Pattern (IBP).
		 *
		 * @type {number}
		 * @default 0.1
		 */
		this.majorityPointsRatio = 0.1;

		/**
		 * Seed for the internal LCG, for reproducible output.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.seed = 1;

	}

	/**
	 * Run the void-and-cluster algorithm.
	 *
	 * @return {{ data: Uint32Array, maxValue: number }} `data` holds per-pixel ranks
	 * in row-major order; `maxValue` is `size² − 1` (the highest rank).
	 */
	generate() {

		const size = this.size;
		const total = size * size;
		const sigma = this.sigma;
		const sigma2 = sigma * sigma;

		// Toroidal Gaussian filter, truncated to ±5σ (or ±size/2, whichever is smaller).
		// Beyond ~5σ the weight is < 4e-6 and contributes nothing measurable.
		const halfSize = ( size / 2 ) | 0;
		const cutoff = Math.min( halfSize, Math.ceil( sigma * 5 ) );
		const filterSize = cutoff * 2 + 1;
		const weights = new Float32Array( filterSize * filterSize );
		for ( let dy = - cutoff; dy <= cutoff; dy ++ ) {

			for ( let dx = - cutoff; dx <= cutoff; dx ++ ) {

				weights[ ( dy + cutoff ) * filterSize + ( dx + cutoff ) ] = Math.exp( - ( dx * dx + dy * dy ) / ( 2 * sigma2 ) );

			}

		}

		// Working state.
		const binaryPattern = new Uint8Array( total );
		const energy = new Float32Array( total );

		// Linear-congruential PRNG, seeded for reproducibility.
		let rngState = ( this.seed | 0 ) || 1;
		const random = () => {

			rngState = ( Math.imul( rngState, 1664525 ) + 1013904223 ) | 0;
			return ( rngState >>> 0 ) / 0x100000000;

		};

		// Place `targetOnes` 1s at random positions via Fisher–Yates.
		const targetOnes = Math.max( 1, Math.floor( total * this.majorityPointsRatio ) );
		const shuffled = new Int32Array( total );
		for ( let i = 0; i < total; i ++ ) shuffled[ i ] = i;
		for ( let i = total - 1; i > 0; i -- ) {

			const j = Math.floor( random() * ( i + 1 ) );
			const tmp = shuffled[ i ];
			shuffled[ i ] = shuffled[ j ];
			shuffled[ j ] = tmp;

		}

		for ( let i = 0; i < targetOnes; i ++ ) {

			binaryPattern[ shuffled[ i ] ] = 1;

		}

		// Add or remove a 1 at (x, y), splatting the Gaussian into the energy buffer.
		const splatEnergy = ( x, y, sign ) => {

			for ( let dy = - cutoff; dy <= cutoff; dy ++ ) {

				const sy = ( ( y + dy ) % size + size ) % size;
				const wRow = ( dy + cutoff ) * filterSize;
				const eRow = sy * size;
				for ( let dx = - cutoff; dx <= cutoff; dx ++ ) {

					const sx = ( ( x + dx ) % size + size ) % size;
					energy[ eRow + sx ] += sign * weights[ wRow + ( dx + cutoff ) ];

				}

			}

		};

		// Tightest cluster: 1-pixel with the highest filter response.
		const findTightestCluster = () => {

			let maxE = - Infinity;
			let idx = - 1;
			for ( let i = 0; i < total; i ++ ) {

				if ( binaryPattern[ i ] === 1 && energy[ i ] > maxE ) {

					maxE = energy[ i ];
					idx = i;

				}

			}

			return idx;

		};

		// Largest void: 0-pixel with the lowest filter response.
		const findLargestVoid = () => {

			let minE = Infinity;
			let idx = - 1;
			for ( let i = 0; i < total; i ++ ) {

				if ( binaryPattern[ i ] === 0 && energy[ i ] < minE ) {

					minE = energy[ i ];
					idx = i;

				}

			}

			return idx;

		};

		// Initial energy from the random seed pattern.
		for ( let i = 0; i < total; i ++ ) {

			if ( binaryPattern[ i ] === 1 ) splatEnergy( i % size, ( i / size ) | 0, + 1 );

		}

		// Step 1: Equilibrate to the Initial Binary Pattern (IBP). Repeatedly move the
		// tightest cluster's 1 into the largest void; converges when the same pixel is
		// chosen on both sides.
		while ( true ) {

			const clusterIdx = findTightestCluster();
			binaryPattern[ clusterIdx ] = 0;
			splatEnergy( clusterIdx % size, ( clusterIdx / size ) | 0, - 1 );

			const voidIdx = findLargestVoid();
			binaryPattern[ voidIdx ] = 1;
			splatEnergy( voidIdx % size, ( voidIdx / size ) | 0, + 1 );

			if ( clusterIdx === voidIdx ) break;

		}

		// Snapshot the IBP — we'll restore it before the forward pass.
		const ibpBinary = binaryPattern.slice();
		const ibpEnergy = energy.slice();

		const ranks = new Uint32Array( total );

		// Phase 1: Reverse-rank the ones in the IBP. Repeatedly remove the tightest
		// cluster, assigning ranks `targetOnes − 1` down to `0`.
		for ( let rank = targetOnes - 1; rank >= 0; rank -- ) {

			const idx = findTightestCluster();
			ranks[ idx ] = rank;
			binaryPattern[ idx ] = 0;
			splatEnergy( idx % size, ( idx / size ) | 0, - 1 );

		}

		// Restore IBP.
		binaryPattern.set( ibpBinary );
		energy.set( ibpEnergy );

		// Phase 2 + 3: Forward-rank the zeros. Repeatedly fill the largest void,
		// assigning ranks `targetOnes` up to `total − 1`. The same operation works
		// past the 50 % mark — picking the 0-pixel with the smallest filter response
		// is equivalent to picking the tightest cluster on the inverted pattern.
		for ( let rank = targetOnes; rank < total; rank ++ ) {

			const idx = findLargestVoid();
			ranks[ idx ] = rank;
			binaryPattern[ idx ] = 1;
			splatEnergy( idx % size, ( idx / size ) | 0, + 1 );

		}

		return { data: ranks, maxValue: total - 1 };

	}

}

/**
 * Generate a blue noise DataTexture.
 * Returns an 8-bit texture with RepeatWrapping, suitable for sampling in shaders
 * as a tileable noise source. Each channel is an independent blue-noise pattern,
 * generated with a distinct seed so consumers can read decorrelated values from
 * a single texture fetch.
 *
 * @param {number} [size=64] Texture dimension in pixels (the noise is square).
 * @param {number} [channels=1] Number of independent noise channels. Must be `1`
 * (RedFormat), `2` (RGFormat), or `4` (RGBAFormat). Generation cost scales linearly.
 * @param {number} [type=UnsignedByteType] Texel data type. `UnsignedByteType` packs the
 * ranks into 8-bit values; `FloatType` stores them as full-precision float32, which avoids
 * the quantization of the 8-bit path when the shader needs finer noise resolution.
 * @return {DataTexture} The generated blue-noise DataTexture.
 */
export function generateBlueNoiseTexture( size = 64, channels = 1, type = UnsignedByteType ) {

	if ( channels !== 1 && channels !== 2 && channels !== 4 ) {

		throw new Error( 'generateBlueNoiseTexture: channels must be 1, 2, or 4.' );

	}

	if ( type !== UnsignedByteType && type !== FloatType ) {

		throw new Error( 'generateBlueNoiseTexture: type must be UnsignedByteType or FloatType.' );

	}

	const format = channels === 1 ? RedFormat : channels === 2 ? RGFormat : RGBAFormat;
	const isFloat = type === FloatType;

	const generator = new BlueNoiseGenerator();
	generator.size = size;

	const pixels = isFloat ? new Float32Array( size * size * channels ) : new Uint8Array( size * size * channels );

	// Each channel is regenerated with a distinct seed for an independent pattern.
	for ( let c = 0; c < channels; c ++ ) {

		generator.seed = c + 1;
		const { data, maxValue } = generator.generate();

		for ( let i = 0, l = data.length; i < l; i ++ ) {

			// Normalize ranks to [0,1]. Float keeps full precision; 8-bit rescales to [0,255].
			const value = data[ i ] / maxValue;
			pixels[ i * channels + c ] = isFloat ? value : value * 255;

		}

	}

	const texture = new DataTexture( pixels, size, size, format, type );
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	texture.needsUpdate = true;

	return texture;

}


/**
 * @param {import('three').Texture} texture
 */
function configureBlueNoiseTexture( texture ) {

	texture.wrapS = texture.wrapT = RepeatWrapping;
	texture.minFilter = NearestFilter;
	texture.magFilter = NearestFilter;

}

let _sharedBlueNoiseTexture = null;

/**
 * Returns a process-wide shared blue-noise texture, generated on first use via the void-and-cluster
 * method (no PNG asset).
 *
 * @returns {import('three').DataTexture}
 */
export function getBlueNoiseTexture() {

	if ( _sharedBlueNoiseTexture === null ) {

		_sharedBlueNoiseTexture = generateBlueNoiseTexture( BLUE_NOISE_TEXTURE_SIZE, 4, FloatType );
		configureBlueNoiseTexture( _sharedBlueNoiseTexture );

	}

	return _sharedBlueNoiseTexture;

}

/**
 * Returns a TSL function that samples the blue-noise texture.
 * Index 0 uses UV lookup; other indices tile-shift via R² + texelFetch.
 * All four channels are also advanced by an R² temporal rotation per index, giving
 * each pixel a low-discrepancy sequence over time without breaking the spatial spectrum.
 *
 * @param {import('three/tsl').TextureNode} blueNoiseTextureNode
 * @param {import('three/tsl').UniformNode<import('three').Vector2>} resolution
 * @param {import('three/tsl').UniformNode<import('three').Vector2>} blueNoiseSize
 * @param {number} [seed=0] - Added to `sampleIndex` so each pass gets an independent R² phase.
 */
export function bindBlueNoise( blueNoiseTextureNode, resolution, blueNoiseSize, seed = 0 ) {

	const seedOffset = int( seed );

	return Fn( ( [ uvCoord, sampleIndex ] ) => {

		const index = int( sampleIndex ).add( seedOffset );
		const noise = vec4().toVar();

		If( index.equal( int( 0 ) ), () => {

			noise.assign( texture( blueNoiseTextureNode, uvCoord.mul( resolution ).div( blueNoiseSize ) ) );

		} ).Else( () => {

			const tileSize = ivec2( blueNoiseSize );
			const pixel = ivec2( uvCoord.mul( resolution ).floor() );
			const offset = fract( vec2( float( index ).mul( 0.7548776662 ).fract(), float( index ).mul( 0.5698402910 ).fract() ) ).mul( blueNoiseSize ).floor();
			const coords = pixel.add( offset ).mod( tileSize ).toVar();

			If( coords.x.lessThan( int( 0 ) ), () => {

				coords.x.assign( coords.x.add( tileSize.x ) );

			} );

			If( coords.y.lessThan( int( 0 ) ), () => {

				coords.y.assign( coords.y.add( tileSize.y ) );

			} );

			noise.assign( textureLoad( blueNoiseTextureNode, coords, 0 ) );

		} );

		return noise;

	} );

}

/**
 * Analytic, texture-free drop-in replacement for {@link bindBlueNoise} (same `(uvCoord, sampleIndex)
 * → vec4` signature). Mirrors {@link bindBlueNoise} indexing: index 0 uses continuous screen pixels;
 * other indices tile-shift with the same R² sequence into a 64×64 period. Values are four independent
 * R² dimensions hashed from the sample coordinates — no IGN, so there is no fixed spatial structure
 * fighting temporal accumulation.
 *
 * @param {import('three/tsl').UniformNode<import('three').Vector2>} resolution
 * @param {number} [seed=0] - Added to the coordinate hash so each pass gets an independent R² phase.
 */
export function bindAnalyticNoise( resolution, seed = 0 ) {

	const seedOffset = int( seed );
	const tileSize = float( BLUE_NOISE_TEXTURE_SIZE );

	const r2Vec4 = ( coords ) => {

		const P = 1.32471795724474602596;

		const t = coords.x.mul( 1 / P ).add( coords.y.mul( 1 / P ** 2 ) ).add( float( seed ) );

		return vec4(
			fract( t.mul( 1 / P ) ),
			fract( t.mul( 1 / P ** 2 ) ),
			fract( t.mul( 0.4198754210 ) ), // this is not 1 / P ** 3, however this magic constant gives better noise
			fract( t.mul( 1 / P ** 3 ) )
		);

	};

	return Fn( ( [ uvCoord, sampleIndex ] ) => {

		const index = int( sampleIndex ).add( seedOffset );
		const noise = vec4().toVar();

		If( index.equal( int( 0 ) ), () => {

			noise.assign( r2Vec4( uvCoord.mul( resolution ) ) );

		} ).Else( () => {

			const screenPixel = uvCoord.mul( resolution ).floor();
			const offset = fract( vec2(
				float( index ).mul( 0.7548776662 ),
				float( index ).mul( 0.5698402910 )
			) ).mul( tileSize ).floor();
			const coords = screenPixel.add( offset ).mod( tileSize );

			noise.assign( r2Vec4( coords ) );

		} );

		return noise;

	} );

}

/**
 * Returns a TSL function that builds a blue-noise kernel rotation matrix.
 * The texture node is captured from closure — do not pass textures as Fn parameters.
 *
 * @param {import('three/tsl').TextureNode} blueNoiseTextureNode
 * @param {import('three/tsl').UniformNode<import('three').Vector2>} resolution
 * @param {import('three/tsl').UniformNode<import('three').Vector2>} blueNoiseSize
 * @param {import('three/tsl').UniformNode<number>} blueNoiseIndex
 * @param {number} [seed=0] - Added to the frame index so each pass gets an independent R² phase.
 * @param {?import('three/tsl').UniformNode<boolean>} [useBlueNoise=null] - When provided, toggles
 * between the blue-noise texture (`true`) and texture-free analytic R² noise (`false`) at runtime.
 */
export function bindBlueNoiseRotationMatrix( blueNoiseTextureNode, resolution, blueNoiseSize, blueNoiseIndex, seed = 0, useBlueNoise = null ) {

	const sampleBlueNoise = bindBlueNoise( blueNoiseTextureNode, resolution, blueNoiseSize, seed );
	const sampleAnalyticNoise = useBlueNoise !== null ? bindAnalyticNoise( resolution, seed ) : null;

	return Fn( ( [ uvCoord ] ) => {

		const noiseTexel = useBlueNoise !== null
			? useBlueNoise.equal( true ).select( sampleBlueNoise( uvCoord, blueNoiseIndex ), sampleAnalyticNoise( uvCoord, blueNoiseIndex ) )
			: sampleBlueNoise( uvCoord, blueNoiseIndex );
		const angle = noiseTexel.r.mul( 2 ).mul( PI );
		return mat2( cos( angle ), sin( angle ).negate(), sin( angle ), cos( angle ) );

	} );

}

export { BlueNoiseGenerator };
