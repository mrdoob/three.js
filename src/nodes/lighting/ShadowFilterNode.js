import { float, vec2, vec4, ivec2, If, Fn } from '../tsl/TSLBase.js';
import { reference } from '../accessors/ReferenceNode.js';
import { texture } from '../accessors/TextureNode.js';
import { mix, floor, step, max, clamp } from '../math/MathNode.js';
import { add, sub } from '../math/OperatorNode.js';
import { renderGroup } from '../core/UniformGroupNode.js';
import NodeMaterial from '../../materials/nodes/NodeMaterial.js';
import { screenCoordinate } from '../display/ScreenNode.js';
import { interleavedGradientNoise, vogelDiskSample } from '../utils/PostProcessingUtils.js';
import { NoBlending } from '../../constants.js';

const shadowMaterialLib = /*@__PURE__*/ new WeakMap();

/**
 * A shadow filtering function performing basic filtering. This is in fact an unfiltered version of the shadow map
 * with a binary `[0,1]` result.
 *
 * @method
 * @param {Object} inputs - The input parameter object.
 * @param {DepthTexture} inputs.depthTexture - A reference to the shadow map's texture data.
 * @param {Node<vec3>} inputs.shadowCoord - The shadow coordinates.
 * @return {Node<float>} The filtering result.
 */
export const BasicShadowFilter = /*@__PURE__*/ Fn( ( { depthTexture, shadowCoord, depthLayer } ) => {

	let basic = texture( depthTexture, shadowCoord.xy ).setName( 't_basic' );

	if ( depthTexture.isArrayTexture ) {

		basic = basic.depth( depthLayer );

	}

	return basic.compare( shadowCoord.z );

} );

/**
 * A shadow filtering function performing PCF filtering with Vogel disk sampling and IGN.
 *
 * Uses 5 samples distributed via Vogel disk pattern, rotated per-pixel using Interleaved
 * Gradient Noise (IGN) to break up banding artifacts. Combined with hardware PCF (4-tap
 * filtering per sample), this effectively provides 20 filtered taps with better distribution.
 *
 * @method
 * @param {Object} inputs - The input parameter object.
 * @param {DepthTexture} inputs.depthTexture - A reference to the shadow map's texture data.
 * @param {Node<vec3>} inputs.shadowCoord - The shadow coordinates.
 * @param {LightShadow} inputs.shadow - The light shadow.
 * @return {Node<float>} The filtering result.
 */
