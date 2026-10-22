import { AnalyticLightNode, Vector3 } from 'three/webgpu';
import { array, getShIrradianceAt, normalWorld, positionWorld, texture3D, uniform, vec3 } from 'three/tsl';

// Padding texels at each boundary of every atlas sub-volume.
export const ATLAS_PADDING = 1;

/**
 * Samples the packed SH atlas and evaluates L2 irradiance for the given normal.
 *
 * The atlas stores the seven RGBA sub-volumes stacked along Z, each occupying
 * `( nz + 2 )` slices: one padding slice (a copy of the nearest edge slice) at
 * each end to prevent color bleeding when the hardware trilinear filter reads
 * across a sub-volume boundary.
 *
 * @private
 * @param {Texture3DNode} atlas - The atlas texture node.
 * @param {Node<vec3>} uvw - The probe-grid sample coordinate (texel centers).
 * @param {Node<vec3>} res - The probe resolution.
 * @param {Node<vec3>} normal - The world-space normal.
 * @return {Node<vec3>} The non-negative irradiance.
 */
function evaluateGridIrradiance( atlas, uvw, res, normal ) {

	const nz = res.z;
	const paddedSlices = nz.add( 2.0 * ATLAS_PADDING );
	const atlasDepth = paddedSlices.mul( 7.0 );
	const uvZBase = uvw.z.mul( nz ).add( ATLAS_PADDING );

	const slice = ( t ) => atlas.sample( vec3( uvw.xy, uvZBase.add( paddedSlices.mul( t ) ).div( atlasDepth ) ) );

	const s0 = slice( 0 ), s1 = slice( 1 ), s2 = slice( 2 ), s3 = slice( 3 );
	const s4 = slice( 4 ), s5 = slice( 5 ), s6 = slice( 6 );

	// Unpack 9 vec3 L2 SH coefficients and evaluate irradiance.

	const sh = array( [
		s0.xyz,
		vec3( s0.w, s1.xy ),
		vec3( s1.zw, s2.x ),
		s2.yzw,
		s3.xyz,
		vec3( s3.w, s4.xy ),
		vec3( s4.zw, s5.x ),
		s5.yzw,
		s6.xyz
	] );

	return getShIrradianceAt( normal, sh ).max( vec3( 0.0 ) );

}

/**
 * Evaluates the irradiance of a light probe grid at the given world-space position and normal.
 *
 * @private
 * @param {LightProbeGrid} light - The light probe grid.
 * @param {Node<vec3>} min - The minimum of the grid bounds.
 * @param {Node<vec3>} max - The maximum of the grid bounds.
 * @param {Node<vec3>} res - The probe resolution.
 * @param {Node<float>} intensity - The intensity.
 * @param {Node<float>} falloff - The falloff distance.
 * @param {Node<vec3>} position - The world-space position.
 * @param {Node<vec3>} normal - The world-space normal.
 * @return {Node<vec3>} The irradiance.
 */
function getGridIrradiance( light, min, max, res, intensity, falloff, position, normal ) {

	const range = max.sub( min );
	const resMinusOne = res.sub( 1.0 );
	const spacing = range.div( resMinusOne );

	// Offset along the normal by half a probe spacing, then remap to texel centers.

	const samplePos = position.add( normal.mul( spacing ).mul( 0.5 ) );
	const uvw = samplePos.sub( min ).div( range ).clamp( 0.0, 1.0 ).mul( resMinusOne ).div( res ).add( vec3( 0.5 ).div( res ) );

	let irradiance = evaluateGridIrradiance( texture3D( light.texture ), uvw, res, normal ).mul( intensity );

	// Optional smooth boundary for blending grids; falloff 0 applies everywhere.

	if ( light.falloff > 0 ) {

		const outside = min.sub( position ).max( 0.0 ).add( position.sub( max ).max( 0.0 ) );
		const weight = outside.length().smoothstep( 0.0, falloff ).oneMinus();

		irradiance = irradiance.mul( weight );

	}

	return irradiance;

}

/**
 * Returns the irradiance of a baked {@link LightProbeGrid} at the given world-space
 * position and normal. Use this to evaluate the grid outside of the lighting context,
 * e.g. when baking light maps with {@link LightMapper}.
 *
 * @param {LightProbeGrid} light - The baked light probe grid.
 * @param {Node<vec3>} position - The world-space position.
 * @param {Node<vec3>} normal - The world-space normal.
 * @return {Node<vec3>} The irradiance.
 */
export function lightProbeGridIrradiance( light, position, normal ) {

	const box = light.boundingBox;

	return getGridIrradiance( light, uniform( box.min ), uniform( box.max ), uniform( light.resolution ), uniform( light.intensity ), uniform( light.falloff ), position, normal );

}

/**
 * The light node that applies a {@link LightProbeGrid} to the scene. It samples
 * the baked L2 spherical-harmonic atlas at the surface position and adds the
 * resulting irradiance to the lighting context, so every standard node material
 * picks up the grid automatically (same role as the WebGL `lights_fragment_begin`
 * integration).
 *
 * @private
 * @augments AnalyticLightNode
 */
class LightProbeGridNode extends AnalyticLightNode {

	static get type() {

		return 'LightProbeGridNode';

	}

	constructor( light = null ) {

		super( light );

		this._min = uniform( new Vector3() );
		this._max = uniform( new Vector3() );
		this._resolution = uniform( new Vector3() );
		this._intensity = uniform( 1 );
		this._falloff = uniform( 0 );

	}

	update( /* frame */ ) {

		const light = this.light;

		this._min.value.copy( light.boundingBox.min );
		this._max.value.copy( light.boundingBox.max );
		this._resolution.value.copy( light.resolution );
		this._intensity.value = light.intensity;
		this._falloff.value = light.falloff;

	}

	setup( builder ) {

		const light = this.light;

		// No baked data yet: contribute nothing.

		if ( light.texture === null ) return;

		const irradiance = getGridIrradiance( light, this._min, this._max, this._resolution, this._intensity, this._falloff, positionWorld, normalWorld );

		builder.context.irradiance.addAssign( irradiance );

	}

}

export { LightProbeGridNode };
