import { float, vec3, vec4, If, Loop, Break, max, min, abs, dot, clamp, log2, exp2, select } from 'three/tsl';

/**
 * Emits the intersection of a ray with the bounds of the given volume.
 *
 * @param {VXGIVolume} volume - The volume.
 * @param {Node<vec3>} origin - The ray origin.
 * @param {Node<vec3>} direction - The normalized ray direction.
 * @return {{tEnter: Node<float>, tExit: Node<float>}} The entry and exit distances. The ray misses the volume if `tExit <= tEnter`.
 */
export function intersectVolume( volume, origin, direction ) {

	const boundsMin = volume.boundsMinNode;
	const boundsMax = boundsMin.add( volume.volumeSizeNode ).toConst();

	const safeDirection = vec3(
		select( abs( direction.x ).lessThan( 1e-6 ), 1e-6, direction.x ),
		select( abs( direction.y ).lessThan( 1e-6 ), 1e-6, direction.y ),
		select( abs( direction.z ).lessThan( 1e-6 ), 1e-6, direction.z )
	).toConst();

	const invDirection = float( 1 ).div( safeDirection ).toConst();
	const t0 = boundsMin.sub( origin ).mul( invDirection ).toConst();
	const t1 = boundsMax.sub( origin ).mul( invDirection ).toConst();
	const tNear = min( t0, t1 ).toConst();
	const tFar = max( t0, t1 ).toConst();

	const tEnter = max( max( tNear.x, tNear.y ), max( tNear.z, 0 ) ).toConst();
	const tExit = min( min( tFar.x, tFar.y ), tFar.z ).toConst();

	return { tEnter, tExit };

}

/**
 * Emits a directional radiance lookup: for each axis the direction block facing the ray is
 * sampled from the directional texture and the three samples are blended with the squared
 * direction components. The block is selected arithmetically, so the lookup does not branch.
 *
 * @param {VXGIVolume} volume - The volume.
 * @param {Texture3DNode} directionalNode - The directional radiance texture node.
 * @param {Node<vec3>} uvw - The texture coordinates within the volume.
 * @param {Node<float>} level - The mip level of the directional texture.
 * @param {Node<vec3>} direction - The normalized ray direction.
 * @return {Node<vec4>} The premultiplied radiance and its weight.
 */
export function sampleDirectional( volume, directionalNode, uvw, level, direction ) {

	const weights = direction.mul( direction ).toConst();

	// keep the lookup inside its block: clamp x by half a texel of the coarser blended level

	const halfTexel = exp2( level.ceil() ).mul( 0.5 ).div( volume.directionalWidthNode ).toConst();
	const u = uvw.x.clamp( halfTexel, halfTexel.oneMinus() ).toConst();

	const result = vec4( 0 ).toVar();

	for ( let axis = 0; axis < 3; axis ++ ) {

		const component = [ 'x', 'y', 'z' ][ axis ];
		const block = float( axis * 2 ).add( select( direction[ component ].lessThan( 0 ), 1, 0 ) );
		const blockUVW = vec3( block.add( u ).div( 6 ), uvw.y, uvw.z );

		result.addAssign( directionalNode.sample( blockUVW ).level( level ).mul( weights[ component ] ) );

	}

	return result;

}

/**
 * Creates a cone tracing function for a {@link VXGIVolume}. The returned function emits
 * TSL code that marches a cone through the volume's opacity/radiance mip chain and returns the
 * gathered radiance, the accumulated occlusion and a distance-weighted occlusion for AO.
 *
 * Implements the approximate voxel cone tracing of Crassin et al. 2011: the cone is sampled at
 * the mip level matching its current diameter with quadrilinear interpolation, samples are
 * composited front-to-back with the emission-absorption model, the opacity of a sample is
 * corrected for the step size and the anisotropic opacity (and, if given, the directional
 * radiance) is interpolated from the three directional values closest to the cone direction.
 * Cones leaving the volume gather nothing.
 *
 * @param {VXGIVolume} volume - The volume to trace.
 * @param {Object} [options={}] - Options.
 * @param {?TextureNode} [options.radianceNode=null] - The radiance texture node to gather from. If `null`, only occlusion is computed.
 * @param {?Texture3DNode} [options.directionalNode=null] - The directional radiance texture node of the coarser levels, see {@link VXGIVolume#directionalRadiance}. If `null`, the coarser levels are gathered from the radiance node's mips.
 * @param {number} [options.maxSteps=128] - Upper bound of steps per cone.
 * @return {Function} A function `( origin, direction, tanHalfAngle, maxDistance, aoDistance = null ) => { color, alpha, ao }`. AO is only computed if `aoDistance` is given.
 */