export const PCFShadowFilter = /*@__PURE__*/ Fn( ( { depthTexture, shadowCoord, shadow, depthLayer } ) => {

	const depthCompare = ( uv, compare ) => {

		let depth = texture( depthTexture, uv );

		if ( depthTexture.isArrayTexture ) {

			depth = depth.depth( depthLayer );

		}

		return depth.compare( compare );

	};

	const mapSize = reference( 'mapSize', 'vec2', shadow ).setGroup( renderGroup );
	const radius = reference( 'radius', 'float', shadow ).setGroup( renderGroup );

	const texelSize = vec2( 1 ).div( mapSize );
	const radiusScaled = radius.mul( texelSize.x );

	// Use IGN to rotate sampling pattern per pixel (phi = IGN * 2π)
	const phi = interleavedGradientNoise( screenCoordinate.xy ).mul( 6.28318530718 );

	// 5 samples using Vogel disk distribution
	return add(
		depthCompare( shadowCoord.xy.add( vogelDiskSample( 0, 5, phi ).mul( radiusScaled ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vogelDiskSample( 1, 5, phi ).mul( radiusScaled ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vogelDiskSample( 2, 5, phi ).mul( radiusScaled ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vogelDiskSample( 3, 5, phi ).mul( radiusScaled ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vogelDiskSample( 4, 5, phi ).mul( radiusScaled ) ), shadowCoord.z )
	).mul( 1 / 5 );

} );

/**
 * A shadow filtering function performing PCF soft filtering.
 *
 * @method
 * @param {Object} inputs - The input parameter object.
 * @param {DepthTexture} inputs.depthTexture - A reference to the shadow map's texture data.
 * @param {Node<vec3>} inputs.shadowCoord - The shadow coordinates.
 * @param {LightShadow} inputs.shadow - The light shadow.
 * @return {Node<float>} The filtering result.
 */
export const PCFSoftShadowFilter = /*@__PURE__*/ Fn( ( { depthTexture, shadowCoord, shadow, depthLayer } ) => {

	const mapSize = reference( 'mapSize', 'vec2', shadow ).setGroup( renderGroup );

	// Integer texel index `i` is the source of truth for both the gather footprint
	// and the bilinear weights `f`, so they always agree by construction.
	const coordPixel = shadowCoord.xy.mul( mapSize );
	const i = floor( coordPixel.sub( 0.5 ) ).toVar();
	const f = coordPixel.sub( 0.5 ).sub( i ).toVar();

	// Snap baseUV to the center of texel `i`. Tiny bias guards against FP round-trip
	// in (i+0.5)/size*size for non-power-of-two map sizes.
	const baseUV = i.add( vec2( 0.5 + 1.0 / 65536.0 ) ).div( mapSize ).toVar();

	const gatherCompare = ( ox, oy ) => {

		let t = texture( depthTexture, baseUV ).offset( ivec2( ox, oy ) ).gather();

		if ( depthTexture.isArrayTexture ) {

			t = t.depth( depthLayer );

		}

		return t.compare( shadowCoord.z );

	};

	// 4 textureGatherCompare calls at integer offsets from `i`. Footprints are
	// (i + offset, i + offset + 1) — never on a texel boundary, so neither hardware
	// fixed-point precision nor the polyfill's FP `floor` can flip the selection.
	const gBL = gatherCompare( - 1, - 1 ).toVar();
	const gBR = gatherCompare( 1, - 1 ).toVar();
	const gTL = gatherCompare( - 1, 1 ).toVar();
	const gTR = gatherCompare( 1, 1 ).toVar();

	// Bilinear weighting per row of the 4×4 footprint.
	const rowBot = float( 1 ).sub( f.y ).mul(
		mix( gBL.w, gBR.z, f.x ).add( gBL.z ).add( gBR.w )
	);

	const row0 = mix( gBL.x, gBR.y, f.x ).add( gBL.y ).add( gBR.x );
	const row1 = mix( gTL.w, gTR.z, f.x ).add( gTL.z ).add( gTR.w );

	const rowTop = f.y.mul(
		mix( gTL.x, gTR.y, f.x ).add( gTL.y ).add( gTR.x )
	);

	return add( rowBot, row0, row1, rowTop ).mul( 1 / 9 );

} );

/**
 * A shadow filtering function performing VSM filtering.
 *
 * @method
 * @param {Object} inputs - The input parameter object.
 * @param {DepthTexture} inputs.depthTexture - A reference to the shadow map's texture data.
 * @param {Node<vec3>} inputs.shadowCoord - The shadow coordinates.
 * @return {Node<float>} The filtering result.
 */
export const VSMShadowFilter = /*@__PURE__*/ Fn( ( { depthTexture, shadowCoord, depthLayer }, builder ) => {

	let distribution = texture( depthTexture ).sample( shadowCoord.xy );

	if ( depthTexture.isArrayTexture ) {

		distribution = distribution.depth( depthLayer );

	}

	distribution = distribution.rg;

	const mean = distribution.x;
	const variance = max( 0.0000001, distribution.y.mul( distribution.y ) );

	const hardShadow = ( builder.renderer.reversedDepthBuffer ) ? step( mean, shadowCoord.z ) : step( shadowCoord.z, mean );

	const output = float( 1 ).toVar(); // default, fully lit

	If( hardShadow.notEqual( 1.0 ), () => {

		// Distance from mean
		const d = shadowCoord.z.sub( mean );

		// Chebyshev's inequality for upper bound on probability
		let p_max = variance.div( variance.add( d.mul( d ) ) );

		// Reduce light bleeding by remapping [amount, 1] to [0, 1]
		p_max = clamp( sub( p_max, 0.3 ).div( 0.65 ) );

		output.assign( max( hardShadow, p_max ) );

	} );
	return output;

} );

/**
 * Retrieves or creates a shadow material for the given light source.
 *
 * This function checks if a shadow material already exists for the provided light.
 * If not, it creates a new `NodeMaterial` configured for shadow rendering and stores it
 * in the `shadowMaterialLib` for future use.
 *
 * @tsl
 * @function
 * @param {Light} light - The light source for which the shadow material is needed.
 *                         If the light is a point light, a depth node is calculated
 *                         using the linear shadow distance.
 * @returns {NodeMaterial} The shadow material associated with the given light.
 */
export const getShadowMaterial = ( light ) => {

	let material = shadowMaterialLib.get( light );

	if ( material === undefined ) {

		material = new NodeMaterial();
		material.colorNode = vec4( 0, 0, 0, 1 );
		material.isShadowPassMaterial = true; // Use to avoid other overrideMaterial override material.colorNode unintentionally when using material.shadowNode
		material.name = 'ShadowMaterial';
		material.blending = NoBlending;
		material.fog = false;

		shadowMaterialLib.set( light, material );

	}

	return material;

};

/**
 * Disposes the shadow material for the given light source.
 *
 * @param {Light} light - The light source.
 */
export const disposeShadowMaterial = ( light ) => {

	const material = shadowMaterialLib.get( light );

	if ( material !== undefined ) {

		material.dispose();
		shadowMaterialLib.delete( light );

	}

};
