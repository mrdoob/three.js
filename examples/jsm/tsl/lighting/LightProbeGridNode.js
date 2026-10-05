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

		// All visible grids are evaluated together by the first one in scene order,
		// so a fragment only samples the grids that contain it. Grids are summed;
		// an `exclusive` grid instead lights the fragments inside it on its own.

		const grids = builder.lightsNode.getLights().filter( light => light.isLightProbeGrid && light.texture !== null );

		if ( grids[ 0 ] !== this.light ) return;

		const irradiance = vec3( 0 ).toVar( 'lightProbeGridIrradiance' );

		const nodes = grids.map( ( light ) => {

			const min = reference( 'boundingBox.min', 'vec3', light ).setGroup( renderGroup );
			const max = reference( 'boundingBox.max', 'vec3', light ).setGroup( renderGroup );
			const res = reference( 'resolution', 'vec3', light ).setGroup( renderGroup );
			const range = max.sub( min );
			const spacing = range.div( res.sub( 1.0 ) );

			// Distance from the fragment to the grid's bounds, zero inside.
			const distance = min.sub( positionWorld ).max( 0.0 ).add( positionWorld.sub( max ).max( 0.0 ) ).length();

			// Surfaces just outside the probes, such as the walls around an inset
			// grid, are still lit for one probe spacing.
			const margin = spacing.x.max( spacing.y ).max( spacing.z );

			return { light, min, max, res, range, spacing, distance, margin };

		} );

		const sample = ( { light, min, res, range, spacing } ) => {

			const intensity = reference( 'intensity', 'float', light ).setGroup( renderGroup );

			// Offset along the normal by half a probe spacing, then remap to texel centers.

			const samplePos = positionWorld.add( normalWorld.mul( spacing ).mul( 0.5 ) );
			const uvw = samplePos.sub( min ).div( range ).clamp( 0.0, 1.0 ).mul( res.sub( 1.0 ) ).div( res ).add( vec3( 0.5 ).div( res ) );

			return evaluateGridIrradiance( texture3D( light.texture ), uvw, res, normalWorld ).mul( intensity );

		};

		const blend = () => {

			for ( const grid of nodes ) {

				if ( grid.light.exclusive ) continue;

				if ( grid.light.falloff > 0 ) {

					const falloff = reference( 'falloff', 'float', grid.light ).setGroup( renderGroup );

					If( grid.distance.lessThan( falloff ), () => {

						irradiance.addAssign( sample( grid ).mul( grid.distance.smoothstep( 0.0, falloff ).oneMinus() ) );

					} );

				} else {

					If( grid.distance.lessThanEqual( grid.margin ), () => {

						irradiance.addAssign( sample( grid ) );

					} );

				}

			}

		};

		// The last exclusive grid containing the fragment wins; otherwise blend.

		const exclusive = nodes.filter( grid => grid.light.exclusive ).reverse();

		if ( exclusive.length > 0 ) {

			let chain = If( exclusive[ 0 ].distance.lessThanEqual( exclusive[ 0 ].margin ), () => {

				irradiance.assign( sample( exclusive[ 0 ] ) );

			} );

			for ( let i = 1; i < exclusive.length; i ++ ) {

				chain = chain.ElseIf( exclusive[ i ].distance.lessThanEqual( exclusive[ i ].margin ), () => {

					irradiance.assign( sample( exclusive[ i ] ) );

				} );

			}

			chain.Else( blend );

		} else {

			blend();

		}

		builder.context.irradiance.addAssign( irradiance );

	}

}

export { LightProbeGridNode };
