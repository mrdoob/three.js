import { AnalyticLightNode } from 'three/webgpu';
import { If, array, getShIrradianceAt, normalWorld, positionWorld, reference, renderGroup, texture3D, vec3 } from 'three/tsl';

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

	setup( builder ) {

		// The first grid samples the last grid whose cells contain the fragment.

		const grids = builder.lightsNode.getLights().filter( light => light.isLightProbeGrid && light.texture !== null );

		if ( grids[ 0 ] !== this.light ) return;

		const irradiance = vec3( 0 ).toVar( 'lightProbeGridIrradiance' );

		const nodes = grids.map( ( light ) => {

			const min = reference( 'boundingBox.min', 'vec3', light ).setGroup( renderGroup );
			const max = reference( 'boundingBox.max', 'vec3', light ).setGroup( renderGroup );
			const res = reference( 'resolution', 'vec3', light ).setGroup( renderGroup );
			const intensity = reference( 'intensity', 'float', light ).setGroup( renderGroup );
			const range = max.sub( min );
			const spacing = range.div( res.sub( 1.0 ) );

			const samplePos = positionWorld.add( normalWorld.mul( spacing ).mul( 0.5 ) );
			const cell = spacing.mul( 0.5 );
			const inside = samplePos.greaterThanEqual( min.sub( cell ) ).all().and( samplePos.lessThanEqual( max.add( cell ) ).all() );

			const sample = () => {

				const uvw = samplePos.sub( min ).div( range ).clamp( 0.0, 1.0 ).mul( res.sub( 1.0 ) ).div( res ).add( vec3( 0.5 ).div( res ) );

				irradiance.assign( evaluateGridIrradiance( texture3D( light.texture ), uvw, res, normalWorld ).mul( intensity ) );

			};

			return { inside, sample };

		} ).reverse();

		let chain = If( nodes[ 0 ].inside, nodes[ 0 ].sample );

		for ( let i = 1; i < nodes.length; i ++ ) {

			chain = chain.ElseIf( nodes[ i ].inside, nodes[ i ].sample );

		}


		builder.context.irradiance.addAssign( irradiance );

	}

}

export { LightProbeGridNode };
