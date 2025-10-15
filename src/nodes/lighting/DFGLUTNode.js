import { texture } from '../accessors/TextureNode.js';
import { generateDFGLUT } from '../functions/BSDF/DFGApprox.js';
import { uint } from '../tsl/TSLBase.js';

import StorageTexture from '../../renderers/common/StorageTexture.js';
import { HalfFloatType } from '../../constants.js';

const _cache = new WeakMap();

/**
 * Creates a DFG (Directional-Fresnel-Geometry) LUT texture for Image-Based Lighting.
 * For WebGPU, it generates the LUT using a compute shader on first use.
 * The LUT is cached per renderer to avoid regeneration.
 *
 * @param {Renderer} renderer - The WebGPU renderer.
 * @param {number} [size=64] - The size of the LUT texture (e.g., 64 for 64x64).
 * @param {number} [sampleCount=1024] - The number of samples per texel for compute generation.
 * @returns {StorageTexture} The generated LUT texture.
 */
function getDFGLUTTexture( renderer, size = 64, sampleCount = 1024 ) {

	let cache = _cache.get( renderer );

	if ( cache === undefined ) {

		cache = new Map();
		_cache.set( renderer, cache );

	}

	// Check if we already have a LUT for this size
	const cacheKey = `${size}_${sampleCount}`;
	let cachedTexture = cache.get( cacheKey );

	if ( cachedTexture === undefined ) {

		// Create storage texture for the LUT
		const storageTexture = new StorageTexture( size, size );
		storageTexture.type = HalfFloatType;
		storageTexture.generateMipmaps = false;

		// Create compute node to generate the LUT
		const computeNode = generateDFGLUT( {
			storageTexture,
			lutSize: uint( size ),
			sampleCount: uint( sampleCount )
		} ).compute( size * size );

		// Generate the LUT
		renderer.compute( computeNode );

		// Cache it
		cache.set( cacheKey, storageTexture );
		cachedTexture = storageTexture;

	}

	return cachedTexture;

}

/**
 * Singleton DFG LUT texture node (64x64, 1024 samples) that can be sampled in shaders.
 * The texture is lazily generated on first use.
 */
class DFGLUTSingleton {

	constructor() {

		this._textureNode = null;
		this._size = 64;
		this._sampleCount = 1024;

	}

	sample( uv ) {

		// Lazy initialization - the texture node will be created when first sampled
		if ( this._textureNode === null ) {

			// Create a placeholder texture node
			const placeholderTexture = new StorageTexture( this._size, this._size );
			placeholderTexture.type = HalfFloatType;
			placeholderTexture.generateMipmaps = false;

			this._textureNode = texture( placeholderTexture );

			// Add a setup hook to update the texture value with the actual LUT
			const originalSetup = this._textureNode.setup.bind( this._textureNode );
			this._textureNode.setup = ( builder ) => {

				// Get the actual LUT texture for this renderer
				const lutTexture = getDFGLUTTexture( builder.renderer, this._size, this._sampleCount );
				this._textureNode.value = lutTexture;

				return originalSetup( builder );

			};

		}

		return this._textureNode.sample( uv );

	}

}

/**
 * Singleton instance of the DFG LUT that can be sampled directly in shader code.
 *
 * @tsl
 * @type {DFGLUTSingleton}
 */
export const dfgLUT = /*@__PURE__*/ new DFGLUTSingleton();
