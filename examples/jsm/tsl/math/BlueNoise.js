import { DataTexture, MathUtils, RedFormat, RGFormat, RGBAFormat, UnsignedByteType, RepeatWrapping, TempNode } from 'three/webgpu';
import { texture, screenCoordinate, uniform, fract, float, vec2, vec4 } from 'three/tsl';

/**
 * @module BlueNoise
 * @three_import import { blueNoise } from 'three/addons/tsl/math/BlueNoise.js';
 */

// Per-channel increments from the R1/R2/R4 quasirandom sequences (Roberts 2018, "The Unreasonable
// Effectiveness of Quasirandom Sequences"). Each channel advances by its own irrational step so
// the channels stay jointly well distributed over time.
const R1 = [ 0.6180339887498949 ];
const R2 = [ 0.7548776662466927, 0.5698402909980532 ];
const R4 = [ 0.8566748838545029, 0.7338918566271260, 0.6287067210378086, 0.5385972572236101 ];

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
		 * Seed of the random initial pattern, for reproducible output.
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

		MathUtils.seededRandom( this.seed );
		const random = () => MathUtils.seededRandom();

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
 * Generates a blue-noise DataTexture.
 *
 * Returns an 8-bit texture with repeat wrapping and nearest filtering, suitable for
 * sampling in shaders as a tileable noise source. Each channel is an independent
 * blue-noise pattern, generated with a distinct seed so consumers can read
 * decorrelated values from a single texture fetch.
 *
 * Generation runs on the CPU (roughly 50 ms per channel at `64`) and the cost grows
 * with the fourth power of `size`, so prefer small textures — a tileable `64` is
 * plenty for screen-space jitter.
 *
 * @param {number} [size=64] - Texture dimension in pixels (the noise is square).
 * @param {number} [channels=1] - Number of independent noise channels. Must be `1`
 * (RedFormat), `2` (RGFormat), or `4` (RGBAFormat). Generation cost scales linearly.
 * @return {DataTexture} The generated blue-noise texture.
 */
export function generateBlueNoiseTexture( size = 64, channels = 1 ) {

	if ( channels !== 1 && channels !== 2 && channels !== 4 ) {

		throw new Error( 'generateBlueNoiseTexture: channels must be 1, 2, or 4.' );

	}

	const format = channels === 1 ? RedFormat : channels === 2 ? RGFormat : RGBAFormat;

	const generator = new BlueNoiseGenerator();
	generator.size = size;

	const pixels = new Uint8Array( size * size * channels );

	// Each channel is regenerated with a distinct seed for an independent pattern.
	for ( let c = 0; c < channels; c ++ ) {

		generator.seed = c + 1;
		const { data, maxValue } = generator.generate();

		for ( let i = 0, l = data.length; i < l; i ++ ) {

			pixels[ i * channels + c ] = ( data[ i ] / maxValue ) * 255;

		}

	}

	const texture = new DataTexture( pixels, size, size, format, UnsignedByteType );
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	texture.needsUpdate = true;

	return texture;

}

/**
 * A node that supplies per-pixel blue-noise values for screen-space sampling jitter.
 *
 * The node lazily generates its own tileable blue-noise texture (see
 * {@link generateBlueNoiseTexture}) and point-samples it at the fragment's screen
 * coordinate. When `animated` is enabled, the values are scrolled along a per-channel
 * quasirandom (R-sequence) increment each frame: every frame keeps the spatial
 * blue-noise distribution while each pixel follows a low-discrepancy temporal
 * sequence — ideal input jitter for effects resolved by temporal accumulation
 * (e.g. `TRAANode`).
 *
 * ```js
 * const giPass = ssgi( scenePassColor, scenePassDepth, sceneNormal, camera );
 * giPass.noiseNode = blueNoise( 2 );
 * ```
 *
 * @augments TempNode
 */
class BlueNoiseNode extends TempNode {

	static get type() {

		return 'BlueNoiseNode';

	}

	/**
	 * Constructs a new blue-noise node.
	 *
	 * @param {number} [channels=1] - Number of decorrelated noise channels. Must be `1`
	 * (float output), `2` (vec2) or `4` (vec4).
	 * @param {number} [size=64] - The edge length of the internal noise texture.
	 */
	constructor( channels = 1, size = 64 ) {

		super( channels === 1 ? 'float' : channels === 2 ? 'vec2' : 'vec4' );

		/**
		 * Number of decorrelated noise channels.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.channels = channels;

		/**
		 * The edge length of the internal noise texture.
		 *
		 * @type {number}
		 * @default 64
		 */
		this.size = size;

		/**
		 * Whether the noise is decorrelated over time for temporal accumulation. When
		 * `false`, the pattern is static — use this when no temporal filtering is in
		 * place, otherwise the noise would visibly crawl.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.animated = true;

		/**
		 * Length of the animation loop in frames. A short loop lets temporally accumulated
		 * results converge to a stable image instead of drifting, while still providing
		 * enough decorrelated patterns for typical accumulation windows.
		 *
		 * @type {number}
		 * @default 12
		 */
		this.cycle = 12;

		/**
		 * The lazily generated blue-noise texture.
		 *
		 * @private
		 * @type {?DataTexture}
		 */
		this._texture = null;

	}

	/**
	 * This method is used to set up the node's TSL code.
	 *
	 * @return {Node} The per-pixel noise value.
	 */
	setup() {

		if ( this._texture === null ) {

			this._texture = generateBlueNoiseTexture( this.size, this.channels );

		}

		const noise = texture( this._texture, screenCoordinate.div( this.size ) );

		const value = ( this.channels === 1 ) ? noise.r : ( this.channels === 2 ) ? noise.rg : noise;

		const steps = ( this.channels === 1 ) ? float( R1[ 0 ] ) : ( this.channels === 2 ) ? vec2( ...R2 ) : vec4( ...R4 );

		const frame = uniform( 0, 'float' ).onRenderUpdate( ( nodeFrame ) => ( this.animated === true ) ? nodeFrame.frameId % this.cycle : 0 );

		return fract( value.add( frame.mul( steps ) ) );

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the node is no longer required.
	 */
	dispose() {

		super.dispose();

		if ( this._texture !== null ) this._texture.dispose();

	}

}

export default BlueNoiseNode;

/**
 * TSL function for creating a blue-noise node.
 *
 * @tsl
 * @function
 * @param {number} [channels=1] - Number of decorrelated noise channels. Must be `1`
 * (float output), `2` (vec2) or `4` (vec4).
 * @param {number} [size=64] - The edge length of the internal noise texture.
 * @returns {BlueNoiseNode}
 */
export const blueNoise = ( channels, size ) => new BlueNoiseNode( channels, size );

export { BlueNoiseGenerator };
