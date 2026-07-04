import { Break, Fn, If, Loop, abs, clamp, dFdx, dFdy, dot, float, max, min, mix, normalViewGeometry, normalize, positionViewDirection, tangentGeometry, tangentView, texture, textureLevel, uv, vec2, vec3 } from 'three/tsl';

/**
 * @module ParallaxOcclusion
 * @three_import import { parallaxOcclusionUV } from 'three/addons/tsl/utils/ParallaxOcclusion.js';
 */

/**
 * TSL function for Parallax Occlusion Mapping (POM) with silhouette clipping,
 * curved surface silhouettes and horizon trimming.
 *
 * The view ray is marched through a height field in tangent space until it intersects
 * the surface. Sampling color, normal or roughness maps at the returned UV coordinates
 * fakes interior depth on flat geometry.
 *
 * With silhouette detection enabled, the returned `coverage` node combines up to three clips:
 *
 * - Silhouette clipping: rays whose final landing UV lies outside `silhouetteBounds`
 *   left the height field through the side, so the mesh outline follows the relief
 *   instead of the polygon edge. For open geometry like plates and walls.
 * - Curved silhouette: with `curvedSilhouette` enabled, the height field is bent along
 *   with the local curvature of the base surface. Rays that march past the horizon of
 *   a convex surface never intersect the bent relief and clip, so the outline of curved
 *   geometry follows the relief. Combine with an inflated shell (see below) to let the
 *   relief extend beyond the base mesh silhouette.
 * - Horizon trimming (opt-in via `horizonStrength`): a view angle driven height threshold
 *   that smoothly erodes the low height field regions near the horizon of curved geometry.
 *
 * Assign `coverage` to `material.opacityNode` with `material.alphaTestNode = float( 0.5 )`
 * (and optionally `material.alphaToCoverage = true` under MSAA) so the silhouette is
 * clipped through the alpha test path:
 *
 * ```js
 * const pom = parallaxOcclusionUV( heightMap, { scale: uniform( 0.05 ) } );
 *
 * material.colorNode = Fn( () => pom.sample( colorMap ) )();
 * material.opacityNode = pom.coverage;
 * material.alphaTestNode = float( 0.5 );
 * material.alphaToCoverage = true;
 * ```
 *
 * For relief that visibly extends beyond the silhouette of curved geometry (shell
 * parallax), inflate the mesh along its normals by the relief height in world units
 * and enable `curvedSilhouette` - the rendered shell carries the relief peaks while
 * the height field floor stays at the original surface:
 *
 * ```js
 * material.positionNode = positionLocal.add( normalLocal.mul( reliefWorldHeight ) );
 * ```
 *
 * The geometry requires tangents, see {@link BufferGeometry#computeTangents}.
 *
 * Note: the returned nodes must stay within a single build context. `normalNode` is
 * compiled in its own sub-build, so a node graph assigned to it needs a dedicated
 * `parallaxOcclusionUV()` call - do not share one call result between `normalNode`
 * and other material slots.
 *
 * Note: when the material also clips through `alphaTestNode`, avoid `sample()` inside
 * the `normalNode` graph - the normal section runs after the alpha test discard, and
 * its screen space derivative sampling behind a discard miscompiles on some drivers,
 * eroding the coverage at grazing view angles. Fetch with `textureLevel()` at an
 * explicit LOD there instead.
 *
 * @tsl
 * @function
 * @param {Texture} heightMap - The height map to march. Height is read from the red channel, white means peak.
 * @param {Object} [options={}] - The configuration options.
 * @param {Node<vec2>} [options.uvNode] - The base UV coordinates. Default is `uv()`.
 * @param {Node<float>|number} [options.scale=0.05] - The relief depth in UV units.
 * @param {number} [options.minLayers=16] - The number of march steps for head-on view angles.
 * @param {number} [options.maxLayers=48] - The number of march steps for grazing view angles.
 * @param {boolean} [options.silhouette=true] - Whether the silhouette `coverage` and `missed` nodes are computed.
 * @param {Array<number>|Array<Array<number>>} [options.silhouetteBounds=[0,1]] - The UV range the silhouette
 * is judged against. Either `[ min, max ]` for both axes, or `[ [ uMin, uMax ], [ vMin, vMax ] ]` per axis.
 * Match this to a scaled `uvNode`, e.g. `[ 0.5, 2.5 ]` for `uv().mul( 2 ).add( 0.5 )`.
 * @param {boolean} [options.curvedSilhouette=false] - Bends the height field with the local surface curvature,
 * so rays passing the horizon of convex geometry clip and the outline follows the relief. Use on curved,
 * tiling meshes (spheres, capsules, rounded boxes), typically together with an inflated shell.
 * @param {number} [options.minViewZ=0.05] - Lower clamp for the view direction depth component. Raising it
 * bounds how far grazing rays travel across the height field.
 * @param {number} [options.horizonStrength=0] - Strength of the optional horizon trim erosion. Disabled
 * by default - the curved silhouette clips through the miss test alone. Raise it to hide the stretched
 * texels of steep relief walls near the horizon at the cost of eroding low relief there.
 * @param {number} [options.horizonSafeZone=0.3] - The view angle (as N.V) above which no horizon trimming
 * occurs. Erosion ramps up as the view drops from this value toward the horizon.
 * @param {number} [options.horizonFalloff=2] - Falloff exponent of the erosion ramp; higher keeps the trim
 * closer to the horizon.
 * @param {number} [options.horizonBias=0] - Height bias subtracted before the erosion threshold test.
 * @param {number} [options.edgeErosion=0] - Optional view independent erosion of the low height field on
 * strongly curved regions. Disabled by default.
 * @param {?(Array<number>|Array<Array<number>>)} [options.sampleBounds=null] - Optional UV region (same
 * format as `silhouetteBounds`) that every height field fetch is clamped into - outside of it the border
 * texels continue indefinitely. Use it to end a tiling relief cleanly: rays marching past the region see
 * its border instead of hitting a wrapped copy of the height field.
 * @param {?(Node<float>|number|Array<number>|Function)} [options.curvature=null] - The local curvature of
 * the base surface, in radians of normal rotation per UV unit. Defaults to a screen space estimate, which
 * is piecewise constant per triangle - supply the analytic curvature where it is known for smooth
 * silhouettes at grazing angles. Pass `[ curvatureU, curvatureV ]` for surfaces that curve differently
 * per UV axis - e.g. a cylinder is `[ 2 * Math.PI / tilesAround, 0 ]`, so marches along its axis stay
 * level. On surfaces that mix flat and curved regions, pass a function `( uv ) => Node<float>`: the sag
 * below the fragment's tangent plane is then integrated along the march path, so a ray marching over
 * flat ground stays level, while a ray that wrapped around a curved region keeps its accumulated drop
 * afterwards.
 * @returns {Object} The result object. `uv` holds the parallax-offset UV coordinates. `coverage` is a float
 * node (1 inside the relief, feathering to 0 where the silhouette clips) for `material.opacityNode`, and
 * `missed` is the equivalent boolean for a plain discard - both `null` when `silhouette` is disabled.
 * `sample( map, coord )` samples the given texture at the offset UV (or at `coord`) with gradients that
 * remain valid inside the marched region.
 */