export function createConeTracer( volume, options = {} ) {

	const { radianceNode = null, directionalNode = null, maxSteps = 128 } = options;

	const opacityNode = volume.opacityNode;
	const boundsMin = volume.boundsMinNode;
	const volumeSize = volume.volumeSizeNode;
	const voxelSize = volume.voxelSizeNode;
	const maxLevel = volume.maxLevelNode;
	const stepScale = volume.stepScale;

	return ( origin, direction, tanHalfAngle, maxDistance, aoDistance = null ) => {

		const color = vec3( 0 ).toVar();
		const alpha = float( 0 ).toVar();
		const ao = float( 0 ).toVar();

		const { tEnter, tExit } = intersectVolume( volume, origin, direction );

		// cones start one voxel away from their origin so the voxels the origin lies in are not sampled

		const t = max( tEnter, voxelSize ).toVar();
		const limit = min( tExit, maxDistance ).toConst();

		// interpolation weights of the three directional opacity values (sum to one)

		const directionWeights = direction.mul( direction ).toConst();

		// AO falloff 1 / ( 1 + r / aoDistance )

		const aoFalloff = aoDistance !== null ? select( aoDistance.greaterThan( 0 ), float( 1 ).div( max( aoDistance, 1e-6 ) ), float( 0 ) ).toConst() : null;

		If( tExit.greaterThan( t ), () => {

			Loop( { start: 0, end: maxSteps, type: 'int', condition: '<', name: 's' }, () => {

				If( t.greaterThanEqual( limit ).or( alpha.greaterThanEqual( 0.98 ) ), () => {

					Break();

				} );

				const diameter = max( t.mul( 2 ).mul( tanHalfAngle ), voxelSize ).toConst();
				const lod = clamp( log2( diameter.div( voxelSize ) ), 0, maxLevel ).toConst();
				const position = origin.add( direction.mul( t ) ).toConst();
				const uvw = position.sub( boundsMin ).div( volumeSize ).toConst();

				const opacity = opacityNode.sample( uvw ).level( lod ).toConst();

				// directional opacity, corrected for a step that is a fraction of the texel size

				const a = clamp( dot( opacity.xyz, directionWeights ), 0, 1 ).oneMinus().pow( stepScale ).oneMinus().toConst();
				const weight = a.mul( alpha.oneMinus() ).toConst();

				if ( radianceNode !== null ) {

					let radiance;

					if ( directionalNode === null ) {

						radiance = radianceNode.sample( uvw ).level( lod ).toConst();

					} else {

						// the finest level is isotropic, coarser levels are stored directionally at half
						// resolution; their weight only counts the surfaces facing the ray

						radiance = vec4( 0 ).toVar();

						If( lod.lessThan( 1 ), () => {

							radiance.assign( radianceNode.sample( uvw ).level( float( 0 ) ) );

						} ).Else( () => {

							radiance.assign( sampleDirectional( volume, directionalNode, uvw, lod.sub( 1 ), direction ) );

						} );

					}

					color.addAssign( radiance.rgb.div( max( radiance.a, 1e-4 ) ).mul( weight ) );

				}

				alpha.addAssign( weight );

				if ( aoFalloff !== null ) {

					ao.addAssign( a.mul( ao.oneMinus() ).div( t.mul( aoFalloff ).add( 1 ) ) );

				}

				t.addAssign( voxelSize.mul( exp2( lod ) ).mul( stepScale ) );

			} );

		} );

		return { color, alpha, ao };

	};

}