export const parallaxOcclusionUV = ( heightMap, options = {} ) => {

	const {
		uvNode = uv(),
		scale = 0.05,
		minLayers = 16,
		maxLayers = 48,
		silhouette = true,
		silhouetteBounds = [ 0, 1 ],
		curvedSilhouette = false,
		minViewZ = 0.05,
		horizonStrength = 0,
		horizonSafeZone = 0.3,
		horizonFalloff = 2,
		horizonBias = 0,
		edgeErosion = 0,
		sampleBounds = null,
		curvature = null
	} = options;

	const scaleNode = float( scale );

	// With sampleBounds set, every height field fetch clamps into the given UV
	// region - outside of it the border texels continue indefinitely. Rays that
	// wander beyond the region then see the border relief instead of hitting a
	// wrapped copy of the height field.

	let coordAt = ( coord ) => coord;

	if ( sampleBounds !== null ) {

		const [ sampleU, sampleV ] = Array.isArray( sampleBounds[ 0 ] )
			? sampleBounds
			: [ sampleBounds, sampleBounds ];

		coordAt = ( coord ) => vec2(
			clamp( coord.x, float( sampleU[ 0 ] ), float( sampleU[ 1 ] ) ),
			clamp( coord.y, float( sampleV[ 0 ] ), float( sampleV[ 1 ] ) )
		);

	}

	// The marched UV exits the layer loop after a per-pixel iteration count, so its
	// screen-space derivatives are undefined. All dependent texture fetches use the
	// explicit gradients of the base UV instead - the sampling rate of the flat
	// surface. The clamp keeps pixel quads that straddle a UV seam (e.g. the edge
	// between two box faces) from collapsing every fetch to the lowest mip, which
	// would draw a line of the height map's average value along the seam.

	const gradX = dFdx( uvNode ).clamp( - 0.1, 0.1 );
	const gradY = dFdy( uvNode ).clamp( - 0.1, 0.1 );

	// The march measures depth below the top plane: 0 at the peaks, 1 at the deepest
	// point. Samples inside the loop must not depend on implicit derivatives since the
	// loop exit is non-uniform, hence the explicit LOD.

	const depthAt = ( coord ) => float( 1.0 ).sub( textureLevel( heightMap, coordAt( coord ), 0 ).r );

	// Curvature of the base surface per UV unit, used by the curved silhouette
	// and the horizon trim. Without the option it is estimated from the screen
	// space derivatives of the geometry normal - independent of view distance
	// and resolution, but piecewise constant per triangle: prefer supplying the
	// analytic curvature where it is known, or the discrete jumps can clip
	// whole triangles near a grazing horizon. On surfaces that mix flat and
	// curved regions, pass a function of the sampled UV: the march then bends
	// each height sample by the curvature at its own location, so rays crossing
	// from a curved region onto a flat one keep marching level instead of
	// inheriting the fragment's curvature and dropping away.

	const curvatureAt = typeof curvature === 'function' ? curvature : null;
	const curvaturePerAxis = Array.isArray( curvature ) ? curvature : null;

	const curvatureNode = curvatureAt !== null
		? float( curvatureAt( uvNode ) )
		: ( curvaturePerAxis !== null
			? float( Math.max( curvaturePerAxis[ 0 ], curvaturePerAxis[ 1 ] ) )
			: ( curvature !== null
				? float( curvature )
				: dFdx( normalViewGeometry ).length().add( dFdy( normalViewGeometry ).length() )
					.div( gradX.length().add( gradY.length() ).max( 1e-6 ) ) ) );

	const march = Fn( () => {

		// view direction (surface towards camera) in tangent space. The frame is
		// built from the geometry accessors on purpose: the shading normal
		// (normalView) may itself be derived from the marched UV, which would
		// make the march circularly depend on its own result.

		const bitangent = normalViewGeometry.cross( tangentView ).mul( tangentGeometry.w );

		// toVar() forces these to be evaluated before the loop below. Without it
		// they would be inlined into the loop body at their first use, and rays
		// that hit the surface immediately would leave the underlying varyings
		// unassigned for the remaining shader code.

		const viewDir = normalize( vec3(
			dot( positionViewDirection, tangentView ),
			dot( positionViewDirection, bitangent ),
			dot( positionViewDirection, normalViewGeometry )
		) ).toVar();

		// grazing angles need more layers than head-on views

		const layers = mix( float( maxLayers ), float( minLayers ), clamp( abs( viewDir.z ), 0.0, 1.0 ) ).toVar();
		const layerDepth = float( 1.0 ).div( layers ).toVar();

		// total UV shift across the full relief depth, clamped at grazing angles

		const shift = viewDir.xy.div( max( abs( viewDir.z ), minViewZ ) ).mul( scaleNode );
		const deltaUV = shift.div( layers ).toVar();

		const currentUV = uvNode.toVar();

		let sampleDepth = depthAt;
		let sagUpdate = null;

		if ( curvedSilhouette === true ) {

			// Curved silhouette: on a convex surface the height field falls away
			// with the marched distance, so rays past the geometric horizon end
			// their march above the relief and are clipped by the miss test.

			if ( curvatureAt !== null ) {

				// with a curvature function the sag is integrated along the path:
				// the curvature crossed so far rotates the surface away (turned),
				// and the rotation in turn accumulates depth drop (sag). A ray
				// that wraps around a curved region keeps its drop when it later
				// crosses flat regions, while a ray marching over flat ground
				// from the start never drops at all.

				const stepLength = deltaUV.length().toVar();
				const turned = float( 0.0 ).toVar();
				const sag = float( 0.0 ).toVar();

				sagUpdate = ( stride ) => {

					turned.addAssign( float( curvatureAt( currentUV ) ).mul( stepLength ).mul( stride ) );
					sag.addAssign( turned.min( 1.5 ).mul( stepLength ).mul( stride ).div( scaleNode.max( 1e-4 ) ) );

				};

				sampleDepth = ( coord ) => depthAt( coord ).add( sag );

			} else if ( curvaturePerAxis !== null ) {

				// constant per-axis curvature: each UV axis sags with its own
				// quadratic. The exact model for a cylinder, which curves
				// around its axis but not along it - marches along the axis
				// stay level like plain parallax occlusion mapping.

				const startUV = vec2( currentUV ).toVar();
				const bend = vec2( curvaturePerAxis[ 0 ], curvaturePerAxis[ 1 ] )
					.div( scaleNode.mul( 2.0 ).max( 1e-4 ) ).min( 6.0 ).toVar();

				sampleDepth = ( coord ) => {

					const offset = coord.sub( startUV );
					return depthAt( coord ).add( offset.mul( offset ).dot( bend ) );

				};

			} else {

				// constant fragment curvature: quadratic sag with the marched
				// distance (sag = curvature/2 * s^2, in march depth units). The
				// clamp keeps extremely curved regions (e.g. capsule poles,
				// where the UV mapping degenerates) from clipping the whole
				// area away.

				const startUV = vec2( currentUV ).toVar();
				const bend = curvatureNode.div( scaleNode.mul( 2.0 ).max( 1e-4 ) ).min( 6.0 ).toVar();

				sampleDepth = ( coord ) => depthAt( coord ).add( coord.sub( startUV ).lengthSq().mul( bend ) );

			}

		}

		const currentLayerDepth = float( 0.0 ).toVar();
		const currentDepth = sampleDepth( currentUV ).toVar();

		Loop( { start: 0, end: maxLayers, type: 'int' }, () => {

			If( currentLayerDepth.greaterThanEqual( currentDepth ), () => {

				Break();

			} );

			currentUV.subAssign( deltaUV );
			currentLayerDepth.addAssign( layerDepth );

			if ( sagUpdate !== null ) sagUpdate( 1.0 );

			currentDepth.assign( sampleDepth( currentUV ) );

		} );

		if ( curvedSilhouette === true ) {

			// Horizon chase: rays that enter the shell near a silhouette look
			// far along the surface, which curves away below their tangent
			// plane while the relief rides on it - legitimate hits can then lie
			// several relief depths deep, beyond the regular march. Continue
			// with coarser steps while the ray is still above the height
			// field: real hits get caught, rays past the true horizon keep
			// missing and clip through the coverage test as before.

			Loop( { start: 0, end: 24, type: 'int' }, () => {

				If( currentLayerDepth.greaterThanEqual( currentDepth ), () => {

					Break();

				} );

				currentUV.subAssign( deltaUV.mul( 4.0 ) );
				currentLayerDepth.addAssign( layerDepth.mul( 4.0 ) );

				if ( sagUpdate !== null ) sagUpdate( 4.0 );

				currentDepth.assign( sampleDepth( currentUV ) );

			} );

		}

		// interpolate between the last two layers so the hit point lands on the
		// surface instead of a stair-step

		const previousUV = currentUV.add( deltaUV );
		const after = currentLayerDepth.sub( currentDepth );
		const before = sampleDepth( previousUV ).sub( currentLayerDepth.sub( layerDepth ) );
		const weight = clamp( after.div( max( after.add( before ), 1e-4 ) ), 0.0, 1.0 );
		const finalUV = mix( currentUV, previousUV, weight );

		// the sign of the remaining surface distance tells hits (ray at or
		// below the height field) from misses (march ended still above it)

		return vec3( finalUV, currentDepth.sub( currentLayerDepth ) );

	} )();

	// materialize the march result so every consumer (color, roughness, ...)
	// references the same variable instead of rebuilding the function call

	const result = march.toVar();

	const offsetUV = result.xy;

	const sample = ( map, coord = offsetUV ) => texture( map, coordAt( coord ) ).grad( gradX, gradY );

	let coverage = null;
	let missed = null;

	if ( silhouette === true ) {

		// Silhouette clipping: judged on the FINAL landing point. A ray that comes
		// to rest outside the bounds left the height field through the side.
		// Judging after the march keeps rays that relief near the border still
		// catches at grazing angles, and rays that hit a wrapped copy of the
		// height field beyond the border land outside the bounds and clip all
		// the same.

		const [ boundsU, boundsV ] = Array.isArray( silhouetteBounds[ 0 ] )
			? silhouetteBounds
			: [ silhouetteBounds, silhouetteBounds ];

		const feather = 0.02;

		const overU = max( float( boundsU[ 0 ] ).sub( offsetUV.x ), offsetUV.x.sub( boundsU[ 1 ] ) );
		const overV = max( float( boundsV[ 0 ] ).sub( offsetUV.y ), offsetUV.y.sub( boundsV[ 1 ] ) );

		coverage = clamp( float( 1.0 ).sub( max( overU, overV ).div( feather ) ), 0.0, 1.0 );

		if ( curvedSilhouette === true ) {

			// a ray that ends its march still above the bent height field never
			// intersected the relief - it has passed the horizon of the curved
			// base surface. Testing the miss itself (instead of an absolute
			// landing depth) keeps far hits on tall relief connected to their
			// base, so overhanging features do not break into floating islands.
			// Flat regions (zero curvature) never miss and keep their relief at
			// every view angle, like plain parallax occlusion mapping.

			const landingCoverage = clamp( float( 1.0 ).sub( result.z.div( 0.05 ) ), 0.0, 1.0 );

			coverage = min( coverage, landingCoverage );

		}

		if ( horizonStrength > 0 || edgeErosion > 0 ) {

			// Horizon trimming on curved geometry: as the view approaches the
			// horizon of the base surface, a rising height threshold smoothly
			// erodes the low regions of the height field. Gated by curvature,
			// so flat faces keep their relief at any view angle.

			const NdotV = abs( dot( normalViewGeometry, positionViewDirection ) );

			const ramp = clamp( float( 1.0 ).sub( NdotV.div( Math.max( horizonSafeZone, 1e-3 ) ) ), 0.0, 1.0 );
			const horizonThreshold = ramp.pow( horizonFalloff ).mul( horizonStrength );

			const curvatureFactor = clamp( curvatureNode.mul( 2.0 ), 0.0, 1.0 );

			const heightThreshold = clamp( max( horizonThreshold, float( edgeErosion ) ).mul( curvatureFactor ), 0.0, 1.0 );

			const surfaceHeight = sample( heightMap ).r.sub( horizonBias );

			const horizonCoverage = clamp( surfaceHeight.sub( heightThreshold ).div( 0.05 ), 0.0, 1.0 );

			coverage = min( coverage, horizonCoverage );

		}

		missed = coverage.lessThan( 0.5 );

	}

	return { uv: offsetUV, missed, coverage, sample };

};
